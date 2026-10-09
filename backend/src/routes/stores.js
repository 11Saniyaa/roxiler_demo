const express = require('express');
const { getPool } = require('../db');
const { asyncHandler, requireAuth, requireRole } = require('../middleware');
const { httpError } = require('../httpError');
const { orderBy, likePattern, toRating } = require('../query');
const { validateRating, collectErrors } = require('../validators');

const router = express.Router();
router.use(requireAuth, requireRole('user'));

const STORE_SORT = {
  name: 's.name',
  address: 's.address',
  overallRating: 'overall_rating',
  userRating: 'user_rating',
};

router.get('/', asyncHandler(async (req, res) => {
  const sql = `
    SELECT
      s.id,
      s.name,
      s.address,
      ROUND(AVG(r.rating), 1) AS overall_rating,
      MAX(ur.rating) AS user_rating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
    WHERE s.name LIKE ? ESCAPE '\\\\'
      AND s.address LIKE ? ESCAPE '\\\\'
    GROUP BY s.id, s.name, s.address
    ORDER BY ${orderBy(STORE_SORT, req.query.sortBy, req.query.sortOrder, 'name')}
  `;
  const [rows] = await getPool().query(sql, [
    req.user.id,
    likePattern(req.query.name),
    likePattern(req.query.address),
  ]);

  res.json({
    stores: rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      overallRating: toRating(row.overall_rating),
      userRating: row.user_rating === null ? null : Number(row.user_rating),
    })),
  });
}));

router.put('/:id/rating', asyncHandler(async (req, res) => {
  const storeId = Number(req.params.id);
  if (!Number.isInteger(storeId) || storeId < 1) throw httpError(404, 'Store not found.');

  const fields = collectErrors({ rating: validateRating(req.body.rating) });
  if (Object.keys(fields).length) {
    throw httpError(400, 'Please correct the highlighted fields.', fields);
  }

  const pool = getPool();
  const [stores] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
  if (!stores[0]) throw httpError(404, 'Store not found.');

  const [existing] = await pool.query(
    'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
    [req.user.id, storeId]
  );

  await pool.query(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
    [req.user.id, storeId, Number(req.body.rating)]
  );

  res.json({
    rating: Number(req.body.rating),
    updated: existing.length > 0,
  });
}));

module.exports = router;
