<?php
header("Access-Control-Allow-Origin: *");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json; charset=UTF-8");

require_once 'config.php';

// Fallback function to load from JSON
function loadFromJson()
{
    $jsonFile = '../../src/data/memorials_v2.json';
    if (file_exists($jsonFile)) {
        $jsonData = file_get_contents($jsonFile);
        $data = json_decode($jsonData, true);
        if ($data) {
            // Add a flag to indicate this is from JSON (optional, for debugging)
            // foreach ($data as &$item) { $item['_source'] = 'json_fallback'; }
            return $data;
        }
    }
    return [];
}

$results = [];

if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM kaddish_requests ORDER BY created_at DESC");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Log error but continue to fallback
        error_log("DB Error in get_all_memorials: " . $e->getMessage());
    }
}

// If DB failed or returned empty, try JSON
if (empty($results)) {
    $jsonResults = loadFromJson();
    if (!empty($jsonResults)) {
        $results = $jsonResults;
    }
}

echo json_encode($results);
?>