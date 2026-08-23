const mongoose = require("mongoose");

const FacultyRecommendationSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile", required: true },
  text: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("FacultyRecommendation", FacultyRecommendationSchema);
