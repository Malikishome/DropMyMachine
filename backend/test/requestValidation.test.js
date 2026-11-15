const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRequest, MESSAGE_MAX_LENGTH } = require('../utils/requestValidation');

const listingId = '3ba790b3-4f4f-4f09-bc4e-c06c6e01d30e';

test('accepts a listing id with no message', () => {
  const { errors, values } = validateRequest({ listing_id: listingId });
  assert.deepEqual(errors, {});
  assert.deepEqual(values, { listing_id: listingId, message: null });
});

test('rejects a missing, blank, or non-uuid listing_id', () => {
  for (const listing_id of [undefined, '', '   ', 'not-a-uuid', 42, null]) {
    const { errors } = validateRequest({ listing_id });
    assert.ok(errors.listing_id, `expected an error for ${JSON.stringify(listing_id)}`);
  }
});

test('accepts an uppercase uuid', () => {
  const { errors } = validateRequest({ listing_id: listingId.toUpperCase() });
  assert.deepEqual(errors, {});
});

test('stores an empty or whitespace-only message as null', () => {
  for (const message of ['', '   ', null]) {
    const { errors, values } = validateRequest({ listing_id: listingId, message });
    assert.deepEqual(errors, {});
    assert.equal(values.message, null);
  }
});

test('trims the message', () => {
  const { values } = validateRequest({ listing_id: listingId, message: '  I have 3 machines.  ' });
  assert.equal(values.message, 'I have 3 machines.');
});

test('allows a message at the limit and rejects one over it', () => {
  const atLimit = 'x'.repeat(MESSAGE_MAX_LENGTH);
  assert.deepEqual(validateRequest({ listing_id: listingId, message: atLimit }).errors, {});

  const { errors } = validateRequest({ listing_id: listingId, message: `${atLimit}y` });
  assert.ok(errors.message);
});

test('rejects a non-string message', () => {
  const { errors } = validateRequest({ listing_id: listingId, message: { text: 'hi' } });
  assert.ok(errors.message);
});

test('reports listing_id and message errors together', () => {
  const { errors } = validateRequest({ listing_id: 'nope', message: 12 });
  assert.deepEqual(Object.keys(errors).sort(), ['listing_id', 'message']);
});
