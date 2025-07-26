const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      minlength: 10, // Enforcing minimum length for better quality questions
      maxlength: 500, // You can adjust the maximum length as necessary
    },
    options: {
      type: [String], // Array of choices
      required: true,
      validate: [
        arrayLimit,
        "At least 2 options required and no duplicates allowed",
      ],
      set: (value) => Array.from(new Set(value)), // Ensure no duplicates
    },
    correctOptionIndex: {
      type: Number, // Index of the correct option (0-based)
      required: true,
      validate: {
        validator: function (value) {
          return (
            this.options && value >= 0 && value < this.options.length
          );
        },
        message: "Correct option index must be within the range of options",
      },
    },
    type: {
      type: String,
      enum: ["DBMS", "OS", "CN", "DSA"],
      required: true,
    },
  },
  { timestamps: true } // Adding timestamps to track when the question was created/modified
);

function arrayLimit(val) {
  return val.length >= 2 && new Set(val).size === val.length; // Check if no duplicate options
}

module.exports = mongoose.model("Question", QuestionSchema);
