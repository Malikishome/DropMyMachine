const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateRequest, validateRequestDecision, isUuid } = require('../utils/requestValidation');

const UNIQUE_VIOLATION = '23505';
const REQUEST_FIELDS = 'id, listing_id, message, status, created_at';
// Never include address here: it is revealed only after accept (build-plan item 13c).
const LISTING_SUMMARY = 'listings(machine_type, city, status)';
const OPERATOR_SUMMARY = 'profiles(full_name, trust_level)';

router.use(authMiddleware);

// Operators see the requests they sent; location owners see requests on their own listings.
function requestsQueryFor(user) {
    const requests = supabase.from('requests');
    let query;
    if (user.role === 'operator') {
        query = requests.select(`${REQUEST_FIELDS}, ${LISTING_SUMMARY}`).eq('operator_id', user.id);
    } else if (user.role === 'location_owner') {
        query = requests
            .select(`${REQUEST_FIELDS}, listings!inner(machine_type, city, status, user_id), ${OPERATOR_SUMMARY}`)
            .eq('listings.user_id', user.id);
    } else {
        return null;
    }
    return query.order('created_at', { ascending: false });
}

function shapeRequest({ listings, profiles, ...request }) {
    const { user_id: _ownerId, ...listing } = listings;
    return profiles ? { ...request, listing, operator: profiles } : { ...request, listing };
}

router.get('/', async (req, res) => {
    try {
        const query = requestsQueryFor(req.user);
        if (!query) {return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });}
        const { data, error } = await query;
        if (error) {return res.status(400).json({ message: error.message });}
        res.json({ requests: data.map(shapeRequest) });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', roleMiddleware('operator'), async (req, res) => {
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

// Guarded on status so two concurrent decisions cannot both win.
async function decidePending(id, status) {
    const { data, error } = await supabase.from('requests')
        .update({ status })
        .eq('id', id)
        .eq('status', 'pending')
        .select(REQUEST_FIELDS);
    return { request: data?.[0] ?? null, error };
}

// Not transactional: if filling the listing fails, the request is put back to pending.
async function fillListing(request) {
    const { data, error } = await supabase.from('listings')
        .update({ status: 'filled' })
        .eq('id', request.listing_id)
        .eq('status', 'active')
        .select('id');
    if (error || !data?.length) {
        await supabase.from('requests').update({ status: 'pending' }).eq('id', request.id);
        return { error, lostRace: !error };
    }
    const { error: siblingError } = await supabase.from('requests')
        .update({ status: 'declined' })
        .eq('listing_id', request.listing_id)
        .eq('status', 'pending');
    if (siblingError) {console.error('Error declining sibling requests:', siblingError);}
    return {};
}

router.put('/:id', roleMiddleware('location_owner'), async (req, res) => {
    if (!isUuid(req.params.id)) {return res.status(400).json({ message: 'Invalid request id' });}
    const { errors, values } = validateRequestDecision(req.body);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: 'Invalid decision', errors });
    }
    try {
        const { data: existing, error: loadError } = await supabase.from('requests')
            .select(`${REQUEST_FIELDS}, listings!inner(status, user_id)`)
            .eq('id', req.params.id)
            .eq('listings.user_id', req.user.id)
            .maybeSingle();
        if (loadError) {return res.status(400).json({ message: loadError.message });}
        if (!existing) {return res.status(404).json({ message: 'Request not found' });}
        if (existing.status !== 'pending') {
            return res.status(409).json({ message: 'This request has already been answered' });
        }
        if (values.status === 'accepted' && existing.listings.status !== 'active') {
            return res.status(409).json({ message: 'Only active listings can accept a request' });
        }

        const { request, error } = await decidePending(existing.id, values.status);
        if (error) {return res.status(400).json({ message: error.message });}
        if (!request) {return res.status(409).json({ message: 'This request has already been answered' });}

        if (values.status === 'accepted') {
            const { error: fillError, lostRace } = await fillListing(request);
            if (lostRace) {return res.status(409).json({ message: 'Only active listings can accept a request' });}
            if (fillError) {
                console.error('Error filling listing:', fillError);
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
        res.json({ request });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
