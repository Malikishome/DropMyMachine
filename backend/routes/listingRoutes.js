const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateListing } = require('../utils/listingValidation');
const { parseListingQuery, escapeLike } = require('../utils/listingQuery');

router.get('/', async (req, res) => {
    const { machineTypes, footTraffic, city } = parseListingQuery(req.query);

    try {
        let query = supabase.from('listings')
            .select('id, user_id, machine_type, location_type, city, description, foot_traffic, status, created_at')
            .neq('status', 'paused');
        if (city) {
            query = query.ilike('city', `%${escapeLike(city)}%`);
        }
        if (machineTypes.length > 0) {
            query = query.in('machine_type', machineTypes);
        }
        if (footTraffic) {
            query = query.eq('foot_traffic', footTraffic);
        }
        const { data, error } = await query;
        if (error) {return res.status(400).json({ message: error.message });}
        res.json({ listings: data });
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/mine', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase.from('listings')
            .select('id, user_id, machine_type, location_type, city, address, description, foot_traffic, status, created_at')
            .eq('user_id', req.user.id);
        if (error) {return res.status(400).json({ message: error.message });}
        res.json({ listings: data });
    } catch (error) {
        console.error('Error fetching my listings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', authMiddleware, roleMiddleware('location_owner'), async (req, res) => {
    const { errors, values } = validateListing(req.body);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: 'Invalid listing', errors });
    }
    try {
        const { data, error } = await supabase.from('listings').insert([
            { ...values, status: 'active', user_id: req.user.id }
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
            .select('id, user_id, machine_type, location_type, city, description, foot_traffic, status, created_at')
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

router.put('/:id', authMiddleware, roleMiddleware('location_owner'), async (req, res) => {
    const { id } = req.params;
    const { errors, values } = validateListing(req.body, { partial: true });
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: 'Invalid listing', errors });
    }
    try {
        const { data, error } = await supabase.from('listings')
            .update(values)
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