const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db');
const { asyncHandler, requireAuth } = require('../middleware');
const { httpError } = require('../httpError');
const {
  validateName,
  validateAddress,
  validatePassword,
  validateEmail,
  collectErrors,
  cleanText,
  cleanEmail,
} = require('../validators');

const router = express.Router();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    role: row.role,
  };
}

router.post('/register', asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name);
  const email = cleanEmail(req.body.email);
  const address = cleanText(req.body.address);
  const password = String(req.body.password ?? '');

  const fields = collectErrors({
    name: validateName(name),
    email: validateEmail(email),
    address: validateAddress(address),
    password: validatePassword(password),
  });
  if (Object.keys(fields).length) {
    throw httpError(400, 'Please correct the highlighted fields.', fields);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await getPool().query(
    `INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, 'user')`,
    [name, email, passwordHash, address]
  );

  const user = { id: result.insertId, name, email, address, role: 'user' };
  res.status(201).json({ token: signToken(user), user });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password ?? '');
  const fields = collectErrors({
    email: validateEmail(email),
    password: password ? null : 'Password is required.',
  });
  if (Object.keys(fields).length) {
    throw httpError(400, 'Please correct the highlighted fields.', fields);
  }

  const [rows] = await getPool().query(
    `SELECT id, name, email, password_hash, address, role FROM users WHERE email = ?`,
    [email]
  );
  const user = rows[0];
  const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !passwordOk) {
    throw httpError(401, 'Email or password is incorrect.');
  }

  res.json({ token: signToken(user), user: publicUser(user) });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const [rows] = await getPool().query(
    `SELECT id, name, email, address, role FROM users WHERE id = ?`,
    [req.user.id]
  );
  if (!rows[0]) throw httpError(401, 'Session expired. Please log in again.');
  res.json({ user: publicUser(rows[0]) });
}));

router.put('/password', requireAuth, asyncHandler(async (req, res) => {
  const currentPassword = String(req.body.currentPassword ?? '');
  const newPassword = String(req.body.newPassword ?? '');
  const fields = collectErrors({
    currentPassword: currentPassword ? null : 'Current password is required.',
    newPassword: validatePassword(newPassword),
  });
  if (Object.keys(fields).length) {
    throw httpError(400, 'Please correct the highlighted fields.', fields);
  }
  if (currentPassword === newPassword) {
    throw httpError(400, 'New password must be different from the current password.', {
      newPassword: 'New password must be different from the current password.',
    });
  }

  const [rows] = await getPool().query(
    'SELECT password_hash FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!rows[0]) throw httpError(401, 'Session expired. Please log in again.');

  const matches = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!matches) {
    throw httpError(400, 'Current password is incorrect.', {
      currentPassword: 'Current password is incorrect.',
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await getPool().query('UPDATE users SET password_hash = ? WHERE id = ?', [
    passwordHash,
    req.user.id,
  ]);
  res.json({ message: 'Password updated.' });
}));

module.exports = router;
