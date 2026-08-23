const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ["classroom", "lab", "washroom", "canteen", "parking", "printer", "library", "faculty-cabin", "ground", "other"], 
    default: "other" 
  },
  building: { type: String, required: true },
  floor: { type: Number, required: true, default: 0 },
  x: { type: Number, required: true, default: 0 },
  y: { type: Number, required: true, default: 0 },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Location", LocationSchema);
