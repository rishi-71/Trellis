const mongoose = require("mongoose");

const PointsConfigSchema = new mongoose.Schema({
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
  points: { type: Number, required: true }
}, { timestamps: true });

// Ensure unique scoring rule per category and level combination
PointsConfigSchema.index({ category: 1, level: 1 }, { unique: 1 });

module.exports = mongoose.model("PointsConfig", PointsConfigSchema);
