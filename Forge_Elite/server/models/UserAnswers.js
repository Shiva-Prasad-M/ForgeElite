const mongoose = require("mongoose");

const userAnswerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedOption: {
      type: Number,
      required: true,
      min: 0,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    topic: {
      type: String,
      enum: ["DBMS", "OS", "CN", "DSA"],
      required: true,
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("UserAnswers", userAnswerSchema);
