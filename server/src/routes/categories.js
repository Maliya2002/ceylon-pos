const express = require('express');
const { db } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - Fetch all categories with products
router.get('/', async (req, res) => {
  try {
    const categories = await db.categories.findMany({
      include: { products: { include: { variants: true } } },
    });
    res.json(categories);
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Admin create category
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const category = await db.categories.create({
      data: { name, description },
    });
    res.status(201).json(category);
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

module.exports = router;
