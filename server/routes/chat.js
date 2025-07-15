// server/routes/chat.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant"; // Google(Slow, Gemma): gemma2-9b-it, Meta(Good, LLaMa): llama-3.3-70b-versatile (for deeper thought), llama-3.1-8b-instant (fast, short)

router.post("/", async (req, res) => {
  const userMessage = req.body.message;
  const ALLOWED_MODELS = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "gemma2-9b-it"
  ];

  const selectedModel = ALLOWED_MODELS.includes(req.body.model)
    ? req.body.model
    : MODEL;


  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: selectedModel,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 1024,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || "[No reply]";
    res.json({ reply });

  } catch (err) {
    console.error("Groq API error:", err.response?.data || err.message);
    res.status(500).json({ reply: "[Groq API error]" });
  }
});

export default router;
