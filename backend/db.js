const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Replace 'movie_booking' with your chosen database name
    await mongoose.connect('mongodb+srv://althaf:althu803@althaf.wjl50gk.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if unable to connect
  }
};

module.exports = connectDB;
