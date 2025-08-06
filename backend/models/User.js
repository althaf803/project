const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },  // hashed password
  isAdmin:  { type: Boolean, default: false }, // admin flag, useful later
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
