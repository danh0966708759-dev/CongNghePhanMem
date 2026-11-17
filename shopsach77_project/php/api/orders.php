<?php
require_once __DIR__ . '/common.php';

function fetch_orders($pdo, $customerId) {
    $stmt = $pdo->prepare(
        'SELECT o.id, COALESCE(o.customer_name, u.name, \'\') AS customerName,
                COALESCE(o.customer_email, u.email, \'\') AS customerEmail,
                o.customer_phone AS customerPhone, o.customer_address AS customerAddress, o.note,
                o.total, o.payment_method AS paymentMethod, o.payment_status AS paymentStatus,
                o.created_at AS createdAt, oi.product_id AS productId, p.title,
                oi.quantity AS qty, oi.price
         FROM orders o
         LEFT JOIN users u ON u.id = o.customer_id
         LEFT JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE o.customer_id = ?
         ORDER BY o.created_at DESC, oi.id',
    );
    $stmt->execute([$customerId]);
    $orders = [];
    foreach ($stmt->fetchAll() as $row) {
        $id = $row['id'];
        if (!isset($orders[$id])) {
            $orders[$id] = [
                'id' => $id,
                'orderCode' => $id,
                'customerName' => $row['customerName'] ?? '',
                'customerEmail' => $row['customerEmail'],
                'customerPhone' => $row['customerPhone'] ?? '',
                'customerAddress' => $row['customerAddress'] ?? '',
                'note' => $row['note'] ?? '',
                'total' => (int)$row['total'],
                'paymentMethod' => $row['paymentMethod'],
                'paymentStatus' => $row['paymentStatus'],
                'createdAt' => $row['createdAt'],
                'items' => [],
            ];
        }
        if ($row['productId'] !== null) {
            $orders[$id]['items'][] = [
                'id' => (int)$row['productId'],
                'title' => $row['title'] ?? 'Sách đã xóa',
                'qty' => (int)$row['qty'],
                'price' => (int)$row['price'],
            ];
        }
    }
    return array_values($orders);
}

$method = $_SERVER['REQUEST_METHOD'];
try {
    if ($method === 'GET') {
        $user = api_require_customer();
        api_json(fetch_orders($pdo, $user['id']));
    }

    if ($method !== 'POST') api_json(['message' => 'Phương thức không được hỗ trợ.'], 405);
    api_require_origin();
    $user = api_require_customer();
    $input = api_input();
    $name = trim($input['customerName'] ?? '');
    $phone = trim($input['customerPhone'] ?? '');
    $address = trim($input['customerAddress'] ?? '');
    $note = trim($input['note'] ?? '');
    $items = $input['items'] ?? null;
    if ($name === '' || $phone === '' || $address === '' || !is_array($items) || !$items || count($items) > 50) {
        api_json(['message' => 'Vui lòng nhập thông tin nhận hàng và chọn sách.'], 400);
    }

    $quantities = [];
    foreach ($items as $item) {
        $id = filter_var($item['id'] ?? null, FILTER_VALIDATE_INT);
        $qty = filter_var($item['qty'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id <= 0 || !$qty || $qty <= 0) api_json(['message' => 'Mã sách hoặc số lượng không hợp lệ.'], 400);
        $quantities[$id] = ($quantities[$id] ?? 0) + $qty;
    }

    $pdo->beginTransaction();
    $orderItems = [];
    $total = 0;
    foreach ($quantities as $productId => $qty) {
        $stmt = $pdo->prepare('SELECT id, title, price, stock, hidden FROM products WHERE id = ? FOR UPDATE');
        $stmt->execute([$productId]);
        $product = $stmt->fetch();
        if (!$product || $product['hidden'] || (int)$product['stock'] < $qty) {
            $pdo->rollBack();
            api_json(['message' => 'Một sách trong giỏ đã hết hàng hoặc không còn bán. Vui lòng tải lại trang.'], 409);
        }
        $price = (int)$product['price'];
        $total += $price * $qty;
        $orderItems[] = ['id' => (int)$product['id'], 'title' => $product['title'], 'qty' => $qty, 'price' => $price];
    }

    $orderId = 'S77' . date('ymdHis') . random_int(100, 999);
    $paymentMethod = 'Quét mã QR thanh toán';
    $paymentStatus = 'Đã thanh toán qua mã QR (Chờ xác nhận)';
    $stmt = $pdo->prepare(
        'INSERT INTO orders (id, customer_id, customer_name, customer_email, customer_phone, customer_address, note, total, payment_method, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    $stmt->execute([$orderId, $user['id'], $name, $user['email'], $phone, $address, $note, $total, $paymentMethod, $paymentStatus]);

    $itemStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    $stockStmt = $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    foreach ($orderItems as $item) {
        $itemStmt->execute([$orderId, $item['id'], $item['qty'], $item['price']]);
        $stockStmt->execute([$item['qty'], $item['id']]);
    }
    $pdo->commit();

    $stocks = [];
    $stockStmt = $pdo->prepare('SELECT stock FROM products WHERE id = ?');
    foreach ($orderItems as $item) {
        $stockStmt->execute([$item['id']]);
        $stocks[$item['id']] = (int)$stockStmt->fetchColumn();
    }
    api_json([
        'order' => [
            'id' => $orderId,
            'orderCode' => $orderId,
            'customerName' => $name,
            'customerEmail' => $user['email'],
            'customerPhone' => $phone,
            'customerAddress' => $address,
            'note' => $note,
            'items' => $orderItems,
            'total' => $total,
            'paymentMethod' => $paymentMethod,
            'paymentStatus' => $paymentStatus,
            'createdAt' => date(DATE_ATOM),
        ],
        'stockByProduct' => $stocks,
    ], 201);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log($e->getMessage());
    api_json(['message' => 'Không thể lưu đơn hàng.'], 500);
}
