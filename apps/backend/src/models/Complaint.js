const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, default: "Facility Issue" },
  location: { type: String, required: true, default: "Campus Premises" },
  category: { 
    type: String, 
    enum: ['washroom', 'wifi', 'projector', 'fan', 'light', 'ragging', 'cleaning', 'electrical', 'lab_equipment', 'water_cooler', 'other'], 
    default: 'other'
  },
  issueType: { type: String },
  description: { type: String, required: true },
  imageUrl: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'resolved'], 
    default: 'pending' 
  },
  assignedTo: { type: String },
  resolutionNotes: { type: String },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);
