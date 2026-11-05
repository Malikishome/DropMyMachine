const test = require('node:test');
const assert = require('node:assert/strict');
const { validateListing } = require('../utils/listingValidation');

const validBody = {
  description: '  Hotel lobby, 200 rooms ',
  city: 'Orlando',
  machine_type: 'vending',
};

test('create accepts the minimum fields and trims text', () => {
  const { errors, values } = validateListing(validBody);
  assert.deepEqual(errors, {});
  assert.equal(values.description, 'Hotel lobby, 200 rooms');
  assert.equal(values.machine_type, 'vending');
});

test('create reports every missing required field', () => {
  const { errors } = validateListing({});
  assert.deepEqual(Object.keys(errors).sort(), ['city', 'description', 'machine_type']);
});

test('create rejects whitespace-only and non-string required text', () => {
  const { errors } = validateListing({ ...validBody, city: '   ', description: 42 });
  assert.ok(errors.city);
  assert.ok(errors.description);
});

test('create rejects values outside each enum', () => {
  const { errors } = validateListing({
    ...validBody,
    machine_type: 'toaster',
    location_type: 'castle',
    foot_traffic: 'extreme',
  });
  assert.ok(errors.machine_type);
  assert.ok(errors.location_type);
  assert.ok(errors.foot_traffic);
});

test('create accepts every valid enum value', () => {
  const { errors, values } = validateListing({
    ...validBody,
    location_type: 'gym',
    foot_traffic: 'high',
    address: ' 1 Main St ',
  });
  assert.deepEqual(errors, {});
  assert.equal(values.location_type, 'gym');
  assert.equal(values.foot_traffic, 'high');
  assert.equal(values.address, '1 Main St');
});

test('create ignores a client-supplied status', () => {
  const { values } = validateListing({ ...validBody, status: 'filled' });
  assert.equal('status' in values, false);
});

test('create turns blank optional fields into null', () => {
  const { errors, values } = validateListing({ ...validBody, address: '  ', foot_traffic: '' });
  assert.deepEqual(errors, {});
  assert.equal(values.address, null);
  assert.equal(values.foot_traffic, null);
});

test('partial update accepts a single field', () => {
  const { errors, values } = validateListing({ city: ' Tampa ' }, { partial: true });
  assert.deepEqual(errors, {});
  assert.deepEqual(values, { city: 'Tampa' });
});

test('partial update rejects an empty body', () => {
  const { errors } = validateListing({}, { partial: true });
  assert.ok(errors.body);
});

test('partial update rejects an unknown-only body', () => {
  const { errors } = validateListing({ user_id: 'someone-else' }, { partial: true });
  assert.ok(errors.body);
});

test('partial update allows active and paused status', () => {
  assert.deepEqual(validateListing({ status: 'paused' }, { partial: true }).values, { status: 'paused' });
  assert.deepEqual(validateListing({ status: 'active' }, { partial: true }).values, { status: 'active' });
});

test('partial update rejects filled and unknown status', () => {
  assert.ok(validateListing({ status: 'filled' }, { partial: true }).errors.status);
  assert.ok(validateListing({ status: 'pending' }, { partial: true }).errors.status);
});

test('partial update cannot blank a required field', () => {
  const { errors } = validateListing({ city: '' }, { partial: true });
  assert.ok(errors.city);
});

test('partial update can clear an optional field', () => {
  const { errors, values } = validateListing({ address: null, foot_traffic: '' }, { partial: true });
  assert.deepEqual(errors, {});
  assert.deepEqual(values, { address: null, foot_traffic: null });
});

test('never returns user_id or other unknown fields in values', () => {
  const { values } = validateListing({ ...validBody, user_id: 'x', id: 'y' });
  assert.equal('user_id' in values, false);
  assert.equal('id' in values, false);
});
