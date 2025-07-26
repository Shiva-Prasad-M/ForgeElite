const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true,
    },
    verifyOtp:{
      type:String,
      default:''
    },
    verifyOtpExpireAt:{
      type:Number,
      default:0
    },
    isAccountVerified:{
      type:Boolean,
      default:false
    },
    resetOtp:{
      type:String,
      default:''
    },
    resetOtpExpireAt:{
      type:Number,
      default:0
    },
    testStatus: {
      passed: { type: Boolean, default: false },
      score: { type: Number, default: 0 },
      lastAttempt: { type: Date },
      cheating: { type: Boolean, default: false },
    },
    topicPercentages: {
      DSA: { type: String, default: "0.00" },
      DBMS: { type: String, default: "0.00" },
      OS: { type: String, default: "0.00" },
      CN: { type: String, default: "0.00" },
    },
    references: [
      {
        topic: { type: String },
        link: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
