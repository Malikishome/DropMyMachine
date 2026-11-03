const test = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../config/db');

function loadWithSupabase({ getUser, profile }) {
  const supabase = {
    auth: { getUser },
    from: () => ({
      select: () => ({
        eq: () => ({ single: async () => profile }),
      }),
    }),
  };
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: supabase };
  delete require.cache[require.resolve('../middleware/authMiddleware')];
  return require('../middleware/authMiddleware');
}

function mockRes() {
  const res = {};
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

const validUser = async () => ({ data: { user: { id: 'u1', email: 'a@b.c' } }, error: null });

test('authMiddleware attaches the profile role to req.user', async () => {
  const authMiddleware = loadWithSupabase({
    getUser: validUser,
    profile: { data: { role: 'operator' }, error: null },
  });
  const req = { headers: { authorization: 'Bearer tok' } };
  let called = false;

  await authMiddleware(req, mockRes(), () => { called = true; });

  assert.equal(called, true);
  assert.equal(req.user.id, 'u1');
  assert.equal(req.user.email, 'a@b.c');
  assert.equal(req.user.role, 'operator');
});

test('authMiddleware returns 401 when the profile row is missing', async () => {
  const authMiddleware = loadWithSupabase({
    getUser: validUser,
    profile: { data: null, error: { code: 'PGRST116', message: 'no rows' } },
  });
  const req = { headers: { authorization: 'Bearer tok' } };
  const res = mockRes();
  let called = false;

  await authMiddleware(req, res, () => { called = true; });

  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.equal(req.user, undefined);
});

test('authMiddleware returns 500 when the profile lookup fails for another reason', async (t) => {
  t.mock.method(console, 'error', () => {});
  const authMiddleware = loadWithSupabase({
    getUser: validUser,
    profile: { data: null, error: { code: '08006', message: 'connection failure' } },
  });
  const req = { headers: { authorization: 'Bearer tok' } };
  const res = mockRes();
  let called = false;

  await authMiddleware(req, res, () => { called = true; });

  assert.equal(called, false);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, 'Internal server error');
  assert.equal(req.user, undefined);
});

test('authMiddleware returns 401 for an invalid token', async () => {
  const authMiddleware = loadWithSupabase({
    getUser: async () => ({ data: { user: null }, error: { message: 'bad' } }),
    profile: { data: { role: 'operator' }, error: null },
  });
  const res = mockRes();

  await authMiddleware({ headers: { authorization: 'Bearer tok' } }, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'Invalid token');
});

test('authMiddleware returns 401 when the authorization header is missing', async () => {
  const authMiddleware = loadWithSupabase({
    getUser: validUser,
    profile: { data: { role: 'operator' }, error: null },
  });
  const res = mockRes();

  await authMiddleware({ headers: {} }, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'Authorization header missing');
});
