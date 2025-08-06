const express = require('express');
const router = express.Router();
const Theater = require('../models/Theater');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all theaters (public)
router.get('/', async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.json(theaters);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch theaters' });
  }
});

// Get single theater by ID
router.get('/:id', async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) return res.status(404).json({ error: 'Theater not found' });
    res.json(theater);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create new theater
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newTheater = new Theater(req.body);
    const savedTheater = await newTheater.save();
    res.status(201).json(savedTheater);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create theater', details: err.message });
  }
});

// Admin: Update theater
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updatedTheater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedTheater) return res.status(404).json({ error: 'Theater not found' });
    res.json(updatedTheater);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update theater', details: err.message });
  }
});

// Admin: Delete theater
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await Theater.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Theater not found' });
    res.json({ message: 'Theater deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete theater', details: err.message });
  }
});

module.exports = router;
