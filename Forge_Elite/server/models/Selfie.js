
const mongoose = require("mongoose");

const selfieSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  image: { type: String, required: true }, // base64 or URL
});

module.exports = mongoose.model("Selfie", selfieSchema);
