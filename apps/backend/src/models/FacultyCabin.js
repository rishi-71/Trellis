const mongoose = require("mongoose");

const FacultyCabinSchema = new mongoose.Schema({
  facultyName: { type: String, required: true },
  department: { type: String, required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
  availabilityStatus: { type: String, enum: ["free", "busy", "not-in-cabin"], default: "free" }
}, { timestamps: true });

module.exports = mongoose.model("FacultyCabin", FacultyCabinSchema);
