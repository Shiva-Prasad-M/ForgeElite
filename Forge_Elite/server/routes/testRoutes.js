const express = require("express");
const router = express.Router();
const Question = require("../models/Questions");
const User = require("../models/User");
const authMiddleware = require("../utils/auth");
const mongoose = require("mongoose");
require("dotenv").config();

// Add questions
router.post("/add", async (req, res) => {
  const payload = req.body;
  try {
    if (Array.isArray(payload)) {
      const newQuestions = await Question.insertMany(payload);
      res.json({ success: true, message: `${newQuestions.length} questions added ✅` });
    } else {
      const { question, options, correctOptionIndex, type } = payload;
      const newQuestion = new Question({ question, options, correctOptionIndex, type });
      await newQuestion.save();
      res.json({ success: true, message: "1 question added ✅" });
    }
  } catch (err) {
    console.error("Error adding question(s):", err);
    res.status(500).json({ success: false, message: "Error adding question(s)" });
  }
});

// Fetch mixed questions
router.get("/questions/mixed", async (req, res) => {
  try {
    const topicWise = await Question.aggregate([
      {
        $facet: {
          DBMS: [{ $match: { type: "DBMS" } }, { $sample: { size: 2 } }],
          OS: [{ $match: { type: "OS" } }, { $sample: { size: 2 } }],
          CN: [{ $match: { type: "CN" } }, { $sample: { size: 2 } }],
          DSA: [{ $match: { type: "DSA" } }, { $sample: { size: 2 } }],
        },
      },
    ]);

    const topicQuestions = [
      ...topicWise[0].DBMS,
      ...topicWise[0].OS,
      ...topicWise[0].CN,
      ...topicWise[0].DSA,
    ];

    const usedIds = topicQuestions.map((q) => q._id);
    const extra = await Question.aggregate([
      { $match: { _id: { $nin: usedIds } } },
      { $sample: { size: 2 } },
    ]);

    const allQuestions = [...topicQuestions, ...extra].sort(() => Math.random() - 0.5);
    res.json(allQuestions);
  } catch (err) {
    console.error("Error fetching mixed questions:", err);
    res.status(500).json({ error: "Failed to load mixed questions" });
  }
});

const UserAnswers = require("../models/UserAnswers");

router.post("/save-answers", async (req, res) => {
  try {
    const { userId, answers } = req.body;

    if (!userId || !answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ error: "Missing userId or answers" });
    }

    const questionIds = Object.keys(answers).map(id => new mongoose.Types.ObjectId(id));
    const questions = await Question.find({ _id: { $in: questionIds } });

    const answerDocs = [];

    for (const question of questions) {
      const questionIdStr = question._id.toString();
      const selectedOption = answers[questionIdStr];
      const topic = question.type;

      if (!topic || !["DBMS", "OS", "CN", "DSA"].includes(topic)) {
        console.warn(`⚠️ Missing or invalid topic for question ID: ${questionIdStr}`);
        continue;
      }

      const isCorrect = selectedOption === question.correctOptionIndex;

      answerDocs.push({
        userId,
        questionId: question._id,
        selectedOption,
        isCorrect,
        topic,
      });
    }

    if (answerDocs.length === 0) {
      return res.status(400).json({ error: "No valid answers to save" });
    }

    await UserAnswers.insertMany(answerDocs);
    res.status(201).json({ message: "✅ Answers stored successfully" });
  } catch (err) {
    console.error("❌ Error saving user answers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/evaluate", authMiddleware, async (req, res) => {
  try {
    const { userId, answers, cheating } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const topicLinks = {
      DSA: "https://www.geeksforgeeks.org/dsa/",
      DBMS: "https://www.geeksforgeeks.org/dbms/",
      OS: "https://www.geeksforgeeks.org/os/",
      CN: "https://www.geeksforgeeks.org/cn/",
    };

    // 🚨 Cheating Case
    if (cheating) {
      await User.findByIdAndUpdate(userId, {
        testStatus: {
          passed: false,
          score: 0,
          lastAttempt: new Date(),
          cheating: true,
        },
        topicPercentages: {
          DSA: "0.00",
          DBMS: "0.00",
          OS: "0.00",
          CN: "0.00",
        },
        references: Object.entries(topicLinks).map(([topic, link]) => ({ topic, link })),
      });

      return res.json({
        message: "🚫 You were disqualified for cheating.",
        score: 0,
        referencePage: true,
        cheating: true,
        name: user.name,
      });
    }

    // ✅ Calculate based on incoming answers
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ error: "No answers submitted" });
    }

    const questionIds = Object.keys(answers).map(id => new mongoose.Types.ObjectId(id));
    const questions = await Question.find({ _id: { $in: questionIds } });

    const topicScores = {};
    const topicCounts = {};
    let correctCount = 0;

    for (const question of questions) {
      const selectedOption = answers[question._id.toString()];
      const isCorrect = selectedOption === question.correctOptionIndex;
      const topic = question.type;

      if (!["DBMS", "DSA", "OS", "CN"].includes(topic)) continue;

      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      if (isCorrect) {
        topicScores[topic] = (topicScores[topic] || 0) + 1;
        correctCount++;
      }
    }

    const calculatedTopicPercentages = {};
    for (const topic in topicCounts) {
      const percent = ((topicScores[topic] || 0) / topicCounts[topic] * 100).toFixed(2);
      calculatedTopicPercentages[topic] = percent;
    }

    const totalQuestions = questions.length;
    const finalScore = totalQuestions ? ((correctCount / totalQuestions) * 100).toFixed(2) : "0.00";
    const passed = parseFloat(finalScore) >= 70;

    const weakTopics = Object.entries(calculatedTopicPercentages)
      .filter(([_, val]) => parseFloat(val) < 50)
      .map(([topic]) => topic);

    const generatedReferences = weakTopics.map(topic => ({
      topic,
      link: topicLinks[topic],
    }));

    await User.findByIdAndUpdate(userId, {
      testStatus: {
        passed,
        score: finalScore,
        lastAttempt: new Date(),
        cheating: false,
      },
      topicPercentages: calculatedTopicPercentages,
      references: generatedReferences,
    });

    res.json({
      status: { passed, score: finalScore },
      topicPercentages: calculatedTopicPercentages,
      references: generatedReferences,
      name: user.name,
    });

  } catch (err) {
    console.error("❌ Error in /evaluate:", err);
    res.status(500).json({ error: "Server error evaluating test" });
  }
});


// Check eligibility
router.get("/eligibility/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ eligible: false, message: "User not found" });
    }

    const testStatus = user.status || {};
    const { passed, lastAttempt } = testStatus;

    if (passed) {
      return res.json({
        eligible: false,
        message: "🎉 You have already passed the test.",
        canRetake: false,
      });
    }

    if (lastAttempt) {
      const now = new Date();
      const nextAllowed = new Date(lastAttempt);
      nextAllowed.setDate(nextAllowed.getDate() + 7);

      if (now < nextAllowed) {
        const daysLeft = Math.ceil((nextAllowed - now) / (1000 * 60 * 60 * 24));
        return res.json({
          eligible: false,
          message: `⏳ Please wait ${daysLeft} more day(s) before retaking the test.`,
          daysLeft,
          canRetake: false,
        });
      }
    }

    res.json({
      eligible: true,
      message: "✅ You are eligible to take the test.",
      canRetake: true,
    });
  } catch (err) {
    console.error("Eligibility check error:", err);
    res.status(500).json({
      eligible: false,
      message: "❌ Server error while checking eligibility.",
      canRetake: false,
    });
  }
});

module.exports = router;
