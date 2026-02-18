
const apiKey = 'AIzaSyDYICYmH9w3pBLJhobRhjzk9qNqoG7MkHw';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Checking models at: ${url.replace(apiKey, 'HIDDEN_KEY')}...`);

async function checkModels() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        console.log("\n====== AVAILABLE GEMINI MODELS ======");
        if (data.models) {
            const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
            generateModels.forEach(m => {
                console.log(`* ${m.name.replace('models/', '')}`);
                console.log(`  - Version: ${m.version}`);
                console.log(`  - Methods: ${m.supportedGenerationMethods.join(', ')}`);
            });
            console.log(`\nTotal available for content generation: ${generateModels.length}`);
        } else {
            console.log("No models found in response.");
        }
        console.log("=====================================\n");
    } catch (error) {
        console.error("FAILED:", error.message);
    }
}

checkModels();
