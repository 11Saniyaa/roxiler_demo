const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool;

function getPool() {
  if (!pool) throw new Error('Database is not initialized.');
  return pool;
}

function assertIdentifier(value, label) {
  if (!/^[A-Za-z0-9_]+$/.test(value || '')) {
    throw new Error(`${label} contains unsupported characters.`);
  }
}

async function initDatabase() {
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
  } = process.env;

  assertIdentifier(DB_NAME, 'DB_NAME');

  const bootstrap = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: false,
  });

  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrap.end();

  pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      address VARCHAR(400) NOT NULL,
      role ENUM('admin', 'user', 'store_owner') NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_users_email (email),
      KEY idx_users_role (role),
      KEY idx_users_name (name)
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL,
      address VARCHAR(400) NOT NULL,
      owner_id INT UNSIGNED NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_stores_email (email),
      UNIQUE KEY uq_stores_owner (owner_id),
      KEY idx_stores_name (name),
      CONSTRAINT fk_stores_owner
        FOREIGN KEY (owner_id) REFERENCES users (id)
        ON DELETE RESTRICT
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      store_id INT UNSIGNED NOT NULL,
      rating TINYINT UNSIGNED NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_ratings_user_store (user_id, store_id),
      KEY idx_ratings_store (store_id),
      CONSTRAINT fk_ratings_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
      CONSTRAINT fk_ratings_store
        FOREIGN KEY (store_id) REFERENCES stores (id)
        ON DELETE CASCADE,
      CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5)
    ) ENGINE=InnoDB
  `);

  await seedIfEmpty();
}

async function seedIfEmpty() {
  const [existing] = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (Number(existing[0].count) > 0) return;

  const users = [
    {
      name: 'System Administrator One',
      email: 'admin@roxiler.com',
      password: 'Admin@123',
      address: '14 Registry House, Administrative Quarter, Central Business District',
      role: 'admin',
    },
    {
      name: 'Alexandra Josephine Miller',
      email: 'alexandra.miller@example.com',
      password: 'User@1234',
      address: '48 Maple Residency, Lakeview Apartments, Sector 12, North End',
      role: 'user',
    },
    {
      name: 'Benjamin Christopher Walsh',
      email: 'benjamin.walsh@example.com',
      password: 'User@1234',
      address: '7 Cedar Court, Hilltop Colony, West Ridge, Block C',
      role: 'user',
    },
    {
      name: 'Priya Nandini Krishnamurthy',
      email: 'priya.krishnamurthy@example.com',
      password: 'User@1234',
      address: '210 Orchard Apartments, Green Park Extension, South Avenue',
      role: 'user',
    },
    {
      name: 'Margaret Eleanor Thompson',
      email: 'margaret.thompson@greenwood.com',
      password: 'Owner@123',
      address: '18 Willow Court, Riverside District, North Quarter',
      role: 'store_owner',
    },
    {
      name: 'Jonathan Patrick Sullivan',
      email: 'jonathan.sullivan@harborview.com',
      password: 'Owner@123',
      address: '3 Wharf Cottage, Harbor District, Pier Road',
      role: 'store_owner',
    },
    {
      name: 'Catherine Marie Holloway',
      email: 'catherine.holloway@lantern.com',
      password: 'Owner@123',
      address: '55 Old Town Walk, Book Row, Lantern Lane',
      role: 'store_owner',
    },
  ];

  const stores = [
    {
      name: 'Greenwood Organic Grocery',
      email: 'hello@greenwoodgrocery.com',
      address: '42 Elm Street, Riverside Market, North Quarter',
      ownerEmail: 'margaret.thompson@greenwood.com',
    },
    {
      name: 'Harborview Coffee Roasters',
      email: 'hello@harborviewcoffee.com',
      address: '9 Pier Road, Harbor District, Wharf Side',
      ownerEmail: 'jonathan.sullivan@harborview.com',
    },
    {
      name: 'Lantern Lane Booksellers',
      email: 'hello@lanternbooks.com',
      address: '160 Lantern Lane, Old Town, Book Row',
      ownerEmail: 'catherine.holloway@lantern.com',
    },
  ];

  const ratings = [
    ['alexandra.miller@example.com', 'hello@greenwoodgrocery.com', 5],
    ['alexandra.miller@example.com', 'hello@harborviewcoffee.com', 4],
    ['alexandra.miller@example.com', 'hello@lanternbooks.com', 2],
    ['benjamin.walsh@example.com', 'hello@greenwoodgrocery.com', 4],
    ['benjamin.walsh@example.com', 'hello@harborviewcoffee.com', 5],
    ['priya.krishnamurthy@example.com', 'hello@greenwoodgrocery.com', 3],
    ['priya.krishnamurthy@example.com', 'hello@lanternbooks.com', 5],
  ];

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [countRows] = await connection.query('SELECT COUNT(*) AS count FROM users FOR UPDATE');
    if (Number(countRows[0].count) > 0) {
      await connection.commit();
      return;
    }

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await connection.query(
        `INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)`,
        [user.name, user.email, passwordHash, user.address, user.role]
      );
    }

    const [userRows] = await connection.query('SELECT id, email FROM users');
    const userIds = Object.fromEntries(userRows.map((row) => [row.email, row.id]));

    for (const store of stores) {
      await connection.query(
        `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
        [store.name, store.email, store.address, userIds[store.ownerEmail]]
      );
    }

    const [storeRows] = await connection.query('SELECT id, email FROM stores');
    const storeIds = Object.fromEntries(storeRows.map((row) => [row.email, row.id]));

    for (const [userEmail, storeEmail, rating] of ratings) {
      await connection.query(
        `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
        [userIds[userEmail], storeIds[storeEmail], rating]
      );
    }

    await connection.commit();
    console.log('Seeded demo accounts, stores, and ratings.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { initDatabase, getPool };
