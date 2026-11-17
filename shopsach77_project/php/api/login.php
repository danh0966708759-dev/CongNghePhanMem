<?php
// api/login.php - Xử lý đăng nhập hệ thống Shop Sách 77
require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    api_json(['message' => 'Phương thức không hợp lệ. Chỉ chấp nhận POST.'], 405);
}

api_require_origin();
$input = api_input();
$email = strtolower(trim($input['email'] ?? ''));
$password = (string)($input['password'] ?? '');
$adminLogin = ($_GET['admin'] ?? '') === '1';
if ($email === '' || $password === '') api_json(['message' => 'Vui lòng điền email và mật khẩu.'], 400);

try {
    $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        api_json(['message' => $adminLogin ? 'Email hoặc mật khẩu quản trị không đúng.' : 'Email hoặc mật khẩu không đúng.'], 401);
    }

    if ($adminLogin && $user['role'] !== 'admin') {
        api_json(['message' => 'Tài khoản này không có quyền truy cập khu vực quản trị.'], 403);
    }

    session_regenerate_id(true);
    unset($user['password_hash']);
    $_SESSION['user'] = $user;
    api_json([
        'ok' => true,
        'message' => 'Đăng nhập thành công.',
        'user' => $user
    ]);
} catch (Exception $e) {
    error_log($e->getMessage());
    api_json(['message' => 'Không thể đăng nhập.'], 500);
}
