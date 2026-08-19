const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  registrationDeadline: { type: Date, required: true },
  posterUrl: { type: String, default: "" },
  maxParticipants: { type: Number },
  registeredParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attendedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
