const mongoose = require("mongoose");

const SensorRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: "Sensor", required: true },
  purpose: { type: String, required: true },
  projectName: { type: String, required: true },
  requestedFrom: { type: Date, required: true },
  requestedTo: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "issued", "returned", "overdue", "lost"], 
    default: "pending" 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvalNote: { type: String },
  approvedAt: { type: Date },
  issuedAt: { type: Date },
  dueAt: { type: Date },
  returnedAt: { type: Date },
  returnCondition: { type: String, enum: ["ok", "damaged"] }
}, { timestamps: true });

module.exports = mongoose.model("SensorRequest", SensorRequestSchema);
