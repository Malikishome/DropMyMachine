const test = require('node:test');
const assert = require('node:assert/strict');
const { parseListingQuery, escapeLike } = require('../utils/listingQuery');

test('empty query yields no filters', () => {
  assert.deepEqual(parseListingQuery({}), { machineTypes: [], footTraffic: null, city: '' });
  assert.deepEqual(parseListingQuery(), { machineTypes: [], footTraffic: null, city: '' });
});

test('machine_type accepts a comma list and trims whitespace', () => {
  const { machineTypes } = parseListingQuery({ machine_type: 'vending, atm' });
  assert.deepEqual(machineTypes, ['vending', 'atm']);
});

test('machine_type drops unknown values and duplicates', () => {
  const { machineTypes } = parseListingQuery({ machine_type: 'vending,bogus,vending,' });
  assert.deepEqual(machineTypes, ['vending']);
});

test('machine_type handles repeated params parsed into an array', () => {
  const { machineTypes } = parseListingQuery({ machine_type: ['atm', 'ice,arcade'] });
  assert.deepEqual(machineTypes, ['atm', 'ice', 'arcade']);
});

test('foot_traffic accepts only known levels', () => {
  assert.equal(parseListingQuery({ foot_traffic: 'high' }).footTraffic, 'high');
  assert.equal(parseListingQuery({ foot_traffic: 'huge' }).footTraffic, null);
  assert.equal(parseListingQuery({ foot_traffic: ['high'] }).footTraffic, null);
});

test('city is trimmed and non-string values are ignored', () => {
  assert.equal(parseListingQuery({ city: '  Tampa ' }).city, 'Tampa');
  assert.equal(parseListingQuery({ city: { $ne: 'x' } }).city, '');
  assert.equal(parseListingQuery({ city: ['a', 'b'] }).city, '');
});

test('escapeLike neutralizes wildcard characters', () => {
  assert.equal(escapeLike('100%_off'), '100\\%\\_off');
  assert.equal(escapeLike('a\\b'), 'a\\\\b');
  assert.equal(escapeLike('Orlando'), 'Orlando');
});
