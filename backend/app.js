const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// This is the middleware section where we set up CORS and JSON parsing for incoming requests
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the DropMyMachine API!');
}
);


module.exports = app;