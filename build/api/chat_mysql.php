<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$db = Database::getInstance();

// Получение IP пользователя
function getUserIP() {
    return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// Получение User Agent
function getUserAgent() {
    return $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
}

// Проверка автоответов
function checkAutoResponse($message) {
    global $db;
    
    $messageLower = mb_strtolower($message, 'UTF-8');
    
    $autoResponses = $db->fetchAll(
        "SELECT * FROM auto_responses WHERE is_active = 1 ORDER BY priority ASC"
    );
    
    foreach ($autoResponses as $response) {
        if (strpos($messageLower, mb_strtolower($response['trigger_text'], 'UTF-8')) !== false) {
            return $response['response_text'];
        }
    }
    
    return null;
}

// Создание или получение чата
function getOrCreateChat($guestId) {
    global $db;
    
    // Проверяем существующий чат
    $chat = $db->fetch(
        "SELECT * FROM chats WHERE guest_id = ? AND status = 'active'",
        [$guestId]
    );
    
    if ($chat) {
        return $chat;
    }
    
    // Создаем новый чат
    $chatId = $db->insert('chats', [
        'guest_id' => $guestId,
        'guest_name' => 'Гость ' . substr($guestId, -4),
        'guest_ip' => getUserIP(),
        'guest_user_agent' => getUserAgent(),
        'status' => 'active',
        'last_message_at' => date('Y-m-d H:i:s')
    ]);
    
    return $db->fetch("SELECT * FROM chats WHERE id = ?", [$chatId]);
}

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
        'ip_address' => getUserIP(),
        'user_agent' => getUserAgent()
    ]);
}

// Обработка запросов
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'GET':
            $action = $_GET['action'] ?? '';
            
            if ($action === 'messages') {
                $chatId = $_GET['chat_id'] ?? '';
                $limit = $_GET['limit'] ?? 50;
                $offset = $_GET['offset'] ?? 0;
                
                if ($chatId) {
                    $messages = $db->fetchAll(
                        "SELECT m.*, u.name as moderator_name 
                         FROM messages m 
                         LEFT JOIN users u ON m.sender_id = u.id 
                         WHERE m.chat_id = ? 
                         ORDER BY m.created_at ASC 
                         LIMIT ? OFFSET ?",
                        [$chatId, $limit, $offset]
                    );
                } else {
                    $messages = $db->fetchAll(
                        "SELECT m.*, c.guest_name, u.name as moderator_name 
                         FROM messages m 
                         LEFT JOIN chats c ON m.chat_id = c.id 
                         LEFT JOIN users u ON m.sender_id = u.id 
                         ORDER BY m.created_at DESC 
                         LIMIT ? OFFSET ?",
                        [$limit, $offset]
                    );
                }
                
                echo json_encode($messages);
                
            } elseif ($action === 'chats') {
                $status = $_GET['status'] ?? 'active';
                $moderatorId = $_GET['moderator_id'] ?? null;
                
                $sql = "SELECT c.*, 
                               COUNT(m.id) as message_count,
                               MAX(m.created_at) as last_message_time,
                               u.name as moderator_name
                        FROM chats c 
                        LEFT JOIN messages m ON c.id = m.chat_id 
                        LEFT JOIN users u ON c.assigned_moderator = u.id
                        WHERE c.status = ?";
                $params = [$status];
                
                if ($moderatorId) {
                    $sql .= " AND c.assigned_moderator = ?";
                    $params[] = $moderatorId;
                }
                
                $sql .= " GROUP BY c.id ORDER BY c.last_message_at DESC";
                
                $chats = $db->fetchAll($sql, $params);
                echo json_encode($chats);
                
            } elseif ($action === 'poll') {
                $chatId = $_GET['chat_id'] ?? '';
                $lastMessageId = $_GET['last_message_id'] ?? 0;
                
                if ($chatId) {
                    $messages = $db->fetchAll(
                        "SELECT m.*, u.name as moderator_name 
                         FROM messages m 
                         LEFT JOIN users u ON m.sender_id = u.id 
                         WHERE m.chat_id = ? AND m.id > ? 
                         ORDER BY m.created_at ASC",
                        [$chatId, $lastMessageId]
                    );
                    
                    echo json_encode($messages);
                } else {
                    echo json_encode([]);
                }
                
            } elseif ($action === 'stats') {
                $stats = [
                    'total_chats' => $db->fetch("SELECT COUNT(*) as count FROM chats")['count'],
                    'active_chats' => $db->fetch("SELECT COUNT(*) as count FROM chats WHERE status = 'active'")['count'],
                    'total_messages' => $db->fetch("SELECT COUNT(*) as count FROM messages")['count'],
                    'messages_today' => $db->fetch("SELECT COUNT(*) as count FROM messages WHERE DATE(created_at) = CURDATE()")['count'],
                    'avg_response_time' => $db->fetch("SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) as avg_time FROM chats WHERE status = 'closed'")['avg_time']
                ];
                
                echo json_encode($stats);
            }
            break;
            
        case 'POST':
            $action = $input['action'] ?? '';
            
            if ($action === 'send_message') {
                $guestId = $input['guest_id'] ?? getUserIP();
                $message = trim($input['message'] ?? '');
                $senderType = $input['sender_type'] ?? 'guest';
                $senderName = $input['sender_name'] ?? 'Гость';
                $senderId = null;
                
                if (!$message) {
                    echo json_encode(['success' => false, 'message' => 'Сообщение не может быть пустым']);
                    break;
                }
                
                // Получаем или создаем чат
                $chat = getOrCreateChat($guestId);
                
                // Если отправитель модератор, получаем его ID
                if ($senderType === 'moderator' && isset($_SESSION['user'])) {
                    $senderId = $_SESSION['user']['id'];
                    $senderName = $_SESSION['user']['name'];
                    
                    // Назначаем модератора чату если не назначен
                    if (!$chat['assigned_moderator']) {
                        $db->update('chats', 
                            ['assigned_moderator' => $senderId], 
                            'id = ?', 
                            [$chat['id']]
                        );
                    }
                }
                
                // Создаем сообщение
                $messageId = $db->insert('messages', [
                    'chat_id' => $chat['id'],
                    'sender_type' => $senderType,
                    'sender_id' => $senderId,
                    'sender_name' => $senderName,
                    'message' => $message,
                    'is_auto' => 0
                ]);
                
                // Обновляем время последнего сообщения в чате
                $db->update('chats', 
                    ['last_message_at' => date('Y-m-d H:i:s')], 
                    'id = ?', 
                    [$chat['id']]
                );
                
                $newMessage = $db->fetch("SELECT * FROM messages WHERE id = ?", [$messageId]);
                
                // Логируем активность
                logActivity('send_message', 'messages', $messageId, null, $newMessage);
                
                $response = ['success' => true, 'message' => $newMessage, 'chat' => $chat];
                
                // Проверяем автоответ только для сообщений гостей
                if ($senderType === 'guest') {
                    $autoResponse = checkAutoResponse($message);
                    if ($autoResponse) {
                        // Добавляем автоответ с небольшой задержкой
                        sleep(1);
                        
                        $autoMessageId = $db->insert('messages', [
                            'chat_id' => $chat['id'],
                            'sender_type' => 'moderator',
                            'sender_id' => null,
                            'sender_name' => 'Автоответ',
                            'message' => $autoResponse,
                            'is_auto' => 1
                        ]);
                        
                        $autoMessage = $db->fetch("SELECT * FROM messages WHERE id = ?", [$autoMessageId]);
                        $response['auto_response'] = $autoMessage;
                        
                        // Обновляем время последнего сообщения
                        $db->update('chats', 
                            ['last_message_at' => date('Y-m-d H:i:s')], 
                            'id = ?', 
                            [$chat['id']]
                        );
                    }
                }
                
                echo json_encode($response);
                
            } elseif ($action === 'assign_moderator') {
                $chatId = $input['chat_id'] ?? '';
                $moderatorId = $input['moderator_id'] ?? '';
                
                if (!$chatId || !$moderatorId) {
                    echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
                    break;
                }
                
                $db->update('chats', 
                    ['assigned_moderator' => $moderatorId], 
                    'id = ?', 
                    [$chatId]
                );
                
                logActivity('assign_moderator', 'chats', $chatId, null, ['moderator_id' => $moderatorId]);
                
                echo json_encode(['success' => true]);
                
            } elseif ($action === 'mark_read') {
                $chatId = $input['chat_id'] ?? '';
                $userId = $_SESSION['user']['id'] ?? null;
                
                if (!$chatId || !$userId) {
                    echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
                    break;
                }
                
                $db->query(
                    "UPDATE messages SET is_read = 1 
                     WHERE chat_id = ? AND sender_type = 'guest' AND is_read = 0",
                    [$chatId]
                );
                
                echo json_encode(['success' => true]);
            }
            break;
            
        case 'PUT':
            $action = $input['action'] ?? '';
            
            if ($action === 'update_chat_status') {
                $chatId = $input['chat_id'] ?? '';
                $status = $input['status'] ?? '';
                
                if (!$chatId || !$status) {
                    echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
                    break;
                }
                
                $oldChat = $db->fetch("SELECT * FROM chats WHERE id = ?", [$chatId]);
                
                $db->update('chats', 
                    ['status' => $status], 
                    'id = ?', 
                    [$chatId]
                );
                
                logActivity('update_chat_status', 'chats', $chatId, $oldChat, ['status' => $status]);
                
                echo json_encode(['success' => true]);
                
            } elseif ($action === 'update_autoresponse') {
                $id = $input['id'] ?? 0;
                $triggerText = $input['trigger_text'] ?? '';
                $responseText = $input['response_text'] ?? '';
                $isActive = $input['is_active'] ?? 1;
                
                if (!$id || !$triggerText || !$responseText) {
                    echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
                    break;
                }
                
                $oldResponse = $db->fetch("SELECT * FROM auto_responses WHERE id = ?", [$id]);
                
                $db->update('auto_responses', [
                    'trigger_text' => $triggerText,
                    'response_text' => $responseText,
                    'is_active' => $isActive
                ], 'id = ?', [$id]);
                
                logActivity('update_autoresponse', 'auto_responses', $id, $oldResponse, $input);
                
                echo json_encode(['success' => true]);
            }
            break;
            
        case 'DELETE':
            $action = $_GET['action'] ?? '';
            
            if ($action === 'delete_chat') {
                $chatId = $_GET['chat_id'] ?? '';
                
                if (!$chatId) {
                    echo json_encode(['success' => false, 'message' => 'ID чата не указан']);
                    break;
                }
                
                $oldChat = $db->fetch("SELECT * FROM chats WHERE id = ?", [$chatId]);
                
                // Удаляем чат (сообщения удалятся автоматически по CASCADE)
                $db->delete('chats', 'id = ?', [$chatId]);
                
                logActivity('delete_chat', 'chats', $chatId, $oldChat, null);
                
                echo json_encode(['success' => true]);
                
            } elseif ($action === 'delete_message') {
                $messageId = $_GET['message_id'] ?? '';
                
                if (!$messageId) {
                    echo json_encode(['success' => false, 'message' => 'ID сообщения не указан']);
                    break;
                }
                
                $oldMessage = $db->fetch("SELECT * FROM messages WHERE id = ?", [$messageId]);
                
                $db->delete('messages', 'id = ?', [$messageId]);
                
                logActivity('delete_message', 'messages', $messageId, $oldMessage, null);
                
                echo json_encode(['success' => true]);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Неподдерживаемый метод']);
    }
    
} catch (Exception $e) {
    error_log("Chat API Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Внутренняя ошибка сервера']);
}
?>