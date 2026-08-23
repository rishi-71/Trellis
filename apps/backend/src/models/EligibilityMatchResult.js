const mongoose = require("mongoose");

const EligibilityMatchResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobPostingId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPosting", required: true },
  isEligible: { type: Boolean, required: true },
  failedConditions: [
    {
      field: { type: String, required: true },
      requiredValue: { type: mongoose.Schema.Types.Mixed, required: true },
      actualValue: { type: mongoose.Schema.Types.Mixed },
      message: { type: String, required: true }
    }
  ],
  studentDecision: { 
    type: String, 
    enum: ["pending", "applied", "no-apply", "not-applicable"], 
    default: "pending" 
  },
  applicationResumeUrl: { type: String },
  decidedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("EligibilityMatchResult", EligibilityMatchResultSchema);
