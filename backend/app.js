const express = require('express');
const cors = require('cors');

const requestsRoutes = require('./routes/requestsRoutes');
const app = express();

// This is the middleware section where we set up CORS and JSON parsing for incoming requests
app.use(cors());
app.use(express.json());

app.use('/api/requests', requestsRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the DropMyMachine API!');
}
);


module.exports = app;