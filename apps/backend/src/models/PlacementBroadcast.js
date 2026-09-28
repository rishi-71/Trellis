const mongoose = require("mongoose");

const PlacementBroadcastSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  senderEmail: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  broadcastType: {
    type: String,
    enum: ["shortlist", "general", "reminder"],
    default: "general"
  },
  targetType: {
    type: String,
    enum: ["all_registered", "drive_candidates", "selected_students"],
    default: "all_registered"
  },
  jobPostingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobPosting"
  },
  jobTitle: {
    type: String,
    default: ""
  },
  recipientCount: {
    type: Number,
    default: 0
  },
  recipientsSummary: [{
    type: String
  }]
}, { timestamps: true });

PlacementBroadcastSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PlacementBroadcast", PlacementBroadcastSchema);
