const mongoose = require("mongoose");

const EducationItemSchema = new mongoose.Schema({
  institution: { type: String, default: "" },
  degree: { type: String, default: "" },
  branch: { type: String, default: "" },
  startYear: { type: String, default: "" },
  endYear: { type: String, default: "" },
  cgpa: { type: String, default: "" }
}, { _id: false });

const ProjectItemSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  description: { type: String, default: "" },
  technologies: { type: String, default: "" },
  githubUrl: { type: String, default: "" },
  liveDemoUrl: { type: String, default: "" }
}, { _id: false });

const ExperienceItemSchema = new mongoose.Schema({
  company: { type: String, default: "" },
  role: { type: String, default: "" },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
  description: { type: String, default: "" }
}, { _id: false });

const CertificationItemSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  organization: { type: String, default: "" },
  date: { type: String, default: "" },
  credentialUrl: { type: String, default: "" }
}, { _id: false });

const AchievementItemSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  date: { type: String, default: "" }
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, default: "My Resume" },
  template: { 
    type: String, 
    enum: ["modern", "classic", "ats", "minimal", "technical", "data-analyst"], 
    default: "modern" 
  },
  personalInfo: {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" }
  },
  summary: { type: String, default: "" },
  education: [EducationItemSchema],
  skills: {
    programmingLanguages: [{ type: String }],
    frameworks: [{ type: String }],
    databases: [{ type: String }],
    tools: [{ type: String }],
    otherSkills: [{ type: String }]
  },
  projects: [ProjectItemSchema],
  experience: [ExperienceItemSchema],
  certifications: [CertificationItemSchema],
  achievements: [AchievementItemSchema],
  sectionOrder: [{ type: String }],
  
  // Backward compatibility fields
  templateId: { type: String },
  name: { type: String },
  generatedContent: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model("Resume", ResumeSchema);
