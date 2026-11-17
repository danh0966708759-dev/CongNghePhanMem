<?php
require_once __DIR__ . '/common.php';

api_require_admin();
$resource = $_GET['resource'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($resource === 'users' && $method === 'GET') {
        $rows = $pdo->query('SELECT id, name, email, role, created_at AS createdAt FROM users ORDER BY created_at DESC')->fetchAll();
        api_json($rows);
    }

    if ($resource === 'orders' && $method === 'GET') {
        $rows = $pdo->query(
            'SELECT o.id, COALESCE(o.customer_name, u.name, \'\') AS customerName,
                    COALESCE(o.customer_email, u.email, \'\') AS customerEmail,
                    o.customer_phone AS customerPhone, o.customer_address AS customerAddress, o.note,
                    o.total, o.payment_method AS paymentMethod, o.payment_status AS paymentStatus,
                    o.created_at AS createdAt, oi.product_id AS productId, p.title, oi.quantity AS qty, oi.price
             FROM orders o
             LEFT JOIN users u ON u.id = o.customer_id
             LEFT JOIN order_items oi ON oi.order_id = o.id
             LEFT JOIN products p ON p.id = oi.product_id
             ORDER BY o.created_at DESC, oi.id',
        )->fetchAll();
        $orders = [];
        foreach ($rows as $row) {
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
        api_json(array_values($orders));
    }

    if ($resource === 'orders' && $method === 'PUT') {
        api_require_origin();
        $id = trim($_GET['id'] ?? '');
        $input = api_input();
        $validStatuses = [
            'Chờ xác nhận chuyển khoản',
            'Đã thanh toán qua mã QR (Chờ xác nhận)',
            'Đã xác nhận thanh toán',
            'Đang giao hàng',
            'Hoàn tất',
            'Đã hủy',
        ];
        if ($id === '' || !in_array($input['status'] ?? '', $validStatuses, true)) {
            api_json(['message' => 'Mã hoặc trạng thái đơn hàng không hợp lệ.'], 400);
        }
        $stmt = $pdo->prepare('UPDATE orders SET payment_status = ? WHERE id = ?');
        $stmt->execute([$input['status'], $id]);
        if (!$stmt->rowCount()) {
            $check = $pdo->prepare('SELECT id FROM orders WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) api_json(['message' => 'Không tìm thấy đơn hàng.'], 404);
        }
        api_json(['ok' => true, 'paymentStatus' => $input['status']]);
    }

    if ($resource === 'orders' && $method === 'DELETE') {
        api_require_origin();
        $id = trim($_GET['id'] ?? '');
        if ($id === '') api_json(['message' => 'Thiếu mã đơn hàng.'], 400);
        $stmt = $pdo->prepare('DELETE FROM orders WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->rowCount()) api_json(['message' => 'Không tìm thấy đơn hàng.'], 404);
        api_json(['ok' => true]);
    }

    if ($resource === 'borrow-slips' && $method === 'GET') {
        $rows = $pdo->query(
            'SELECT s.id, s.member_name AS memberName, s.member_email AS memberEmail,
                    s.due_at AS dueDate, s.borrowed_at AS createdAt, s.status,
                    bi.product_id AS productId, p.title, bi.quantity AS qty
             FROM borrow_slips s
             LEFT JOIN borrow_items bi ON bi.slip_id = s.id
             LEFT JOIN products p ON p.id = bi.product_id
             ORDER BY s.borrowed_at DESC, bi.id',
        )->fetchAll();
        $slips = [];
        foreach ($rows as $row) {
            $id = $row['id'];
            if (!isset($slips[$id])) {
                $slips[$id] = [
                    'id' => $id,
                    'memberName' => $row['memberName'],
                    'memberEmail' => $row['memberEmail'],
                    'dueDate' => $row['dueDate'],
                    'createdAt' => $row['createdAt'],
                    'status' => $row['status'],
                    'items' => [],
                ];
            }
            if ($row['productId'] !== null) {
                $slips[$id]['items'][] = [
                    'id' => (int)$row['productId'],
                    'title' => $row['title'] ?? 'Sách đã xóa',
                    'qty' => (int)$row['qty'],
                ];
            }
        }
        api_json(array_values($slips));
    }

    if ($resource === 'borrow-slips' && $method === 'POST') {
        api_require_origin();
        $input = api_input();
        $name = trim($input['memberName'] ?? '');
        $email = strtolower(trim($input['memberEmail'] ?? ''));
        $dueDate = $input['dueDate'] ?? '';
        $items = $input['items'] ?? null;
        $parsedDate = DateTime::createFromFormat('!Y-m-d', $dueDate);
        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)
            || !$parsedDate || $parsedDate->format('Y-m-d') !== $dueDate
            || !is_array($items) || !$items) {
            api_json(['message' => 'Thông tin người mượn, hạn trả hoặc sách không hợp lệ.'], 400);
        }
        $quantities = [];
        foreach ($items as $item) {
            $productId = filter_var($item['id'] ?? null, FILTER_VALIDATE_INT);
            $qty = filter_var($item['qty'] ?? null, FILTER_VALIDATE_INT);
            if (!$productId || $productId <= 0 || !$qty || $qty <= 0) {
                api_json(['message' => 'Mã sách hoặc số lượng không hợp lệ.'], 400);
            }
            $quantities[$productId] = ($quantities[$productId] ?? 0) + $qty;
        }

        $pdo->beginTransaction();
        $slipItems = [];
        foreach ($quantities as $productId => $qty) {
            $stmt = $pdo->prepare('SELECT id, title, stock, hidden FROM products WHERE id = ? FOR UPDATE');
            $stmt->execute([$productId]);
            $product = $stmt->fetch();
            if (!$product || $product['hidden'] || (int)$product['stock'] < $qty) {
                $pdo->rollBack();
                api_json(['message' => 'Một sách trong phiếu mượn không đủ tồn kho.'], 409);
            }
            $slipItems[] = ['id' => (int)$product['id'], 'title' => $product['title'], 'qty' => $qty];
        }

        $slipId = 'PM-' . date('ymdHis') . random_int(100, 999);
        $stmt = $pdo->prepare(
            "INSERT INTO borrow_slips (id, member_name, member_email, created_by, due_at, status) VALUES (?, ?, ?, ?, ?, 'Đang mượn')",
        );
        $stmt->execute([$slipId, $name, $email, $_SESSION['user']['id'], $dueDate]);
        $itemStmt = $pdo->prepare('INSERT INTO borrow_items (slip_id, product_id, quantity, returned_quantity) VALUES (?, ?, ?, 0)');
        $stockStmt = $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
        foreach ($slipItems as $item) {
            $itemStmt->execute([$slipId, $item['id'], $item['qty']]);
            $stockStmt->execute([$item['qty'], $item['id']]);
        }
        $pdo->commit();

        $stocks = [];
        $stockStmt = $pdo->prepare('SELECT stock FROM products WHERE id = ?');
        foreach ($slipItems as $item) {
            $stockStmt->execute([$item['id']]);
            $stocks[$item['id']] = (int)$stockStmt->fetchColumn();
        }
        api_json([
            'slip' => [
                'id' => $slipId,
                'memberName' => $name,
                'memberEmail' => $email,
                'dueDate' => $dueDate,
                'createdAt' => date(DATE_ATOM),
                'status' => 'Đang mượn',
                'items' => $slipItems,
            ],
            'stockByProduct' => $stocks,
        ], 201);
    }

    if ($resource === 'borrow-slips' && $method === 'PUT') {
        api_require_origin();
        $id = trim($_GET['id'] ?? '');
        $input = api_input();
        $newStatus = trim($input['status'] ?? '');
        $validStatuses = ['Đang mượn', 'Đã trả', 'Quá hạn'];
        if ($id === '' || !in_array($newStatus, $validStatuses, true)) {
            api_json(['message' => 'Mã phiếu hoặc trạng thái không hợp lệ.'], 400);
        }

        $stmt = $pdo->prepare('SELECT status FROM borrow_slips WHERE id = ?');
        $stmt->execute([$id]);
        $oldStatus = $stmt->fetchColumn();
        if (!$oldStatus) api_json(['message' => 'Không tìm thấy phiếu mượn.'], 404);

        $pdo->beginTransaction();
        $updateStmt = $pdo->prepare('UPDATE borrow_slips SET status = ? WHERE id = ?');
        $updateStmt->execute([$newStatus, $id]);

        if ($newStatus === 'Đã trả' && $oldStatus !== 'Đã trả') {
            $itemsStmt = $pdo->prepare('SELECT product_id, quantity FROM borrow_items WHERE slip_id = ?');
            $itemsStmt->execute([$id]);
            $slipItems = $itemsStmt->fetchAll();
            $stockStmt = $pdo->prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
            foreach ($slipItems as $item) {
                $stockStmt->execute([(int)$item['quantity'], (int)$item['product_id']]);
            }
        }
        $pdo->commit();
        api_json(['ok' => true, 'id' => $id, 'status' => $newStatus]);
    }

    if ($resource === 'borrow-slips' && $method === 'DELETE') {
        api_require_origin();
        $id = trim($_GET['id'] ?? '');
        if ($id === '') api_json(['message' => 'Thiếu mã phiếu mượn.'], 400);
        $stmt = $pdo->prepare('DELETE FROM borrow_slips WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->rowCount()) api_json(['message' => 'Không tìm thấy phiếu mượn.'], 404);
        api_json(['ok' => true]);
    }

    api_json(['message' => 'Yêu cầu quản trị không hợp lệ.'], 405);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log($e->getMessage());
    api_json(['message' => 'Không thể xử lý yêu cầu quản trị.'], 500);
}
