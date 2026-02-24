import { GoogleGenAI } from "@google/genai";
import { Telegraf } from "telegraf";
import 'dotenv/config';

// 1. Initialize Gemini
// It will automatically look for GEMINI_API_KEY in your .env or environment variables
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY 
});
const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

// 2. Initialize Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Handle the /start command
bot.start((ctx) => ctx.reply("Hi! I'm powered by Gemini. Ask me anything!"));

// Handle all incoming text messages
bot.on("text", async (ctx) => {
    try {
        // Show "typing..." status in Telegram
        await ctx.sendChatAction("typing");

        // Generate response from Gemini
        const result = await model.generateContent(ctx.message.text);
        const text = result.response.text();

        // Reply to the user
        await ctx.reply(text);
    } catch (error) {
        console.error("Error:", error);
        ctx.reply("Sorry, I encountered an error processing that.");
    }
});

// Launch the bot
bot.launch().then(() => {
    console.log("Bot is running...");
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
