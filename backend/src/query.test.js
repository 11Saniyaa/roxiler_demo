const test = require('node:test');
const assert = require('node:assert/strict');
const { orderBy, likePattern, toRating } = require('./query');

test('orderBy only allows known columns and directions', () => {
  const allowed = { name: 'u.name', email: 'u.email' };
  assert.equal(orderBy(allowed, 'name', 'asc', 'email'), 'u.name ASC');
  assert.equal(orderBy(allowed, 'email', 'DESC', 'name'), 'u.email DESC');
  assert.equal(orderBy(allowed, 'name; DROP TABLE users', 'asc', 'name'), 'u.name ASC');
  assert.equal(orderBy(allowed, 'name', 'sideways', 'name'), 'u.name ASC');
});

test('likePattern escapes wildcard characters', () => {
  assert.equal(likePattern('north'), '%north%');
  assert.equal(likePattern('100%_main'), '%100\\%\\_main%');
});

test('toRating rounds to one decimal and preserves null', () => {
  assert.equal(toRating(null), null);
  assert.equal(toRating('4.25'), 4.3);
  assert.equal(toRating(4), 4);
});
