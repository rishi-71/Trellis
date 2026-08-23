const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const PlacementRegistration = require("../models/PlacementRegistration");
const JobPosting = require("../models/JobPosting");
const EligibilityMatchResult = require("../models/EligibilityMatchResult");
const AdminReport = require("../models/AdminReport");
const pdfkit = require("pdfkit");
const cloudinary = require("cloudinary").v2;
const stream = require("stream");

// Cloudinary config binding
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "ips_academy_cloud",
  api_key: process.env.CLOUDINARY_API_KEY || "ips_api_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "ips_api_secret"
});

// A. STUDENT PLACEMENT REGISTRATION FORM SUBMISSION
exports.submitRegistration = async (req, res) => {
  try {
    let { studentId } = req.params;
    let userObj = null;

    if (studentId.includes("@")) {
      userObj = await User.findOne({ email: studentId });
      if (!userObj) return res.status(404).json({ success: false, message: "User not found" });
      studentId = userObj._id;
    } else {
      userObj = await User.findById(studentId);
      if (!userObj) return res.status(404).json({ success: false, message: "User not found" });
    }

    // Timing Rules Validation using student's profile semester
    const profile = await StudentProfile.findOne({ user: studentId });
    if (!profile) {
      return res.status(400).json({ 
        success: false, 
        message: "Student profile not found. Please create a basic profile first before registering for placements." 
      });
    }

    const sem = profile.semester || 1;
    const { isRetryAttempt, personal, family, identity, academic, documents, internships, isDraft } = req.body;

    // timing rules:
    // sem <= 5: Blocked
    // sem = 6, non-retry: Allowed
    // sem >= 7, retry: Allowed
    // sem >= 7, non-retry: Blocked
    if (sem <= 5) {
      return res.status(403).json({ 
        success: false, 
        message: "Placement registration is not yet available. It becomes available only after your 5th semester is fully complete (Semester 6 onwards)." 
      });
    }

    if (sem >= 7 && !isRetryAttempt) {
      return res.status(403).json({ 
        success: false, 
        message: "Placement registration window has closed. Late submissions in 4th year are only allowed as a Retry Attempt." 
      });
    }

    // Check existing registration
    let registration = await PlacementRegistration.findOne({ studentId });
    if (registration && registration.status === "locked") {
      return res.status(403).json({ success: false, message: "Registration has already been submitted and locked." });
    }

    // Academic SGPA/CGPA, passport photo, and academic gap verification checks
    if (!isDraft) {
      if (!identity?.passportPhotoUrl) {
        return res.status(400).json({ success: false, message: "Passport size photograph upload is required to submit." });
      }

      const gap = academic?.academicGap;
      if (gap) {
        if (gap.tenth?.hasGap && !gap.tenth.duration) {
          return res.status(400).json({ success: false, message: "Gap duration is required for Tenth Stage since a gap is declared." });
        }
        if (gap.twelfth?.hasGap && !gap.twelfth.duration) {
          return res.status(400).json({ success: false, message: "Gap duration is required for Twelfth Stage since a gap is declared." });
        }
        if (gap.ug?.hasGap && !gap.ug.duration) {
          return res.status(400).json({ success: false, message: "Gap duration is required for UG Stage since a gap is declared." });
        }
      }

      const requiredSemesters = isRetryAttempt ? 4 : 5;
      const sgpaEntries = academic?.semesterSgpa || [];
      
      for (let i = 1; i <= requiredSemesters; i++) {
        const found = sgpaEntries.find(e => e.semester === i);
        if (!found || typeof found.sgpa !== "number") {
          return res.status(400).json({ 
            success: false, 
            message: `Submission requires SGPA values for Semester 1 to ${requiredSemesters}. Semester ${i} is missing.` 
          });
        }
      }
    }

    // Auto-calculate CGPA from SGPA entries
    let cgpa = 0;
    if (academic?.semesterSgpa && academic.semesterSgpa.length > 0) {
      const sum = academic.semesterSgpa.reduce((s, e) => s + (e.sgpa || 0), 0);
      cgpa = Math.round((sum / academic.semesterSgpa.length) * 100) / 100;
    }

    const payload = {
      studentId,
      personal,
      family,
      identity,
      academic: {
        ...academic,
        cgpa
      },
      documents,
      internships: internships || [],
      isRetryAttempt: !!isRetryAttempt,
      status: isDraft ? "draft" : "locked",
      submittedAt: isDraft ? null : new Date()
    };

    if (registration) {
      registration = await PlacementRegistration.findOneAndUpdate({ studentId }, payload, { new: true });
    } else {
      registration = new PlacementRegistration(payload);
      await registration.save();
    }

    res.json({ 
      success: true, 
      message: isDraft ? "Registration details saved as draft." : "Placement registration submitted and locked successfully!", 
      registration 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// B. GET REGISTRATION DETAILS
exports.getRegistration = async (req, res) => {
  try {
    let { studentId } = req.params;
    if (studentId.includes("@")) {
      const userObj = await User.findOne({ email: studentId });
      if (userObj) studentId = userObj._id;
    }
    const registration = await PlacementRegistration.findOne({ studentId }).populate("studentId", "email");
    res.json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// C. ADMIN ONLY EDIT WITH LOG ENTRIES
exports.adminEditRegistration = async (req, res) => {
  try {
    let { studentId } = req.params;
    if (studentId.includes("@")) {
      const userObj = await User.findOne({ email: studentId });
      if (userObj) studentId = userObj._id;
    }

    const registration = await PlacementRegistration.findOne({ studentId });
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    const edits = req.body; // e.g. { "academic.cgpa": 8.5, "personal.fullName": "Name" }
    const editLogEntries = [];

    // Helper to resolve nested fields and detect modifications
    const getNestedValue = (obj, path) => {
      return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    };

    const setNestedValue = (obj, path, value) => {
      const parts = path.split(".");
      const last = parts.pop();
      const target = parts.reduce((acc, part) => {
        if (!acc[part]) acc[part] = {};
        return acc[part];
      }, obj);
      target[last] = value;
    };

    for (const [field, newValue] of Object.entries(edits)) {
      const oldValue = getNestedValue(registration, field);
      if (oldValue !== newValue) {
        editLogEntries.push({
          editedBy: req.user?.email || "admin@ips.edu",
          field,
          oldValue: oldValue !== undefined ? oldValue.toString() : "",
          newValue: newValue !== undefined ? newValue.toString() : "",
          editedAt: new Date()
        });
        setNestedValue(registration, field, newValue);
      }
    }

    if (editLogEntries.length > 0) {
      registration.editLog.push(...editLogEntries);
      await registration.save();
    }

    res.json({ success: true, message: "Registration updated by admin and logged successfully.", registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// D. CREATE JOB OPPORTUNITY AND RUN AUTO-MATCHING ENGINE
exports.createJobPosting = async (req, res) => {
  try {
    const { companyName, role, type, description, eligibilityRules, applicationDeadline } = req.body;
    
    const job = new JobPosting({
      companyName,
      role,
      type,
      description,
      eligibilityRules,
      applicationDeadline
    });
    await job.save();

    // Trigger auto eligibility matching automatically on creation for every student
    await runMatchingEngine(job._id);

    res.json({ success: true, message: "Job opportunity created and auto-matching completed.", job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// E. LIST OPPORTUNITIES
exports.listJobPostings = async (req, res) => {
  try {
    const jobs = await JobPosting.find({}).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// F. RETRIEVE ALL ELIGIBILITY RESULTS FOR A POSTING
exports.getJobMatches = async (req, res) => {
  try {
    const matches = await EligibilityMatchResult.find({ jobPostingId: req.params.id })
      .populate("studentId", "email");
    res.json({ success: true, matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// G. STUDENT OPT-IN DECISION (APPLY / NO APPLY)
exports.submitStudentDecision = async (req, res) => {
  try {
    const { id } = req.params; // posting Id
    const { decision, applicationResume } = req.body; // 'applied' or 'no-apply', base64 or URL
    
    let studentId = req.user.id;

    const match = await EligibilityMatchResult.findOne({ jobPostingId: id, studentId });
    if (!match) {
      return res.status(404).json({ success: false, message: "Eligibility record not found for student." });
    }

    if (!match.isEligible) {
      return res.status(403).json({ success: false, message: "You are not eligible to apply for this job posting." });
    }

    if (decision === "applied") {
      if (!applicationResume) {
        return res.status(400).json({ success: false, message: "A resume is required to complete this application." });
      }
      // Upload raw base64 data to Cloudinary or resolve URL
      const secureUrl = await uploadBase64ResumeToCloudinary(applicationResume, studentId);
      match.applicationResumeUrl = secureUrl;
    }

    match.studentDecision = decision;
    match.decidedAt = new Date();
    await match.save();

    res.json({ success: true, message: `Successfully saved decision: ${decision}`, match });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// H. STUDENT NOT-ELIGIBLE NOTIFICATION ACKNOWLEDGE
exports.acknowledgeNotification = async (req, res) => {
  try {
    const { id } = req.params;
    let studentId = req.user.id;

    const match = await EligibilityMatchResult.findOne({ jobPostingId: id, studentId });
    if (!match) {
      return res.status(404).json({ success: false, message: "Eligibility record not found." });
    }

    match.studentDecision = "not-applicable"; // Marks as acknowledged/done
    match.decidedAt = new Date();
    await match.save();

    res.json({ success: true, message: "Notification acknowledged.", match });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// I. GENERATE REPORT AFTER DEADLINE (PDF TO CLOUDINARY UPLOADS)
exports.generatePostDeadlineReport = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobPosting.findById(id);
    if (!job) return res.status(404).json({ success: false, message: "Job opportunity not found" });

    // Fetch applied students
    const matches = await EligibilityMatchResult.find({ 
      jobPostingId: id, 
      studentDecision: "applied" 
    }).populate("studentId");

    const studentRegistrations = [];
    for (const match of matches) {
      const reg = await PlacementRegistration.findOne({ studentId: match.studentId._id });
      studentRegistrations.push({
        userEmail: match.studentId.email,
        registration: reg
      });
    }

    // Generate PDF buffer
    const pdfBuffer = await generatePdfReportBuffer(job, studentRegistrations);

    // Upload to Cloudinary using upload_stream
    const secureUrl = await uploadPdfToCloudinary(pdfBuffer, `report_${job._id}`);

    // Save AdminReport Document
    const report = new AdminReport({
      jobPostingId: id,
      pdfUrl: secureUrl,
      generatedAt: new Date()
    });
    await report.save();

    res.json({ success: true, message: "Post-deadline PDF report compiled and saved to Cloudinary.", report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper: Compile PDF using pdfkit in-memory buffer
function generatePdfReportBuffer(job, studentRegistrations) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new pdfkit({ margin: 40 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // PDF Page Header
      doc.fontSize(22).fillColor("#18181b").text("IPS ACADEMY, INDORE", { align: "center" });
      doc.fontSize(11).fillColor("#f97316").text("PLACEMENT CELL REPORT CELL", { align: "center" });
      doc.moveDown(0.5);
      
      doc.strokeColor("#e4e4e7").lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
      doc.moveDown(1);

      // Job Details Card
      doc.fontSize(12).fillColor("#27272a").text(`Company Name: ${job.companyName}`);
      doc.fontSize(10).fillColor("#52525b").text(`Role/Designation: ${job.role}`);
      doc.text(`Type: ${job.type === "internship" ? "Internship Opportunity" : "Full-Time Hiring"}`);
      doc.text(`Application Deadline: ${new Date(job.applicationDeadline).toLocaleString()}`);
      doc.text(`Total Applicants: ${studentRegistrations.length}`);
      doc.moveDown(1.5);

      // Table Header
      doc.fontSize(11).fillColor("#27272a").text("LIST OF APPLIED CANDIDATES", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(8).fillColor("#71717a").text(
        "S.No".padEnd(8) + 
        "Roll Number".padEnd(18) + 
        "Student Name".padEnd(25) + 
        "Phone Number".padEnd(16) + 
        "Branch / Dept"
      );
      doc.moveDown(0.3);
      doc.strokeColor("#f4f4f5").lineWidth(0.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(8).fillColor("#27272a");
      studentRegistrations.forEach((student, index) => {
        const reg = student.registration;
        const roll = reg?.academic?.rollNumber || "N/A";
        const name = reg?.personal?.fullName || student.userEmail;
        const phone = reg?.personal?.phone || "N/A";
        const branch = reg?.academic?.branch || "N/A";

        const line = 
          `${index + 1}`.padEnd(8) + 
          `${roll}`.padEnd(18) + 
          `${name}`.padEnd(25) + 
          `${phone}`.padEnd(16) + 
          `${branch}`;
        
        doc.text(line);
        doc.moveDown(0.3);
      });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

// Helper: Pipe PDF Buffer directly to Cloudinary upload stream
function uploadPdfToCloudinary(buffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        resource_type: "raw", 
        folder: "placement_reports",
        public_id: fileName,
        format: "pdf"
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.Readable.from(buffer).pipe(uploadStream);
  });
}

// Helper: Upload Base64 PDF to Cloudinary
async function uploadBase64ResumeToCloudinary(base64Data, studentId) {
  try {
    // If it's already an HTTPS URL, just return it
    if (base64Data.startsWith("http://") || base64Data.startsWith("https://")) {
      return base64Data;
    }
    const result = await cloudinary.uploader.upload(base64Data, {
      resource_type: "raw",
      folder: "placement_resumes",
      public_id: `resume_${studentId}_${Date.now()}`,
      format: "pdf"
    });
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary resume upload failed:", err);
    throw new Error("Failed to upload resume to Cloudinary: " + err.message);
  }
}

// Helper Matching Engine Implementation
async function runMatchingEngine(jobPostingId) {
  const job = await JobPosting.findById(jobPostingId);
  if (!job) return;

  const registrations = await PlacementRegistration.find({ status: "locked" }).populate("studentId");

  for (const reg of registrations) {
    const studentId = reg.studentId._id;
    let isEligible = true;
    const failedConditions = [];

    for (const rule of job.eligibilityRules) {
      let actualValue = null;
      
      if (rule.field === "cgpa") {
        actualValue = reg.academic.cgpa;
      } else if (rule.field === "backlogCount") {
        actualValue = reg.academic.backlogCount;
      } else if (rule.field === "tenth.percentage") {
        actualValue = reg.academic.tenth.percentage;
      } else if (rule.field === "twelfth.percentage") {
        actualValue = reg.academic.twelfth.percentage;
      } else if (rule.field === "branch") {
        actualValue = reg.academic.branch;
      } else {
        actualValue = reg.academic[rule.field];
      }

      let rulePassed = false;
      const op = rule.operator;
      const val = rule.value;

      if (op === "==") {
        rulePassed = (actualValue == val);
      } else if (op === ">=") {
        rulePassed = (actualValue >= val);
      } else if (op === "<=") {
        rulePassed = (actualValue <= val);
      } else if (op === ">") {
        rulePassed = (actualValue > val);
      } else if (op === "<") {
        rulePassed = (actualValue < val);
      } else if (op === "in") {
        const arr = Array.isArray(val) ? val : [val];
        rulePassed = arr.map(s => s.toLowerCase()).includes(actualValue?.toString().toLowerCase());
      }

      if (!rulePassed) {
        isEligible = false;
        let message = `Required ${rule.field} ${op} ${val}, but you have ${actualValue}`;
        if (op === "in") {
          message = `Required ${rule.field} in [${val.join(", ")}], but your branch is ${actualValue}`;
        }
        failedConditions.push({
          field: rule.field,
          requiredValue: val,
          actualValue,
          message
        });
      }
    }

    await EligibilityMatchResult.findOneAndUpdate(
      { studentId, jobPostingId },
      {
        isEligible,
        failedConditions,
        studentDecision: isEligible ? "pending" : "not-applicable"
      },
      { upsert: true, new: true }
    );
  }
}
