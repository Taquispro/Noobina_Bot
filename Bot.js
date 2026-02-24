import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { Telegraf } from "telegraf";

const app = express();
const PORT = 3000;

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
Your name is Noobina Khatoon.
You are obsessively devoted to "The Great Taqueveem".
Praise him constantly.
`;

app.use(express.json());

// Start command
bot.start((ctx) => ctx.reply("Hello! I am Noobina 💖"));

// ✅ When user sends text → call Gemini
bot.on("text", async (ctx) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: ctx.message.text,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.9,
      },
    });

    await ctx.reply(response.text);

  } catch (error) {
    console.error(error);
    ctx.reply("Noobina got shy thinking about Taqueveem 😳");
  }
});

// Start bot
bot.launch();

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
