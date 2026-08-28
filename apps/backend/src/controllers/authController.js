const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const FacultyProfile = require("../models/FacultyProfile");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "supersecretkey12345",
    { expiresIn: "30d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { email, password, role, name, rollNumber, enrollmentNumber, branch, collegeId, post, year, semester, department } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, password, and role are required" });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    // Role-specific validation
    if (role === "student") {
      const finalRoll = rollNumber || enrollmentNumber;
      if (!name || !finalRoll || !branch || !year || !semester) {
        return res.status(400).json({ success: false, message: "Full Name, Enrollment Number, Branch, Year, and Semester are required for students" });
      }
      // Check if roll number already exists
      const existingStudent = await StudentProfile.findOne({ rollNumber: finalRoll });
      if (existingStudent) {
        return res.status(400).json({ success: false, message: "Student with this Enrollment Number already exists" });
      }
    } else if (role === "faculty") {
      if (!name || !collegeId || !post || !department) {
        return res.status(400).json({ success: false, message: "Full Name, College ID, Post, and Department are required for faculty" });
      }
      // Check if college ID already exists
      const existingFaculty = await FacultyProfile.findOne({ collegeId });
      if (existingFaculty) {
        return res.status(400).json({ success: false, message: "Faculty with this College ID already exists" });
      }
    }
    
    // Create new user
    const user = new User({ email, password, role });
    await user.save();
    
    // Create profile
    if (role === "student") {
      const finalRoll = rollNumber || enrollmentNumber;
      const graduationYear = req.body.graduationYear || (new Date().getFullYear() + 3);
      const studentProfile = new StudentProfile({
        user: user._id,
        name,
        rollNumber: finalRoll,
        branch,
        graduationYear,
        year: parseInt(req.body.year) || 1,
        semester: parseInt(req.body.semester) || 1
      });
      await studentProfile.save();
    } else if (role === "faculty") {
      const facultyProfile = new FacultyProfile({
        user: user._id,
        name,
        collegeId,
        post,
        department
      });
      await facultyProfile.save();
    }
    
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let profile = null;
    if (user.role === "student") {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === "faculty") {
      profile = await FacultyProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user,
      profile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
