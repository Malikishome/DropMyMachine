const MESSAGE_MAX_LENGTH = 500;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Body for POST /api/requests: listing_id is required, message is optional.
// A blank message is stored as null so the column never holds empty strings.
function validateRequest(body = {}) {
  const errors = {};
  const values = {};

  if (typeof body.listing_id !== 'string' || !UUID_PATTERN.test(body.listing_id)) {
    errors.listing_id = 'listing_id must be a valid listing id';
  } else {
    values.listing_id = body.listing_id;
  }

  const { message } = body;
  if (message === undefined || message === null) {
    values.message = null;
  } else if (typeof message !== 'string') {
    errors.message = 'message must be text';
  } else if (message.trim().length > MESSAGE_MAX_LENGTH) {
    errors.message = `message must be ${MESSAGE_MAX_LENGTH} characters or fewer`;
  } else {
    values.message = message.trim() || null;
  }

  return { errors, values };
}

module.exports = { validateRequest, MESSAGE_MAX_LENGTH };
