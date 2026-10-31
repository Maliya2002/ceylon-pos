const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders/active - Fetch active orders for KDS and POS
router.get('/active', async (req, res) => {
  try {
    const orders = await db.orders.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY'] },
      },
    });
    res.json(orders);
  } catch (err) {
    console.error('Fetch active orders error:', err);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
});

// GET /api/orders - Fetch all orders
router.get('/', async (req, res) => {
  try {
    const orders = await db.orders.findMany();
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Fetch single order
router.get('/:id', async (req, res) => {
  try {
    const order = await db.orders.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Fetch order error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders - Create new order (Takeaway or Dine-In)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      orderType = 'TAKEAWAY',
      tableId,
      items,
      discount = 0,
      tax = 0,
      paymentMethod = 'CASH',
      isPaid = false,
      notes = '',
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (orderType === 'DINE_IN' && !tableId) {
      return res.status(400).json({ error: 'Table selection is required for Dine-In orders' });
    }

    // Calculate subtotal
    let subTotal = 0;
    const orderItemsCreate = items.map(item => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const quantity = parseInt(item.quantity) || 1;
      const totalPrice = unitPrice * quantity;
      subTotal += totalPrice;

      return {
        productId: item.productId,
        variantName: item.variantName || null,
        quantity,
        unitPrice,
        totalPrice,
        notes: item.notes || null,
      };
    });

    const numDiscount = parseFloat(discount) || 0;
    const numTax = parseFloat(tax) || 0;
    const grandTotal = Math.max(0, subTotal - numDiscount + numTax);

    const newOrder = await db.orders.create({
      data: {
        orderType,
        status: 'PENDING',
        tableId: orderType === 'DINE_IN' ? tableId : null,
        userId: req.user.id,
        subTotal,
        discount: numDiscount,
        tax: numTax,
        grandTotal,
        paymentMethod,
        isPaid: Boolean(isPaid),
        notes,
        items: {
          create: orderItemsCreate,
        },
      },
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PATCH /api/orders/:id/status - Update status (PENDING -> PREPARING -> READY -> COMPLETED)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status: ${status}` });
    }

    const order = await db.orders.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updated = await db.orders.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// POST /api/orders/:id/checkout - Process final payment & free assigned table
router.post('/:id/checkout', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      paymentMethod = 'CASH',
      tenderedAmount,
      discount,
      notes,
    } = req.body;

    const order = await db.orders.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let finalDiscount = discount !== undefined ? parseFloat(discount) : order.discount;
    let finalGrandTotal = Math.max(0, order.subTotal - finalDiscount + order.tax);
    let changeAmount = 0;

    if (paymentMethod === 'CASH' && tenderedAmount) {
      changeAmount = Math.max(0, parseFloat(tenderedAmount) - finalGrandTotal);
    }

    const updatedOrder = await db.orders.update({
      where: { id },
      data: {
        isPaid: true,
        paymentMethod,
        discount: finalDiscount,
        grandTotal: finalGrandTotal,
        status: order.status === 'READY' ? 'COMPLETED' : order.status,
        notes: notes !== undefined ? notes : order.notes,
      },
    });

    res.json({
      message: 'Checkout completed successfully',
      order: updatedOrder,
      tenderedAmount: tenderedAmount ? parseFloat(tenderedAmount) : finalGrandTotal,
      changeAmount,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to complete checkout' });
  }
});

// POST /api/orders/:id/add-items - Add additional items to ongoing Dine-In order
router.post('/:id/add-items', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    const order = await db.orders.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.isPaid) {
      return res.status(400).json({ error: 'Cannot add items to already paid / settled order' });
    }

    const updated = await db.orders.addItems({
      orderId: id,
      items,
      notes,
    });

    res.json({
      message: 'Items added to order successfully',
      order: updated,
    });
  } catch (err) {
    console.error('Add items error:', err);
    res.status(500).json({ error: 'Failed to add items to order' });
  }
});

module.exports = router;
