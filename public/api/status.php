<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html dir='rtl'><head><meta charset='utf-8'><title>בדיקת מערכת</title></head><body style='font-family: sans-serif; text-align: center; padding: 50px;'>";
echo "<h1>בדיקת מערכת ומסד נתונים</h1>";

if (!file_exists('config.php')) {
    die("<h2 style='color:red;'>שגיאה: קובץ config.php חסר!</h2></body></html>");
}

require_once 'config.php';

if (isset($pdo) && $pdo) {
    echo "<h2 style='color:green;'>✅ המסד מחובר בהצלחה!</h2>";

    // Check tables
    $tables = ['messages', 'kaddish_requests', 'subscribers'];
    $allExist = true;

    foreach ($tables as $table) {
        try {
            $result = $pdo->query("SELECT 1 FROM $table LIMIT 1");
            echo "<div style='color:green; margin: 10px;'>• טבלה <strong>$table</strong> קיימת (V)</div>";
        } catch (PDOException $e) {
            echo "<div style='color:red; margin: 10px;'>• טבלה <strong>$table</strong> חסרה (X)</div>";
            $allExist = false;
        }
    }

    if ($allExist) {
        echo "<h3 style='color:blue; margin-top:20px;'>המערכת מוכנה לשימוש מלא!</h3>";
    } else {
        echo "<h3 style='color:orange;'>חלק מהטבלאות חסרות - הן יווצרו אוטומטית בפעולה הבאה באתר.</h3>";
    }

} else {
    echo "<h2 style='color:red;'>❌ שגיאת חיבור למסד הנתונים</h2>";
    echo "<p>אנא ודא שקובץ config.php מכיל את השם משתמש והסיסמה הנכונים מ-uPress.</p>";
}

echo "</body></html>";
?>