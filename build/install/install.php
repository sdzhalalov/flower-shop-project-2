<?php
require_once '../config/database.php';

try {
    // Создаем базу данных если не существует
    $pdo = new PDO("mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // Подключаемся к базе данных
    $db = Database::getInstance()->getConnection();
    
    // Создаем таблицы
    $queries = [
        // Пользователи
        "CREATE TABLE IF NOT EXISTS `users` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `username` varchar(50) NOT NULL UNIQUE,
            `password` varchar(255) NOT NULL,
            `name` varchar(100) NOT NULL,
            `role` enum('admin','moderator','user') NOT NULL DEFAULT 'user',
            `email` varchar(100) DEFAULT NULL,
            `phone` varchar(20) DEFAULT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Услуги
        "CREATE TABLE IF NOT EXISTS `services` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `description` text,
            `price` decimal(10,2) NOT NULL,
            `duration` int(11) DEFAULT NULL COMMENT 'Время выполнения в минутах',
            `image` varchar(255) DEFAULT NULL,
            `category` varchar(100) DEFAULT NULL,
            `is_active` tinyint(1) NOT NULL DEFAULT 1,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Чаты
        "CREATE TABLE IF NOT EXISTS `chats` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `guest_id` varchar(100) NOT NULL,
            `guest_name` varchar(100) NOT NULL,
            `guest_ip` varchar(45) DEFAULT NULL,
            `guest_user_agent` text,
            `status` enum('active','closed','pending') NOT NULL DEFAULT 'active',
            `assigned_moderator` int(11) DEFAULT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            `last_message_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            KEY `guest_id` (`guest_id`),
            KEY `assigned_moderator` (`assigned_moderator`),
            FOREIGN KEY (`assigned_moderator`) REFERENCES `users`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Сообщения
        "CREATE TABLE IF NOT EXISTS `messages` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `chat_id` int(11) NOT NULL,
            `sender_type` enum('guest','moderator','system') NOT NULL,
            `sender_id` int(11) DEFAULT NULL,
            `sender_name` varchar(100) NOT NULL,
            `message` text NOT NULL,
            `message_type` enum('text','image','file') NOT NULL DEFAULT 'text',
            `is_auto` tinyint(1) NOT NULL DEFAULT 0,
            `is_read` tinyint(1) NOT NULL DEFAULT 0,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `chat_id` (`chat_id`),
            KEY `sender_id` (`sender_id`),
            KEY `created_at` (`created_at`),
            FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Заказы
        "CREATE TABLE IF NOT EXISTS `orders` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `customer_name` varchar(100) NOT NULL,
            `customer_phone` varchar(20) NOT NULL,
            `customer_email` varchar(100) DEFAULT NULL,
            `service_type` varchar(100) DEFAULT NULL,
            `message` text,
            `total_amount` decimal(10,2) DEFAULT 0.00,
            `status` enum('new','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'new',
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Элементы заказа
        "CREATE TABLE IF NOT EXISTS `order_items` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `order_id` int(11) NOT NULL,
            `service_id` int(11) NOT NULL,
            `quantity` int(11) NOT NULL DEFAULT 1,
            `price` decimal(10,2) NOT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `order_id` (`order_id`),
            KEY `service_id` (`service_id`),
            FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Автоответы
        "CREATE TABLE IF NOT EXISTS `auto_responses` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `trigger_text` varchar(255) NOT NULL,
            `response_text` text NOT NULL,
            `is_active` tinyint(1) NOT NULL DEFAULT 1,
            `priority` int(11) NOT NULL DEFAULT 0,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Настройки сайта
        "CREATE TABLE IF NOT EXISTS `settings` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `setting_key` varchar(100) NOT NULL UNIQUE,
            `setting_value` text,
            `setting_type` enum('text','number','boolean','json') NOT NULL DEFAULT 'text',
            `description` text,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        
        // Лог активности
        "CREATE TABLE IF NOT EXISTS `activity_log` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `user_id` int(11) DEFAULT NULL,
            `action` varchar(100) NOT NULL,
            `table_name` varchar(50) DEFAULT NULL,
            `record_id` int(11) DEFAULT NULL,
            `old_data` json DEFAULT NULL,
            `new_data` json DEFAULT NULL,
            `ip_address` varchar(45) DEFAULT NULL,
            `user_agent` text,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `user_id` (`user_id`),
            KEY `action` (`action`),
            KEY `created_at` (`created_at`),
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    ];
    
    foreach ($queries as $query) {
        $db->exec($query);
    }
    
    // Добавляем начальных пользователей
    $users = [
        ['username' => 'admin', 'password' => password_hash('admin', PASSWORD_DEFAULT), 'name' => 'Администратор', 'role' => 'admin'],
        ['username' => 'moderator1', 'password' => password_hash('moderator', PASSWORD_DEFAULT), 'name' => 'Модератор 1', 'role' => 'moderator'],
        ['username' => 'moderator2', 'password' => password_hash('moderator', PASSWORD_DEFAULT), 'name' => 'Модератор 2', 'role' => 'moderator']
    ];
    
    $userCheck = $db->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $userInsert = $db->prepare("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)");
    
    foreach ($users as $user) {
        $userCheck->execute([$user['username']]);
        if ($userCheck->fetchColumn() == 0) {
            $userInsert->execute([$user['username'], $user['password'], $user['name'], $user['role']]);
        }
    }
    
    // Добавляем начальные услуги
    $services = [
        ['name' => 'Диагностика автомобиля', 'price' => 2500.00, 'description' => 'Полная компьютерная диагностика всех систем автомобиля', 'duration' => 60, 'category' => 'diagnostic'],
        ['name' => 'Замена масла', 'price' => 1500.00, 'description' => 'Замена моторного масла и масляного фильтра', 'duration' => 30, 'category' => 'maintenance'],
        ['name' => 'Ремонт тормозной системы', 'price' => 5000.00, 'description' => 'Диагностика и ремонт тормозной системы', 'duration' => 120, 'category' => 'repair'],
        ['name' => 'Шиномонтаж', 'price' => 800.00, 'description' => 'Замена и балансировка колес', 'duration' => 45, 'category' => 'wheels'],
        ['name' => 'Техническое обслуживание', 'price' => 3500.00, 'description' => 'Плановое ТО согласно регламенту производителя', 'duration' => 180, 'category' => 'maintenance'],
        ['name' => 'Ремонт двигателя', 'price' => 15000.00, 'description' => 'Диагностика и ремонт двигателя', 'duration' => 480, 'category' => 'repair']
    ];
    
    $serviceCheck = $db->prepare("SELECT COUNT(*) FROM services WHERE name = ?");
    $serviceInsert = $db->prepare("INSERT INTO services (name, price, description, duration, category) VALUES (?, ?, ?, ?, ?)");
    
    foreach ($services as $service) {
        $serviceCheck->execute([$service['name']]);
        if ($serviceCheck->fetchColumn() == 0) {
            $serviceInsert->execute([$service['name'], $service['price'], $service['description'], $service['duration'], $service['category']]);
        }
    }
    
    // Добавляем автоответы
    $autoResponses = [
        ['trigger_text' => 'привет', 'response_text' => 'Здравствуйте! Добро пожаловать в наш автосервис. Как мы можем помочь?', 'priority' => 1],
        ['trigger_text' => 'цена', 'response_text' => 'Цены на наши услуги можно посмотреть в разделе "Услуги". Для точной стоимости рекомендуем записаться на диагностику.', 'priority' => 2],
        ['trigger_text' => 'время', 'response_text' => 'Мы работаем: Пн-Сб: 9:00-20:00, Вс: 10:00-18:00. Запись по телефону +7 (495) 123-45-67', 'priority' => 3],
        ['trigger_text' => 'адрес', 'response_text' => 'Наш адрес: г. Москва, ул. Автосервисная, д. 15. Удобная парковка для клиентов.', 'priority' => 4],
        ['trigger_text' => 'запись', 'response_text' => 'Для записи на сервис звоните +7 (495) 123-45-67 или оставьте заявку на сайте в разделе "Контакты".', 'priority' => 5]
    ];
    
    $responseCheck = $db->prepare("SELECT COUNT(*) FROM auto_responses WHERE trigger_text = ?");
    $responseInsert = $db->prepare("INSERT INTO auto_responses (trigger_text, response_text, priority) VALUES (?, ?, ?)");
    
    foreach ($autoResponses as $response) {
        $responseCheck->execute([$response['trigger_text']]);
        if ($responseCheck->fetchColumn() == 0) {
            $responseInsert->execute([$response['trigger_text'], $response['response_text'], $response['priority']]);
        }
    }
    
    // Добавляем начальные настройки
    $settings = [
        ['setting_key' => 'site_name', 'setting_value' => 'Автосервис', 'setting_type' => 'text', 'description' => 'Название сайта'],
        ['setting_key' => 'site_description', 'setting_value' => 'Профессиональный автосервис с опытными мастерами', 'setting_type' => 'text', 'description' => 'Описание сайта'],
        ['setting_key' => 'contact_phone', 'setting_value' => '+7 (495) 123-45-67', 'setting_type' => 'text', 'description' => 'Контактный телефон'],
        ['setting_key' => 'contact_email', 'setting_value' => 'info@autoservice.ru', 'setting_type' => 'text', 'description' => 'Контактный email'],
        ['setting_key' => 'contact_address', 'setting_value' => 'г. Москва, ул. Автосервисная, д. 15', 'setting_type' => 'text', 'description' => 'Адрес'],
        ['setting_key' => 'work_hours', 'setting_value' => 'Пн-Сб: 9:00-20:00, Вс: 10:00-18:00', 'setting_type' => 'text', 'description' => 'Время работы'],
        ['setting_key' => 'chat_enabled', 'setting_value' => '1', 'setting_type' => 'boolean', 'description' => 'Включить чат'],
        ['setting_key' => 'auto_responses_enabled', 'setting_value' => '1', 'setting_type' => 'boolean', 'description' => 'Включить автоответы']
    ];
    
    $settingCheck = $db->prepare("SELECT COUNT(*) FROM settings WHERE setting_key = ?");
    $settingInsert = $db->prepare("INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)");
    
    foreach ($settings as $setting) {
        $settingCheck->execute([$setting['setting_key']]);
        if ($settingCheck->fetchColumn() == 0) {
            $settingInsert->execute([$setting['setting_key'], $setting['setting_value'], $setting['setting_type'], $setting['description']]);
        }
    }
    
    echo "✅ База данных успешно создана и настроена!\n";
    echo "📊 Созданы таблицы:\n";
    echo "- users (пользователи)\n";
    echo "- services (услуги)\n";
    echo "- chats (чаты)\n";
    echo "- messages (сообщения)\n";
    echo "- orders (заказы)\n";
    echo "- order_items (элементы заказа)\n";
    echo "- auto_responses (автоответы)\n";
    echo "- settings (настройки)\n";
    echo "- activity_log (лог активности)\n";
    echo "\n🔑 Пользователи:\n";
    echo "- admin / admin (Администратор)\n";
    echo "- moderator1 / moderator (Модератор 1)\n";
    echo "- moderator2 / moderator (Модератор 2)\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка при создании базы данных: " . $e->getMessage() . "\n";
}
?>