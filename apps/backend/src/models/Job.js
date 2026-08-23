const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['internship', 'fulltime'], default: 'fulltime' },
  eligibility: {
    cgpa: { type: Number, default: 0.0 },
    branch: { type: String, default: "All Branches" }
  },
  deadline: { type: Date, required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model("Job", JobSchema);
