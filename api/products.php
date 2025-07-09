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

// Получение всех товаров с категориями
if ($method === 'GET') {
    $category = $_GET['category'] ?? null;
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 12);
    $offset = ($page - 1) * $limit;
    
    $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.is_active = 1";
    
    $params = [];
    
    if ($category) {
        $sql .= " AND c.slug = ?";
        $params[] = $category;
    }
    
    $sql .= " ORDER BY p.sort_order ASC, p.created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
    // Получаем общее количество товаров для пагинации
    $countSql = "SELECT COUNT(*) FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.is_active = 1";
    $countParams = [];
    
    if ($category) {
        $countSql .= " AND c.slug = ?";
        $countParams[] = $category;
    }
    
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($countParams);
    $total = $countStmt->fetchColumn();
    
    jsonResponse([
        'success' => true,
        'data' => $products,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

// Получение одного товара
if ($method === 'GET' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    
    $stmt = $pdo->prepare("SELECT p.*, c.name as category_name, c.slug as category_slug 
                           FROM products p 
                           LEFT JOIN categories c ON p.category_id = c.id 
                           WHERE p.id = ? AND p.is_active = 1");
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    
    if ($product) {
        jsonResponse(['success' => true, 'data' => $product]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Товар не найден'], 404);
    }
}

// Создание товара (только для админов)
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO products (category_id, name, slug, description, price, stock_quantity, image) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    $slug = strtolower(str_replace(' ', '-', $data['name']));
    $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
    
    $result = $stmt->execute([
        $data['category_id'],
        $data['name'],
        $slug,
        $data['description'] ?? '',
        $data['price'],
        $data['stock_quantity'] ?? 0,
        $data['image'] ?? ''
    ]);
    
    if ($result) {
        jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при создании товара'], 500);
    }
}

// Обновление товара
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)$data['id'];
    
    $stmt = $pdo->prepare("UPDATE products SET 
                           category_id = ?, name = ?, description = ?, 
                           price = ?, stock_quantity = ?, image = ? 
                           WHERE id = ?");
    
    $result = $stmt->execute([
        $data['category_id'],
        $data['name'],
        $data['description'] ?? '',
        $data['price'],
        $data['stock_quantity'] ?? 0,
        $data['image'] ?? '',
        $id
    ]);
    
    if ($result) {
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при обновлении товара'], 500);
    }
}

// Удаление товара
if ($method === 'DELETE') {
    $id = (int)$_GET['id'];
    
    $stmt = $pdo->prepare("UPDATE products SET is_active = 0 WHERE id = ?");
    $result = $stmt->execute([$id]);
    
    if ($result) {
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при удалении товара'], 500);
    }
}
?>