<?php
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT * FROM kaddish_requests LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($row);
    echo "</pre>";

    // Also show columns
    $colStmt = $pdo->query("SHOW COLUMNS FROM kaddish_requests");
    $cols = $colStmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<h3>Columns:</h3><pre>";
    print_r($cols);
    echo "</pre>";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>