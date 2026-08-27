const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile", required: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["academic", "sports", "cultural", "technical", "leadership", "social-work"], 
    required: true 
  },
  level: { 
    type: String, 
    enum: ["college", "state", "national", "international"], 
    required: true 
  },
  description: { type: String, required: true },
  proofUrl: { type: String },
  date: { type: Date, default: Date.now },
  semester: { type: Number },
  status: { 
    type: String, 
    enum: ["pending", "verified", "rejected"], 
    default: "pending" 
  },
  rejectionReason: { type: String },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verifiedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Achievement", AchievementSchema);
