const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['hackathon', 'sports', 'nss_ncc', 'certification', 'research', 'other'], 
    required: true 
  },
  title: { type: String, required: true },
  description: String,
  date: Date,
  certificateUrl: { type: String, default: "" },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pointsAwarded: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Activity", ActivitySchema);
