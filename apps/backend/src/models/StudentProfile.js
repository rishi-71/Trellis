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
  bannerImage: { type: String, default: "" },
  contact: { type: String, default: "" },
  education: {
    tenth: {
      percentageOrCgpa: { type: String, default: "" },
      board: { type: String, default: "" },
      schoolName: { type: String, default: "" },
      yearOfPassing: { type: Number }
    },
    twelfth: {
      percentageOrCgpa: { type: String, default: "" },
      board: { type: String, default: "" },
      schoolName: { type: String, default: "" },
      yearOfPassing: { type: Number }
    },
    graduation: {
      courseBranch: { type: String, default: "" },
      universityName: { type: String, default: "" },
      currentCgpa: { type: Number, default: 0 },
      currentSemester: { type: Number, default: 1 }
    }
  },
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  portfolio: { type: String, default: "" },
  isPublic: { type: Boolean, default: true },
  skills: [{ type: String }],
  projects: [{
    title: { type: String, required: true },
    description: String,
    techStack: String,
    link: String,
    semester: Number
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: String,
    date: Date,
    proofUrl: String,
    semester: Number
  }],
  experience: [{
    title: { type: String, required: true },
    org: String,
    duration: String,
    description: String,
    semester: Number
  }],
  profileCompletionPercent: { type: Number, default: 0 },
  careerTags: [{ type: String }],
  profileViewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);
