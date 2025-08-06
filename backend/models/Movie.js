const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  screenName: { type: String, required: true },
  times: [{ type: Date, required: true }]  // multiple showtimes for that screen
});

const movieSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  posterUrl:   { type: String },
  genre:       { type: String },
  duration:    { type: Number }, // in minutes
  showtimes:   [showtimeSchema], // showtimes per theater + screen
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
