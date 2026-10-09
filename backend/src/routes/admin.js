const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool } = require('../db');
const { asyncHandler, requireAuth, requireRole } = require('../middleware');
const { httpError } = require('../httpError');
const { orderBy, likePattern, toRating, toCount } = require('../query');
const {
  validateName,
  validateAddress,
  validatePassword,
  validateEmail,
  validateRole,
  collectErrors,
  cleanText,
  cleanEmail,
} = require('../validators');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

const USER_SORT = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  role: `CASE u.role
    WHEN 'admin' THEN 'System Administrator'
    WHEN 'store_owner' THEN 'Store Owner'
    ELSE 'Normal User' END`,
  rating: 'rating',
};

const STORE_SORT = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'rating',
};

const USER_LIST_SQL = `
  SELECT
    u.id,
    u.name,
    u.email,
    u.address,
    u.role,
    s.name AS store_name,
    ROUND(AVG(r.rating), 1) AS rating
  FROM users u
  LEFT JOIN stores s ON s.owner_id = u.id
  LEFT JOIN ratings r ON r.store_id = s.id
`;

function userFilters(query) {
  const role = ['admin', 'user', 'store_owner'].includes(query.role) ? query.role : '';
  return {
    clause: `WHERE u.name LIKE ? ESCAPE '\\\\'
      AND u.email LIKE ? ESCAPE '\\\\'
      AND u.address LIKE ? ESCAPE '\\\\'
      AND (? = '' OR u.role = ?)`,
    params: [
      likePattern(query.name),
      likePattern(query.email),
      likePattern(query.address),
      role,
      role,
    ],
  };
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    role: row.role,
    storeName: row.store_name || null,
    rating: row.role === 'store_owner' ? toRating(row.rating) : null,
  };
}

router.get('/stats', asyncHandler(async (req, res) => {
  const [rows] = await getPool().query(`
    SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM stores) AS stores,
      (SELECT COUNT(*) FROM ratings) AS ratings
  `);
  res.json({
    users: toCount(rows[0].users),
    stores: toCount(rows[0].stores),
    ratings: toCount(rows[0].ratings),
  });
}));

router.get('/users', asyncHandler(async (req, res) => {
  const filters = userFilters(req.query);
  const sql = `
    ${USER_LIST_SQL}
    ${filters.clause}
    GROUP BY u.id, u.name, u.email, u.address, u.role, s.name
    ORDER BY ${orderBy(USER_SORT, req.query.sortBy, req.query.sortOrder, 'name')}
  `;
  const [rows] = await getPool().query(sql, filters.params);
  res.json({ users: rows.map(mapUser) });
}));

router.get('/users/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw httpError(404, 'User not found.');

  const [rows] = await getPool().query(
    `
    ${USER_LIST_SQL}
    WHERE u.id = ?
    GROUP BY u.id, u.name, u.email, u.address, u.role, s.name
    `,
    [id]
  );
  if (!rows[0]) throw httpError(404, 'User not found.');
  res.json({ user: mapUser(rows[0]) });
}));

router.post('/users', asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name);
  const email = cleanEmail(req.body.email);
  const address = cleanText(req.body.address);
  const password = String(req.body.password ?? '');
  const role = req.body.role;

  const fields = collectErrors({
    name: validateName(name),
    email: validateEmail(email),
    address: validateAddress(address),
    password: validatePassword(password),
    role: validateRole(role, ['admin', 'user']),
  });
  if (Object.keys(fields).length) {
    throw httpError(400, 'Please correct the highlighted fields.', fields);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await getPool().query(
    `INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)`,
    [name, email, passwordHash, address, role]
  );

  res.status(201).json({
    user: { id: result.insertId, name, email, address, role, storeName: null, rating: null },
  });
}));

router.get('/stores', asyncHandler(async (req, res) => {
  const sql = `
    SELECT
      s.id,
      s.name,
      s.email,
      s.address,
      u.name AS owner_name,
      ROUND(AVG(r.rating), 1) AS rating
    FROM stores s
    INNER JOIN users u ON u.id = s.owner_id
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE s.name LIKE ? ESCAPE '\\\\'
      AND s.email LIKE ? ESCAPE '\\\\'
      AND s.address LIKE ? ESCAPE '\\\\'
    GROUP BY s.id, s.name, s.email, s.address, u.name
    ORDER BY ${orderBy(STORE_SORT, req.query.sortBy, req.query.sortOrder, 'name')}
  `;
  const [rows] = await getPool().query(sql, [
    likePattern(req.query.name),
    likePattern(req.query.email),
    likePattern(req.query.address),
  ]);
  res.json({
    stores: rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      ownerName: row.owner_name,
      rating: toRating(row.rating),
    })),
  });
}));

router.post('/stores', asyncHandler(async (req, res) => {
  const storeName = cleanText(req.body.name);
  const storeEmail = cleanEmail(req.body.email);
  const storeAddress = cleanText(req.body.address);
  const ownerName = cleanText(req.body.ownerName);
  const ownerEmail = cleanEmail(req.body.ownerEmail);
  const ownerAddress = cleanText(req.body.ownerAddress);
  const ownerPassword = String(req.body.ownerPassword ?? '');

  const fields = collectErrors({
    name: validateName(storeName),
    email: validateEmail(storeEmail),
    address: validateAddress(storeAddress),
    ownerName: validateName(ownerName),
    ownerEmail: validateEmail(ownerEmail),
    ownerAddress: validateAddress(ownerAddress),
    ownerPassword: validatePassword(ownerPassword),
  });
  if (storeEmail && ownerEmail && storeEmail === ownerEmail) {
    fields.ownerEmail = 'Owner email must be different from the store email.';
  }
  if (Object.keys(fields).length) {
    throw httpError(400, 'Please correct the highlighted fields.', fields);
  }

  const passwordHash = await bcrypt.hash(ownerPassword, 10);
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [ownerResult] = await connection.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES (?, ?, ?, ?, 'store_owner')`,
      [ownerName, ownerEmail, passwordHash, ownerAddress]
    );
    const [storeResult] = await connection.query(
      `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
      [storeName, storeEmail, storeAddress, ownerResult.insertId]
    );
    await connection.commit();
    res.status(201).json({
      store: {
        id: storeResult.insertId,
        name: storeName,
        email: storeEmail,
        address: storeAddress,
        ownerName,
        rating: null,
      },
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

module.exports = router;
