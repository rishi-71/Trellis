const mongoose = require("mongoose");

const EndorsementSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skill: { type: String, required: true }
}, { timestamps: true });

// Ensure a user can only endorse another user once per skill
EndorsementSchema.index({ fromUserId: 1, toUserId: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model("Endorsement", EndorsementSchema);
