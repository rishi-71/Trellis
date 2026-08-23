const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g. IoT Kit, Arduino, etc.
  department: { type: String, required: true },
  totalQuantity: { type: Number, required: true },
  availableQuantity: { type: Number, required: true },
  conditionSummary: { 
    type: String, 
    enum: ["working", "damaged", "under-repair"], 
    default: "working" 
  },
  unitConditionLog: [
    {
      condition: { type: String, enum: ["working", "damaged", "under-repair"], required: true },
      notes: { type: String },
      updatedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Sensor", SensorSchema);
