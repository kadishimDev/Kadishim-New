<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
echo "API is working. ";
try {
    require_once 'config.php';
    echo "Config loaded. ";
    if (isset($pdo)) {
        echo "PDO exists. ";
    } else {
        echo "PDO missing. ";
    }
} catch (Throwable $t) {
    echo "Error: " . $t->getMessage();
}
?>