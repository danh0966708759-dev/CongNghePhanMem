<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/db.php';

$email = strtolower(trim(getenv('ADMIN_EMAIL') ?: ''));
$password = getenv('ADMIN_PASSWORD') ?: '';
$name = trim(getenv('ADMIN_NAME') ?: 'Quản trị viên Shop');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
    fwrite(STDERR, "Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 12 characters first.\n");
    exit(1);
}

$id = 'admin-' . bin2hex(random_bytes(12));
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare(
    "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin'",
);
$stmt->execute([$id, $name, $email, $hash]);
fwrite(STDOUT, "Admin account configured: $email\n");
