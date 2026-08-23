const mongoose = require("mongoose");

const PlacementRegistrationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  personal: {
    fullName: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    currentAddress: { type: String, required: true },
    localAddressPincode: { type: String },
    permanentAddress: { type: String, required: true },
    permanentAddressPincode: { type: String },
    state: { type: String }
  },
  family: {
    fatherName: { type: String, required: true },
    fatherOccupation: { type: String, required: true },
    fatherContact: { type: String, required: true },
    motherName: { type: String, required: true },
    motherOccupation: { type: String, required: true },
    motherContact: { type: String, required: true }
  },
  identity: {
    apaarId: { type: String, required: true },
    photoUrl: { type: String, required: true },
    passportPhotoUrl: { type: String, required: true }
  },
  academic: {
    universityName: { type: String },
    courseName: { type: String },
    yearOfAdmission: { type: Number },
    yearOfPassing: { type: Number },
    tenth: {
      percentage: { type: Number, required: true },
      board: { type: String, required: true },
      year: { type: Number, required: true },
      yearOfPassing: { type: Number }
    },
    twelfth: {
      percentage: { type: Number, required: true },
      board: { type: String, required: true },
      year: { type: Number, required: true },
      yearOfPassing: { type: Number }
    },
    diploma: {
      percentage: { type: Number },
      board: { type: String },
      year: { type: Number }
    },
    branch: { type: String, required: true },
    rollNumber: { type: String, required: true },
    enrollmentNumber: { type: String, required: true },
    semesterSgpa: [
      {
        semester: { type: Number, required: true },
        sgpa: { type: Number, required: true }
      }
    ],
    cgpa: { type: Number, required: true },
    backlogCount: { type: Number, required: true, default: 0 },
    backlogHistory: [{ type: String }],
    academicGap: {
      tenth: { hasGap: { type: Boolean, default: false }, duration: String, reason: String },
      twelfth: { hasGap: { type: Boolean, default: false }, duration: String, reason: String },
      ug: { hasGap: { type: Boolean, default: false }, duration: String, reason: String }
    }
  },
  documents: {
    resumeUrl: { type: String, required: true },
    marksheetUrls: [{ type: String }]
  },
  internships: [
    { companyName: { type: String, required: true } }
  ],
  isRetryAttempt: { type: Boolean, required: true, default: false },
  status: { type: String, enum: ["draft", "locked"], default: "draft" },
  submittedAt: { type: Date },
  editLog: [
    {
      editedBy: { type: String, required: true },
      field: { type: String, required: true },
      oldValue: { type: String },
      newValue: { type: String },
      editedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("PlacementRegistration", PlacementRegistrationSchema);
