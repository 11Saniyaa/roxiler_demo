const express = require('express');
const { getPool } = require('../db');
const { asyncHandler, requireAuth, requireRole } = require('../middleware');
const { orderBy, toRating, toCount } = require('../query');

const router = express.Router();
router.use(requireAuth, requireRole('store_owner'));

const RATER_SORT = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  rating: 'r.rating',
  submittedAt: 'r.updated_at',
};

router.get('/dashboard', asyncHandler(async (req, res) => {
  const pool = getPool();
  const [stores] = await pool.query(
    'SELECT id, name, email, address FROM stores WHERE owner_id = ?',
    [req.user.id]
  );
  const store = stores[0];
  if (!store) {
    return res.json({ store: null, raters: [] });
  }

  const [summaryRows] = await pool.query(
    `SELECT ROUND(AVG(rating), 1) AS average_rating, COUNT(*) AS rating_count
     FROM ratings WHERE store_id = ?`,
    [store.id]
  );

  const [raters] = await pool.query(
    `
    SELECT u.id, u.name, u.email, u.address, r.rating, r.updated_at AS submitted_at
    FROM ratings r
    INNER JOIN users u ON u.id = r.user_id
    WHERE r.store_id = ?
    ORDER BY ${orderBy(RATER_SORT, req.query.sortBy, req.query.sortOrder, 'name')}
    `,
    [store.id]
  );

  res.json({
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating: toRating(summaryRows[0].average_rating),
      ratingCount: toCount(summaryRows[0].rating_count),
    },
    raters: raters.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      rating: Number(row.rating),
      submittedAt: row.submitted_at,
    })),
  });
}));

module.exports = router;
