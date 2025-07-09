<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

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
        case 'POST':
            $action = $input['action'] ?? '';
            
            if ($action === 'login') {
                $username = $input['username'] ?? '';
                $password = $input['password'] ?? '';
                
                if (!$username || !$password) {
                    echo json_encode(['success' => false, 'message' => 'Логин и пароль обязательны']);
                    break;
                }
                
                $user = $db->fetch(
                    "SELECT * FROM users WHERE username = ? AND role IN ('admin', 'moderator')",
                    [$username]
                );
                
                if ($user && password_verify($password, $user['password'])) {
                    $_SESSION['user'] = [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'name' => $user['name'],
                        'role' => $user['role'],
                        'email' => $user['email'],
                        'phone' => $user['phone']
                    ];
                    
                    // Обновляем время последнего входа
                    $db->update('users', 
                        ['updated_at' => date('Y-m-d H:i:s')], 
                        'id = ?', 
                        [$user['id']]
                    );
                    
                    logActivity('login', 'users', $user['id'], null, ['username' => $username]);
                    
                    echo json_encode([
                        'success' => true,
                        'user' => $_SESSION['user']
                    ]);
                } else {
                    logActivity('login_failed', null, null, null, ['username' => $username]);
                    echo json_encode(['success' => false, 'message' => 'Неверный логин или пароль']);
                }
                
            } elseif ($action === 'logout') {
                $userId = $_SESSION['user']['id'] ?? null;
                
                if ($userId) {
                    logActivity('logout', 'users', $userId, null, null);
                }
                
                session_destroy();
                echo json_encode(['success' => true]);
                
            } elseif ($action === 'register') {
                $username = $input['username'] ?? '';
                $password = $input['password'] ?? '';
                $name = $input['name'] ?? '';
                $email = $input['email'] ?? '';
                $phone = $input['phone'] ?? '';
                $role = $input['role'] ?? 'user';
                
                if (!$username || !$password || !$name) {
                    echo json_encode(['success' => false, 'message' => 'Логин, пароль и имя обязательны']);
                    break;
                }
                
                // Проверяем существование пользователя
                $existingUser = $db->fetch(
                    "SELECT id FROM users WHERE username = ?",
                    [$username]
                );
                
                if ($existingUser) {
                    echo json_encode(['success' => false, 'message' => 'Пользователь с таким логином уже существует']);
                    break;
                }
                
                // Создаем нового пользователя
                $userId = $db->insert('users', [
                    'username' => $username,
                    'password' => password_hash($password, PASSWORD_DEFAULT),
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'role' => $role
                ]);
                
                $newUser = $db->fetch("SELECT id, username, name, role, email, phone FROM users WHERE id = ?", [$userId]);
                
                logActivity('register', 'users', $userId, null, $newUser);
                
                echo json_encode([
                    'success' => true,
                    'user' => $newUser
                ]);
                
            } elseif ($action === 'change_password') {
                $currentPassword = $input['current_password'] ?? '';
                $newPassword = $input['new_password'] ?? '';
                $userId = $_SESSION['user']['id'] ?? null;
                
                if (!$userId || !$currentPassword || !$newPassword) {
                    echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
                    break;
                }
                
                $user = $db->fetch("SELECT password FROM users WHERE id = ?", [$userId]);
                
                if (!$user || !password_verify($currentPassword, $user['password'])) {
                    echo json_encode(['success' => false, 'message' => 'Неверный текущий пароль']);
                    break;
                }
                
                $db->update('users', 
                    ['password' => password_hash($newPassword, PASSWORD_DEFAULT)], 
                    'id = ?', 
                    [$userId]
                );
                
                logActivity('change_password', 'users', $userId, null, null);
                
                echo json_encode(['success' => true]);
            }
            break;
            
        case 'GET':
            if (isset($_SESSION['user'])) {
                echo json_encode(['success' => true, 'user' => $_SESSION['user']]);
            } else {
                echo json_encode(['success' => false]);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Неподдерживаемый метод']);
    }
    
} catch (Exception $e) {
    error_log("Auth API Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Внутренняя ошибка сервера']);
}
?>