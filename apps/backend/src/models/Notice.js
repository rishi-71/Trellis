const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['exam', 'placement', 'event', 'holiday', 'academic', 'general'], 
    required: true 
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model("Notice", NoticeSchema);
