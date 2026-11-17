<?php
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json; charset=utf-8');

if (session_status() !== PHP_SESSION_ACTIVE) {
    $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function api_json($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_input() {
    $input = json_decode(file_get_contents('php://input'), true);
    return is_array($input) ? $input : $_POST;
}

function api_require_origin() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!$origin) return;
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $allowedOrigins = array_filter(array_map('trim', explode(',', getenv('FRONTEND_ORIGIN') ?: '')));
    $isLocal = preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i', $origin);
    if ($origin !== $scheme . '://' . $host && !in_array($origin, $allowedOrigins, true) && !$isLocal) {
        api_json(['message' => 'Nguồn yêu cầu không được phép.'], 403);
    }
}

function api_require_user() {
    if (empty($_SESSION['user']) || empty($_SESSION['user']['id'])) {
        api_json(['message' => 'Vui lòng đăng nhập.'], 401);
    }
    global $pdo;
    try {
        $stmt = $pdo->prepare('SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$_SESSION['user']['id']]);
        $user = $stmt->fetch();
    } catch (Throwable $e) {
        error_log($e->getMessage());
        api_json(['message' => 'Không thể xác minh phiên đăng nhập.'], 500);
    }
    if (!$user) {
        unset($_SESSION['user']);
        api_json(['message' => 'Phiên đăng nhập không còn hợp lệ.'], 401);
    }
    $_SESSION['user'] = $user;
    return $user;
}

function api_require_admin() {
    $user = api_require_user();
    if (($user['role'] ?? '') !== 'admin') {
        api_json(['message' => 'Bạn không có quyền quản trị.'], 403);
    }
    return $user;
}

function api_require_customer() {
    $user = api_require_user();
    if (($user['role'] ?? '') !== 'customer') {
        api_json(['message' => 'Chức năng này chỉ dành cho khách hàng.'], 403);
    }
    return $user;
}

function api_migrate_schema($pdo) {
    $ordersTable = $pdo->query("SHOW TABLES LIKE 'orders'")->fetchColumn();
    $productsTable = $pdo->query("SHOW TABLES LIKE 'products'")->fetchColumn();
    if (!$ordersTable || !$productsTable) {
        return;
    }

    $orderColumns = [
        'customer_name' => 'VARCHAR(120) NULL',
        'customer_email' => 'VARCHAR(190) NULL',
        'customer_phone' => 'VARCHAR(40) NULL',
        'customer_address' => 'TEXT NULL',
        'note' => 'TEXT NULL',
    ];
    $existingColumns = $pdo->query('SHOW COLUMNS FROM orders')->fetchAll(PDO::FETCH_COLUMN);
    foreach ($orderColumns as $column => $definition) {
        if (!in_array($column, $existingColumns, true)) {
            $pdo->exec("ALTER TABLE orders ADD COLUMN `$column` $definition");
        }
    }
    $customerId = $pdo->query("SHOW COLUMNS FROM orders LIKE 'customer_id'")->fetch();
    if ($customerId && $customerId['Null'] !== 'YES') {
        $pdo->exec('ALTER TABLE orders MODIFY customer_id VARCHAR(64) NULL');
    }
    $productId = $pdo->query("SHOW COLUMNS FROM products LIKE 'id'")->fetch();
    if ($productId && strpos($productId['Extra'], 'auto_increment') === false) {
        $pdo->exec('ALTER TABLE products MODIFY id BIGINT NOT NULL AUTO_INCREMENT');
    }
}

try {
    api_migrate_schema($pdo);
} catch (Throwable $e) {
    error_log($e->getMessage());
    api_json(['message' => 'Không thể khởi tạo cấu trúc dữ liệu. Kiểm tra database và quyền ALTER TABLE.'], 500);
}
