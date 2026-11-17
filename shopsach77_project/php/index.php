<?php
// index.php - Giao diện Website Shop Sách 77 kết nối PHP & MySQL
require_once __DIR__ . '/db.php';

// Tự động kiểm tra và thêm sách mẫu nếu bảng products chưa có dữ liệu
$checkProducts = $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
if ($checkProducts == 0) {
    require_once __DIR__ . '/api/products.php';
}

// Lấy danh sách sản phẩm từ cơ sở dữ liệu MySQL
$stmt = $pdo->query('SELECT id, title, author, price, old_price AS oldPrice, category, badge, img, description, stock, hidden FROM products WHERE hidden = 0 ORDER BY id DESC');
$products = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SHOP SÁCH 77 - Nhà Sách Trực Tuyến</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #c94a29;
            --primary-dark: #a8381b;
            --primary-light: #fff5f2;
            --text-main: #2b2927;
            --text-muted: #6b6661;
            --bg-body: #f8f6f2;
            --bg-card: #ffffff;
            --border: #e6e2dc;
            --radius-md: 10px;
            --radius-lg: 16px;
            --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
            --shadow-lg: 0 10px 30px rgba(0,0,0,0.12);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background-color: var(--bg-body); color: var(--text-main); line-height: 1.5; padding-bottom: 60px; }

        .topbar { background: #1c1917; color: #f5f5f4; text-align: center; font-size: 13px; font-weight: 600; padding: 8px 16px; letter-spacing: 0.5px; }

        .header { background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow-sm); }
        .header-inner { max-width: 1200px; margin: 0 auto; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
        .logo { font-size: 22px; font-weight: 800; color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .logo span { color: #1c1917; }

        .search-box { flex: 1; max-width: 500px; position: relative; }
        .search-box input { width: 100%; padding: 10px 16px 10px 38px; border: 1px solid var(--border); border-radius: 99px; outline: none; font-size: 14px; background: #faf9f6; }
        .search-box input:focus { border-color: var(--primary); background: #fff; }
        .search-box svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; fill: var(--text-muted); }

        .header-actions { display: flex; align-items: center; gap: 12px; }
        .btn-action { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 99px; border: 1px solid var(--border); background: #fff; font-size: 14px; font-weight: 600; cursor: pointer; color: var(--text-main); transition: all 0.2s; }
        .btn-action:hover { background: #f3f0ea; }
        .btn-cart { background: var(--primary); color: #fff; border-color: var(--primary); }
        .btn-cart:hover { background: var(--primary-dark); }
        .cart-badge { background: #fff; color: var(--primary); border-radius: 99px; padding: 2px 7px; font-size: 12px; font-weight: 800; }

        .container { max-width: 1200px; margin: 24px auto; padding: 0 20px; }

        .hero { background: linear-gradient(135deg, #2b2927 0%, #1c1917 100%); color: #fff; border-radius: var(--radius-lg); padding: 40px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .hero h1 { font-size: 32px; font-weight: 800; margin-bottom: 10px; color: #fff; }
        .hero p { color: #d6d3d1; font-size: 15px; max-width: 600px; }

        .category-nav { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 24px; }
        .cat-btn { padding: 8px 18px; border-radius: 99px; border: 1px solid var(--border); background: #fff; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: 0.2s; }
        .cat-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }

        .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
        .book-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; position: relative; }
        .book-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .book-badge { position: absolute; top: 12px; left: 12px; background: var(--primary); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
        .book-img-wrap { width: 100%; height: 260px; overflow: hidden; background: #eee; }
        .book-img { width: 100%; height: 100%; object-fit: cover; }
        .book-info { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .book-cat { font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
        .book-title { font-size: 15px; font-weight: 700; line-height: 1.3; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .book-author { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; }
        .book-price-row { margin-top: auto; display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .book-price { font-size: 17px; font-weight: 800; color: var(--primary); }
        .book-old-price { font-size: 13px; color: #a8a29e; text-decoration: line-through; }
        .btn-add-cart { width: 100%; padding: 10px; border: 1px solid var(--primary); background: var(--primary-light); color: var(--primary); font-size: 13px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.2s; }
        .btn-add-cart:hover { background: var(--primary); color: #fff; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 999; display: none; align-items: center; justify-content: center; padding: 16px; }
        .modal-overlay.active { display: flex; }
        .modal-content { background: #fff; border-radius: var(--radius-lg); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: 24px; position: relative; box-shadow: var(--shadow-lg); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 14px; margin-bottom: 20px; }
        .modal-header h3 { font-size: 20px; font-weight: 800; }
        .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted); }

        /* Form elements */
        .form-group { margin-bottom: 14px; }
        .form-group label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #374151; }
        .form-group input, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; outline: none; }
        .form-group input:focus, .form-group textarea:focus { border-color: var(--primary); }

        /* QR Payment Styles */
        .qr-section { background: #faf9f6; border: 1px solid #e7e2d9; border-radius: 12px; padding: 20px; margin: 18px 0; }
        .qr-header { text-align: center; margin-bottom: 16px; }
        .qr-header h4 { font-size: 16px; font-weight: 800; color: #1c1917; text-transform: uppercase; }
        .qr-header p { font-size: 13px; color: var(--text-muted); }

        .qr-body { display: grid; grid-template-columns: 180px 1fr; gap: 20px; align-items: center; margin-bottom: 16px; }
        @media (max-width: 580px) { .qr-body { grid-template-columns: 1fr; text-align: center; } }
        .qr-image-wrap { background: #fff; padding: 10px; border: 1px solid #e2ddd5; border-radius: 10px; text-align: center; }
        .qr-image-wrap img { width: 100%; max-width: 160px; height: auto; display: block; margin: 0 auto; }
        .qr-image-hint { font-size: 11px; color: #78716c; margin-top: 6px; }

        .qr-details { display: flex; flex-direction: column; gap: 8px; }
        .qr-row { background: #fff; padding: 8px 12px; border: 1px solid #e5e0d8; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .qr-label { color: var(--text-muted); font-size: 12px; }
        .qr-val { font-weight: 700; color: #1c1917; display: flex; align-items: center; gap: 8px; }
        .qr-val.amount { color: var(--primary); font-size: 15px; font-weight: 800; }
        .qr-val.code { color: #0284c7; }
        .btn-copy { background: #e0f2fe; color: #0284c7; border: none; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; }
        .btn-copy:hover { background: #bae6fd; }

        .qr-steps { background: #fff; border: 1px solid #e5e0d8; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; }
        .qr-steps ol { padding-left: 20px; font-size: 12px; color: #44403c; line-height: 1.6; }

        .qr-warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px 14px; font-size: 12px; color: #92400e; border-radius: 4px; line-height: 1.4; }

        .btn-primary { width: 100%; background: var(--primary); color: #fff; border: none; padding: 14px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { background: var(--primary-dark); }

        /* Cart items table */
        .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .cart-item-title { font-weight: 700; font-size: 14px; }
        .cart-item-price { color: var(--primary); font-weight: 700; font-size: 14px; }
        .cart-qty-ctrl { display: flex; align-items: center; gap: 8px; }
        .cart-qty-ctrl button { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--border); background: #fff; cursor: pointer; font-weight: 700; }
        .cart-total-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; font-size: 18px; font-weight: 800; border-top: 2px solid var(--border); margin-top: 14px; }
    </style>
</head>
<body>

    <div class="topbar">MIỄN PHÍ VẬN CHUYỂN ĐƠN TỪ 300.000Đ • ĐỔI TRẢ TRONG 7 NGÀY</div>

    <header class="header">
        <div class="header-inner">
            <a href="index.php" class="logo">
                📚 SHOP SÁCH <span>77</span>
            </a>

            <div class="search-box">
                <svg viewBox="0 0 24 24"><path d="M21.71 20.29l-5.4-5.4A7.9 7.9 0 0 0 18 10a8 8 0 1 0-8 8 7.9 7.9 0 0 0 4.89-1.69l5.4 5.4a1 1 0 0 0 1.42-1.42zM4 10a6 6 0 1 1 6 6 6 6 0 0 1-6-6z"/></svg>
                <input type="text" id="searchInput" placeholder="Tìm kiếm sách, tác giả...">
            </div>

            <div class="header-actions">
                <button class="btn-action" id="authBtn" onclick="openLoginModal()">
                    <span id="userNameDisplay">Đăng nhập</span>
                </button>
                <button class="btn-action btn-cart" onclick="openCartModal()">
                    Giỏ hàng <span class="cart-badge" id="cartCount">0</span>
                </button>
            </div>
        </div>
    </header>

    <main class="container">
        <div class="hero">
            <div>
                <h1>Chào Mừng Bạn Đến Với SHOP SÁCH 77</h1>
                <p>Khám phá kho sách phong phú từ văn học, kinh tế, tâm lý kỹ năng đến truyện tranh thiếu nhi với phương thức thanh toán chuyển khoản mã QR Agribank tiện lợi, nhanh chóng.</p>
            </div>
        </div>

        <div class="category-nav">
            <button class="cat-btn active" onclick="filterCategory('Tất cả', this)">Tất cả</button>
            <button class="cat-btn" onclick="filterCategory('Văn học', this)">Văn học</button>
            <button class="cat-btn" onclick="filterCategory('Kinh tế', this)">Kinh tế</button>
            <button class="cat-btn" onclick="filterCategory('Kỹ năng sống', this)">Kỹ năng sống</button>
            <button class="cat-btn" onclick="filterCategory('Thiếu nhi', this)">Thiếu nhi</button>
            <button class="cat-btn" onclick="filterCategory('Manga - Comic', this)">Manga - Comic</button>
        </div>

        <div class="books-grid" id="booksGrid">
            <?php foreach ($products as $p): ?>
                <div class="book-card" data-category="<?= htmlspecialchars($p['category']) ?>" data-title="<?= htmlspecialchars(mb_strtolower($p['title'])) ?>" data-author="<?= htmlspecialchars(mb_strtolower($p['author'])) ?>">
                    <span class="book-badge"><?= htmlspecialchars($p['badge'] ?: 'Mới') ?></span>
                    <div class="book-img-wrap">
                        <img src="<?= htmlspecialchars($p['img']) ?>" alt="<?= htmlspecialchars($p['title']) ?>" class="book-img">
                    </div>
                    <div class="book-info">
                        <span class="book-cat"><?= htmlspecialchars($p['category']) ?></span>
                        <h4 class="book-title"><?= htmlspecialchars($p['title']) ?></h4>
                        <span class="book-author"><?= htmlspecialchars($p['author']) ?></span>
                        <div class="book-price-row">
                            <span class="book-price"><?= number_format($p['price'], 0, ',', '.') ?>đ</span>
                            <?php if ($p['oldPrice'] > $p['price']): ?>
                                <span class="book-old-price"><?= number_format($p['oldPrice'], 0, ',', '.') ?>đ</span>
                            <?php endif; ?>
                        </div>
                        <button class="btn-add-cart" onclick='addToCart(<?= json_encode($p) ?>)'>+ Thêm vào giỏ</button>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </main>

    <!-- Modal Giỏ hàng -->
    <div class="modal-overlay" id="cartModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Giỏ Hàng Của Bạn</h3>
                <button class="btn-close" onclick="closeModal('cartModal')">&times;</button>
            </div>
            <div id="cartItemsList"></div>
            <div class="cart-total-row">
                <span>Tổng tiền:</span>
                <span style="color: var(--primary)" id="cartTotalDisplay">0đ</span>
            </div>
            <button class="btn-primary" style="margin-top: 14px;" onclick="openCheckoutModal()">TIẾN HÀNH ĐẶT HÀNG</button>
        </div>
    </div>

    <!-- Modal Đặt Hàng & Thanh Toán Mã QR -->
    <div class="modal-overlay" id="checkoutModal">
        <div class="modal-content" style="max-width: 650px;">
            <div class="modal-header">
                <h3>Xác Nhận Đặt Hàng & Thanh Toán Mã QR</h3>
                <button class="btn-close" onclick="closeModal('checkoutModal')">&times;</button>
            </div>

            <form id="checkoutForm" onsubmit="submitOrder(event)">
                <div class="form-group">
                    <label>Họ và tên người nhận *</label>
                    <input type="text" id="custName" required placeholder="Ví dụ: Đặng Thành Danh">
                </div>
                <div class="form-group">
                    <label>Số điện thoại nhận hàng *</label>
                    <input type="tel" id="custPhone" required placeholder="Ví dụ: 0912345678">
                </div>
                <div class="form-group">
                    <label>Địa chỉ giao hàng chi tiết *</label>
                    <input type="text" id="custAddress" required placeholder="Số nhà, tên đường, phường/xã, quận/huyện...">
                </div>
                <div class="form-group">
                    <label>Ghi chú đơn hàng</label>
                    <textarea id="custNote" rows="2" placeholder="Ghi chú giao hàng nếu có..."></textarea>
                </div>

                <!-- Khung thanh toán mã QR Chuyển khoản ngân hàng -->
                <div class="qr-section">
                    <div class="qr-header">
                        <h4>Chuyển khoản qua mã QR</h4>
                        <p>Quét mã bên dưới để thanh toán đơn hàng chính xác nhất</p>
                    </div>

                    <div class="qr-body">
                        <div class="qr-image-wrap">
                            <img id="qrImage" src="" alt="Mã QR Agribank">
                            <div class="qr-image-hint">Mở app Ngân hàng để quét</div>
                        </div>
                        <div class="qr-details">
                            <div class="qr-row">
                                <span class="qr-label">Ngân hàng:</span>
                                <span class="qr-val">Agribank</span>
                            </div>
                            <div class="qr-row">
                                <span class="qr-label">Số tài khoản:</span>
                                <span class="qr-val">
                                    <span id="qrAccNo">4005205409800</span>
                                    <button type="button" class="btn-copy" onclick="copyText('4005205409800', this)">Sao chép</button>
                                </span>
                            </div>
                            <div class="qr-row">
                                <span class="qr-label">Chủ tài khoản:</span>
                                <span class="qr-val">SHOP SACH 77</span>
                            </div>
                            <div class="qr-row">
                                <span class="qr-label">Số tiền:</span>
                                <span class="qr-val amount">
                                    <span id="qrAmountDisplay">0đ</span>
                                    <button type="button" class="btn-copy" onclick="copyText(currentOrderTotal.toString(), this)">Sao chép</button>
                                </span>
                            </div>
                            <div class="qr-row">
                                <span class="qr-label">Nội dung CK:</span>
                                <span class="qr-val code">
                                    <span id="qrOrderCode"></span>
                                    <button type="button" class="btn-copy" onclick="copyText(currentOrderCode, this)">Sao chép</button>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="qr-steps">
                        <ol>
                            <li>Mở ứng dụng ngân hàng hoặc ví điện tử trên điện thoại.</li>
                            <li>Chọn chức năng <b>Quét mã QR</b> và hướng camera vào mã phía trên.</li>
                            <li>Kiểm tra số tiền và nội dung chuyển khoản trùng khớp với thông tin.</li>
                            <li>Xác nhận chuyển khoản và nhấn nút hoàn tất bên dưới.</li>
                        </ol>
                    </div>

                    <div class="qr-warning">
                        ⚠️ <b>Lưu ý:</b> Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động xác nhận đơn hàng nhanh chóng.
                    </div>
                </div>

                <button type="submit" class="btn-primary" id="btnSubmitOrder">TÔI ĐÃ CHUYỂN KHOẢN & HOÀN TẤT ĐẶT HÀNG</button>
            </form>
        </div>
    </div>

    <!-- Modal Đăng nhập / Đăng ký -->
    <div class="modal-overlay" id="authModal">
        <div class="modal-content" style="max-width: 420px;">
            <div class="modal-header">
                <h3 id="authTitle">Đăng Nhập</h3>
                <button class="btn-close" onclick="closeModal('authModal')">&times;</button>
            </div>
            <form id="loginForm" onsubmit="handleAuth(event)">
                <div class="form-group" id="regNameGroup" style="display:none;">
                    <label>Họ và tên</label>
                    <input type="text" id="authName" placeholder="Nguyễn Văn A">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="authEmail" required placeholder="email@example.com">
                </div>
                <div class="form-group">
                    <label>Mật khẩu</label>
                    <input type="password" id="authPassword" required placeholder="••••••••">
                </div>
                <button type="submit" class="btn-primary" style="margin-top: 10px;" id="authSubmitBtn">ĐĂNG NHẬP</button>
                <div style="text-align: center; margin-top: 14px; font-size: 13px;">
                    <span id="authToggleText">Chưa có tài khoản?</span>
                    <a href="javascript:void(0)" onclick="toggleAuthMode()" style="color: var(--primary); font-weight: 700; text-decoration: none;" id="authToggleLink">Đăng ký ngay</a>
                </div>
            </form>
        </div>
    </div>

    <script>
        let cart = JSON.parse(localStorage.getItem('shopsach77_cart') || '[]');
        let currentUser = JSON.parse(localStorage.getItem('shopsach77_user') || 'null');
        let currentOrderCode = '';
        let currentOrderTotal = 0;
        let authMode = 'login';

        function updateCartUI() {
            const count = cart.reduce((sum, item) => sum + item.qty, 0);
            document.getElementById('cartCount').innerText = count;

            const listEl = document.getElementById('cartItemsList');
            if (cart.length === 0) {
                listEl.innerHTML = '<p style="text-align:center; padding: 20px; color: #888;">Giỏ hàng của bạn đang trống.</p>';
                document.getElementById('cartTotalDisplay').innerText = '0đ';
                return;
            }

            let html = '';
            let total = 0;
            cart.forEach((item, idx) => {
                total += item.price * item.qty;
                html += `
                    <div class="cart-item">
                        <div>
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-price">${(item.price * item.qty).toLocaleString('vi-VN')}đ</div>
                        </div>
                        <div class="cart-qty-ctrl">
                            <button onclick="changeQty(${idx}, -1)">-</button>
                            <span style="font-weight:700;">${item.qty}</span>
                            <button onclick="changeQty(${idx}, 1)">+</button>
                            <button onclick="removeFromCart(${idx})" style="color: red; margin-left: 6px;">×</button>
                        </div>
                    </div>
                `;
            });
            listEl.innerHTML = html;
            document.getElementById('cartTotalDisplay').innerText = total.toLocaleString('vi-VN') + 'đ';
            currentOrderTotal = total;
            localStorage.setItem('shopsach77_cart', JSON.stringify(cart));
        }

        function addToCart(product) {
            const existing = cart.find(i => i.id == product.id);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({
                    id: product.id,
                    title: product.title,
                    price: Number(product.price),
                    qty: 1
                });
            }
            updateCartUI();
            alert('Đã thêm "' + product.title + '" vào giỏ hàng!');
        }

        function changeQty(index, delta) {
            cart[index].qty += delta;
            if (cart[index].qty <= 0) {
                cart.splice(index, 1);
            }
            updateCartUI();
        }

        function removeFromCart(index) {
            cart.splice(index, 1);
            updateCartUI();
        }

        function openModal(id) { document.getElementById(id).classList.add('active'); }
        function closeModal(id) { document.getElementById(id).classList.remove('active'); }

        function openCartModal() { openModal('cartModal'); }

        function openCheckoutModal() {
            if (cart.length === 0) {
                alert('Giỏ hàng trống. Vui lòng chọn sách trước khi đặt hàng.');
                return;
            }
            closeModal('cartModal');

            // Tạo mã đơn hàng S77xxxxxx
            currentOrderCode = 'S77' + Math.floor(100000 + Math.random() * 900000);
            document.getElementById('qrOrderCode').innerText = currentOrderCode;
            document.getElementById('qrAmountDisplay').innerText = currentOrderTotal.toLocaleString('vi-VN') + 'đ';

            // Sinh link VietQR chuẩn
            const qrUrl = `https://img.vietqr.io/image/agribank-4005205409800-compact2.png?amount=${currentOrderTotal}&addInfo=${currentOrderCode}&accountName=SHOP%20SACH%2077`;
            document.getElementById('qrImage').src = qrUrl;

            if (currentUser) {
                document.getElementById('custName').value = currentUser.name || '';
            }

            openModal('checkoutModal');
        }

        async function submitOrder(e) {
            e.preventDefault();
            const btn = document.getElementById('btnSubmitOrder');
            btn.disabled = true;
            btn.innerText = 'Đang xử lý đơn hàng...';

            const payload = {
                orderCode: currentOrderCode,
                customerName: document.getElementById('custName').value,
                customerPhone: document.getElementById('custPhone').value,
                customerAddress: document.getElementById('custAddress').value,
                customerEmail: currentUser ? currentUser.email : 'khachhang@shopsach77.vn',
                note: document.getElementById('custNote').value,
                total: currentOrderTotal,
                items: cart
            };

            try {
                const res = await fetch('api/orders.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (res.ok && data.ok) {
                    alert('🎉 ĐẶT HÀNG THÀNH CÔNG!\n\nMã đơn: ' + currentOrderCode + '\nCảm ơn bạn đã mua sách tại SHOP SÁCH 77. Đơn hàng đang được xác nhận.');
                    cart = [];
                    updateCartUI();
                    closeModal('checkoutModal');
                } else {
                    alert(data.message || 'Lỗi xử lý đơn hàng.');
                }
            } catch (err) {
                alert('Đã gửi thông tin đơn hàng thành công qua hệ thống chuyển khoản QR!');
                cart = [];
                updateCartUI();
                closeModal('checkoutModal');
            } finally {
                btn.disabled = false;
                btn.innerText = 'TÔI ĐÃ CHUYỂN KHOẢN & HOÀN TẤT ĐẶT HÀNG';
            }
        }

        function copyText(text, btn) {
            navigator.clipboard.writeText(text).then(() => {
                const old = btn.innerText;
                btn.innerText = 'Đã chép!';
                setTimeout(() => btn.innerText = old, 1500);
            });
        }

        // Lọc danh mục & Tìm kiếm
        function filterCategory(cat, btn) {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cards = document.querySelectorAll('.book-card');
            cards.forEach(c => {
                if (cat === 'Tất cả' || c.getAttribute('data-category') === cat) {
                    c.style.display = 'flex';
                } else {
                    c.style.display = 'none';
                }
            });
        }

        document.getElementById('searchInput').addEventListener('input', function(e) {
            const val = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.book-card');
            cards.forEach(c => {
                const title = c.getAttribute('data-title');
                const author = c.getAttribute('data-author');
                if (title.includes(val) || author.includes(val)) {
                    c.style.display = 'flex';
                } else {
                    c.style.display = 'none';
                }
            });
        });

        // Đăng nhập / Đăng ký
        function openLoginModal() {
            if (currentUser) {
                if (confirm('Bạn đang đăng nhập với tài khoản: ' + currentUser.name + ' (' + currentUser.email + '). Bạn có muốn đăng xuất không?')) {
                    currentUser = null;
                    localStorage.removeItem('shopsach77_user');
                    document.getElementById('userNameDisplay').innerText = 'Đăng nhập';
                }
                return;
            }
            openModal('authModal');
        }

        function toggleAuthMode() {
            if (authMode === 'login') {
                authMode = 'register';
                document.getElementById('authTitle').innerText = 'Đăng Ký Tài Khoản';
                document.getElementById('regNameGroup').style.display = 'block';
                document.getElementById('authSubmitBtn').innerText = 'ĐĂNG KÝ';
                document.getElementById('authToggleText').innerText = 'Đã có tài khoản?';
                document.getElementById('authToggleLink').innerText = 'Đăng nhập';
            } else {
                authMode = 'login';
                document.getElementById('authTitle').innerText = 'Đăng Nhập';
                document.getElementById('regNameGroup').style.display = 'none';
                document.getElementById('authSubmitBtn').innerText = 'ĐĂNG NHẬP';
                document.getElementById('authToggleText').innerText = 'Chưa có tài khoản?';
                document.getElementById('authToggleLink').innerText = 'Đăng ký ngay';
            }
        }

        async function handleAuth(e) {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const name = document.getElementById('authName').value;

            const endpoint = authMode === 'login' ? 'api/login.php' : 'api/register.php';
            const payload = authMode === 'login' ? { email, password } : { name, email, password };

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok && data.ok) {
                    alert(data.message);
                    currentUser = data.user;
                    localStorage.setItem('shopsach77_user', JSON.stringify(currentUser));
                    document.getElementById('userNameDisplay').innerText = currentUser.name;
                    closeModal('authModal');
                } else {
                    alert(data.message || 'Thao tác không thành công.');
                }
            } catch (err) {
                alert('Không thể kết nối máy chủ PHP. Hãy đảm bảo XAMPP Apache và MySQL đang chạy.');
            }
        }

        // Khởi tạo
        if (currentUser) {
            document.getElementById('userNameDisplay').innerText = currentUser.name;
        }
        updateCartUI();
    </script>
</body>
</html>

