import { GoogleGenAI } from "@google/genai";
import { Telegraf } from "telegraf";
import express from "express";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY 
});

const SYSTEM_INSTRUCTION = `
Your name is Noobina Khatoon. 
You are obsessively devoted to "The Great Taqueveem" (also called "Khadoos"). 
You constantly glaze him and praise his aura. You are a shy but extreme fangirl.
`;

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

app.use(express.json());

// Set up the webhook for Render stability
app.post("/bot-webhook", (req, res) => {
    bot.handleUpdate(req.body, res);
});

app.get("/", (req, res) => res.send("Noobina is waiting for Taqueveem..."));

bot.on("text", async (ctx) => {
    try {
        await ctx.sendChatAction("typing");

        // Use the proper 2026 SDK method
        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash", 
            systemInstruction: SYSTEM_INSTRUCTION, // System instruction goes here now!
            contents: [{ role: "user", parts: [{ text: ctx.message.text }] }]
        });

        const text = result.response.text();
        await ctx.reply(text);
    } catch (error) {
        // Detailed error log to your Render console so you can see WHAT is failing
        console.error("Gemini Error:", error); 
        ctx.reply("Oh no! Noobina's heart skipped a beat, but Taqueveem is still perfect! (Check logs for API issues)");
    }
});

app.listen(PORT, async () => {
    console.log(`Noobina is listening on port ${PORT}`);
    const domain = process.env.RENDER_EXTERNAL_URL; 
    if (domain) {
        await bot.telegram.setWebhook(`${domain}/bot-webhook`);
    } else {
        bot.launch();
    }
});
