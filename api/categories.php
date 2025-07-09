<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDatabase();

// Получение всех категорий
if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC");
    $stmt->execute();
    $categories = $stmt->fetchAll();
    
    // Добавляем количество товаров в каждой категории
    foreach ($categories as &$category) {
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_id = ? AND is_active = 1");
        $countStmt->execute([$category['id']]);
        $category['products_count'] = (int)$countStmt->fetchColumn();
    }
    
    jsonResponse(['success' => true, 'data' => $categories]);
}

// Создание категории
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $slug = strtolower(str_replace(' ', '-', $data['name']));
    $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
    
    $stmt = $pdo->prepare("INSERT INTO categories (name, slug, description, image, sort_order) 
                           VALUES (?, ?, ?, ?, ?)");
    
    $result = $stmt->execute([
        $data['name'],
        $slug,
        $data['description'] ?? '',
        $data['image'] ?? '',
        $data['sort_order'] ?? 0
    ]);
    
    if ($result) {
        jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при создании категории'], 500);
    }
}

// Обновление категории
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)$data['id'];
    
    $stmt = $pdo->prepare("UPDATE categories SET 
                           name = ?, description = ?, image = ?, sort_order = ? 
                           WHERE id = ?");
    
    $result = $stmt->execute([
        $data['name'],
        $data['description'] ?? '',
        $data['image'] ?? '',
        $data['sort_order'] ?? 0,
        $id
    ]);
    
    if ($result) {
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при обновлении категории'], 500);
    }
}

// Удаление категории
if ($method === 'DELETE') {
    $id = (int)$_GET['id'];
    
    // Проверяем, есть ли товары в категории
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_id = ? AND is_active = 1");
    $countStmt->execute([$id]);
    $productsCount = $countStmt->fetchColumn();
    
    if ($productsCount > 0) {
        jsonResponse(['success' => false, 'message' => 'Нельзя удалить категорию с товарами'], 400);
    }
    
    $stmt = $pdo->prepare("UPDATE categories SET is_active = 0 WHERE id = ?");
    $result = $stmt->execute([$id]);
    
    if ($result) {
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при удалении категории'], 500);
    }
}
?>