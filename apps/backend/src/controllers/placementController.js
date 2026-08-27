const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const PlacementRegistration = require("../models/PlacementRegistration");
const JobPosting = require("../models/JobPosting");
const EligibilityMatchResult = require("../models/EligibilityMatchResult");
const AdminReport = require("../models/AdminReport");
const pdfkit = require("pdfkit");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const stream = require("stream");

// Cloudinary config binding
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Helper: Calculate Education Gaps
const calculateEducationGaps = (academic) => {
  const tenthYear = parseInt(academic?.tenth?.year);
  const twelfthYear = parseInt(academic?.twelfth?.year);
  const gradStartYear = parseInt(academic?.graduation?.startYear);
  
  let tenthToTwelfthGap = 0;
  let twelfthToGraduationGap = 0;
  
  if (tenthYear && twelfthYear) {
    tenthToTwelfthGap = Math.max(0, twelfthYear - tenthYear - 2);
  }
  if (twelfthYear && gradStartYear) {
    twelfthToGraduationGap = Math.max(0, gradStartYear - twelfthYear);
  }
  const overallEducationGap = tenthToTwelfthGap + twelfthToGraduationGap;

  return {
    tenthToTwelfthGap,
    twelfthToGraduationGap,
    overallEducationGap
  };
};

// Helper: Calculate CGPA
const calculateCgpa = (sgpaEntries, isRetryAttempt) => {
  if (!sgpaEntries || sgpaEntries.length === 0) return 0;
  const maxSemesters = isRetryAttempt ? 4 : 5;
  const filtered = sgpaEntries.filter(e => e.semester >= 1 && e.semester <= maxSemesters && typeof e.sgpa === "number");
  if (filtered.length === 0) return 0;
  const sum = filtered.reduce((acc, curr) => acc + curr.sgpa, 0);
  return Math.round((sum / filtered.length) * 100) / 100;
};

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
    const { isRetryAttempt, personal, family, identity, academic, documents, isDraft } = req.body;

    // Timing Window: Semesters 6, 7, and 8 are allowed. Sem <= 5 is too early. Sem > 8 is too late (4th year ends).
    if (sem <= 5) {
      return res.status(403).json({ 
        success: false, 
        message: `Placement registration is not available. It becomes available strictly in Semesters 6, 7, and 8. Your current semester is ${sem}.` 
      });
    }

    if (sem > 8) {
      return res.status(403).json({ 
        success: false, 
        message: `Placement registration is completely blocked. Submissions are not allowed after Semester 8. Your current semester is ${sem}.` 
      });
    }

    // Check existing registration locking
    let registration = await PlacementRegistration.findOne({ studentId });
    if (registration && registration.status === "locked") {
      return res.status(403).json({ success: false, message: "Registration has already been submitted and locked." });
    }

    // Verify SGPAs and documents if submitting (not draft)
    if (!isDraft) {
      const requiredSemesters = isRetryAttempt ? 4 : 5;
      const sgpaEntries = academic?.semesterSgpa || [];
      
      for (let i = 1; i <= requiredSemesters; i++) {
        const found = sgpaEntries.find(e => e.semester === i);
        if (!found || typeof found.sgpa !== "number" || isNaN(found.sgpa)) {
          return res.status(400).json({ 
            success: false, 
            message: `Submission requires valid SGPA values for Semester 1 to ${requiredSemesters}. Semester ${i} is missing.` 
          });
        }
      }

      if (!identity?.photoUrl) {
        return res.status(400).json({ success: false, message: "Identity photo upload is required to submit." });
      }
      if (!documents?.resumeUrl || !documents?.tenthMarksheetUrl || !documents?.twelfthMarksheetUrl) {
        return res.status(400).json({ success: false, message: "Resume, 10th marksheet, and 12th marksheet uploads are required to submit." });
      }

      // Detailed Section validations
      const current = personal?.currentAddress;
      const permanent = personal?.permanentAddress;
      if (!current?.addressLine || !current?.city || !current?.state || !current?.pincode) {
        return res.status(400).json({ success: false, message: "Current address line, city, state, and pincode are required." });
      }
      if (!permanent?.addressLine || !permanent?.city || !permanent?.state || !permanent?.pincode) {
        return res.status(400).json({ success: false, message: "Permanent address line, city, state, and pincode are required." });
      }

      if (!academic?.tenth?.schoolName || !academic?.twelfth?.schoolName) {
        return res.status(400).json({ success: false, message: "10th and 12th school names are required." });
      }

      if (!family?.fatherName || !family?.fatherContact || !family?.motherName || !family?.motherContact) {
        return res.status(400).json({ success: false, message: "Family details including contact numbers are required." });
      }
    }

    // Server-side derived data calculations
    const derivedCgpa = calculateCgpa(academic?.semesterSgpa, !!isRetryAttempt);
    const gaps = calculateEducationGaps(academic);

    const payload = {
      studentId,
      personal,
      family,
      identity: {
        apaarId: identity?.apaarId || "",
        photoUrl: identity?.photoUrl || ""
      },
      academic: {
        ...academic,
        cgpa: derivedCgpa,
        tenthToTwelfthGap: gaps.tenthToTwelfthGap,
        twelfthToGraduationGap: gaps.twelfthToGraduationGap,
        overallEducationGap: gaps.overallEducationGap
      },
      documents,
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

    const edits = req.body; // e.g. { "academic.backlogCount": 1, "personal.fullName": "Name" }
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
      // Re-calculate derived CGPA and gaps if academic details were edited
      const academicUpdated = editLogEntries.some(e => e.field.startsWith("academic."));
      if (academicUpdated) {
        registration.academic.cgpa = calculateCgpa(registration.academic.semesterSgpa, registration.isRetryAttempt);
        const gaps = calculateEducationGaps(registration.academic);
        registration.academic.tenthToTwelfthGap = gaps.tenthToTwelfthGap;
        registration.academic.twelfthToGraduationGap = gaps.twelfthToGraduationGap;
        registration.academic.overallEducationGap = gaps.overallEducationGap;
      }

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

    // Trigger auto eligibility matching automatically on creation for every student with locked registration
    await runMatchingEngine(job._id);

    res.json({ success: true, message: "Job opportunity created and auto-matching completed.", job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// E. LIST OPPORTUNITIES
exports.listJobPostings = async (req, res) => {
  try {
    // If student query parameter is present, return matches with status details
    const { studentEmail } = req.query;
    if (studentEmail) {
      const user = await User.findOne({ email: studentEmail });
      if (user) {
        const matches = await EligibilityMatchResult.find({ studentId: user._id }).populate("jobPostingId");
        return res.json({ success: true, jobs: matches });
      }
    }

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
    const { decision, applicationResume, studentEmail } = req.body; // 'applied' or 'no-apply'
    
    let studentId = req.user.id;
    if (studentEmail && req.user.role === "admin") {
      const userObj = await User.findOne({ email: studentEmail });
      if (userObj) studentId = userObj._id;
    }

    const job = await JobPosting.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job opportunity not found." });
    }

    // Verify Deadline has not passed
    if (new Date() > new Date(job.applicationDeadline)) {
      return res.status(403).json({ success: false, message: "The application deadline for this job posting has passed." });
    }

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
    const { studentEmail } = req.body;
    let studentId = req.user.id;

    if (studentEmail && req.user.role === "admin") {
      const userObj = await User.findOne({ email: studentEmail });
      if (userObj) studentId = userObj._id;
    }

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

    // Prevent duplicate report generation
    const reportExists = await AdminReport.findOne({ jobPostingId: id });
    if (reportExists) {
      return res.json({ success: true, message: "Report already generated.", report: reportExists });
    }

    // Fetch applied students
    const matches = await EligibilityMatchResult.find({ 
      jobPostingId: id, 
      studentDecision: "applied" 
    }).populate("studentId");

    const studentRegistrations = [];
    const studentIds = [];
    
    for (const match of matches) {
      const reg = await PlacementRegistration.findOne({ studentId: match.studentId._id });
      if (reg) {
        studentRegistrations.push({
          userEmail: match.studentId.email,
          registration: reg
        });
        studentIds.push(match.studentId._id);
      }
    }

    // Generate PDF buffer
    const pdfBuffer = await generatePdfReportBuffer(job, studentRegistrations);

    // Upload to Cloudinary or fallback to local storage
    const secureUrl = await uploadPdfToCloudinary(pdfBuffer, `report_${job._id}`);

    // Save AdminReport Document
    const report = new AdminReport({
      jobPostingId: id,
      pdfUrl: secureUrl,
      studentIds,
      generatedAt: new Date()
    });
    await report.save();

    res.json({ success: true, message: "Post-deadline PDF report compiled successfully.", report });
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
      doc.fontSize(11).fillColor("#0f766e").text("PLACEMENT CELL REPORT CELL", { align: "center" });
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

// Helper: Pipe PDF Buffer directly to Cloudinary or write locally as fallback
function uploadPdfToCloudinary(buffer, fileName) {
  return new Promise((resolve, reject) => {
    if (hasCloudinary) {
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
    } else {
      // Local fallback
      try {
        const dir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, `${fileName}.pdf`);
        fs.writeFileSync(filePath, buffer);
        resolve(`http://localhost:5000/uploads/${fileName}.pdf`);
      } catch (err) {
        reject(err);
      }
    }
  });
}

// Helper: Upload Base64 PDF to Cloudinary or write locally as fallback
async function uploadBase64ResumeToCloudinary(base64Data, studentId) {
  try {
    if (base64Data.startsWith("http://") || base64Data.startsWith("https://")) {
      return base64Data;
    }
    
    if (hasCloudinary) {
      const result = await cloudinary.uploader.upload(base64Data, {
        resource_type: "raw",
        folder: "placement_resumes",
        public_id: `resume_${studentId}_${Date.now()}`,
        format: "pdf"
      });
      return result.secure_url;
    } else {
      // Local fallback
      const base64Content = base64Data.replace(/^data:application\/pdf;base64,/, "").replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      const buffer = Buffer.from(base64Content, "base64");
      const dir = path.join(process.cwd(), "public/uploads");
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const fileName = `resume_${studentId}_${Date.now()}.pdf`;
      const filePath = path.join(dir, fileName);
      fs.writeFileSync(filePath, buffer);
      return `http://localhost:5000/uploads/${fileName}`;
    }
  } catch (err) {
    console.error("Cloudinary/Local resume upload failed:", err);
    throw new Error("Failed to upload resume: " + err.message);
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
      } else if (rule.field === "tenthPercentage" || rule.field === "tenth.percentage") {
        actualValue = reg.academic.tenth.percentage;
      } else if (rule.field === "twelfthPercentage" || rule.field === "twelfth.percentage") {
        actualValue = reg.academic.twelfth.percentage;
      } else if (rule.field === "branch") {
        actualValue = reg.academic.branch;
      } else if (rule.field === "twelfthToGraduationGap") {
        actualValue = reg.academic.twelfthToGraduationGap;
      } else if (rule.field === "tenthToTwelfthGap") {
        actualValue = reg.academic.tenthToTwelfthGap;
      } else if (rule.field === "overallEducationGap") {
        actualValue = reg.academic.overallEducationGap;
      } else {
        // Resolve nested path safely
        const parts = rule.field.split(".");
        actualValue = parts.reduce((acc, part) => acc && acc[part], reg.academic);
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
        rulePassed = arr.map(s => s.toLowerCase().trim()).includes(actualValue?.toString().toLowerCase().trim());
      }

      if (!rulePassed) {
        isEligible = false;
        let message = `Required ${rule.field} ${op} ${val}, but actual value is ${actualValue !== undefined ? actualValue : "N/A"}`;
        if (op === "in") {
          const list = Array.isArray(val) ? val.join(", ") : val;
          message = `Required ${rule.field} in [${list}], but actual value is ${actualValue !== undefined ? actualValue : "N/A"}`;
        }
        failedConditions.push({
          field: rule.field,
          requiredValue: val,
          actualValue: actualValue !== undefined ? actualValue : null,
          message
        });
      }
    }

    // Fetch existing match to prevent duplicate creations
    const existingMatch = await EligibilityMatchResult.findOne({ studentId, jobPostingId });
    
    // Ineligible students are forced to 'not-applicable', eligible are 'pending'
    const studentDecision = isEligible ? (existingMatch?.studentDecision === "applied" || existingMatch?.studentDecision === "no-apply" ? existingMatch.studentDecision : "pending") : "not-applicable";

    await EligibilityMatchResult.findOneAndUpdate(
      { studentId, jobPostingId },
      {
        isEligible,
        failedConditions,
        studentDecision
      },
      { upsert: true, new: true }
    );
  }
}

exports.runMatchingEngineEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    await runMatchingEngine(id);
    res.json({ success: true, message: "Matching engine executed successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
