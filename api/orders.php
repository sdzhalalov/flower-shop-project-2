<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDatabase();
} catch (Exception $e) {
    jsonResponse(['success' => false, 'message' => 'Ошибка подключения к базе данных: ' . $e->getMessage()], 500);
}

// Создание заказа
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Валидация данных
    if (empty($data['customer_name']) || empty($data['customer_phone']) || 
        empty($data['customer_address']) || empty($data['items'])) {
        jsonResponse(['success' => false, 'message' => 'Заполните все обязательные поля'], 400);
    }
    
    try {
        $pdo->beginTransaction();
        
        // Генерируем номер заказа
        $orderNumber = 'BB' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        // Проверяем уникальность номера заказа
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE order_number = ?");
        $checkStmt->execute([$orderNumber]);
        while ($checkStmt->fetchColumn() > 0) {
            $orderNumber = 'BB' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $checkStmt->execute([$orderNumber]);
        }
        
        // Рассчитываем общую сумму
        $totalAmount = 0;
        foreach ($data['items'] as $item) {
            $totalAmount += $item['price'] * $item['quantity'];
        }
        
        // Создаем заказ
        $orderStmt = $pdo->prepare("INSERT INTO orders 
                                   (order_number, customer_name, customer_phone, customer_address, comment, total_amount) 
                                   VALUES (?, ?, ?, ?, ?, ?)");
        
        $orderStmt->execute([
            $orderNumber,
            $data['customer_name'],
            $data['customer_phone'],
            $data['customer_address'],
            $data['comment'] ?? '',
            $totalAmount
        ]);
        
        $orderId = $pdo->lastInsertId();
        
        // Добавляем товары в заказ
        $itemStmt = $pdo->prepare("INSERT INTO order_items 
                                  (order_id, product_id, product_name, product_price, quantity, total) 
                                  VALUES (?, ?, ?, ?, ?, ?)");
        
        foreach ($data['items'] as $item) {
            $itemTotal = $item['price'] * $item['quantity'];
            $itemStmt->execute([
                $orderId,
                $item['id'],
                $item['name'],
                $item['price'],
                $item['quantity'],
                $itemTotal
            ]);
            
            // Уменьшаем количество товара на складе
            $updateStockStmt = $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");
            $updateStockStmt->execute([$item['quantity'], $item['id']]);
        }
        
        $pdo->commit();
        
        jsonResponse([
            'success' => true, 
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'message' => 'Заказ успешно создан'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['success' => false, 'message' => 'Ошибка при создании заказа: ' . $e->getMessage()], 500);
    }
}

// Получение заказов (для админки)
if ($method === 'GET') {
    $status = $_GET['status'] ?? null;
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;
    
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
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();
    
    // Получаем общее количество заказов
    $countSql = "SELECT COUNT(*) FROM orders";
    $countParams = [];
    
    if ($status) {
        $countSql .= " WHERE status = ?";
        $countParams[] = $status;
    }
    
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($countParams);
    $total = $countStmt->fetchColumn();
    
    jsonResponse([
        'success' => true,
        'data' => $orders,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

// Получение деталей заказа
if ($method === 'GET' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    
    // Получаем заказ
    $orderStmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
    $orderStmt->execute([$id]);
    $order = $orderStmt->fetch();
    
    if (!$order) {
        jsonResponse(['success' => false, 'message' => 'Заказ не найден'], 404);
    }
    
    // Получаем товары заказа
    $itemsStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemsStmt->execute([$id]);
    $items = $itemsStmt->fetchAll();
    
    $order['items'] = $items;
    
    jsonResponse(['success' => true, 'data' => $order]);
}

// Обновление статуса заказа
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)$data['id'];
    
    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $result = $stmt->execute([$data['status'], $id]);
    
    if ($result) {
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при обновлении заказа'], 500);
    }
}
?>