const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/tables - Get all dining table statuses
router.get('/', async (req, res) => {
  try {
    const tables = await db.tables.findMany();
    // Also fetch active orders associated with tables
    const activeOrders = await db.orders.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY'] },
      },
    });

    const tablesWithOrders = tables.map(table => {
      const currentOrder = activeOrders.find(o => o.tableId === table.id && !o.isPaid);
      return {
        ...table,
        isOccupied: Boolean(currentOrder || table.isOccupied),
        activeOrder: currentOrder ? {
          id: currentOrder.id,
          orderNumber: currentOrder.orderNumber,
          status: currentOrder.status,
          grandTotal: currentOrder.grandTotal,
          itemsCount: currentOrder.items ? currentOrder.items.length : 0,
          createdAt: currentOrder.createdAt,
        } : null,
      };
    });

    res.json(tablesWithOrders);
  } catch (err) {
    console.error('Fetch tables error:', err);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// PATCH /api/tables/:id/toggle-status
router.patch('/:id/toggle-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const table = await db.tables.findUnique({ where: { id } });
    if (!table) return res.status(404).json({ error: 'Table not found' });

    const updated = await db.tables.update({
      where: { id },
      data: { isOccupied: !table.isOccupied },
    });

    res.json(updated);
  } catch (err) {
    console.error('Toggle table status error:', err);
    res.status(500).json({ error: 'Failed to toggle table status' });
  }
});

module.exports = router;
