const express = require('express');
const { db } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await db.products.findMany({
      include: { variants: true, category: true },
    });
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products - Add new product with variants and pricing
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { name, categoryId, basePrice, isAvailable, variants } = req.body;
    if (!name || !categoryId || basePrice === undefined) {
      return res.status(400).json({ error: 'Name, categoryId, and basePrice are required' });
    }

    const product = await db.products.create({
      data: {
        name,
        categoryId,
        basePrice: parseFloat(basePrice),
        isAvailable: isAvailable !== false,
        variants: variants && variants.length > 0 ? {
          create: variants.map(v => ({
            name: v.name,
            price: parseFloat(v.price),
          })),
        } : undefined,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PATCH /api/products/:id/toggle-status - Quickly enable/disable out-of-stock items
router.patch('/:id/toggle-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.products.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updated = await db.products.update({
      where: { id },
      data: { isAvailable: !existing.isAvailable },
    });

    res.json({
      message: `Product is now ${updated.isAvailable ? 'Available' : 'Out of stock'}`,
      product: updated,
    });
  } catch (err) {
    console.error('Toggle product status error:', err);
    res.status(500).json({ error: 'Failed to toggle product status' });
  }
});

// PUT /api/products/:id
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, basePrice, isAvailable, variants } = req.body;

    const updated = await db.products.update({
      where: { id },
      data: {
        name,
        categoryId,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
        isAvailable,
        variants,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.products.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
