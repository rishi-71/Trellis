const mongoose = require("mongoose");

const SensorRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  enrollmentNo: { type: String, required: true },
  branch: { type: String, required: true },
  phone: { type: String, required: true },
  duration: { type: String, required: true, default: "7 Days" },
  purpose: { type: String, required: true },
  projectName: { type: String, default: "Academic Lab Work" },
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: "Sensor", required: true },
  sensorName: { type: String },
  requestedFrom: { type: Date, default: Date.now },
  requestedTo: { type: Date },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "issued", "returned", "overdue", "lost"], 
    default: "pending" 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approverName: { type: String },
  approvalNote: { type: String },
  approvedAt: { type: Date },
  issuedAt: { type: Date },
  dueAt: { type: Date },
  returnedAt: { type: Date },
  returnCondition: { type: String, enum: ["ok", "damaged"], default: "ok" }
}, { timestamps: true });

module.exports = mongoose.model("SensorRequest", SensorRequestSchema);
