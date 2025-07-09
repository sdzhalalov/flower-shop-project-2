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

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'GET':
            $orderId = $_GET['order_id'] ?? '';
            $status = $_GET['status'] ?? '';
            $limit = $_GET['limit'] ?? 50;
            $offset = $_GET['offset'] ?? 0;
            
            if ($orderId) {
                // Получаем конкретный заказ с элементами
                $order = $db->fetch(
                    "SELECT * FROM orders WHERE id = ?",
                    [$orderId]
                );
                
                if ($order) {
                    $order['items'] = $db->fetchAll(
                        "SELECT oi.*, s.name as service_name, s.description as service_description 
                         FROM order_items oi 
                         JOIN services s ON oi.service_id = s.id 
                         WHERE oi.order_id = ?",
                        [$orderId]
                    );
                }
                
                echo json_encode($order);
                
            } else {
                // Получаем список заказов
                $sql = "SELECT o.*, COUNT(oi.id) as items_count 
                        FROM orders o 
                        LEFT JOIN order_items oi ON o.id = oi.order_id";
                $params = [];
                
                if ($status) {
                    $sql .= " WHERE o.status = ?";
                    $params[] = $status;
                }
                
                $sql .= " GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
                $params[] = $limit;
                $params[] = $offset;
                
                $orders = $db->fetchAll($sql, $params);
                echo json_encode($orders);
            }
            break;
            
        case 'POST':
            $customerName = $input['customer_name'] ?? '';
            $customerPhone = $input['customer_phone'] ?? '';
            $customerEmail = $input['customer_email'] ?? '';
            $serviceType = $input['service_type'] ?? '';
            $message = $input['message'] ?? '';
            $items = $input['items'] ?? [];
            
            if (!$customerName || !$customerPhone) {
                echo json_encode(['success' => false, 'message' => 'Имя и телефон обязательны']);
                break;
            }
            
            $db->beginTransaction();
            
            try {
                // Создаем заказ
                $orderId = $db->insert('orders', [
                    'customer_name' => $customerName,
                    'customer_phone' => $customerPhone,
                    'customer_email' => $customerEmail,
                    'service_type' => $serviceType,
                    'message' => $message,
                    'status' => 'new'
                ]);
                
                $totalAmount = 0;
                
                // Добавляем элементы заказа
                if (!empty($items)) {
                    foreach ($items as $item) {
                        $serviceId = $item['service_id'] ?? 0;
                        $quantity = $item['quantity'] ?? 1;
                        $price = $item['price'] ?? 0;
                        
                        if ($serviceId && $price > 0) {
                            $db->insert('order_items', [
                                'order_id' => $orderId,
                                'service_id' => $serviceId,
                                'quantity' => $quantity,
                                'price' => $price
                            ]);
                            
                            $totalAmount += $price * $quantity;
                        }
                    }
                }
                
                // Обновляем общую стоимость заказа
                $db->update('orders', 
                    ['total_amount' => $totalAmount], 
                    'id = ?', 
                    [$orderId]
                );
                
                $db->commit();
                
                $newOrder = $db->fetch("SELECT * FROM orders WHERE id = ?", [$orderId]);
                $newOrder['items'] = $db->fetchAll(
                    "SELECT oi.*, s.name as service_name 
                     FROM order_items oi 
                     JOIN services s ON oi.service_id = s.id 
                     WHERE oi.order_id = ?",
                    [$orderId]
                );
                
                logActivity('create_order', 'orders', $orderId, null, $newOrder);
                
                echo json_encode(['success' => true, 'order' => $newOrder]);
                
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
            break;
            
        case 'PUT':
            $orderId = $input['order_id'] ?? 0;
            $status = $input['status'] ?? '';
            $customerName = $input['customer_name'] ?? '';
            $customerPhone = $input['customer_phone'] ?? '';
            $customerEmail = $input['customer_email'] ?? '';
            $message = $input['message'] ?? '';
            
            if (!$orderId) {
                echo json_encode(['success' => false, 'message' => 'ID заказа не указан']);
                break;
            }
            
            $oldOrder = $db->fetch("SELECT * FROM orders WHERE id = ?", [$orderId]);
            
            if (!$oldOrder) {
                echo json_encode(['success' => false, 'message' => 'Заказ не найден']);
                break;
            }
            
            $updateData = [];
            
            if ($status) $updateData['status'] = $status;
            if ($customerName) $updateData['customer_name'] = $customerName;
            if ($customerPhone) $updateData['customer_phone'] = $customerPhone;
            if ($customerEmail !== null) $updateData['customer_email'] = $customerEmail;
            if ($message !== null) $updateData['message'] = $message;
            
            if (!empty($updateData)) {
                $db->update('orders', $updateData, 'id = ?', [$orderId]);
                
                $updatedOrder = $db->fetch("SELECT * FROM orders WHERE id = ?", [$orderId]);
                
                logActivity('update_order', 'orders', $orderId, $oldOrder, $updatedOrder);
                
                echo json_encode(['success' => true, 'order' => $updatedOrder]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Нет данных для обновления']);
            }
            break;
            
        case 'DELETE':
            $orderId = $_GET['order_id'] ?? 0;
            
            if (!$orderId) {
                echo json_encode(['success' => false, 'message' => 'ID заказа не указан']);
                break;
            }
            
            $oldOrder = $db->fetch("SELECT * FROM orders WHERE id = ?", [$orderId]);
            
            if (!$oldOrder) {
                echo json_encode(['success' => false, 'message' => 'Заказ не найден']);
                break;
            }
            
            // Удаляем заказ (элементы удалятся автоматически по CASCADE)
            $db->delete('orders', 'id = ?', [$orderId]);
            
            logActivity('delete_order', 'orders', $orderId, $oldOrder, null);
            
            echo json_encode(['success' => true]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Неподдерживаемый метод']);
    }
    
} catch (Exception $e) {
    error_log("Orders API Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Внутренняя ошибка сервера']);
}
?>