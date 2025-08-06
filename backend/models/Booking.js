const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie:     { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theater:   { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  screenName: { type: String, required: true },          // to know which screen
  showtime:  { type: Date, required: true },
  seats:     [{ type: String }],                          // e.g., ["A1", "A2"]
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
