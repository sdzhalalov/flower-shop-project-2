#!/bin/bash

# Скрипт для остановки WebSocket сервера чата

echo "🛑 Остановка WebSocket сервера чата..."

# Проверяем существование PID файла
if [ -f server.pid ]; then
    PID=$(cat server.pid)
    
    # Проверяем, запущен ли процесс
    if ps -p $PID > /dev/null 2>&1; then
        # Останавливаем процесс
        kill $PID
        echo "✅ Сервер остановлен (PID: $PID)"
        
        # Удаляем PID файл
        rm server.pid
    else
        echo "⚠️  Процесс с PID $PID не найден"
        rm server.pid
    fi
else
    echo "⚠️  PID файл не найден"
fi

# Принудительно останавливаем все процессы chat_server.php
pkill -f "chat_server.php"

echo "🔄 Все процессы WebSocket сервера остановлены"