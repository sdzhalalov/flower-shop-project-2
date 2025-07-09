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

// Создание нового чата
if ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create_chat') {
    $chatId = generateId(12);
    
    $stmt = $pdo->prepare("INSERT INTO chats (chat_id, customer_name, customer_phone) VALUES (?, ?, ?)");
    $result = $stmt->execute([
        $chatId,
        $_POST['customer_name'] ?? 'Гость',
        $_POST['customer_phone'] ?? ''
    ]);
    
    if ($result) {
        jsonResponse(['success' => true, 'chat_id' => $chatId]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при создании чата'], 500);
    }
}

// Отправка сообщения
if ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'send_message') {
    $chatId = $_POST['chat_id'];
    $message = $_POST['message'];
    $senderType = $_POST['sender_type'] ?? 'customer';
    $senderName = $_POST['sender_name'] ?? 'Гость';
    $userId = $_POST['user_id'] ?? null;
    
    // Получаем ID чата из базы
    $chatStmt = $pdo->prepare("SELECT id FROM chats WHERE chat_id = ?");
    $chatStmt->execute([$chatId]);
    $chat = $chatStmt->fetch();
    
    if (!$chat) {
        jsonResponse(['success' => false, 'message' => 'Чат не найден'], 404);
    }
    
    $stmt = $pdo->prepare("INSERT INTO chat_messages (chat_id, sender_type, sender_name, user_id, message) 
                           VALUES (?, ?, ?, ?, ?)");
    
    $result = $stmt->execute([
        $chat['id'],
        $senderType,
        $senderName,
        $userId,
        $message
    ]);
    
    if ($result) {
        // Обновляем время последней активности чата
        $updateStmt = $pdo->prepare("UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $updateStmt->execute([$chat['id']]);
        
        jsonResponse(['success' => true, 'message_id' => $pdo->lastInsertId()]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при отправке сообщения'], 500);
    }
}

// Получение сообщений чата
if ($method === 'GET' && isset($_GET['chat_id'])) {
    $chatId = $_GET['chat_id'];
    $lastMessageId = (int)($_GET['last_message_id'] ?? 0);
    
    // Получаем ID чата из базы
    $chatStmt = $pdo->prepare("SELECT id FROM chats WHERE chat_id = ?");
    $chatStmt->execute([$chatId]);
    $chat = $chatStmt->fetch();
    
    if (!$chat) {
        jsonResponse(['success' => false, 'message' => 'Чат не найден'], 404);
    }
    
    $sql = "SELECT * FROM chat_messages WHERE chat_id = ?";
    $params = [$chat['id']];
    
    if ($lastMessageId > 0) {
        $sql .= " AND id > ?";
        $params[] = $lastMessageId;
    }
    
    $sql .= " ORDER BY created_at ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $messages = $stmt->fetchAll();
    
    jsonResponse(['success' => true, 'data' => $messages]);
}

// Получение списка чатов (для админки)
if ($method === 'GET' && !isset($_GET['chat_id'])) {
    $status = $_GET['status'] ?? 'open';
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;
    
    $sql = "SELECT c.*, 
                   COUNT(cm.id) as messages_count,
                   COUNT(CASE WHEN cm.sender_type = 'customer' AND cm.is_read = 0 THEN 1 END) as unread_count,
                   MAX(cm.created_at) as last_message_time
            FROM chats c 
            LEFT JOIN chat_messages cm ON c.id = cm.chat_id 
            WHERE c.status = ?
            GROUP BY c.id 
            ORDER BY last_message_time DESC 
            LIMIT ? OFFSET ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$status, $limit, $offset]);
    $chats = $stmt->fetchAll();
    
    // Получаем общее количество чатов
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM chats WHERE status = ?");
    $countStmt->execute([$status]);
    $total = $countStmt->fetchColumn();
    
    jsonResponse([
        'success' => true,
        'data' => $chats,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

// Обновление статуса чата
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)$data['id'];
    
    $stmt = $pdo->prepare("UPDATE chats SET status = ?, assigned_user_id = ? WHERE id = ?");
    $result = $stmt->execute([
        $data['status'],
        $data['assigned_user_id'] ?? null,
        $id
    ]);
    
    if ($result) {
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при обновлении чата'], 500);
    }
}

// Отметка сообщений как прочитанных
if ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'mark_read') {
    $chatId = (int)$_POST['chat_id'];
    
    $stmt = $pdo->prepare("UPDATE chat_messages SET is_read = 1 WHERE chat_id = ? AND sender_type = 'customer'");
    $result = $stmt->execute([$chatId]);
    
    if ($result) {
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при обновлении статуса'], 500);
    }
}
?>