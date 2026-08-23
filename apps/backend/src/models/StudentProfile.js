const mongoose = require("mongoose");

const StudentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  semester: { type: Number, default: 1 },
  cgpa: { type: Number, default: 0.0 },
  bio: { type: String, default: "" },
  photoUrl: { type: String, default: "" },
  contact: { type: String, default: "" },
  skills: [{ type: String }],
  projects: [{
    title: { type: String, required: true },
    description: String,
    techStack: String,
    link: String
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: String,
    date: Date,
    proofUrl: String
  }],
  experience: [{
    title: { type: String, required: true },
    org: String,
    duration: String,
    description: String
  }],
  profileCompletionPercent: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  talentTags: [{ type: String }],
  profileViewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);
