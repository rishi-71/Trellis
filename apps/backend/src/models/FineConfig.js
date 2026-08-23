const mongoose = require("mongoose");

const FineConfigSchema = new mongoose.Schema({
  ratePerHour: { type: Number, required: true, default: 10 }
}, { timestamps: true });

module.exports = mongoose.model("FineConfig", FineConfigSchema);
