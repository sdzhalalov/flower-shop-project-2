<?php
session_start();
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDatabase();

// Авторизация
if ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        jsonResponse(['success' => false, 'message' => 'Заполните все поля'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        // Обновляем время последнего входа
        $updateStmt = $pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?");
        $updateStmt->execute([$user['id']]);
        
        // Сохраняем данные в сессии
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        
        jsonResponse([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'name' => $user['name'],
                'role' => $user['role']
            ]
        ]);
    } else {
        jsonResponse(['success' => false, 'message' => 'Неверный логин или пароль'], 401);
    }
}

// Выход
if ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'logout') {
    session_destroy();
    jsonResponse(['success' => true, 'message' => 'Вы вышли из системы']);
}

// Проверка авторизации
if ($method === 'GET') {
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) {
        jsonResponse([
            'success' => true,
            'logged_in' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'name' => $_SESSION['name'],
                'role' => $_SESSION['role']
            ]
        ]);
    } else {
        jsonResponse(['success' => true, 'logged_in' => false]);
    }
}

// Изменение пароля
if ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'change_password') {
    if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
        jsonResponse(['success' => false, 'message' => 'Необходима авторизация'], 401);
    }
    
    $currentPassword = $_POST['current_password'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    
    if (empty($currentPassword) || empty($newPassword)) {
        jsonResponse(['success' => false, 'message' => 'Заполните все поля'], 400);
    }
    
    // Проверяем текущий пароль
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!password_verify($currentPassword, $user['password'])) {
        jsonResponse(['success' => false, 'message' => 'Неверный текущий пароль'], 400);
    }
    
    // Обновляем пароль
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $result = $updateStmt->execute([$hashedPassword, $_SESSION['user_id']]);
    
    if ($result) {
        jsonResponse(['success' => true, 'message' => 'Пароль успешно изменен']);
    } else {
        jsonResponse(['success' => false, 'message' => 'Ошибка при изменении пароля'], 500);
    }
}
?>