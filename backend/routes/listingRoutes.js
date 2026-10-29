const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    const { city, machine_type } = req.query;
    
    try {
        let query = supabase.from('listings')
            .select('id, user_id, machine_type, location_type, city, description, foot_traffic, revenue_split, status, created_at');
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


router.post('/', authMiddleware, async (req, res) => {
    const { description, city, machine_type, location_type, address, foot_traffic, revenue_split } = req.body;
    if (!description || !city || !machine_type) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const { data, error } = await supabase.from('listings').insert([
            { description, city, machine_type, location_type, address, foot_traffic, revenue_split, status: 'pending', user_id: req.user.id }
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
        const { data, error } = await supabase.from('listings')
            .select('id, user_id, machine_type, location_type, city, description, foot_traffic, revenue_split, status, created_at')
            .eq('id', id)
            .single();
        if (error) {return res.status(404).json({ message: 'Listing not found' });}

        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user && user.id === data.user_id) {
                const { data: ownerView } = await supabase.from('listings').select('address').eq('id', id).single();
                data.address = ownerView?.address ?? null;
            }
        }

        res.json({ listing: data });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { description, city, machine_type, status, location_type, address, foot_traffic, revenue_split } = req.body;
    try {
        const { data, error } = await supabase.from('listings')
            .update({ description, city, machine_type, status, location_type, address, foot_traffic, revenue_split })
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select();
        if (error) {return res.status(400).json({ message: error.message });}
        if (!data || data.length === 0) {return res.status(404).json({ message: 'Listing not found' });}
        res.json({ listing: data[0] });
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase.from('listings')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select();
        if (error) {return res.status(400).json({ message: error.message });}
        if (!data || data.length === 0) {return res.status(404).json({ message: 'Listing not found' });}
        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;