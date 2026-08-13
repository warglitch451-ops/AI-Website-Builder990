
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post("/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({
        error: "Please enter a website description."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
You are an expert professional web developer.

Create a complete, modern, responsive website based on this request:

${prompt}

Requirements:
- Return ONLY the complete HTML code.
- Include CSS inside the HTML.
- Include JavaScript inside the HTML when needed.
- Make it responsive on mobile, tablet and desktop.
- Make the design premium and professional.
- Include realistic website content.
- Use semantic HTML.
- Include navigation, hero, services, about, testimonials,
  call-to-action and contact sections when appropriate.
- Do not explain the code.
`
    });

    let website = response.text;

    website = website
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    res.json({ website });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Website generation failed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
