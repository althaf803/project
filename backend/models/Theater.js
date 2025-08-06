const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  name: { type: String, required: true },           // e.g., "Screen 1"
  rows: { type: Number, required: true },
  seatsPerRow: { type: Number, required: true },
  seatLayout: {                                     // Optional: 2D seat labels for custom layout
    type: [[String]],
    default: []
  }
});

const theaterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  screens: [screenSchema]
});

module.exports = mongoose.model('Theater', theaterSchema);
