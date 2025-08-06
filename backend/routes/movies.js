const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET all movies - public
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// GET single movie by ID - public
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN: Create new movie
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, posterUrl, genre, duration, showtimes } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // You may want to validate showtimes format here, ensure theater IDs are valid, etc.

    const newMovie = new Movie({
      title,
      description,
      posterUrl,
      genre,
      duration,
      showtimes,
    });

    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create movie', details: err.message });
  }
});


// ADMIN: Update movie
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMovie) return res.status(404).json({ error: 'Movie not found' });
    res.json(updatedMovie);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update movie', details: err.message });
  }
});

// ADMIN: Delete movie
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Movie not found' });
    res.json({ message: 'Movie deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete movie', details: err.message });
  }
});

module.exports = router;
