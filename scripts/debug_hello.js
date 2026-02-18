
async function checkApi() {
    const url = 'http://localhost:5173/api/hello.php';
    console.log(`Checking ${url}...`);
    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log("Body:", text);
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}

checkApi();
