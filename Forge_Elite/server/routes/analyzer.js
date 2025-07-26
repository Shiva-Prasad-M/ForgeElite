// analyzer.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// Helper: Generate AI feedback
async function analyzeResumeWithGemini(resumeText, targetRole) {
  const prompt = `
Resume Content:
"""
${resumeText}
"""

Target Role: ${targetRole}

Please perform the following:
1. Extract important skills from the resume.
2. Compare them to what is expected for the role "${targetRole}".
3. Give a skill match score out of 100.
4. List skills that are missing or weak.
5. Provide detailed , actionable feedback on how the resume can be improved for this role.
6.Give me in point wise and concise way 
Format:
{
  "score": number,
  "matchedSkills": [...],
  "missingSkills": [...],
  "feedback": "..."
}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Try to parse JSON-like content from Gemini
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Error parsing Gemini output:", err);
    return {
      score: null,
      matchedSkills: [],
      missingSkills: [],
      feedback: text,
    };
  }
}

// POST /analyze-resume
router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  const { targetRole } = req.body;
  const resumeFile = req.file;
  if (!targetRole || !resumeFile) {
    return res.status(400).json({ error: "Target role and resume file are required." });
  }

  try {
    const dataBuffer = fs.readFileSync(resumeFile.path);
    const resumeText = (await pdfParse(dataBuffer)).text;

    const result = await analyzeResumeWithGemini(resumeText, targetRole);
    res.json(result);
  } catch (err) {
    console.error("❌ Error analyzing resume in the backedn :", err);
    res.status(500).json({ error: "Error analyzing resume in the backend." });
  } finally {
    fs.unlink(resumeFile.path, () => {}); // Clean up uploaded file
  }
});

module.exports = router;