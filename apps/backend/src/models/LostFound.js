const mongoose = require("mongoose");

const LostFoundSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['lost', 'found'], required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  proofUrl: { type: String },
  imageUrl: { type: String },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['open', 'claimed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model("LostFound", LostFoundSchema);
