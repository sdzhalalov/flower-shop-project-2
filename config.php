<?php
// Конфигурация базы данных для OpenServer
define('DB_HOST', 'localhost');
define('DB_NAME', 'bloom_blossom');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Настройки сайта
define('SITE_NAME', 'Bloom & Blossom');
define('SITE_URL', 'http://localhost');
define('UPLOAD_PATH', 'uploads/');

// Подключение к базе данных
function getDatabase() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        die('Ошибка подключения к базе данных: ' . $e->getMessage());
    }
}

// Функция для JSON ответов
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Функция для генерации случайного ID
function generateId($length = 8) {
    return substr(bin2hex(random_bytes($length)), 0, $length);
}

// Включение CORS для API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
?>