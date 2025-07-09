<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Простая база данных в файле
$dataFile = 'data/services.json';

// Создаем директорию если не существует
if (!file_exists('data')) {
    mkdir('data', 0777, true);
}

// Инициализируем данные если файл не существует
if (!file_exists($dataFile)) {
    $initialData = [
        [
            'id' => 1,
            'name' => 'Диагностика автомобиля',
            'price' => 2500,
            'description' => 'Полная компьютерная диагностика всех систем автомобиля'
        ],
        [
            'id' => 2,
            'name' => 'Замена масла',
            'price' => 1500,
            'description' => 'Замена моторного масла и масляного фильтра'
        ],
        [
            'id' => 3,
            'name' => 'Ремонт тормозной системы',
            'price' => 5000,
            'description' => 'Диагностика и ремонт тормозной системы'
        ],
        [
            'id' => 4,
            'name' => 'Шиномонтаж',
            'price' => 800,
            'description' => 'Замена и балансировка колес'
        ],
        [
            'id' => 5,
            'name' => 'Техническое обслуживание',
            'price' => 3500,
            'description' => 'Плановое ТО согласно регламенту производителя'
        ],
        [
            'id' => 6,
            'name' => 'Ремонт двигателя',
            'price' => 15000,
            'description' => 'Диагностика и ремонт двигателя'
        ]
    ];
    file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Читаем данные
function readServices() {
    global $dataFile;
    $data = file_get_contents($dataFile);
    return json_decode($data, true);
}

// Записываем данные
function writeServices($services) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($services, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Обработка запросов
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        echo json_encode(readServices());
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $services = readServices();
        
        // Находим максимальный ID
        $maxId = 0;
        foreach ($services as $service) {
            if ($service['id'] > $maxId) {
                $maxId = $service['id'];
            }
        }
        
        // Добавляем новую услугу
        $newService = [
            'id' => $maxId + 1,
            'name' => $input['name'],
            'price' => intval($input['price']),
            'description' => $input['description']
        ];
        
        $services[] = $newService;
        writeServices($services);
        
        echo json_encode(['success' => true, 'service' => $newService]);
        break;
        
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $services = readServices();
        
        // Находим и обновляем услугу
        for ($i = 0; $i < count($services); $i++) {
            if ($services[$i]['id'] == $input['id']) {
                $services[$i] = $input;
                break;
            }
        }
        
        writeServices($services);
        echo json_encode(['success' => true]);
        break;
        
    case 'DELETE':
        $id = intval($_GET['id']);
        $services = readServices();
        
        // Удаляем услугу
        $services = array_filter($services, function($service) use ($id) {
            return $service['id'] != $id;
        });
        
        writeServices(array_values($services));
        echo json_encode(['success' => true]);
        break;
}
?>