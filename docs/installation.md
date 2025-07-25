# Установка Bloom & Blossom

## 🚀 Быстрая установка на OpenServer

### 1. Подготовка файлов
1. Скопируйте все файлы проекта в папку domains вашего OpenServer
2. Например: `C:\OpenServer\domains\bloom-blossom\`

### 2. Настройка базы данных
1. Запустите OpenServer
2. Откройте phpMyAdmin (обычно http://localhost/phpmyadmin)
3. Создайте новую базу данных `bloom_blossom`
4. Выберите кодировку `utf8mb4_unicode_ci`
5. Импортируйте файл `install.sql` в созданную базу данных

### 3. Проверка конфигурации
Убедитесь, что файл `config.php` содержит правильные настройки:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'bloom_blossom');
define('DB_USER', 'root');
define('DB_PASS', ''); // Обычно пустой в OpenServer
```

### 4. Создание папки для загрузок
1. Создайте папку `uploads/` в корне проекта
2. Установите права на запись (обычно 755)

### 5. Запуск сайта
1. Убедитесь, что OpenServer запущен
2. Откройте в браузере: `http://localhost/bloom-blossom/bloom-index.html`
3. Для админ-панели: `http://localhost/bloom-blossom/admin/login.html`

## 🔐 Тестовые аккаунты

После установки вы можете войти в админ-панель используя:

**Администратор:**
- Логин: `admin`
- Пароль: `password`

**Модератор:**
- Логин: `moderator`  
- Пароль: `password`

## ✅ Проверка работоспособности

### Фронтенд
1. Откройте главную страницу
2. Проверьте загрузку товаров и категорий
3. Добавьте товар в корзину
4. Попробуйте оформить заказ
5. Протестируйте чат

### Админ-панель
1. Войдите в админ-панель
2. Проверьте дашборд со статистикой
3. Попробуйте добавить новый товар
4. Создайте новую категорию
5. Ответьте на сообщение в чате

## 🐛 Возможные проблемы

### База данных не подключается
- Проверьте настройки в `config.php`
- Убедитесь, что MySQL запущен в OpenServer
- Проверьте название базы данных

### Не загружаются товары
- Откройте консоль разработчика в браузере
- Проверьте ошибки в вкладке Network
- Убедитесь, что API возвращает корректный JSON

### Не работает авторизация в админке
- Убедитесь, что сессии включены в PHP
- Проверьте права на папку сессий
- Очистите cookies браузера

### Не отображаются изображения
- Создайте папку `uploads/`
- Установите права на запись
- Проверьте настройки PHP (upload_max_filesize)

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи ошибок PHP в OpenServer
2. Откройте консоль разработчика в браузере
3. Убедитесь, что все файлы скопированы правильно