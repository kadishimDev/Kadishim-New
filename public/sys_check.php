<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html dir='rtl'><head><meta charset='utf-8'><title>בדיקת מערכת</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem;text-align:center;background:#f0f2f5} .card{background:white;padding:2rem;border-radius:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.1)} h1{color:#2c3e50} .success{color:#27ae60;font-weight:bold} .error{color:#c0392b;font-weight:bold} .item{margin:1rem 0;padding:1rem;background:#f8f9fa;border-radius:0.5rem;display:flex;justify-content:space-between} </style></head><body>";

echo "<div class='card'>";
echo "<h1>בדיקת מערכת קדישים</h1>";

$configPath = 'api/config.php';
if (!file_exists($configPath)) {
    die("<h2 class='error'>שגיאה קריטית: קובץ api/config.php לא נמצא!</h2></div></body></html>");
}

require_once $configPath;

if (isset($pdo) && $pdo) {
    echo "<h2 class='success'>✅ החיבור למסד הנתונים תקין!</h2>";
    echo "<p>משתמש: $db_user | מסד: $db_name</p>";

    // Check tables
    $tables = ['messages', 'kaddish_requests', 'subscribers'];
    $allExist = true;

    echo "<div style='text-align:right'>";
    foreach ($tables as $table) {
        echo "<div class='item'><span>טבלה <strong>$table</strong></span>";
        try {
            $result = $pdo->query("SELECT 1 FROM $table LIMIT 1");
            echo "<span class='success'>✔ קיימת ותקינה</span>";
        } catch (PDOException $e) {
            echo "<span class='error'>✘ חסרה (תיווצר אוטומטית בשימוש הבא)</span>";
            $allExist = false;
        }
        echo "</div>";
    }
    echo "</div>";

    if ($allExist) {
        echo "<h3 style='color:#2980b9; margin-top:20px;'>המערכת מוכנה לשימוש מלא!</h3>";
        echo "<a href='./' style='display:inline-block;padding:1rem 2rem;background:#2980b9;color:white;text-decoration:none;border-radius:0.5rem;margin-top:1rem'>עבור לאתר</a>";
    } else {
        echo "<h3 style='color:#e67e22;'>חלק מהטבלאות חסרות. הן יווצרו אוטומטית בשימוש הראשון באתר.</h3>";
    }

} else {
    echo "<h2 class='error'>❌ שגיאת חיבור למסד הנתונים</h2>";
    echo "<p>אנא ודא שפרטי החיבור ב-config.php נכונים.</p>";
}

echo "</div></body></html>";
?>