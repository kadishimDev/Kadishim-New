<?php
require_once 'config.php';

try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Columns to add
    $columns = [
        "memorial_children TEXT",
        "memorial_residence VARCHAR(255)",
        "deceased_residence_country VARCHAR(100) DEFAULT 'Israel'",
        "requester_city VARCHAR(100)",
        "requester_street VARCHAR(255)",
        "requester_building VARCHAR(50)",
        "requester_apartment VARCHAR(50)",
        "requester_zip VARCHAR(20)",
        "requester_country VARCHAR(100) DEFAULT 'Israel'"
    ];

    foreach ($columns as $colDef) {
        try {
            // Naive check: Try to add. If fails (likely exists), catch and continue.
            // Better: Check if column exists first, but that's DB-specific (MySQL vs SQLite).
            // This is a quick migration script.
            $sql = "ALTER TABLE kaddish_requests ADD COLUMN $colDef";
            $pdo->exec($sql);
            echo "Added column: $colDef <br>";
        } catch (PDOException $e) {
            // Error 1060: Duplicate column name
            if (strpos($e->getMessage(), 'Duplicate column') !== false || $e->getCode() == '42S21') {
                echo "Column already exists (skipped): " . explode(' ', $colDef)[0] . "<br>";
            } else {
                echo "Error adding column $colDef: " . $e->getMessage() . "<br>";
            }
        }
    }

    echo "Schema update completed.";

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>