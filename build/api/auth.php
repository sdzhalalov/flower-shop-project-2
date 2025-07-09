<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Пользователи
$users = [
    'admin' => [
        'password' => 'admin',
        'role' => 'admin',
        'name' => 'Администратор'
    ],
    'moderator1' => [
        'password' => 'moderator',
        'role' => 'moderator',
        'name' => 'Модератор'
    ]
];

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';
        
        if ($action === 'login') {
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            
            if (isset($users[$username]) && $users[$username]['password'] === $password) {
                $_SESSION['user'] = [
                    'username' => $username,
                    'role' => $users[$username]['role'],
                    'name' => $users[$username]['name']
                ];
                
                echo json_encode([
                    'success' => true,
                    'user' => $_SESSION['user']
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Неверный логин или пароль']);
            }
        } elseif ($action === 'logout') {
            session_destroy();
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
}
?>