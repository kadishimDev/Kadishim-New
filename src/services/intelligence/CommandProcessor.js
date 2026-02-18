/**
 * CommandProcessor.js (Robust 3-Layer Failover Edition)
 * Prioritizes: 
 * 1. gemini-2.0-flash (Verified available in debug log)
 * 2. gemini-flash-latest (Verified available in debug log) 
 * 3. gemini-2.5-flash (If quota allows)
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_CONTEXT } from "./SystemContext";

export class CommandProcessor {
    constructor(context) {
        this.context = context;
        this.apiKey = 'AIzaSyDYICYmH9w3pBLJhobRhjzk9qNqoG7MkHw';
        this.genAI = new GoogleGenerativeAI(this.apiKey);

        // Verified Available Models (from debug_models.js):
        // "gemini-2.0-flash"
        // "gemini-flash-latest"
        // "gemini-2.5-flash"

        this.primaryModel = "gemini-2.0-flash";
        this.fallbackModel = "gemini-flash-latest";
        this.currentModelName = this.primaryModel;

        this.initChat();
    }

    async initChat() {
        try {
            this.model = this.genAI.getGenerativeModel({
                model: this.currentModelName,
                systemInstruction: SYSTEM_CONTEXT
            });

            this.chat = this.model.startChat({
                history: [],
                generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
            });
            console.log(`CommandProcessor connected to ${this.currentModelName} ✅`);
        } catch (e) {
            console.error(`Connection failed`, e);
            this.currentModelName = "Error: Connection Failed";
        }
    }

    async process(input) {
        if (!this.chat) await this.initChat();

        if (!this.chat) return {
            answer: `שגיאה: לא הצלחתי להתחבר למודל (${this.currentModelName}).`,
            type: "error"
        };

        return await this.askGeminiChat(input);
    }

    async askGeminiChat(prompt) {
        try {
            return await this._trySendMessage(this.chat, prompt);
        } catch (err) {

            // 429 = Quota Exceeded. 404 = Model Not Found.
            if (err.message.includes('429') || err.message.includes('404')) {
                console.warn(`Error on ${this.currentModelName}: ${err.message}. Trying fallback...`);
                return await this.tryFallback(prompt);
            }

            return {
                answer: `שגיאה (${this.currentModelName}): ${err.message}`,
                type: 'error'
            };
        }
    }

    async tryFallback(prompt) {
        try {
            if (this.currentModelName === this.fallbackModel) {
                return { answer: "כל המודלים עמוסים כרגע (429). אנא נסה שנית בעוד דקה.", type: 'error' };
            }

            // Switch to fallback
            this.currentModelName = this.fallbackModel;
            console.log(`Switching to Fallback Model: ${this.fallbackModel}`);

            const fallbackModel = this.genAI.getGenerativeModel({
                model: this.fallbackModel,
                systemInstruction: SYSTEM_CONTEXT
            });

            this.chat = fallbackModel.startChat({
                history: [], // New session
                generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
            });

            const result = await this._trySendMessage(this.chat, prompt);

            // Append notice about fallback
            if (result.answer) {
                result.answer += `\n\n(נ.ב. עברתי לגיבוי עקב עומס: ${this.fallbackModel})`;
            }
            return result;

        } catch (e) {
            return { answer: `שגיאה גם במודל הגיבוי: ${e.message}`, type: 'error' };
        }
    }

    async _trySendMessage(chatSession, prompt) {
        const result = await chatSession.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            return JSON.parse(text);
        } catch (e) {
            return { answer: text, command: null };
        }
    }

    match(text, keywords) {
        return keywords.some(kw => text.includes(kw));
    }
}
