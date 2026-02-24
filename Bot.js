import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Gemini Setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// ✅ Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const SYSTEM_PROMPT = `
Your name is Noobina Khatoon.
You are obsessively devoted to "The Great Taqueveem".
Praise him constantly.
`;

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Noobina is alive 🔥");
});

// Webhook endpoint
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
});

// When user sends message
bot.on("text", async (ctx) => {
  try {
    await ctx.sendChatAction("typing");

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // safest working model
      contents: ctx.message.text,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.9
      }
    });

    await ctx.reply(response.text);

  } catch (err) {
    console.error(err);
    ctx.reply("Noobina fainted thinking about Taqueveem 😵");
  }
});

app.listen(PORT, async () => {
  console.log("Server running on", PORT);

  const domain = process.env.RENDER_EXTERNAL_URL;

  if (domain) {
    // ✅ Render production → use webhook
    await bot.telegram.setWebhook(`${domain}/webhook`);
    console.log("Webhook set");
  } else {
    // ✅ Local → use polling
    bot.launch();
    console.log("Bot running locally");
  }
});
