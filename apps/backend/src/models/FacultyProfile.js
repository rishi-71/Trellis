const mongoose = require("mongoose");

const FacultyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  collegeId: { type: String, required: true, unique: true },
  post: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("FacultyProfile", FacultyProfileSchema);
