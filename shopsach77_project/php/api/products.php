<?php
require_once __DIR__ . '/common.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $isAdmin = !empty($_SESSION['user']) && ($_SESSION['user']['role'] ?? '') === 'admin';
        $sql = 'SELECT id, title, author, price, old_price AS oldPrice, category, badge, img, description, stock, hidden FROM products';
        $params = [];
        if (!$isAdmin) {
            $sql .= ' WHERE hidden = 0';
        }
        if (!empty($_GET['category']) && $_GET['category'] !== 'Tất cả') {
            $sql .= $isAdmin ? ' WHERE category = ?' : ' AND category = ?';
            $params[] = $_GET['category'];
        }
        if (!empty($_GET['q'])) {
            $sql .= ($isAdmin && empty($_GET['category'])) ? ' WHERE' : ' AND';
            $sql .= ' (title LIKE ? OR author LIKE ?)';
            $params[] = '%' . $_GET['q'] . '%';
            $params[] = '%' . $_GET['q'] . '%';
        }
        $sql .= ' ORDER BY id DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();
        foreach ($products as &$product) {
            $product['id'] = (int)$product['id'];
            $product['price'] = (int)$product['price'];
            $product['oldPrice'] = (int)$product['oldPrice'];
            $product['stock'] = (int)$product['stock'];
            $product['hidden'] = (bool)$product['hidden'];
        }
        api_json($products);
    }

    api_require_origin();
    api_require_admin();
    $input = api_input();

    if ($method === 'POST' || $method === 'PUT') {
        $id = filter_var($_GET['id'] ?? $input['id'] ?? null, FILTER_VALIDATE_INT);
        $title = trim($input['title'] ?? '');
        $author = trim($input['author'] ?? '');
        $category = trim($input['category'] ?? '');
        $price = filter_var($input['price'] ?? null, FILTER_VALIDATE_INT);
        $oldPrice = ($input['oldPrice'] ?? '') === '' ? $price : filter_var($input['oldPrice'] ?? null, FILTER_VALIDATE_INT);
        $stock = filter_var($input['stock'] ?? 5, FILTER_VALIDATE_INT);
        if ($title === '' || $author === '' || $category === ''
            || $price === false || $price === null || $price <= 0
            || $oldPrice === false || $oldPrice === null || $oldPrice < 0
            || $stock === false || $stock === null || $stock < 0
            || ($method === 'PUT' && (!$id || $id <= 0))) {
            api_json(['message' => 'Thông tin sách hoặc giá, tồn kho không hợp lệ.'], 400);
        }

        $values = [
            $title, $author, $price, $oldPrice, $category,
            trim($input['badge'] ?? 'Mới'), trim($input['img'] ?? ''),
            trim($input['description'] ?? ''), $stock, !empty($input['hidden']) ? 1 : 0,
        ];
        if ($method === 'POST') {
            $stmt = $pdo->prepare(
                'INSERT INTO products (title, author, price, old_price, category, badge, img, description, stock, hidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            );
            $stmt->execute($values);
            $id = (int)$pdo->lastInsertId();
        } else {
            $stmt = $pdo->prepare(
                'UPDATE products SET title = ?, author = ?, price = ?, old_price = ?, category = ?, badge = ?, img = ?, description = ?, stock = ?, hidden = ? WHERE id = ?',
            );
            $stmt->execute(array_merge($values, [$id]));
            if ($stmt->rowCount() === 0) {
                $check = $pdo->prepare('SELECT id FROM products WHERE id = ?');
                $check->execute([$id]);
                if (!$check->fetch()) api_json(['message' => 'Không tìm thấy sách.'], 404);
            }
        }

        $stmt = $pdo->prepare('SELECT id, title, author, price, old_price AS oldPrice, category, badge, img, description, stock, hidden FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        $product['id'] = (int)$product['id'];
        $product['price'] = (int)$product['price'];
        $product['oldPrice'] = (int)$product['oldPrice'];
        $product['stock'] = (int)$product['stock'];
        $product['hidden'] = (bool)$product['hidden'];
        api_json($product, $method === 'POST' ? 201 : 200);
    }

    if ($method === 'DELETE') {
        $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id <= 0) api_json(['message' => 'Thiếu mã sách cần xóa.'], 400);
        $check = $pdo->prepare('SELECT id FROM order_items WHERE product_id = ? LIMIT 1');
        $check->execute([$id]);
        $hasOrders = (bool)$check->fetch();
        $check = $pdo->prepare('SELECT id FROM borrow_items WHERE product_id = ? LIMIT 1');
        $check->execute([$id]);
        if ($hasOrders || $check->fetch()) {
            api_json(['message' => 'Sách đã có lịch sử đơn hàng hoặc phiếu mượn. Hãy ẩn sách thay vì xóa.'], 409);
        }
        $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->rowCount()) api_json(['message' => 'Không tìm thấy sách.'], 404);
        api_json(['ok' => true]);
    }

    api_json(['message' => 'Phương thức không được hỗ trợ.'], 405);
} catch (Throwable $e) {
    error_log($e->getMessage());
    api_json(['message' => 'Không thể xử lý sản phẩm.'], 500);
}
