const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const express = require("express");

// 🔐 Load from environment variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// 🤖 Create Telegram bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  // Ignore non-text messages
  if (!msg.text) return;

  const userMessage = msg.text;

  try {
    // ✅ Latest working Gemini model
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        contents: [{ parts: [{ text: userMessage }] }]
      }
    );

    const reply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    bot.sendMessage(chatId, reply);

  } catch (error) {
    console.error(error.response?.data || error.message);
    bot.sendMessage(chatId, "⚠️ Error talking to Gemini");
  }
});

console.log("Bot is running...");

// 🌐 Dummy web server (needed for hosting platforms)
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Telegram Gemini Bot is running 🤖");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
