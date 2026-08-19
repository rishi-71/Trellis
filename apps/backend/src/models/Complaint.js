const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { 
    type: String, 
    enum: ['washroom', 'wifi', 'projector', 'fan', 'light', 'ragging', 'cleaning', 'other'], 
    required: true 
  },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'resolved'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);
