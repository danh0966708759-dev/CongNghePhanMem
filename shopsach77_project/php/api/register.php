<?php
// api/register.php - Xử lý đăng ký tài khoản khách hàng
require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    api_json(['message' => 'Phương thức không hợp lệ. Chỉ chấp nhận POST.'], 405);
}

api_require_origin();
$input = api_input();

$name = trim($input['name'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$password = (string)($input['password'] ?? '');

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) {
    api_json(['message' => 'Vui lòng điền họ tên, email hợp lệ và mật khẩu từ 6 ký tự.'], 400);
}

try {
    $id = 'user_' . bin2hex(random_bytes(12));
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $role = 'customer';
    $insert = $pdo->prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
    $insert->execute([$id, $name, $email, $passwordHash, $role]);

    session_regenerate_id(true);
    $_SESSION['user'] = ['id' => $id, 'name' => $name, 'email' => $email, 'role' => $role];
    api_json([
        'ok' => true,
        'message' => 'Đăng ký tài khoản thành công.',
        'id' => $id,
        'name' => $name,
        'email' => $email,
        'role' => $role
    ], 201);
} catch (Exception $e) {
    if ($e instanceof PDOException && $e->getCode() === '23000') {
        api_json(['message' => 'Email này đã được sử dụng.'], 409);
    }
    error_log($e->getMessage());
    api_json(['message' => 'Không thể đăng ký tài khoản.'], 500);
}
