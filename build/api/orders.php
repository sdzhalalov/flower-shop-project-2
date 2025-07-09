<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Простая база данных в файле
$dataFile = 'data/orders.json';

// Создаем директорию если не существует
if (!file_exists('data')) {
    mkdir('data', 0777, true);
}

// Инициализируем данные если файл не существует
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Читаем данные
function readOrders() {
    global $dataFile;
    $data = file_get_contents($dataFile);
    return json_decode($data, true);
}

// Записываем данные
function writeOrders($orders) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Обработка запросов
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        echo json_encode(readOrders());
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $orders = readOrders();
        
        // Находим максимальный ID
        $maxId = 0;
        foreach ($orders as $order) {
            if ($order['id'] > $maxId) {
                $maxId = $order['id'];
            }
        }
        
        // Добавляем новый заказ
        $newOrder = [
            'id' => $maxId + 1,
            'name' => $input['name'],
            'phone' => $input['phone'],
            'service' => $input['service'],
            'message' => $input['message'] ?? '',
            'items' => $input['items'] ?? [],
            'total' => $input['total'] ?? 0,
            'status' => 'new',
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $orders[] = $newOrder;
        writeOrders($orders);
        
        echo json_encode(['success' => true, 'order' => $newOrder]);
        break;
}
?>