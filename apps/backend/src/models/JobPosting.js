const mongoose = require("mongoose");

const JobPostingSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  type: { type: String, enum: ["internship", "full-time"], required: true },
  description: { type: String, required: true },
  eligibilityRules: [
    {
      field: { type: String, required: true },
      operator: { type: String, enum: ["==", ">=", "<=", ">", "<", "in"], required: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true }
    }
  ],
  applicationDeadline: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model("JobPosting", JobPostingSchema);
