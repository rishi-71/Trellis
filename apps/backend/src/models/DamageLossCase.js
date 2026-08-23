const mongoose = require("mongoose");

const DamageLossCaseSchema = new mongoose.Schema({
  sensorRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "SensorRequest", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: "Sensor", required: true },
  type: { type: String, enum: ["damaged", "lost"], required: true },
  penaltyAmount: { type: Number, required: true },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  notes: { type: String },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("DamageLossCase", DamageLossCaseSchema);
