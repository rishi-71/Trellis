const mongoose = require("mongoose");

const AdminReportSchema = new mongoose.Schema({
  jobPostingId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPosting", required: true },
  pdfUrl: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("AdminReport", AdminReportSchema);
