const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initDatabase } = require('./db');
const { errorHandler } = require('./middleware');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
const ownerRoutes = require('./routes/owner');
const catalogRoutes = require('./routes/catalog');

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing ${name} in backend/.env`);
  }
}

async function main() {
  ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'].forEach(requireEnv);
  if (process.env.DB_PASSWORD === undefined) {
    throw new Error('Missing DB_PASSWORD in backend/.env');
  }

  await initDatabase();

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });
  app.use('/api/catalog', catalogRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/stores', storeRoutes);
  app.use('/api/owner', ownerRoutes);
  app.use('/api', (req, res) => {
    res.status(404).json({ message: 'Not found.' });
  });
  app.use(errorHandler);

  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start the API.');
  if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ECONNREFUSED') {
    console.error('Check that MySQL is running and backend/.env credentials are correct.');
  }
  console.error(error);
  process.exit(1);
});
