const mongoose = require("mongoose");

const FineSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sensorRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "SensorRequest", required: true },
  lateDuration: { type: Number, required: true }, // in hours
  ratePerUnit: { type: Number, required: true }, // snapshot of fine config rate per hour
  amount: { type: Number, required: true }, // lateDuration * ratePerUnit
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  markedPaidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  markedPaidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Fine", FineSchema);
