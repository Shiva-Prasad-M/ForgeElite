const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes.js");
const testRoutes = require("./routes/testRoutes.js");
const user=require("./routes/user.js");
const payment=require("./routes/payment.js");
const cookieParser=require('cookie-parser');
const bodyParser=require("body-parser");
const analyzerRoute=require("./routes/genai.js");
const analyze=require("./routes/analyzer.js");


const port=process.env.PORT;


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());


app.use(cors({
    origin: ["http://localhost:5174","http://localhost:5173"],
    credentials: true
  }));

app.use("/api/tests", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user",user);
app.use("/api/payment",payment);
app.use("/api/ai", analyzerRoute);
app.use("/api/resume", analyze);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(port, () => console.log("✅ Server running on port 8000"));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

