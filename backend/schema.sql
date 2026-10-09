-- Roxiler Stores schema. The API also creates these tables on startup.
CREATE DATABASE IF NOT EXISTS roxiler_stores
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE roxiler_stores;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;
