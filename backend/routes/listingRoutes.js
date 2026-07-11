const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

router.get('/', async (req, res) => {
    const { city, machine_type } = req.query;
    
    try {
        let query = supabase.from('listings').select('*');
        if (city) {
            query = query.eq('city', city);
        }
        if (machine_type) {
            query = query.eq('machine_type', machine_type);
        }
        const { data, error } = await query;
        if (error) {return res.status(400).json({ message: error.message });}
        res.json({ listings: data });
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/', async (req, res) => {
    const { description, city, machine_type, user_id } = req.body;
    if (!description || !city || !machine_type || !user_id) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const { data, error } = await supabase.from('listings').insert([
            { description, city, machine_type, status: 'pending', user_id }
        ]).select();
        if (error) {return res.status(400).json({ message: error.message });}
        if (!data || data.length === 0) return res.status(201).json({ message: 'Listing created successfully' })
            res.status(201).json({ listing: data[0] })
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
        if (error) {return res.status(404).json({ message: 'Listing not found' });}
        res.json({ listing: data });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { description, city, machine_type, status } = req.body;
    try {
        const { data, error } = await supabase.from('listings').update({ description, city, machine_type, status }).eq('id', id);
        if (error) {return res.status(400).json({ message: error.message });}
        res.json({ listing: data[0] });
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('listings').delete().eq('id', id);
        if (error) {return res.status(400).json({ message: error.message });}
        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;