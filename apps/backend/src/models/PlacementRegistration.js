const mongoose = require("mongoose");

const PlacementRegistrationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  personal: {
    fullName: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    currentAddress: {
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },
    permanentAddress: {
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    }
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
    photoUrl: { type: String, required: true }
  },
  
  academic: {
    tenth: {
      percentage: { type: Number, required: true },
      board: { type: String, required: true },
      schoolName: { type: String, required: true },
      year: { type: Number, required: true }
    },
    
    twelfth: {
      percentage: { type: Number, required: true },
      board: { type: String, required: true },
      schoolName: { type: String, required: true },
      year: { type: Number, required: true }
    },
    
    diploma: {
      percentage: { type: Number },
      board: { type: String },
      year: { type: Number }
    },
    
    graduation: {
      degree: { type: String },
      university: { type: String },
      college: { type: String },
      branch: { type: String },
      startYear: { type: Number },
      expectedGraduationYear: { type: Number },
      currentSemester: { type: Number }
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
    
    tenthToTwelfthGap: { type: Number, default: 0 },
    twelfthToGraduationGap: { type: Number, default: 0 },
    overallEducationGap: { type: Number, default: 0 }
  },
  
  documents: {
    resumeUrl: { type: String, required: true },
    tenthMarksheetUrl: { type: String, required: true },
    twelfthMarksheetUrl: { type: String, required: true },
    semesterMarksheets: [
      {
        semester: { type: Number, required: true },
        url: { type: String, required: true }
      }
    ]
  },
  
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

// Add database indexes
PlacementRegistrationSchema.index({ studentId: 1 });
PlacementRegistrationSchema.index({ status: 1 });

module.exports = mongoose.model("PlacementRegistration", PlacementRegistrationSchema);
