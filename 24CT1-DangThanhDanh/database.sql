CREATE DATABASE IF NOT EXISTS shopsach77 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopsach77;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(190) NOT NULL,
  price INT NOT NULL,
  old_price INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  badge VARCHAR(80) NOT NULL DEFAULT 'Mới',
  img TEXT NOT NULL,
  description TEXT,
  stock INT NOT NULL DEFAULT 5,
  hidden TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_id VARCHAR(64) NOT NULL,
  total INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id VARCHAR(64) NOT NULL,
  product_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS borrow_slips (
  id VARCHAR(64) PRIMARY KEY,
  member_name VARCHAR(120) NOT NULL,
  member_email VARCHAR(190) NOT NULL,
  created_by VARCHAR(64) NOT NULL,
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_at DATE NOT NULL,
  status ENUM('Đang mượn', 'Đã trả', 'Quá hạn') NOT NULL DEFAULT 'Đang mượn',
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS borrow_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  slip_id VARCHAR(64) NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  returned_quantity INT NOT NULL DEFAULT 0,
  FOREIGN KEY (slip_id) REFERENCES borrow_slips(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
