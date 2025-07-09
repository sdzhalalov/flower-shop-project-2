<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Файлы для хранения данных
$messagesFile = 'data/messages.json';
$chatsFile = 'data/chats.json';
$autoResponsesFile = 'data/autoresponses.json';

// Создаем директорию если не существует
if (!file_exists('data')) {
    mkdir('data', 0777, true);
}

// Инициализация файлов
if (!file_exists($messagesFile)) {
    file_put_contents($messagesFile, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if (!file_exists($chatsFile)) {
    file_put_contents($chatsFile, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if (!file_exists($autoResponsesFile)) {
    $defaultAutoResponses = [
        [
            'id' => 1,
            'trigger' => 'привет',
            'response' => 'Здравствуйте! Добро пожаловать в наш автосервис. Как мы можем помочь?',
            'active' => true
        ],
        [
            'id' => 2,
            'trigger' => 'цена',
            'response' => 'Цены на наши услуги можно посмотреть в разделе "Услуги". Для точной стоимости рекомендуем записаться на диагностику.',
            'active' => true
        ],
        [
            'id' => 3,
            'trigger' => 'время',
            'response' => 'Мы работаем: Пн-Сб: 9:00-20:00, Вс: 10:00-18:00. Запись по телефону +7 (495) 123-45-67',
            'active' => true
        ],
        [
            'id' => 4,
            'trigger' => 'адрес',
            'response' => 'Наш адрес: г. Москва, ул. Автосервисная, д. 15. Удобная парковка для клиентов.',
            'active' => true
        ]
    ];
    file_put_contents($autoResponsesFile, json_encode($defaultAutoResponses, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Чтение данных
function readData($file) {
    if (!file_exists($file)) return [];
    $data = file_get_contents($file);
    return json_decode($data, true) ?: [];
}

// Запись данных
function writeData($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Генерация ID
function generateId() {
    return uniqid() . '_' . time();
}

// Получение IP пользователя
function getUserIP() {
    return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// Проверка автоответов
function checkAutoResponse($message) {
    global $autoResponsesFile;
    $autoResponses = readData($autoResponsesFile);
    
    $messageLower = mb_strtolower($message, 'UTF-8');
    
    foreach ($autoResponses as $autoResponse) {
        if ($autoResponse['active'] && strpos($messageLower, $autoResponse['trigger']) !== false) {
            return $autoResponse['response'];
        }
    }
    
    return null;
}

// Создание или получение чата
function getOrCreateChat($guestId) {
    global $chatsFile;
    $chats = readData($chatsFile);
    
    foreach ($chats as $chat) {
        if ($chat['guest_id'] === $guestId) {
            return $chat;
        }
    }
    
    // Создаем новый чат
    $newChat = [
        'id' => generateId(),
        'guest_id' => $guestId,
        'guest_name' => 'Гость ' . substr($guestId, -4),
        'status' => 'active',
        'created_at' => date('Y-m-d H:i:s'),
        'last_message_at' => date('Y-m-d H:i:s')
    ];
    
    $chats[] = $newChat;
    writeData($chatsFile, $chats);
    
    return $newChat;
}

// Обработка запросов
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'messages') {
            $chatId = $_GET['chat_id'] ?? '';
            $messages = readData($messagesFile);
            
            if ($chatId) {
                $messages = array_filter($messages, function($msg) use ($chatId) {
                    return $msg['chat_id'] === $chatId;
                });
            }
            
            echo json_encode(array_values($messages));
            
        } elseif ($action === 'chats') {
            $chats = readData($chatsFile);
            echo json_encode($chats);
            
        } elseif ($action === 'autoresponses') {
            $autoResponses = readData($autoResponsesFile);
            echo json_encode($autoResponses);
            
        } elseif ($action === 'poll') {
            // Простой polling для обновлений
            $chatId = $_GET['chat_id'] ?? '';
            $lastMessageId = $_GET['last_message_id'] ?? '';
            
            $messages = readData($messagesFile);
            $newMessages = [];
            
            if ($chatId) {
                $found = false;
                foreach ($messages as $message) {
                    if ($message['chat_id'] === $chatId) {
                        if ($lastMessageId && $found) {
                            $newMessages[] = $message;
                        } elseif ($message['id'] === $lastMessageId) {
                            $found = true;
                        } elseif (!$lastMessageId) {
                            $newMessages[] = $message;
                        }
                    }
                }
            }
            
            echo json_encode($newMessages);
        }
        break;
        
    case 'POST':
        $action = $input['action'] ?? '';
        
        if ($action === 'send_message') {
            $guestId = $input['guest_id'] ?? getUserIP();
            $message = trim($input['message'] ?? '');
            $senderType = $input['sender_type'] ?? 'guest'; // guest или moderator
            $senderName = $input['sender_name'] ?? 'Гость';
            
            if (!$message) {
                echo json_encode(['success' => false, 'message' => 'Сообщение не может быть пустым']);
                break;
            }
            
            // Получаем или создаем чат
            $chat = getOrCreateChat($guestId);
            
            // Создаем сообщение
            $newMessage = [
                'id' => generateId(),
                'chat_id' => $chat['id'],
                'sender_type' => $senderType,
                'sender_name' => $senderName,
                'message' => $message,
                'timestamp' => date('Y-m-d H:i:s'),
                'is_auto' => false
            ];
            
            $messages = readData($messagesFile);
            $messages[] = $newMessage;
            writeData($messagesFile, $messages);
            
            // Обновляем время последнего сообщения в чате
            $chats = readData($chatsFile);
            for ($i = 0; $i < count($chats); $i++) {
                if ($chats[$i]['id'] === $chat['id']) {
                    $chats[$i]['last_message_at'] = date('Y-m-d H:i:s');
                    break;
                }
            }
            writeData($chatsFile, $chats);
            
            $response = ['success' => true, 'message' => $newMessage, 'chat' => $chat];
            
            // Проверяем автоответ только для сообщений гостей
            if ($senderType === 'guest') {
                $autoResponse = checkAutoResponse($message);
                if ($autoResponse) {
                    // Добавляем автоответ
                    $autoMessage = [
                        'id' => generateId(),
                        'chat_id' => $chat['id'],
                        'sender_type' => 'moderator',
                        'sender_name' => 'Автоответ',
                        'message' => $autoResponse,
                        'timestamp' => date('Y-m-d H:i:s'),
                        'is_auto' => true
                    ];
                    
                    $messages[] = $autoMessage;
                    writeData($messagesFile, $messages);
                    
                    $response['auto_response'] = $autoMessage;
                }
            }
            
            echo json_encode($response);
            
        } elseif ($action === 'quick_response') {
            $guestId = $input['guest_id'] ?? '';
            $quickResponse = $input['quick_response'] ?? '';
            $senderName = $input['sender_name'] ?? 'Модератор';
            
            if (!$quickResponse || !$guestId) {
                echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
                break;
            }
            
            // Получаем чат
            $chat = getOrCreateChat($guestId);
            
            // Создаем сообщение
            $newMessage = [
                'id' => generateId(),
                'chat_id' => $chat['id'],
                'sender_type' => 'moderator',
                'sender_name' => $senderName,
                'message' => $quickResponse,
                'timestamp' => date('Y-m-d H:i:s'),
                'is_auto' => false
            ];
            
            $messages = readData($messagesFile);
            $messages[] = $newMessage;
            writeData($messagesFile, $messages);
            
            echo json_encode(['success' => true, 'message' => $newMessage]);
        }
        break;
        
    case 'PUT':
        $action = $input['action'] ?? '';
        
        if ($action === 'update_autoresponse') {
            $autoResponses = readData($autoResponsesFile);
            $id = $input['id'] ?? 0;
            
            for ($i = 0; $i < count($autoResponses); $i++) {
                if ($autoResponses[$i]['id'] == $id) {
                    $autoResponses[$i]['trigger'] = $input['trigger'] ?? $autoResponses[$i]['trigger'];
                    $autoResponses[$i]['response'] = $input['response'] ?? $autoResponses[$i]['response'];
                    $autoResponses[$i]['active'] = $input['active'] ?? $autoResponses[$i]['active'];
                    break;
                }
            }
            
            writeData($autoResponsesFile, $autoResponses);
            echo json_encode(['success' => true]);
        }
        break;
        
    case 'DELETE':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'close_chat') {
            $chatId = $_GET['chat_id'] ?? '';
            $chats = readData($chatsFile);
            
            for ($i = 0; $i < count($chats); $i++) {
                if ($chats[$i]['id'] === $chatId) {
                    $chats[$i]['status'] = 'closed';
                    break;
                }
            }
            
            writeData($chatsFile, $chats);
            echo json_encode(['success' => true]);
        }
        break;
}
?>