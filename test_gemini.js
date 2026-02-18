
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = 'AIzaSyDYICYmH9w3pBLJhobRhjzk9qNqoG7MkHw';
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Fetching available models...");
        // Hack: The SDK doesn't expose listModels directly in all versions, 
        // so we use the REST API via fetch if SDK fails, or just try a standard fetch here.

        // Using standard fetch for max compatibility
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("\n--- AVAILABLE MODELS ---");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name.replace('models/', '')}`);
                }
            });
            console.log("------------------------\n");
        } else {
            console.log("No models found in response:", data);
        }
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listModels();
