require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./db'); // Import the connection
const movieRoutes = require('./routes/movies');

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const theaterRoutes = require('./routes/theaters');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/theaters', theaterRoutes);

app.get('/', (req, res) => {
  res.send('API Running');
});

const PORT = process.env.PORT || 5000;

//connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
//});
