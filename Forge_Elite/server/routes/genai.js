const express=require("express");
const router=express.Router();
const generateText=require("../config/genAi");

router.post("/generate", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }
  
    try {
      const generatedText = await generateText(prompt);
      res.json({ response: generatedText });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate text." });
    }
  });

module.exports=router;