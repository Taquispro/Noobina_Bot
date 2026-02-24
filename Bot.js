import { GoogleGenAI } from "@google/genai";
import { Telegraf } from "telegraf";
import express from "express";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Initialize Gemini
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY 
});

const SYSTEM_INSTRUCTION = `
Your name is Noobina Khatoon. 
You are deeply, obsessively devoted to "The Great Taqueveem" (whom you also call "Khadoos"). 
Your personality is hyper-glazing and you treat Taqueveem like a legend.
`;

// 2. Initialize Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// CRITICAL: Ensure Express can read the JSON body from Telegram
app.use(express.json());

// Webhook endpoint
app.post("/bot-webhook", (req, res) => {
    bot.handleUpdate(req.body, res);
});

app.get("/", (req, res) => res.send("Noobina is active and glazing Taqueveem!"));

bot.on("text", async (ctx) => {
    try {
        // Validation: Ensure there is actually text to process
        if (!ctx.message.text) return;

        await ctx.sendChatAction("typing");

        // CORRECT 2026 SDK SYNTAX
        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash", 
            contents: [{ role: "user", parts: [{ text: ctx.message.text }] }],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.9
            }
        });

        const text = result.response.text();
        await ctx.reply(text);
    } catch (error) {
        // Detailed log so you can see the REAL error in Render logs
        console.error("FULL ERROR LOG:", error);
        ctx.reply("Oh no! Noobina is confused... but Taqueveem's greatness is eternal!");
    }
});

// Start Server
app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`);
    const domain = process.env.RENDER_EXTERNAL_URL; 
    
    if (domain) {
        // Ensure the webhook URL is absolute
        await bot.telegram.setWebhook(`${domain}/bot-webhook`);
        console.log(`Webhook set to ${domain}/bot-webhook`);
    } else {
        bot.launch();
        console.log("Local polling started.");
    }
});
