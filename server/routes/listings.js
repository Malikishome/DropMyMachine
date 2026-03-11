const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Listings route is working!' });
});


router.post('/', (req, res) => {
    const { title, description, price } = req.body;
    // Here you would typically save the listing to a database
    res.json({ message: 'Listing created successfully!', listing: { title, description, price } });
});

module.exports = router;