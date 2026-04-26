import { Router } from 'express';


const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Listings route is working!' });
});


router.post('/', (req, res) => {
    const { title, description, price } = req.body;

    if (!title || !description || !price) {
        return res.status(400).json({ message: 'Title, description, and price are required.' });
    }

    // Here you would typically save the listing to a database
    res.json({ message: 'Listing created successfully!', listing: { title, description, price } });
});


router.get('/:id', (req, res) => {
    const listingId = req.params.id;

    if (!listingId) {
        return res.status(400).json({ message: 'Listing ID is required.' });
    }

    // Here you would typically fetch the listing from a database using the listingId
    res.json({ message: `Listing with ID ${listingId} fetched successfully!`, listing: { id: listingId, title: 'Sample Listing', description: 'This is a sample listing.', price: 100 } });
});

router.post('/:id', (req, res) => {
    const listingId = req.params.id;
    const { title, description, price } = req.body;
        if (!listingId) {
        return res.status(400).json({ message: 'Listing ID is required.' });
    }
        if (!title || !description || !price) {
        return res.status(400).json({ message: 'Title, description, and price are required.' });
    }

    // Here you would typically update the listing in a database using the listingId
    res.json({ message: `Listing with ID ${listingId} updated successfully!`, listing: { id: listingId, title, description, price } });
});

router.delete('/:id', (req, res) => {
    const listingId = req.params.id;    
    if (!listingId) {
        return res.status(400).json({ message: 'Listing ID is required.' });
    }

    // Here you would typically delete the listing from a database using the listingId
    res.json({ message: `Listing with ID ${listingId} deleted successfully!` });
});

module.exports = router;