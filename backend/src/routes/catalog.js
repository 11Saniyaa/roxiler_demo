const express = require('express');
const { getPool } = require('../db');
const { asyncHandler } = require('../middleware');
const { orderBy, likePattern, toRating } = require('../query');

const router = express.Router();

const STORE_SORT = {
  name: 's.name',
  address: 's.address',
  rating: 'overall_rating',
};

router.get('/stores', asyncHandler(async (req, res) => {
  const sql = `
    SELECT
      s.id,
      s.name,
      s.address,
      ROUND(AVG(r.rating), 1) AS overall_rating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE s.name LIKE ? ESCAPE '\\\\'
      AND s.address LIKE ? ESCAPE '\\\\'
    GROUP BY s.id, s.name, s.address
    ORDER BY ${orderBy(STORE_SORT, req.query.sortBy, req.query.sortOrder, 'name')}
  `;
  const [rows] = await getPool().query(sql, [
    likePattern(req.query.name),
    likePattern(req.query.address),
  ]);

  res.json({
    stores: rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      rating: toRating(row.overall_rating),
    })),
  });
}));

module.exports = router;
