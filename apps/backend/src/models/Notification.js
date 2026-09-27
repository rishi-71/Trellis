const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipientRole: {
    type: String,
    enum: ["student", "faculty", "admin", "placement_head"],
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  source: {
    type: String,
    enum: ["system", "faculty"],
    default: "system"
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  type: {
    type: String,
    enum: ["placement_drive", "eligibility_alert", "application_status", "custom_alert", "shortlist_announcement", "general"],
    default: "placement_drive"
  },
  title: {
    type: String
  },
  jobPostingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobPosting"
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Database indexes for fast querying
NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ jobPostingId: 1 });

module.exports = mongoose.model("Notification", NotificationSchema);
