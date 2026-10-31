const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/daily-summary?date=YYYY-MM-DD
router.get('/daily-summary', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const allOrders = await db.orders.findMany();

    // Filter orders by date
    const dayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfDay && orderDate <= endOfDay;
    });

    const paidOrders = dayOrders.filter(o => o.isPaid && o.status !== 'CANCELLED');

    // Revenue calculations
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalDiscount = paidOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalTax = paidOrders.reduce((sum, o) => sum + (o.tax || 0), 0);
    const grossSales = paidOrders.reduce((sum, o) => sum + (o.subTotal || 0), 0);

    // Payment method breakdown
    const paymentBreakdown = {
      CASH: paidOrders.filter(o => o.paymentMethod === 'CASH').reduce((sum, o) => sum + o.grandTotal, 0),
      CARD: paidOrders.filter(o => o.paymentMethod === 'CARD').reduce((sum, o) => sum + o.grandTotal, 0),
      QR: paidOrders.filter(o => o.paymentMethod === 'QR').reduce((sum, o) => sum + o.grandTotal, 0),
      SPLIT: paidOrders.filter(o => o.paymentMethod === 'SPLIT').reduce((sum, o) => sum + o.grandTotal, 0),
    };

    // Order type breakdown
    const dineInOrders = paidOrders.filter(o => o.orderType === 'DINE_IN');
    const takeawayOrders = paidOrders.filter(o => o.orderType === 'TAKEAWAY');

    const orderTypeBreakdown = {
      dineIn: {
        count: dineInOrders.length,
        revenue: dineInOrders.reduce((sum, o) => sum + o.grandTotal, 0),
      },
      takeaway: {
        count: takeawayOrders.length,
        revenue: takeawayOrders.reduce((sum, o) => sum + o.grandTotal, 0),
      },
    };

    // Best-selling items calculation
    const itemMap = {};
    paidOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const name = (item.product && item.product.name) || item.name || 'Unknown Item';
          const key = `${name} (${item.variantName || 'Regular'})`;
          if (!itemMap[key]) {
            itemMap[key] = {
              name,
              variant: item.variantName || 'Regular',
              quantity: 0,
              revenue: 0,
            };
          }
          itemMap[key].quantity += item.quantity || 1;
          itemMap[key].revenue += (item.totalPrice || item.unitPrice * (item.quantity || 1));
        });
      }
    });

    const bestSellingItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    // Hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      orders: 0,
      revenue: 0,
    }));

    paidOrders.forEach(order => {
      const h = new Date(order.createdAt).getHours();
      hourlyDistribution[h].orders += 1;
      hourlyDistribution[h].revenue += order.grandTotal || 0;
    });

    res.json({
      date: targetDate.toISOString().split('T')[0],
      summary: {
        totalOrders: dayOrders.length,
        paidOrdersCount: paidOrders.length,
        grossSales,
        totalDiscount,
        totalTax,
        totalRevenue,
      },
      paymentBreakdown,
      orderTypeBreakdown,
      bestSellingItems,
      hourlyDistribution: hourlyDistribution.filter(h => h.orders > 0 || (new Date().getHours() <= 24 && parseInt(h.hour) >= 8 && parseInt(h.hour) <= 22)),
      allOrders: dayOrders,
    });
  } catch (err) {
    console.error('Daily summary report error:', err);
    res.status(500).json({ error: 'Failed to generate daily summary report' });
  }
});

module.exports = router;
