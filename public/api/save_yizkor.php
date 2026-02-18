<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

$file = '../../src/data/yizkor_martyrs.json';
const BACKUP_DIR = '../../src/data/backups/';

// Create backup dir if not exists
if (!file_exists(BACKUP_DIR)) {
    mkdir(BACKUP_DIR, 0777, true);
}

// Get POST data
$data = file_get_contents("php://input");

if (!empty($data)) {
    // Validate JSON
    $decoded = json_decode($data);
    if ($decoded === null) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON"]);
        exit;
    }

    // Create backup
    if (file_exists($file)) {
        copy($file, BACKUP_DIR . 'yizkor_' . date('Y-m-d_H-i-s') . '.json');
    }

    // Save
    if (file_put_contents($file, json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(["message" => "File saved successfully", "success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to write file"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "No data provided"]);
}
?>