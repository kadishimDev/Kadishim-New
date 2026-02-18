<?php
header("Content-Type: application/json; charset=UTF-8");
require_once 'config.php';

// Fallback function to load from JSON
function loadPagesFromJson()
{
    $jsonFile = '../../src/data/pages_db.json';
    if (file_exists($jsonFile)) {
        $jsonData = file_get_contents($jsonFile);
        $data = json_decode($jsonData, true);
        return $data ?: [];
    }
    return [];
}

$pages = [];

if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM kaddish_pages");
        $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("DB Error in get_pages: " . $e->getMessage());
    }
}

// Fallback logic
if (empty($pages)) {
    $jsonPages = loadPagesFromJson();
    if (!empty($jsonPages)) {
        $pages = $jsonPages;
    }
}

echo json_encode($pages);
?>