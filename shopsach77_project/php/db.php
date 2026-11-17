
<?php
// php/db.php - Ket noi MySQL bang PDO

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_filter(array_map('trim', explode(',', getenv('FRONTEND_ORIGIN') ?: '')));
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$sameOrigin = $origin && $origin === $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? '');
$isLocalOrigin = $origin && preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i', $origin);
if ($sameOrigin || in_array($origin, $allowedOrigins, true) || $isLocalOrigin) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(200);
    exit;
}
$host = 'sql204.infinityfree.com';
$port = '3306';
$db   = 'if0_42860770_ShopSach77';
$user = 'if0_42860770';
$pass = 'danh24112006';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'message' => 'Không thể kết nối cơ sở dữ liệu.'
    ], JSON_UNESCAPED_UNICODE);

    error_log($e->getMessage());
    exit;
}

$host = 'sql204.infinityfree.com';
$port = '3306';
$db   = 'if0_42860770_ShopSach77';
$user = 'if0_42860770';
$pass = 'DÁN_MẬT_KHẨU_MYSQL_MỚI_VÀO_ĐÂY';