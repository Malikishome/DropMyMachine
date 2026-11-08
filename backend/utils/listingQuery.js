const { MACHINE_TYPES, FOOT_TRAFFIC_LEVELS } = require('./listingValidation');

// Express parses repeated params into arrays and bracket syntax into objects,
// so every query value is coerced to a string before use.
const asString = (value) => (typeof value === 'string' ? value.trim() : '');

function parseMachineTypes(raw) {
  const parts = (Array.isArray(raw) ? raw : [raw]).flatMap((item) => asString(item).split(','));
  return [...new Set(parts.map((part) => part.trim()).filter((part) => MACHINE_TYPES.includes(part)))];
}

function parseFootTraffic(raw) {
  const value = asString(raw);
  return FOOT_TRAFFIC_LEVELS.includes(value) ? value : null;
}

function escapeLike(text) {
  return text.replace(/[\\%_]/g, '\\$&');
}

function parseListingQuery(query = {}) {
  return {
    machineTypes: parseMachineTypes(query.machine_type),
    footTraffic: parseFootTraffic(query.foot_traffic),
    city: asString(query.city),
  };
}

module.exports = { parseListingQuery, escapeLike };
