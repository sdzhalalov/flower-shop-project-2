#!/bin/bash

# Скрипт для запуска WebSocket сервера чата

echo "🚀 Запуск WebSocket сервера чата..."

# Проверяем, запущен ли уже сервер
if pgrep -f "chat_server.php" > /dev/null
then
    echo "⚠️  Сервер уже запущен!"
    echo "Для перезапуска выполните: ./stop_server.sh && ./start_server.sh"
    exit 1
fi

# Запускаем сервер в фоне
php chat_server.php &

# Получаем PID процесса
PID=$!

# Сохраняем PID в файл
echo $PID > server.pid

echo "✅ WebSocket сервер запущен с PID: $PID"
echo "🔗 Адрес сервера: ws://127.0.0.1:8080"
echo "📝 Логи можно посмотреть командой: tail -f server.log"
echo "🛑 Для остановки выполните: ./stop_server.sh"

# Отправляем логи в файл
nohup php chat_server.php > server.log 2>&1 &