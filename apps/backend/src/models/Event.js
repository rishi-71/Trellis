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
  attendedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  winners: [
    {
      position: { type: String, required: true }, // e.g., "Winner (1st Place)", "Runner Up (2nd Place)", "2nd Runner Up (3rd Place)"
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      studentName: { type: String, required: true },
      rollNumber: { type: String, default: "" },
      branch: { type: String, default: "" },
      semester: { type: Number, default: 1 },
      email: { type: String, default: "" },
      contact: { type: String, default: "" },
      prize: { type: String, default: "" }
    }
  ],
  resultsAnnounced: { type: Boolean, default: false },
  resultsAnnouncedAt: { type: Date },
  resultsNoticeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notice' }
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
