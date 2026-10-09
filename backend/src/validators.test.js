const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateName,
  validateAddress,
  validatePassword,
  validateEmail,
  validateRating,
  collectErrors,
} = require('./validators');

test('name must be 20 to 60 characters', () => {
  assert.ok(validateName('Too Short Name'));
  assert.equal(validateName('System Administrator One'), null);
  assert.ok(validateName('A'.repeat(61)));
  assert.equal(validateName(`  ${'A'.repeat(20)}  `), null);
});

test('address is required and capped at 400 characters', () => {
  assert.ok(validateAddress('   '));
  assert.equal(validateAddress('14 Registry House'), null);
  assert.ok(validateAddress('A'.repeat(401)));
});

test('password length, uppercase letter, and special character', () => {
  assert.ok(validatePassword('short1A'));
  assert.ok(validatePassword('alllower1!'));
  assert.ok(validatePassword('NoSpecial1'));
  assert.equal(validatePassword('Admin@123'), null);
  assert.ok(validatePassword('Admin@123456789012'));
});

test('email follows a standard pattern', () => {
  assert.equal(validateEmail('admin@roxiler.com'), null);
  assert.ok(validateEmail('not-an-email'));
  assert.ok(validateEmail('a@b'));
});

test('rating is an integer from 1 to 5', () => {
  assert.equal(validateRating(1), null);
  assert.equal(validateRating(5), null);
  assert.ok(validateRating(0));
  assert.ok(validateRating(6));
  assert.ok(validateRating(3.5));
});

test('collectErrors drops valid fields', () => {
  assert.deepEqual(collectErrors({ name: null, email: 'Enter a valid email address.' }), {
    email: 'Enter a valid email address.',
  });
});
