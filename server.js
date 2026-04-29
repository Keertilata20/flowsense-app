import express from "express";
import 'dotenv/config';
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/improve", async (req, res) => {
  const { text } = req.body;

  try {
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

    console.log("LanguageTool:", data);

    // Apply first suggestion (simple version)
    let corrected = text;

    data.matches.forEach(match => {
      if (match.replacements.length > 0) {
        const replacement = match.replacements[0].value;

        corrected =
          corrected.slice(0, match.offset) +
          replacement +
          corrected.slice(match.offset + match.length);
      }
    });

    res.json({ result: corrected });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ result: "Error fixing text" });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
