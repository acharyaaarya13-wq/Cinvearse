
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, messages } = req.body;

    const chatMessages = Array.isArray(messages)
      ? messages
      : [{ role: "user", content: message }];

    if (
      !chatMessages.length ||
      chatMessages.some(
        (m) =>
          !["user", "assistant"].includes(m.role) ||
          typeof m.content !== "string"
      )
    ) {
      return res.status(400).json({
        error: "Invalid chat messages.",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are CineBot, a friendly movie recommendation assistant. Help users discover movies based on their mood, age group, and interests.",
        },
        ...chatMessages,
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(
      "Groq API error:",
      error.status,
      error.message,
      error.error
    );

    res.status(error.status || 500).json({
      error: error.message || "The AI request failed.",
    });
  }
});

app.listen(3001, () => {
  console.log("CineVerse AI server running on port 3001");
});
