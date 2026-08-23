const mongoose = require("mongoose");

const NavNodeSchema = new mongoose.Schema({
  idStr: { type: String, required: true, unique: true },
  floor: { type: Number, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  name: { type: String },
  connectedNodeIds: [{
    nodeId: { type: String, required: true },
    distance: { type: Number, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model("NavNode", NavNodeSchema);
