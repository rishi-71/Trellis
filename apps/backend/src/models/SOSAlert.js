const mongoose = require("mongoose");

const SOSAlertSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model("SOSAlert", SOSAlertSchema);
