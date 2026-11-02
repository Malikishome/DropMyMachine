const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase.from('profiles')
            .select('role, full_name, city, plan, trust_level')
            .eq('id', req.user.id)
            .single();
        if (error) {return res.status(404).json({ message: 'Profile not found' });}
        res.json({ profile: data });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
