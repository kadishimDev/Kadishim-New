
async function checkApi() {
    const url = 'http://localhost:5173/api/get_all_memorials.php';
    console.log(`Checking ${url}...`);
    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        try {
            const json = JSON.parse(text);
            console.log("Valid JSON received. First item keys:");
            if (Array.isArray(json) && json.length > 0) {
                console.log(Object.keys(json[0]));
                console.log("Sample Data:", JSON.stringify(json[0], null, 2));
            } else {
                console.log("JSON is empty array or object:", json);
            }
        } catch (e) {
            console.log("Invalid JSON. Raw body (first 500 chars):");
            console.log(text.substring(0, 500));
        }
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}

checkApi();
