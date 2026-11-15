const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateRequest } = require('../utils/requestValidation');

const UNIQUE_VIOLATION = '23505';
const REQUEST_FIELDS = 'id, listing_id, message, status, created_at';
// Never include address here: it is revealed only after accept (build-plan item 13c).
const LISTING_SUMMARY = 'listings(machine_type, city, status)';

router.use(authMiddleware, roleMiddleware('operator'));

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('requests')
            .select(`${REQUEST_FIELDS}, ${LISTING_SUMMARY}`)
            .eq('operator_id', req.user.id)
            .order('created_at', { ascending: false });
        if (error) {return res.status(400).json({ message: error.message });}
        const requests = data.map(({ listings, ...request }) => ({ ...request, listing: listings }));
        res.json({ requests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    const { errors, values } = validateRequest(req.body);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: 'Invalid request', errors });
    }
    try {
        const { data: listing, error: listingError } = await supabase.from('listings')
            .select('id, status')
            .eq('id', values.listing_id)
            .maybeSingle();
        if (listingError) {return res.status(400).json({ message: listingError.message });}
        if (!listing) {return res.status(404).json({ message: 'Listing not found' });}
        if (listing.status !== 'active') {
            return res.status(409).json({ message: 'This listing is not accepting requests' });
        }

        const { data, error } = await supabase.from('requests')
            .insert([{ ...values, operator_id: req.user.id }])
            .select(REQUEST_FIELDS)
            .single();
        if (error) {
            if (error.code === UNIQUE_VIOLATION) {
                return res.status(409).json({ message: 'You already requested this listing' });
            }
            return res.status(400).json({ message: error.message });
        }
        res.status(201).json({ request: data });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
