<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$db = Database::getInstance();

// Логирование активности
function logActivity($action, $tableName = null, $recordId = null, $oldData = null, $newData = null) {
    global $db;
    
    $userId = $_SESSION['user']['id'] ?? null;
    
    $db->insert('activity_log', [
        'user_id' => $userId,
        'action' => $action,
        'table_name' => $tableName,
        'record_id' => $recordId,
        'old_data' => $oldData ? json_encode($oldData) : null,
        'new_data' => $newData ? json_encode($newData) : null,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);
}

// Обработка запросов
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'GET':
            $category = $_GET['category'] ?? '';
            $isActive = $_GET['is_active'] ?? 1;
            $limit = $_GET['limit'] ?? 100;
            $offset = $_GET['offset'] ?? 0;
            
            $sql = "SELECT * FROM services WHERE is_active = ?";
            $params = [$isActive];
            
            if ($category) {
                $sql .= " AND category = ?";
                $params[] = $category;
            }
            
            $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            
            $services = $db->fetchAll($sql, $params);
            echo json_encode($services);
            break;
            
        case 'POST':
            $name = $input['name'] ?? '';
            $description = $input['description'] ?? '';
            $price = $input['price'] ?? 0;
            $duration = $input['duration'] ?? null;
            $category = $input['category'] ?? 'general';
            $image = $input['image'] ?? null;
            
            if (!$name || !$description || $price <= 0) {
                echo json_encode(['success' => false, 'message' => 'Недостаточно данных или некорректная цена']);
                break;
            }
            
            $serviceId = $db->insert('services', [
                'name' => $name,
                'description' => $description,
                'price' => $price,
                'duration' => $duration,
                'category' => $category,
                'image' => $image,
                'is_active' => 1
            ]);
            
            $newService = $db->fetch("SELECT * FROM services WHERE id = ?", [$serviceId]);
            
            logActivity('create_service', 'services', $serviceId, null, $newService);
            
            echo json_encode(['success' => true, 'service' => $newService]);
            break;
            
        case 'PUT':
            $id = $input['id'] ?? 0;
            $name = $input['name'] ?? '';
            $description = $input['description'] ?? '';
            $price = $input['price'] ?? 0;
            $duration = $input['duration'] ?? null;
            $category = $input['category'] ?? 'general';
            $image = $input['image'] ?? null;
            $isActive = $input['is_active'] ?? 1;
            
            if (!$id || !$name || !$description || $price <= 0) {
                echo json_encode(['success' => false, 'message' => 'Недостаточно данных или некорректная цена']);
                break;
            }
            
            $oldService = $db->fetch("SELECT * FROM services WHERE id = ?", [$id]);
            
            if (!$oldService) {
                echo json_encode(['success' => false, 'message' => 'Услуга не найдена']);
                break;
            }
            
            $db->update('services', [
                'name' => $name,
                'description' => $description,
                'price' => $price,
                'duration' => $duration,
                'category' => $category,
                'image' => $image,
                'is_active' => $isActive
            ], 'id = ?', [$id]);
            
            $updatedService = $db->fetch("SELECT * FROM services WHERE id = ?", [$id]);
            
            logActivity('update_service', 'services', $id, $oldService, $updatedService);
            
            echo json_encode(['success' => true, 'service' => $updatedService]);
            break;
            
        case 'DELETE':
            $id = $_GET['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID услуги не указан']);
                break;
            }
            
            $oldService = $db->fetch("SELECT * FROM services WHERE id = ?", [$id]);
            
            if (!$oldService) {
                echo json_encode(['success' => false, 'message' => 'Услуга не найдена']);
                break;
            }
            
            // Мягкое удаление - помечаем как неактивную
            $db->update('services', ['is_active' => 0], 'id = ?', [$id]);
            
            logActivity('delete_service', 'services', $id, $oldService, ['is_active' => 0]);
            
            echo json_encode(['success' => true]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Неподдерживаемый метод']);
    }
    
} catch (Exception $e) {
    error_log("Services API Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Внутренняя ошибка сервера']);
}
?>