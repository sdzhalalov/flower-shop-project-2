<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDatabase();

// Получение настроек
if ($method === 'GET') {
    $public_only = isset($_GET['public']) ? true : false;
    
    $sql = "SELECT * FROM settings";
    $params = [];
    
    if ($public_only) {
        $sql .= " WHERE is_public = 1";
    }
    
    $sql .= " ORDER BY setting_key ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $settings = $stmt->fetchAll();
    
    // Преобразуем в удобный формат ключ-значение
    $result = [];
    foreach ($settings as $setting) {
        $value = $setting['setting_value'];
        
        // Преобразуем boolean значения
        if ($setting['setting_type'] === 'boolean') {
            $value = (bool)$value;
        }
        // Преобразуем числовые значения
        elseif ($setting['setting_type'] === 'number') {
            $value = is_numeric($value) ? (float)$value : $value;
        }
        
        $result[$setting['setting_key']] = $value;
    }
    
    jsonResponse(['success' => true, 'data' => $result]);
}

// Обновление настроек (только для админов)
if ($method === 'POST') {
    session_start();
    
    // Проверяем авторизацию и права админа
    if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in'] || $_SESSION['role'] !== 'admin') {
        jsonResponse(['success' => false, 'message' => 'Доступ запрещен'], 403);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data)) {
        jsonResponse(['success' => false, 'message' => 'Нет данных для обновления'], 400);
    }
    
    try {
        $pdo->beginTransaction();
        
        $updateStmt = $pdo->prepare("UPDATE settings SET setting_value = ? WHERE setting_key = ?");
        
        foreach ($data as $key => $value) {
            // Преобразуем boolean в строку для хранения
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }
            
            $updateStmt->execute([$value, $key]);
        }
        
        $pdo->commit();
        jsonResponse(['success' => true, 'message' => 'Настройки обновлены']);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['success' => false, 'message' => 'Ошибка при обновлении настроек'], 500);
    }
}

// Получение конкретной настройки
if ($method === 'GET' && isset($_GET['key'])) {
    $key = $_GET['key'];
    
    $stmt = $pdo->prepare("SELECT * FROM settings WHERE setting_key = ?");
    $stmt->execute([$key]);
    $setting = $stmt->fetch();
    
    if ($setting) {
        $value = $setting['setting_value'];
        
        // Преобразуем значение в нужный тип
        if ($setting['setting_type'] === 'boolean') {
            $value = (bool)$value;
        } elseif ($setting['setting_type'] === 'number') {
            $value = is_numeric($value) ? (float)$value : $value;
        }
        
        jsonResponse(['success' => true, 'data' => $value]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Настройка не найдена'], 404);
    }
}

// Создание новой настройки
if ($method === 'PUT') {
    session_start();
    
    // Проверяем авторизацию и права админа
    if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in'] || $_SESSION['role'] !== 'admin') {
        jsonResponse(['success' => false, 'message' => 'Доступ запрещен'], 403);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public) 
                           VALUES (?, ?, ?, ?, ?) 
                           ON DUPLICATE KEY UPDATE 
                           setting_value = VALUES(setting_value),
                           setting_type = VALUES(setting_type),
                           description = VALUES(description),
                           is_public = VALUES(is_public)");
    
    $result = $stmt->execute([
        $data['key'],
        $data['value'],
        $data['type'] ?? 'text',
        $data['description'] ?? '',
        $data['is_public'] ?? false
    ]);
    
    if ($result) {
        jsonResponse(['success' => true, 'message' => 'Настройка сохранена']);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при сохранении настройки'], 500);
    }
}
?>