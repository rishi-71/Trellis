const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile", required: true },
  templateId: { type: String, enum: ["minimal", "technical", "data-analyst"], default: "minimal" },
  name: { type: String, required: true },
  generatedContent: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Resume", ResumeSchema);
