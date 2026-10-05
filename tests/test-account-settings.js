'use strict';

/**
 * POST /api/settings/account: renaming the single account and setting its
 * e-mail address (which single sign-on matches against).
 *
 * Covered:
 *   1. Migration 16 adds the email column; addUser() stores an e-mail.
 *   2. The endpoint demands the current password and validates its input.
 *   3. A rename re-issues the session cookie under the new name, keeps the
 *      MFA state of the row, and the old name no longer exists.
 *   4. An empty e-mail clears it.
 *   5. API key authentication cannot use it.
 */

const assert = require('assert');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { mountRouter } = require('./helpers/mount-router');

const PASSWORD = 'correct-horse-battery';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅  ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌  ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

function sessionCookie(response) {
  const cookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [response.headers.get('set-cookie') || ''];
  for (const cookie of cookies) {
    const match = /^jwt=([^;]*)/.exec(cookie);
    if (match && match[1]) return decodeURIComponent(match[1]);
  }
  return null;
}

(async () => {
  const harness = await mountRouter({
    env: { LOGIN_RATE_LIMIT_MAX: '1000' },
  });
  const secret = process.env.JWT_SECRET;
  const db = harness.documentModel;

  await test('the users table has an email column and addUser() stores it', async () => {
    await db.addUser('admin', await bcrypt.hash(PASSWORD, 4), 'a@example.com');
    const user = await db.getUser('admin');
    assert.strictEqual(user.email, 'a@example.com');
  });

  await db.setUserMfaSettings('admin', true, 'SECRETSECRET');
  const admin = await db.getUser('admin');
  let session = jwt.sign(
    { id: admin.id, username: 'admin', typ: 'session', auth: 'oidc' },
    secret,
    { expiresIn: '1h' }
  );

  const post = (body, headers = {}) =>
    fetch(harness.base + '/api/settings/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `jwt=${session}`,
        ...headers,
      },
      body: JSON.stringify(body),
      redirect: 'manual',
    });

  await test('a wrong current password is refused with 401', async () => {
    const res = await post({
      username: 'andy',
      email: 'andy@example.com',
      currentPassword: 'wrong-password',
    });
    assert.strictEqual(res.status, 401);
    assert.ok(await db.getUser('admin'), 'nothing was renamed');
  });

  await test('a missing current password is refused with 400', async () => {
    const res = await post({ username: 'andy', email: '' });
    assert.strictEqual(res.status, 400);
  });

  await test('an invalid e-mail is refused with 400', async () => {
    const res = await post({
      username: 'andy',
      email: 'not-an-address',
      currentPassword: PASSWORD,
    });
    assert.strictEqual(res.status, 400);
  });

  await test('an empty username is refused with 400', async () => {
    const res = await post({ username: '  ', currentPassword: PASSWORD });
    assert.strictEqual(res.status, 400);
  });

  await test('a rename and new e-mail are saved and the session follows', async () => {
    const res = await post({
      username: 'andy',
      email: 'andy@example.com',
      currentPassword: PASSWORD,
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.deepStrictEqual(body.data, {
      username: 'andy',
      email: 'andy@example.com',
    });

    const renamed = await db.getUser('andy');
    assert.strictEqual(renamed.email, 'andy@example.com');
    assert.strictEqual(renamed.mfa_enabled, 1, 'MFA state stays with the row');
    assert.strictEqual(await db.getUser('admin'), undefined);

    const newSession = sessionCookie(res);
    const payload = jwt.verify(newSession, secret);
    assert.strictEqual(payload.username, 'andy');
    assert.strictEqual(payload.typ, 'session');
    assert.strictEqual(payload.auth, 'oidc', 'the sign-in method is kept');
    session = newSession;
  });

  await test('an empty e-mail clears it', async () => {
    const res = await post({
      username: 'andy',
      email: '',
      currentPassword: PASSWORD,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual((await db.getUser('andy')).email, null);
  });

  await test('API key authentication cannot change the account', async () => {
    const res = await fetch(harness.base + '/api/settings/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY,
      },
      body: JSON.stringify({
        username: 'mallory',
        currentPassword: PASSWORD,
      }),
    });
    assert.strictEqual(res.status, 403);
    assert.ok(await db.getUser('andy'));
  });

  await harness.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
