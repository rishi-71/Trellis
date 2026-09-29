const mongoose = require("mongoose");

const ManagementProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true, default: "Campus Management & Facilities" },
  phone: { type: String },
  officeLocation: { type: String, default: "Central Administration Office" },
  assignedModules: {
    type: [String],
    default: ["lostfound", "complaints"]
  }
}, { timestamps: true });

module.exports = mongoose.model("ManagementProfile", ManagementProfileSchema);
