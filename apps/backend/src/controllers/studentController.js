const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");

// Get all student users
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("email role");
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get current student's profile
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id }).populate("user", "email role");
    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create current student's profile
exports.createProfile = async (req, res) => {
  try {
    const { name, rollNumber, branch, graduationYear, cgpa, backlogs, bio, photoUrl, skills, projects, internships, resumeUrl, socialLinks, education } = req.body;
    
    // Check if profile already exists
    const existingProfile = await StudentProfile.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ success: false, message: "Profile already exists for this user. Use PUT to update." });
    }
    
    // Check if roll number is already used
    const existingRoll = await StudentProfile.findOne({ rollNumber });
    if (existingRoll) {
      return res.status(400).json({ success: false, message: "Roll number is already registered by another student" });
    }
    
    const profile = new StudentProfile({
      user: req.user.id,
      name,
      rollNumber,
      branch,
      graduationYear,
      cgpa,
      backlogs,
      bio,
      photoUrl,
      skills,
      projects,
      internships,
      resumeUrl,
      socialLinks,
      education
    });
    
    await profile.save();
    
    res.status(201).json({ success: true, message: "Profile created successfully", profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update current student's profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow changing the user field directly
    delete updates.user;
    
    // Find and update
    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found. Create it first." });
    }
    
    // If roll number is updated, verify it is not taken
    if (updates.rollNumber && updates.rollNumber !== profile.rollNumber) {
      const existingRoll = await StudentProfile.findOne({ rollNumber: updates.rollNumber });
      if (existingRoll) {
        return res.status(400).json({ success: false, message: "Roll number is already taken" });
      }
    }
    
    // Update fields
    Object.assign(profile, updates);
    await profile.save();
    
    res.json({ success: true, message: "Profile updated successfully", profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get public student profile by roll number
exports.getPublicProfile = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const profile = await StudentProfile.findOne({ rollNumber }).populate("user", "email");
    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
