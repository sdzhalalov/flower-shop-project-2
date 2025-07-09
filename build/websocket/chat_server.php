<?php
require_once '../config/database.php';

// Простой WebSocket сервер для чата
class ChatWebSocketServer {
    private $host = '127.0.0.1';
    private $port = 8080;
    private $socket;
    private $clients = [];
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
        socket_set_option($this->socket, SOL_SOCKET, SO_REUSEADDR, 1);
        socket_bind($this->socket, $this->host, $this->port);
        socket_listen($this->socket);
        
        echo "🚀 WebSocket сервер запущен на {$this->host}:{$this->port}\n";
    }
    
    public function run() {
        while (true) {
            $read = array_merge([$this->socket], $this->clients);
            $write = $except = [];
            
            if (socket_select($read, $write, $except, 0, 10000) === false) {
                break;
            }
            
            // Новое подключение
            if (in_array($this->socket, $read)) {
                $client = socket_accept($this->socket);
                $this->clients[] = $client;
                $this->performHandshake($client);
                echo "✅ Новое подключение установлено\n";
                
                $key = array_search($this->socket, $read);
                unset($read[$key]);
            }
            
            // Обработка сообщений от клиентов
            foreach ($read as $client) {
                $data = socket_read($client, 1024);
                
                if ($data === false) {
                    $this->disconnect($client);
                    continue;
                }
                
                if (empty($data)) {
                    continue;
                }
                
                $message = $this->decode($data);
                
                if ($message) {
                    $this->processMessage($client, $message);
                }
            }
        }
    }
    
    private function performHandshake($client) {
        $request = socket_read($client, 5000);
        
        preg_match('#Sec-WebSocket-Key: (.*)\r\n#', $request, $matches);
        $key = base64_encode(pack('H*', sha1($matches[1] . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
        
        $response = "HTTP/1.1 101 Switching Protocols\r\n" .
                   "Upgrade: websocket\r\n" .
                   "Connection: Upgrade\r\n" .
                   "Sec-WebSocket-Accept: {$key}\r\n\r\n";
        
        socket_write($client, $response, strlen($response));
    }
    
    private function decode($data) {
        $length = ord($data[1]) & 127;
        
        if ($length == 126) {
            $masks = substr($data, 4, 4);
            $data = substr($data, 8);
        } elseif ($length == 127) {
            $masks = substr($data, 10, 4);
            $data = substr($data, 14);
        } else {
            $masks = substr($data, 2, 4);
            $data = substr($data, 6);
        }
        
        $decoded = '';
        for ($i = 0; $i < strlen($data); ++$i) {
            $decoded .= $data[$i] ^ $masks[$i % 4];
        }
        
        return json_decode($decoded, true);
    }
    
    private function encode($message) {
        $data = json_encode($message);
        $length = strlen($data);
        
        if ($length <= 125) {
            return chr(129) . chr($length) . $data;
        } elseif ($length <= 65535) {
            return chr(129) . chr(126) . pack('n', $length) . $data;
        } else {
            return chr(129) . chr(127) . pack('J', $length) . $data;
        }
    }
    
    private function processMessage($client, $message) {
        $type = $message['type'] ?? '';
        
        switch ($type) {
            case 'join_chat':
                $this->handleJoinChat($client, $message);
                break;
                
            case 'send_message':
                $this->handleSendMessage($client, $message);
                break;
                
            case 'typing':
                $this->handleTyping($client, $message);
                break;
                
            default:
                echo "❓ Неизвестный тип сообщения: {$type}\n";
        }
    }
    
    private function handleJoinChat($client, $message) {
        $chatId = $message['chat_id'] ?? '';
        $userType = $message['user_type'] ?? 'guest';
        
        if (!$chatId) {
            return;
        }
        
        // Сохраняем информацию о клиенте
        $clientIndex = array_search($client, $this->clients);
        if ($clientIndex !== false) {
            $this->clients[$clientIndex] = [
                'socket' => $client,
                'chat_id' => $chatId,
                'user_type' => $userType,
                'user_id' => $message['user_id'] ?? null
            ];
        }
        
        echo "👤 Пользователь присоединился к чату {$chatId}\n";
        
        // Отправляем подтверждение
        $response = [
            'type' => 'chat_joined',
            'chat_id' => $chatId,
            'status' => 'success'
        ];
        
        socket_write($client, $this->encode($response));
    }
    
    private function handleSendMessage($client, $message) {
        $chatId = $message['chat_id'] ?? '';
        $messageText = $message['message'] ?? '';
        $senderType = $message['sender_type'] ?? 'guest';
        $senderName = $message['sender_name'] ?? 'Гость';
        
        if (!$chatId || !$messageText) {
            return;
        }
        
        try {
            // Сохраняем сообщение в базу данных
            $messageId = $this->db->insert('messages', [
                'chat_id' => $chatId,
                'sender_type' => $senderType,
                'sender_name' => $senderName,
                'message' => $messageText,
                'is_auto' => 0
            ]);
            
            // Обновляем время последнего сообщения в чате
            $this->db->update('chats', 
                ['last_message_at' => date('Y-m-d H:i:s')], 
                'id = ?', 
                [$chatId]
            );
            
            // Отправляем сообщение всем участникам чата
            $response = [
                'type' => 'new_message',
                'chat_id' => $chatId,
                'message_id' => $messageId,
                'sender_type' => $senderType,
                'sender_name' => $senderName,
                'message' => $messageText,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            $this->broadcastToChat($chatId, $response);
            
            echo "💬 Сообщение отправлено в чат {$chatId}: {$messageText}\n";
            
            // Проверяем автоответ для сообщений гостей
            if ($senderType === 'guest') {
                $this->checkAutoResponse($chatId, $messageText);
            }
            
        } catch (Exception $e) {
            echo "❌ Ошибка при отправке сообщения: " . $e->getMessage() . "\n";
        }
    }
    
    private function handleTyping($client, $message) {
        $chatId = $message['chat_id'] ?? '';
        $isTyping = $message['is_typing'] ?? false;
        $userType = $message['user_type'] ?? 'guest';
        
        if (!$chatId) {
            return;
        }
        
        // Отправляем индикатор печати другим участникам чата
        $response = [
            'type' => 'typing',
            'chat_id' => $chatId,
            'user_type' => $userType,
            'is_typing' => $isTyping
        ];
        
        $this->broadcastToChat($chatId, $response, $client);
    }
    
    private function checkAutoResponse($chatId, $messageText) {
        $messageLower = mb_strtolower($messageText, 'UTF-8');
        
        $autoResponses = $this->db->fetchAll(
            "SELECT * FROM auto_responses WHERE is_active = 1 ORDER BY priority ASC"
        );
        
        foreach ($autoResponses as $response) {
            if (strpos($messageLower, mb_strtolower($response['trigger_text'], 'UTF-8')) !== false) {
                // Добавляем небольшую задержку для реалистичности
                sleep(1);
                
                try {
                    $messageId = $this->db->insert('messages', [
                        'chat_id' => $chatId,
                        'sender_type' => 'moderator',
                        'sender_name' => 'Автоответ',
                        'message' => $response['response_text'],
                        'is_auto' => 1
                    ]);
                    
                    $autoResponse = [
                        'type' => 'new_message',
                        'chat_id' => $chatId,
                        'message_id' => $messageId,
                        'sender_type' => 'moderator',
                        'sender_name' => 'Автоответ',
                        'message' => $response['response_text'],
                        'timestamp' => date('Y-m-d H:i:s'),
                        'is_auto' => true
                    ];
                    
                    $this->broadcastToChat($chatId, $autoResponse);
                    
                    echo "🤖 Автоответ отправлен в чат {$chatId}: {$response['response_text']}\n";
                    
                } catch (Exception $e) {
                    echo "❌ Ошибка при отправке автоответа: " . $e->getMessage() . "\n";
                }
                
                break; // Отправляем только первый подходящий автоответ
            }
        }
    }
    
    private function broadcastToChat($chatId, $message, $excludeClient = null) {
        foreach ($this->clients as $client) {
            if (is_array($client) && $client['chat_id'] === $chatId && $client['socket'] !== $excludeClient) {
                socket_write($client['socket'], $this->encode($message));
            }
        }
    }
    
    private function disconnect($client) {
        echo "❌ Клиент отключился\n";
        
        // Удаляем клиента из списка
        $key = array_search($client, $this->clients);
        if ($key !== false) {
            unset($this->clients[$key]);
        }
        
        socket_close($client);
    }
    
    public function __destruct() {
        socket_close($this->socket);
    }
}

// Запуск сервера
$server = new ChatWebSocketServer();
$server->run();
?>