const mongoose = require("mongoose");

const PlacementActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["profile_locked", "profile_updated", "job_applied", "broadcast_sent"],
    required: true
  },
  actorName: {
    type: String,
    default: "Student"
  },
  actorEmail: {
    type: String,
    default: ""
  },
  actorRole: {
    type: String,
    default: "student"
  },
  rollNumber: {
    type: String,
    default: ""
  },
  branch: {
    type: String,
    default: ""
  },
  jobPostingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobPosting"
  },
  companyName: {
    type: String,
    default: ""
  },
  message: {
    type: String,
    required: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

PlacementActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model("PlacementActivity", PlacementActivitySchema);
