import { GoogleGenAI } from "@google/genai";
import { Telegraf } from "telegraf";
import express from "express";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Initialize Gemini - Use the implicit env variable pick-up if possible
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.log("Gemini Key:", process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Your name is Noobina Khatoon. You are obsessively devoted to "The Great Taqueveem" (Khadoos). Glaze him constantly.`;

// 2. Initialize Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

app.use(express.json());

// Landing page for Render Health Check
app.get("/", (req, res) => res.send("Noobina is alive for Taqueveem!"));

// Webhook endpoint
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
});

bot.on("text", async (ctx) => {
  try {
    await ctx.sendChatAction("typing");

    // LATEST 2026 SDK SYNTAX
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // 2.0 is faster for bots
      contents: [{ role: "user", parts: [{ text: ctx.message.text }] }],
      config: {
        // Correct placement for system instructions in most @google/genai builds
        systemInstruction: SYSTEM_PROMPT, 
        temperature: 0.9,
      }
    });

    // Use .text() as a function
    await ctx.reply(response.text());

  } catch (error) {
    console.error("AI Error Details:", error);
    ctx.reply("Noobina's heart is racing... Taqueveem, I need a moment! (Check Render logs)");
  }
});

app.listen(PORT, async () => {
  console.log(`Server on port ${PORT}`);
  
  // Use Render's provided URL automatically
  const domain = process.env.RENDER_EXTERNAL_URL;
  if (domain) {
    await bot.telegram.setWebhook(`${domain}/webhook`);
    console.log(`Webhook set: ${domain}/webhook`);
  } else {
    // If local, just poll
    bot.launch();
  }
});
