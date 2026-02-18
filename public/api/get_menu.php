<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$filePath = __DIR__ . '/../data/menu_structure.json';

if (file_exists($filePath)) {
    echo file_get_contents($filePath);
} else {
    // If no custom menu exists, return an empty array or default structure
    // Ideally the frontend handles the default, but we can return null
    echo json_encode(null);
}
?>