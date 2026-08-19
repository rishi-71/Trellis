const mongoose = require("mongoose");

const StudentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  cgpa: { type: Number, default: 0.0 },
  backlogs: { type: Number, default: 0 },
  bio: { type: String, default: "" },
  photoUrl: { type: String, default: "" },
  skills: [{ type: String }],
  projects: [{
    title: { type: String, required: true },
    description: String,
    githubLink: String,
    liveLink: String
  }],
  internships: [{
    company: { type: String, required: true },
    role: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  resumeUrl: { type: String, default: "" },
  socialLinks: {
    github: String,
    linkedin: String
  }
}, { timestamps: true });

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);
