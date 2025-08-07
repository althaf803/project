const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Booking = require('../models/Booking');

const router = express.Router();

// Admin: Get ALL bookings
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('movie')
      .populate('theater')
      .populate('user', 'email name');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all bookings' });
  }
});

// Create booking
router.post('/', authenticateToken, async (req, res) => {
  const { movie, theater, screenName, showtime, seats } = req.body;

  if (!movie || !theater || !screenName || !showtime || !seats || seats.length === 0) {
    return res.status(400).json({ error: 'All required booking fields must be provided' });
  }

  try {
    const existing = await Booking.findOne({
      movie,
      theater,
      screenName,
      showtime,
      seats: { $in: seats }
    });

    if (existing) {
      return res.status(400).json({ error: 'Some of the selected seats are already booked for this showtime.' });
    }

    const booking = new Booking({
      user: req.user.userId,
      movie,
      theater,
      screenName,
      showtime,
      seats
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: 'Booking failed', details: err.message });
  }
});

// Get booked seats for a movie + theater + screen + showtime
router.get('/booked-seats', async (req, res) => {
  const { movie, theater, screenName, showtime } = req.query;

  if (!movie || !theater || !screenName || !showtime) {
    return res.status(400).json({ error: 'Movie, theater, screenName and showtime are required' });
  }

  try {
    const bookings = await Booking.find({
      movie,
      theater,
      screenName,
      showtime: new Date(showtime)
    });

    const bookedSeats = bookings.reduce((all, b) => all.concat(b.seats), []);
    res.json({ bookedSeats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booked seats' });
  }
});

// Get user's bookings
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId }).populate('movie');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Delete (cancel) booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ error: 'Booking not found' });

    // Only the booking owner or admin can cancel
    const isOwner = booking.user.toString() === req.user.userId;
    if (!isOwner && !req.user.isAdmin)
      return res.status(403).json({ error: 'You cannot cancel this booking.' });

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
