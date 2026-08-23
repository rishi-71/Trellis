const mongoose = require("mongoose");

const ResourceIssueSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resourceName: { type: String, required: true },
  category: { type: String, enum: ['sensor', 'lab', 'sports'], required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  fine: { type: Number, default: 0 },
  status: { type: String, enum: ['issued', 'returned'], default: 'issued' }
}, { timestamps: true });

module.exports = mongoose.model("ResourceIssue", ResourceIssueSchema);
