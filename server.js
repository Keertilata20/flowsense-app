import express from "express";
import "dotenv/config";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/improve", async (req, res) => {
  const { text, mode } = req.body;

  try {
    // =========================
    // ✏️ FIX MODE (LanguageTool)
    // =========================
    if (mode === "fix") {
      const response = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          text: text,
          language: "en-US",
        }),
      });

      const data = await response.json();

      let corrected = text;
      let shift = 0;

      data.matches.forEach((match) => {
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

    // =========================
    // ✨ IMPROVE MODE (Groq AI)
    // =========================
 if (mode === "improve") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  // 🔁 Try multiple models (because Groq keeps changing them)
  const models = ["llama3-70b-8192", "llama-3.1-8b-instant"];

  let data = null;

  for (let model of models) {
    try {
      console.log("Trying model:", model);

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: "Rewrite the sentence. Return ONLY the final sentence. No explanation."
              },
              {
                role: "user",
                content: text,
              },
            ],
          }),
          signal: controller.signal,
        }
      );

      const result = await response.json();

      if (result.choices) {
        data = result;
        break; // ✅ success → stop trying
      } else {
        console.log("Model failed:", model, result);
      }
    } catch (err) {
      console.log("Error with model:", model);
    }
  }

  clearTimeout(timeout);

  // ❌ If ALL models failed
  if (!data) {
    return res.json({
      result: "⚠️ AI busy right now. Try again in a moment.",
    });
  }

  // ✅ Success
  const finalText = data.choices[0].message.content;

  return res.json({ result: finalText });
}
    // fallback
    return res.json({ result: text });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    if (err.name === "AbortError") {
      return res.json({ result: "⏳ Request timed out. Try again." });
    }

    return res.json({ result: "⚠️ Network error. Try again." });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});