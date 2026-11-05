const MACHINE_TYPES = ['vending', 'atm', 'arcade', 'ice'];
const LOCATION_TYPES = ['hotel', 'gym', 'office', 'retail'];
const FOOT_TRAFFIC_LEVELS = ['low', 'medium', 'high'];
// 'filled' is deliberately absent: only accepting a request may set it (build-plan item 13).
const OWNER_STATUSES = ['active', 'paused'];

const REQUIRED_TEXT = ['description', 'city'];
const OPTIONAL_TEXT = ['address'];
const ENUM_FIELDS = {
  machine_type: MACHINE_TYPES,
  location_type: LOCATION_TYPES,
  foot_traffic: FOOT_TRAFFIC_LEVELS,
};

const isBlank = (value) => value === undefined || value === null || value === '';

function validateRequiredText(field, raw, errors, values) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    errors[field] = `${field} is required`;
    return;
  }
  values[field] = raw.trim();
}

function validateOptionalText(field, raw, errors, values) {
  if (typeof raw !== 'string') {
    errors[field] = `${field} must be text`;
    return;
  }
  values[field] = raw.trim() || null;
}

function validateEnum(field, raw, allowed, errors, values) {
  if (!allowed.includes(raw)) {
    errors[field] = `${field} must be one of: ${allowed.join(', ')}`;
    return;
  }
  values[field] = raw;
}

// On create, machine_type, description and city are required and status is
// ignored (the route sets it). On partial updates only supplied fields are
// checked, and at least one must be present.
function validateListing(body = {}, { partial = false } = {}) {
  const errors = {};
  const values = {};

  for (const field of REQUIRED_TEXT) {
    if (partial && body[field] === undefined) continue;
    validateRequiredText(field, body[field], errors, values);
  }

  for (const field of OPTIONAL_TEXT) {
    if (body[field] === undefined) continue;
    if (body[field] === null) values[field] = null;
    else validateOptionalText(field, body[field], errors, values);
  }

  for (const [field, allowed] of Object.entries(ENUM_FIELDS)) {
    const raw = body[field];
    if (raw === undefined) {
      if (!partial && field === 'machine_type') errors[field] = `${field} is required`;
      continue;
    }
    if (isBlank(raw) && field !== 'machine_type') {
      values[field] = null;
      continue;
    }
    validateEnum(field, raw, allowed, errors, values);
  }

  if (partial && body.status !== undefined) {
    validateEnum('status', body.status, OWNER_STATUSES, errors, values);
  }

  if (partial && Object.keys(errors).length === 0 && Object.keys(values).length === 0) {
    errors.body = 'No valid fields to update';
  }

  return { errors, values };
}

module.exports = {
  validateListing,
  MACHINE_TYPES,
  LOCATION_TYPES,
  FOOT_TRAFFIC_LEVELS,
  OWNER_STATUSES,
};
