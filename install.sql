-- Создание базы данных Bloom & Blossom
CREATE DATABASE IF NOT EXISTS bloom_blossom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bloom_blossom;

-- Таблица категорий
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Таблица заказов
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    comment TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица товаров в заказе
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Таблица пользователей (администраторы и модераторы)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'moderator') DEFAULT 'moderator',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица чатов
CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    status ENUM('open', 'closed') DEFAULT 'open',
    assigned_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Таблица сообщений чата
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_type ENUM('customer', 'admin') NOT NULL,
    sender_name VARCHAR(100),
    user_id INT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Таблица настроек сайта
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('text', 'textarea', 'boolean', 'number', 'email', 'url') DEFAULT 'text',
    description VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE
);

-- Вставка начальных данных

-- Пользователи
INSERT INTO users (username, password, name, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Администратор', 'admin'),
('moderator', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Модератор', 'moderator');

-- Категории
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Букеты', 'bouquets', 'Красивые букеты на любой повод', 1),
('Композиции', 'compositions', 'Цветочные композиции в коробках и корзинах', 2),
('Подарки', 'gifts', 'Цветочные подарки и сувениры', 3);

-- Товары
INSERT INTO products (category_id, name, slug, description, price, stock_quantity, sort_order) VALUES
(1, 'Букет из красных роз', 'red-roses-bouquet', 'Классический букет из 25 красных роз с зеленью', 3500.00, 10, 1),
(1, 'Весенний микс', 'spring-mix', 'Нежный букет из тюльпанов, нарциссов и зелени', 2200.00, 15, 2),
(1, 'Букет невесты', 'bridal-bouquet', 'Роскошный белый букет из роз и пионов', 4500.00, 5, 3),
(2, 'Корзина садовых цветов', 'garden-basket', 'Большая корзина с сезонными садовыми цветами', 5500.00, 8, 1),
(2, 'Композиция в шляпной коробке', 'hat-box-composition', 'Стильная композиция из роз в элегантной коробке', 3200.00, 12, 2),
(3, 'Мини-букет с мишкой', 'mini-bouquet-bear', 'Маленький букет с плюшевым мишкой', 1800.00, 20, 1),
(3, 'Цветы в горшке', 'potted-flowers', 'Живые цветы в декоративном горшке', 2500.00, 10, 2);

-- Настройки сайта
INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'Bloom & Blossom', 'text', 'Название сайта', TRUE),
('site_description', 'Свежие цветы и красивые букеты на любой повод', 'textarea', 'Описание сайта', TRUE),
('contact_phone', '+7 (495) 555-77-88', 'text', 'Контактный телефон', TRUE),
('contact_email', 'info@bloomblossom.ru', 'email', 'Контактный email', TRUE),
('contact_address', 'г. Москва, ул. Цветочная, д. 25', 'text', 'Адрес магазина', TRUE),
('work_hours', 'Ежедневно: 8:00-22:00', 'text', 'Время работы', TRUE),
('delivery_info', 'Доставка по Москве 2-3 часа (500 руб), срочная доставка за 1 час (1000 руб)', 'textarea', 'Информация о доставке', TRUE),
('chat_enabled', '1', 'boolean', 'Включить чат', FALSE),
('auto_responses_enabled', '1', 'boolean', 'Включить автоответы', FALSE);