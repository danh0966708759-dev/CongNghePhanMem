<?php
require_once __DIR__ . '/common.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    api_json(['user' => api_require_user()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    api_require_origin();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => $params['samesite'] ?? 'Lax',
        ]);
    }
    session_destroy();
    api_json(['ok' => true]);
}

api_json(['message' => 'Phương thức không được hỗ trợ.'], 405);
