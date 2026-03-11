const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const listingsRouter = require('./routes/listings');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/listings', listingsRouter);

// Routes
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

const Port = process.env.PORT || 5000;
app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});

