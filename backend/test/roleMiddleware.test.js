const test = require('node:test');
const assert = require('node:assert/strict');
const roleMiddleware = require('../middleware/roleMiddleware');

function mockRes() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

test('roleMiddleware calls next() when req.user.role matches the required role', () => {
  const middleware = roleMiddleware('operator');
  const req = { user: { role: 'operator' } };
  const res = mockRes();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('roleMiddleware returns 403 when req.user.role does not match', () => {
  const middleware = roleMiddleware('operator');
  const req = { user: { role: 'location_owner' } };
  const res = mockRes();

  middleware(req, res, () => {
    throw new Error('next() should not be called');
  });

  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /Forbidden/);
});

test('roleMiddleware returns 401 when req.user has no role', () => {
  const middleware = roleMiddleware('operator');
  const req = { user: {} };
  const res = mockRes();

  middleware(req, res, () => {
    throw new Error('next() should not be called');
  });

  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /Unauthorized/);
});

test('roleMiddleware returns 401 when req.user is undefined', () => {
  const middleware = roleMiddleware('operator');
  const req = {};
  const res = mockRes();

  middleware(req, res, () => {
    throw new Error('next() should not be called');
  });

  assert.equal(res.statusCode, 401);
});
