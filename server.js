import express from "express";
import 'dotenv/config';
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/improve", async (req, res) => {
  const { text, mode } = req.body;

  try {
    // ✏️ FIX MODE (LanguageTool)
    if (mode === "fix") {
     const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: "mixtral-8x7b-32768", // 👈 FIXED
    messages: [
      {
        role: "system",
        content:
          mode === "fix"
            ? "Fix grammar and spelling ONLY. Do not rewrite."
            : "Improve this sentence to sound natural and fluent.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  }),
});

      const data = await response.json();

      let corrected = text;
      let shift = 0;

      data.matches.forEach(match => {
        if (match.replacements.length > 0) {
          const replacement = match.replacements[0].value;

          const start = match.offset + shift;
          const end = start + match.length;

          corrected =
            corrected.slice(0, start) +
            replacement +
            corrected.slice(end);

          shift += replacement.length - match.length;
        }
      });

      return res.json({ result: corrected });
    }

    // ✨ IMPROVE MODE (Groq AI)
    if (mode === "improve") {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "user",
              content: `Rewrite this sentence clearly and naturally:\n${text}`,
            },
          ],
        }),
      });

      const data = await response.json();

      console.log("GROQ RESPONSE:", data);

      const result = data.choices?.[0]?.message?.content || "No response";

      return res.json({ result });
    }

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ result: "Server error" });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
