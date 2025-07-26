const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Selfie = require("../models/Selfie");
const authMiddleware = require("../utils/auth");


const JWT_SECRET = process.env.JWT_SECRET;


router.get("/selfie-exists", authMiddleware, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const email = decoded.email;

    // Check if selfie already exists for this user
    const selfie = await Selfie.findOne({ user: userId });
    if (selfie) {
      return res.json({ exists: true });  // If selfie exists, return true
    }

    // If no selfie, return false
    res.json({ exists: false });

  } catch (err) {
    console.error("Selfie check error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

router.post("/save-selfie", authMiddleware, async (req, res) => {
  const { image } = req.body;
  const email = req.user.email;

  try {
    await Selfie.findOneAndUpdate(
      { email },
      { image },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save selfie." });
  }
});

router.post("/verify-face", authMiddleware, async (req, res) => {
  const { liveImage } = req.body; // current webcam image
  const email = req.user.email;
  const selfieRecord = await Selfie.findOne({ email });

  if (!selfieRecord) return res.status(404).json({ error: "Selfie not found" });

  const result = await axios.post("http://localhost:5000/proctor/verify", {
    registeredImage: selfieRecord.image,
    liveImage,
  });

  res.json(result.data);
});

router.get("/status", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    

    if (!user || !user.testStatus) {
      return res.status(404).json({ message: "User or test status not found" });
    }

    const { passed, score, lastAttempt } = user.testStatus;
    const topicPercentages = user.topicPercentages;
    const references = user.references;
    const name=user.name;

    res.json({
      name,
      passed,
      score,
      lastAttempt: lastAttempt || null,
      topicPercentages,
      references,
    });
  } catch (err) {
    console.error("❌ Failed to fetch status:", err);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/data" , authMiddleware , async (req,res)=>{
  try{

    const userId = req.user.id;

    const user = await User.findById(userId);

    if(!user){
      return res.json({success:false,message:"User not Found"});
    }
    res.json({
      success:true,
      userData:{
        name:user.name,
        isAccountVerified:user.isAccountVerified
      }
    });
  }
  catch(err){
    res.json({success:false,message:err.message});
  }

})

module.exports = router;
