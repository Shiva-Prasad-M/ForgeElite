const express = require("express");
const bcrypt=require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const transporter=require("../config/nodemailer");
const userAuth=require("../middleware/userAuth");
const authMiddleware=require("../utils/auth");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1d" });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Forge-Elite",
      text: "Thank You for creating your account on the Forge-Elite website",
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      token,
      userId: user._id,
      message: "Registration successful",
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and Password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1d" });

    return res.json({
      success: true,
      token,
      userId: user._id,
      message: "Login successful",
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/google", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.json({ success: false, message: "Missing Google account details" });
  }

  try {
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        name,
        email,
        password: "", // No password needed for OAuth
      });

      await user.save();

      // Send welcome email only for new users
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Welcome to Forge-Elite",
        text: "Thank You for creating your account on the Forge-Elite website",
      };

      await transporter.sendMail(mailOptions);
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1d" });

    return res.json({
      success: true,
      token,
      userId: user._id,
      message: isNewUser ? "Google OAuth registration successful" : "Google OAuth login successful",
    });

  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});




router.post("/send-verify-opt" , authMiddleware , async (req,res)=>{
  try{
    const userId = req.user.id;
    const user=await User.findById(userId);
    
    if(user.isAccountVerified){
      return res.json({success:false,message:"Account already verified"});
    }

    const otp=String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp=otp;

    user.verifyOtpExpireAt=Date.now() + 24*60*60*1000;

    await user.save();

    const mailOption={
      from:process.env.SENDER_EMAIL,
      to:user.email,
      subject:"Account Verification OTP",
      text:`Your OTP is ${otp}. Verify your Account using this OTP.`
    }

    await transporter.sendMail(mailOption);

    res.json({success:true,message:"Verification OTP sent to Email"});

  }
  catch(err){
    res.json({success:false,message:err.message});  
  }
})

router.post("/verify-account" , authMiddleware,   async (req,res)=>{

  const userId = req.user.id;

  if(!userId || !otp){
    return res.json({success:false,message:"Missing Details"});
  }
  try{
    const user=await User.findById(userId);

    if(!user){
      return res.json({success:false,message:"User not found"});
    }

    if(user.verifyOtp === '' || user.verifyOtp !== otp){
      return res.json({success:false,message:"Invalid otp"});
    }

    if(user.verifyOtpExpireAt < Date.now()){
      return res.json({success:false,message:"OTP Expired"});
    }

    user.isAccountVerified=true;
    user.verifyOtp='';
    user.verifyOtpExpireAt=0;

    await user.save();

    return res.json({success:true,message:"Email verified Successfully"});
  }
  catch(err){
    res.json({success:false,message:err.message});
  }
}) 

router.get("/is-auth" , authMiddleware , async (req,res)=>{
  try{
    return res.json({success:true});
  }
  catch(err){
    res.json({success:false,message:err.messgae});
  }
})

router.post("/send-reset-otp" , async (req,res)=>{
  const {email} = req.body;

  if(!email){
    return res.json({success:false,message:"Email is required"});
  }

  try{
    const user=await User.findOne({email});

    if(!user){
      return res.json({success:false,message:"User not Found"});
    }

    const otp=String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp=otp;

    user.resetOtpExpireAt=Date.now() + 15*60*1000;

    await user.save();

    const mailOption={
      from:process.env.SENDER_EMAIL,
      to:user.email,
      subject:"Password Reset OTP",
      text:`Your OTP for resetting your password is ${otp}.`
    }

    await transporter.sendMail(mailOption);

    return res.json({success:true,message:"OTP sent to your Email"});

  }
  catch(err){
    res.json({success:false,message:err.message});
  }
})

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Email, OTP, and new password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password has been reset successfully." });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});


module.exports = router;
