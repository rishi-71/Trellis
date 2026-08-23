const mongoose = require("mongoose");

const ActivityFeedPostSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile", required: true },
  type: { type: String, enum: ["achievement", "project", "certification"], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId },
  message: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("ActivityFeedPost", ActivityFeedPostSchema);
