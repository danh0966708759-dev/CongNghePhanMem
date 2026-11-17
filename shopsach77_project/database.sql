-- ====================================================================
-- CƠ SỞ DỮ LIỆU ĐẦY ĐỦ CHO DỰ ÁN SHOP SÁCH 77
-- ĐÃ BAO GỒM TẠO BẢNG VÀ NẠP DỮ LIỆU MẪU ĐẦY ĐỦ
-- ====================================================================

CREATE DATABASE IF NOT EXISTS shop_sach_77project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shop_sach_77project;

-- 1. BẢNG NGƯỜI DÙNG (users)
DROP TABLE IF EXISTS borrow_items;
DROP TABLE IF EXISTS borrow_slips;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG SẢN PHẨM SÁCH (products)
CREATE TABLE products (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG ĐƠN HÀNG (orders)
CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_id VARCHAR(64) NULL,
  customer_name VARCHAR(120) NULL,
  customer_email VARCHAR(190) NULL,
  customer_phone VARCHAR(40) NULL,
  customer_address TEXT NULL,
  note TEXT NULL,
  total INT NOT NULL,
  payment_method VARCHAR(100) DEFAULT 'Chuyển khoản mã QR Agribank',
  payment_status VARCHAR(100) DEFAULT 'Đã thanh toán qua mã QR (Chờ xác nhận)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG CHI TIẾT ĐƠN HÀNG (order_items)
CREATE TABLE order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG YÊU THÍCH (favorites)
CREATE TABLE favorites (
  user_id VARCHAR(64) NOT NULL,
  product_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG PHIẾU MƯỢN SÁCH (borrow_slips)
CREATE TABLE borrow_slips (
  id VARCHAR(64) PRIMARY KEY,
  member_name VARCHAR(120) NOT NULL,
  member_email VARCHAR(190) NOT NULL,
  created_by VARCHAR(64) NOT NULL,
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_at DATE NOT NULL,
  status ENUM('Đang mượn', 'Đã trả', 'Quá hạn') NOT NULL DEFAULT 'Đang mượn',
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG CHI TIẾT PHIẾU MƯỢN (borrow_items)
CREATE TABLE borrow_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  slip_id VARCHAR(64) NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  returned_quantity INT NOT NULL DEFAULT 0,
  FOREIGN KEY (slip_id) REFERENCES borrow_slips(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- DỮ LIỆU MẪU (SEED DATA) ĐỂ BẢNG KHÔNG BỊ TRỐNG KHI IMPORT VÀO PHPMYADMIN
-- ====================================================================

-- Dữ liệu bảng users (Mật khẩu admin: admin123 | Mật khẩu khách: 123456)
INSERT INTO users (id, name, email, password_hash, role) VALUES
('admin-1', 'Quản trị viên Shop', 'admin@shopsach77.vn', '$2b$10$sRz2CCxUaiOOppAv2L3kOOpDO.QWjjq1sWR.YkqbIXq144Y98gWCy', 'admin'),
('user-1', 'Đặng Thành Danh', 'danh24ct1@dau.edu.vn', '$2b$10$ClBgYvnNSb.kkFVC3dsW6O30zWH3E12FsbrJoGJ4TzsgnBI0rYYfe', 'customer'),
('user-2', 'Nguyễn Thị Mai', 'mainguyen@gmail.com', '$2b$10$ClBgYvnNSb.kkFVC3dsW6O30zWH3E12FsbrJoGJ4TzsgnBI0rYYfe', 'customer'),
('user-3', 'Trần Văn Hoàng', 'hoangtran@gmail.com', '$2b$10$ClBgYvnNSb.kkFVC3dsW6O30zWH3E12FsbrJoGJ4TzsgnBI0rYYfe', 'customer');

-- Dữ liệu bảng products
INSERT INTO products (id, title, author, price, old_price, category, badge, img, description, stock, hidden) VALUES
(1, 'Nhà giả kim', 'Paulo Coelho', 79000, 99000, 'Văn học', 'Bán chạy', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(2, 'Tuổi trẻ đáng giá bao nhiêu?', 'Rosie Nguyễn', 68000, 85000, 'Kỹ năng sống', '-20%', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(3, 'Đắc nhân tâm', 'Dale Carnegie', 86000, 110000, 'Kỹ năng sống', 'Bán chạy', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(4, 'Những người khốn khổ', 'Victor Hugo', 145000, 180000, 'Văn học', 'Mới', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(5, 'Đi tìm lẽ sống', 'Viktor E. Frankl', 92000, 115000, 'Kỹ năng sống', '-20%', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(6, 'Dế Mèn phiêu lưu ký', 'Tô Hoài', 55000, 65000, 'Thiếu nhi', 'Yêu thích', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(7, 'Thao túng tâm lý', 'Sherry Argov', 99000, 125000, 'Tâm lý', 'Hot', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(8, 'Cây cam ngọt của tôi', 'José Mauro de Vasconcelos', 89000, 108000, 'Văn học', 'Mới', 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(9, 'Spider-Man: Người Nhện', 'Marvel Comics', 129000, 159000, 'Manga - Comic', 'Hot', 'https://images.unsplash.com/photo-1601645191163-3fc0d5d64e35?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(10, 'Avengers: Biệt Đội Siêu Anh Hùng', 'Marvel Comics', 139000, 169000, 'Manga - Comic', 'Mới', 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(11, 'X-Men: Những Dị Nhân', 'Marvel Comics', 125000, 155000, 'Manga - Comic', 'Bán chạy', 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(12, 'Guardians of the Galaxy', 'Marvel Comics', 119000, 149000, 'Manga - Comic', 'Mới', 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&w=500&q=80', '', 5, 0),
(13, 'Cha Giàu Cha Nghèo', 'Robert T. Kiyosaki', 99000, 129000, 'Kinh tế', 'Bán chạy', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=500&q=80', 'Cuốn sách giới thiệu tư duy về tiền bạc, tài sản và cách xây dựng nền tảng tài chính cá nhân.', 5, 0),
(14, 'Từ Tốt Đến Vĩ Đại', 'Jim Collins', 125000, 155000, 'Kinh tế', 'Mới', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=500&q=80', 'Nghiên cứu những đặc điểm giúp một doanh nghiệp chuyển từ hoạt động tốt sang tạo ra kết quả vượt trội trong dài hạn.', 5, 0),
(15, 'Khởi Nghiệp Tinh Gọn', 'Eric Ries', 115000, 145000, 'Kinh tế', 'Hot', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=500&q=80', 'Phương pháp xây dựng sản phẩm bằng thử nghiệm nhanh, học hỏi từ khách hàng và cải tiến liên tục.', 5, 0),
(16, 'Nghệ Thuật Bán Hàng', 'Brian Tracy', 89000, 119000, 'Kinh tế', 'Yêu thích', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=500&q=80', 'Các nguyên tắc thực hành về chuẩn bị, giao tiếp, xử lý nhu cầu và xây dựng quan hệ với khách hàng.', 5, 0),
(17, 'Dế Mèn phiêu lưu ký', 'Tô Hoài', 55000, 65000, 'Thiếu nhi', 'Yêu thích', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80', 'Câu chuyện phiêu lưu giàu trí tưởng tượng, giúp trẻ nhỏ học về tình bạn, lòng dũng cảm và cách trưởng thành.', 5, 0),
(18, 'Alice ở xứ sở thần tiên', 'Lewis Carroll', 69000, 85000, 'Thiếu nhi', 'Mới', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80', 'Một chuyến phiêu lưu kỳ ảo trong thế giới kỳ quặc, đầy nhân vật lạ và những câu đố thú vị.', 5, 0),
(19, 'Hoàng tử bé', 'Antoine de Saint-Exupéry', 79000, 99000, 'Thiếu nhi', 'Bán chạy', 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=500&q=80', 'Tác phẩm thiếu nhi giàu chất thơ về tình bạn, tình yêu và cách nhìn thế giới bằng sự hồn nhiên.', 5, 0),
(20, 'Pinocchio', 'Carlo Collodi', 59000, 75000, 'Thiếu nhi', 'Nên đọc', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80', 'Câu chuyện về cậu bé người gỗ Pinocchio và hành trình học cách trung thực, tốt bụng và có trách nhiệm.', 5, 0);

-- Dữ liệu bảng orders
INSERT INTO orders (id, customer_id, total, payment_method, payment_status, created_at) VALUES
('S77894215', 'user-1', 148000, 'Chuyển khoản mã QR Agribank', 'Đã thanh toán qua mã QR (Chờ xác nhận)', '2026-10-06 09:15:00'),
('S77512498', 'user-2', 115000, 'Chuyển khoản mã QR Agribank', 'Đã thanh toán qua mã QR (Chờ xác nhận)', '2026-10-06 10:30:00'),
('S77341209', 'user-3', 213000, 'Chuyển khoản mã QR Agribank', 'Đã thanh toán qua mã QR (Chờ xác nhận)', '2026-10-06 13:45:00');

-- Dữ liệu bảng order_items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
('S77894215', 1, 1, 79000),
('S77894215', 2, 1, 69000),
('S77512498', 5, 1, 115000),
('S77341209', 3, 1, 85000),
('S77341209', 7, 1, 78000),
('S77341209', 6, 1, 30000);

-- Dữ liệu bảng favorites
INSERT INTO favorites (user_id, product_id) VALUES
('user-1', 1),
('user-1', 3),
('user-2', 2),
('user-3', 5);

-- Dữ liệu bảng borrow_slips
INSERT INTO borrow_slips (id, member_name, member_email, created_by, borrowed_at, due_at, status) VALUES
('PM-17912001', 'Đặng Thành Danh', 'danh24ct1@dau.edu.vn', 'admin-1', '2026-10-01 08:00:00', '2026-10-15', 'Đang mượn'),
('PM-17912002', 'Lê Thị Thu Thảo', 'thao.le@gmail.com', 'admin-1', '2026-10-02 09:30:00', '2026-10-16', 'Đang mượn');

-- Dữ liệu bảng borrow_items
INSERT INTO borrow_items (slip_id, product_id, quantity, returned_quantity) VALUES
('PM-17912001', 3, 1, 0),
('PM-17912001', 8, 1, 0),
('PM-17912002', 2, 1, 0);
