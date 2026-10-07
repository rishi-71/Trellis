const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const PlacementRegistration = require("../models/PlacementRegistration");
const JobPosting = require("../models/JobPosting");
const EligibilityMatchResult = require("../models/EligibilityMatchResult");
const AdminReport = require("../models/AdminReport");
const Notification = require("../models/Notification");
const PlacementBroadcast = require("../models/PlacementBroadcast");
const PlacementActivity = require("../models/PlacementActivity");
const { dispatchNotification } = require("./notificationController");
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
  const filtered = sgpaEntries.filter(e => e.semester >= 1 && e.semester <= 8 && typeof e.sgpa === "number" && e.sgpa > 0);
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
      if (!documents?.resumeUrl) {
        return res.status(400).json({ success: false, message: "Resume upload is required to submit." });
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

    if (!isDraft) {
      try {
        const activeJobs = await JobPosting.find({
          $or: [
            { applicationDeadline: { $gte: new Date() } },
            { applicationDeadline: null }
          ]
        });
        for (const j of activeJobs) {
          await runMatchingEngine(j._id);
        }

        // Log student activity for faculty feed
        await PlacementActivity.create({
          type: "profile_locked",
          actorName: registration.personal?.fullName || "Student",
          actorEmail: registration.personal?.email || userObj?.email || "",
          rollNumber: registration.academic?.rollNumber || "",
          branch: registration.academic?.branch || "",
          message: `${registration.personal?.fullName || "Student"} (${registration.academic?.rollNumber || "N/A"}) completed & locked their placement profile.`
        });
      } catch (matchErr) {
        console.error("Auto match / activity log on lock failed:", matchErr);
      }
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

// B2. LIST ALL REGISTERED CANDIDATES FOR FACULTY / ADMIN / PLACEMENT HEAD
exports.listAllRegistrations = async (req, res) => {
  try {
    const registrations = await PlacementRegistration.find({})
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, registrations });
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

      // Notify student about administrative changes to profile
      await dispatchNotification({
        recipientRole: "student",
        recipientId: registration.studentId,
        source: req.user?.role === "faculty" ? "faculty" : "system",
        sentBy: req.user?.id || null,
        type: "eligibility_alert",
        message: `Your placement profile was updated by the Placement Cell / Admin (${editLogEntries.length} field(s) revised).`
      });
    }

    res.json({ success: true, message: "Registration updated by admin and logged successfully.", registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// C2. STUDENT UPDATE: ONLY RESUME AND SEMESTER CGPA CAN BE UPDATED BY STUDENT
exports.updateStudentResumeAndCgpa = async (req, res) => {
  try {
    let studentId = req.params.studentId || req.user.id;
    if (studentId.includes("@")) {
      const userObj = await User.findOne({ email: studentId });
      if (userObj) studentId = userObj._id;
    }

    const registration = await PlacementRegistration.findOne({ studentId });
    if (!registration) {
      return res.status(404).json({ success: false, message: "Placement registration record not found." });
    }

    const { semesterSgpa, resumeUrl } = req.body;

    // 1. Update resume if provided
    if (resumeUrl && typeof resumeUrl === "string") {
      let finalResumeUrl = resumeUrl;
      if (resumeUrl.startsWith("data:")) {
        finalResumeUrl = await uploadBase64ResumeToCloudinary(resumeUrl, studentId);
      }
      if (!registration.documents) registration.documents = {};
      registration.documents.resumeUrl = finalResumeUrl;
    }

    // 2. Update semesterSgpa and recalculate CGPA if provided
    if (Array.isArray(semesterSgpa) && semesterSgpa.length > 0) {
      if (!registration.academic) registration.academic = {};
      registration.academic.semesterSgpa = semesterSgpa.map((item) => ({
        semester: Number(item.semester),
        sgpa: Number(item.sgpa)
      }));

      // Automatically recalculate cumulative CGPA
      registration.academic.cgpa = calculateCgpa(
        registration.academic.semesterSgpa,
        !!registration.isRetryAttempt
      );
    }

    await registration.save();

    // Re-run matching engine for active drives so newly eligible drives match
    try {
      const activeJobs = await JobPosting.find({
        $or: [
          { applicationDeadline: { $gte: new Date() } },
          { applicationDeadline: null }
        ]
      });
      for (const j of activeJobs) {
        await runMatchingEngine(j._id);
      }

      // Log student profile update activity
      await PlacementActivity.create({
        type: "profile_updated",
        actorName: registration.personal?.fullName || "Student",
        actorEmail: registration.personal?.email || "",
        rollNumber: registration.academic?.rollNumber || "",
        branch: registration.academic?.branch || "",
        message: `${registration.personal?.fullName || "Student"} updated Resume & Semester CGPA (Current CGPA: ${registration.academic?.cgpa?.toFixed(2)}).`
      });
    } catch (matchErr) {
      console.error("Auto match on student profile update failed:", matchErr);
    }

    res.json({
      success: true,
      message: "Resume & Semester CGPA updated successfully!",
      registration
    });
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
    await runMatchingEngine(job._id, req.user?.id, req.user?.role);

    res.json({ success: true, message: "Job opportunity created and auto-matching completed.", job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// D2. UPDATE JOB OPPORTUNITY (Faculty / Placement Head)
exports.updateJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, role, type, description, eligibilityRules, applicationDeadline } = req.body;
    
    const job = await JobPosting.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job opportunity not found." });
    }

    if (companyName) job.companyName = companyName;
    if (role) job.role = role;
    if (type) job.type = type;
    if (description !== undefined) job.description = description;
    if (eligibilityRules) job.eligibilityRules = eligibilityRules;
    if (applicationDeadline) job.applicationDeadline = applicationDeadline;

    await job.save();

    // Re-run matching engine automatically so new/updated rules immediately re-evaluate students and send notifications
    await runMatchingEngine(job._id, req.user?.id, req.user?.role);

    res.json({ success: true, message: "Job opportunity updated and eligibility re-matched successfully!", job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// D3. DELETE JOB OPPORTUNITY
exports.deleteJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobPosting.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job opportunity not found." });
    }
    await EligibilityMatchResult.deleteMany({ jobPostingId: id });
    await Notification.deleteMany({ jobPostingId: id });
    res.json({ success: true, message: "Job posting deleted successfully." });
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
      let finalResume = match.applicationResumeUrl || applicationResume;
      if (!finalResume) {
        const studentReg = await PlacementRegistration.findOne({ studentId });
        finalResume = studentReg?.documents?.resumeUrl;
      }
      if (!finalResume) {
        return res.status(400).json({ success: false, message: "A resume is required to complete this application." });
      }
      if (finalResume.startsWith("data:")) {
        const secureUrl = await uploadBase64ResumeToCloudinary(finalResume, studentId);
        match.applicationResumeUrl = secureUrl;
      } else {
        match.applicationResumeUrl = finalResume;
      }
    }

    match.studentDecision = decision;
    match.decidedAt = new Date();
    await match.save();

    if (decision === "applied") {
      await dispatchNotification({
        recipientRole: "student",
        recipientId: studentId,
        source: "system",
        type: "application_status",
        jobPostingId: job._id,
        message: `Application Confirmed: You have successfully applied for ${job.companyName} (${job.role}). Your profile & resume are submitted to the placement cell.`
      });

      try {
        const studentUser = await User.findById(studentId);
        const studentReg = await PlacementRegistration.findOne({ studentId });
        await PlacementActivity.create({
          type: "job_applied",
          actorName: studentReg?.personal?.fullName || studentUser?.name || "Student",
          actorEmail: studentUser?.email || "",
          rollNumber: studentReg?.academic?.rollNumber || "",
          branch: studentReg?.academic?.branch || "",
          jobPostingId: job._id,
          companyName: job.companyName,
          message: `${studentReg?.personal?.fullName || studentUser?.name || "Candidate"} applied for ${job.companyName} (${job.role}).`
        });
      } catch (actErr) {
        console.error("Activity logging on apply failed:", actErr);
      }
    }

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

// H2. ATTACH / UPDATE COMPANY-SPECIFIC RESUME (Without modifying master profile)
exports.attachDriveSpecificResume = async (req, res) => {
  try {
    const { id } = req.params; // jobPostingId
    const { resumeUrl } = req.body;
    let studentId = req.user.id;

    if (!resumeUrl) {
      return res.status(400).json({ success: false, message: "Resume data is required." });
    }

    const job = await JobPosting.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job opportunity not found." });
    }

    // Upload base64 resume or resolve URL
    const secureUrl = await uploadBase64ResumeToCloudinary(resumeUrl, studentId);

    // Find or create eligibility match record for this specific company
    let match = await EligibilityMatchResult.findOne({ jobPostingId: id, studentId });
    if (!match) {
      match = new EligibilityMatchResult({
        jobPostingId: id,
        studentId,
        isEligible: true,
        failedConditions: [],
        studentDecision: "pending",
        applicationResumeUrl: secureUrl
      });
    } else {
      match.applicationResumeUrl = secureUrl;
    }
    await match.save();

    res.json({
      success: true,
      message: `Custom tailored resume for ${job.companyName} attached successfully!`,
      applicationResumeUrl: secureUrl,
      jobPostingId: id
    });
  } catch (err) {
    console.error("Error attaching company-specific resume:", err);
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
    const studentIds = [];
    
    for (const match of matches) {
      if (!match.studentId) continue;
      const sId = match.studentId._id || match.studentId;
      const reg = await PlacementRegistration.findOne({ studentId: sId });
      if (reg) {
        studentRegistrations.push({
          userEmail: match.studentId.email || "N/A",
          registration: reg
        });
        studentIds.push(sId);
      } else {
        studentRegistrations.push({
          userEmail: match.studentId.email || "N/A",
          registration: {
            personal: {
              fullName: match.studentId.name || (match.studentId.email ? match.studentId.email.split("@")[0] : "Student"),
              email: match.studentId.email || "N/A",
              phone: match.studentId.phone || "N/A"
            },
            academic: {
              rollNumber: match.studentId.enrollmentNumber || "N/A",
              branch: match.studentId.branch || "N/A",
              cgpa: "N/A"
            }
          }
        });
        studentIds.push(sId);
      }
    }

    // Generate fresh PDF buffer with updated tabular layout
    const pdfBuffer = await generatePdfReportBuffer(job, studentRegistrations);

    // Upload to Cloudinary or fallback to local storage
    const secureUrl = await uploadPdfToCloudinary(pdfBuffer, `report_${job._id}`);

    // Save or update AdminReport Document
    let report = await AdminReport.findOne({ jobPostingId: id });
    if (report) {
      report.pdfUrl = secureUrl;
      report.studentIds = studentIds;
      report.generatedAt = new Date();
      await report.save();
    } else {
      report = new AdminReport({
        jobPostingId: id,
        pdfUrl: secureUrl,
        studentIds,
        generatedAt: new Date()
      });
      await report.save();
    }

    res.json({ success: true, message: "Post-deadline PDF report compiled successfully.", report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper: Compile PDF with proper table grid, rows, and columns
function generatePdfReportBuffer(job, studentRegistrations) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new pdfkit({ margin: 40, size: "A4", autoFirstPage: true });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const leftMargin = 40;
      const contentWidth = 515;

      // 1. Institution Header Banner
      doc.rect(leftMargin, 35, contentWidth, 54).fillAndStroke("#f0fdf4", "#bbf7d0");
      doc.fillColor("#065f46").font("Helvetica-Bold").fontSize(18).text("IPS ACADEMY, INDORE", leftMargin, 43, { width: contentWidth, align: "center" });
      doc.fillColor("#047857").font("Helvetica-Bold").fontSize(9).text("CENTRAL TRAINING & PLACEMENT CELL", leftMargin, 64, { width: contentWidth, align: "center", characterSpacing: 1.5 });
      doc.fillColor("#64748b").font("Helvetica").fontSize(7.5).text(`Official Drive Report • Generated: ${new Date().toLocaleString()}`, leftMargin, 76, { width: contentWidth, align: "center" });

      // 2. Drive Details Summary Box
      let currentY = 100;
      doc.rect(leftMargin, currentY, contentWidth, 70).fillAndStroke("#f8fafc", "#e2e8f0");

      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(9);
      doc.text("Company:", leftMargin + 14, currentY + 12);
      doc.font("Helvetica").text(job.companyName, leftMargin + 72, currentY + 12);

      doc.font("Helvetica-Bold").text("Role / Post:", leftMargin + 260, currentY + 12);
      doc.font("Helvetica").text(job.role, leftMargin + 325, currentY + 12);

      doc.font("Helvetica-Bold").text("Job Type:", leftMargin + 14, currentY + 30);
      doc.font("Helvetica").text(job.type === "internship" ? "Internship" : "Full-Time Hiring", leftMargin + 72, currentY + 30);

      doc.font("Helvetica-Bold").text("Deadline:", leftMargin + 260, currentY + 30);
      doc.font("Helvetica").text(new Date(job.applicationDeadline).toLocaleString(), leftMargin + 325, currentY + 30);

      doc.font("Helvetica-Bold").text("Total Applied Candidates:", leftMargin + 14, currentY + 48);
      doc.fillColor("#047857").font("Helvetica-Bold").fontSize(10).text(`${studentRegistrations.length}`, leftMargin + 145, currentY + 47);

      currentY += 86;

      // 3. Section Title
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(11).text("LIST OF SHORTLISTED / APPLIED APPLICANTS", leftMargin, currentY);
      doc.fillColor("#64748b").font("Helvetica").fontSize(8).text("Candidate data verified via student locked placement profile records.", leftMargin, currentY + 14);

      currentY += 28;

      // 4. Tabular Grid Definition
      const columns = [
        { title: "S.No", width: 32, align: "center" },
        { title: "Roll No", width: 75, align: "left" },
        { title: "Student Name", width: 110, align: "left" },
        { title: "Phone No", width: 80, align: "left" },
        { title: "Email Address", width: 118, align: "left" },
        { title: "Branch", width: 50, align: "center" },
        { title: "CGPA", width: 50, align: "center" }
      ];

      const headerHeight = 22;
      const rowHeight = 20;

      const drawTableHeader = (yPos) => {
        let x = leftMargin;
        doc.lineWidth(0.5);
        columns.forEach((col) => {
          // Cell background
          doc.rect(x, yPos, col.width, headerHeight).fillAndStroke("#0f766e", "#0d5f58");
          // Header Text
          doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8).text(
            col.title,
            x + 3,
            yPos + 6,
            { width: col.width - 6, align: col.align }
          );
          x += col.width;
        });
      };

      // Draw initial table header
      drawTableHeader(currentY);
      currentY += headerHeight;

      if (studentRegistrations.length === 0) {
        doc.rect(leftMargin, currentY, contentWidth, 32).fillAndStroke("#ffffff", "#e2e8f0");
        doc.fillColor("#64748b").font("Helvetica-Oblique").fontSize(9).text(
          "No candidates have applied for this placement drive yet.",
          leftMargin,
          currentY + 10,
          { width: contentWidth, align: "center" }
        );
        currentY += 32;
      } else {
        studentRegistrations.forEach((student, index) => {
          // Check for page overflow
          if (currentY + rowHeight > pageHeight - 80) {
            doc.addPage();
            currentY = 40;
            drawTableHeader(currentY);
            currentY += headerHeight;
          }

          const reg = student.registration;
          const roll = reg?.academic?.rollNumber || "N/A";
          const name = reg?.personal?.fullName || "Student";
          const phone = reg?.personal?.phone || "N/A";
          const email = reg?.personal?.email || student.userEmail || "N/A";
          const branch = (reg?.academic?.branch || "N/A").toUpperCase();
          const cgpa = typeof reg?.academic?.cgpa === "number" ? reg.academic.cgpa.toFixed(2) : (reg?.academic?.cgpa || "N/A");

          const rowData = [
            (index + 1).toString(),
            roll,
            name,
            phone,
            email,
            branch,
            cgpa
          ];

          const isEven = index % 2 === 0;
          const rowBg = isEven ? "#ffffff" : "#f8fafc";

          let x = leftMargin;
          doc.lineWidth(0.5);
          rowData.forEach((val, cIdx) => {
            const col = columns[cIdx];
            doc.rect(x, currentY, col.width, rowHeight).fillAndStroke(rowBg, "#e2e8f0");
            doc.fillColor("#1e293b").font("Helvetica").fontSize(7.5).text(
              val,
              x + 3,
              currentY + 6,
              { width: col.width - 6, align: col.align, ellipsis: true }
            );
            x += col.width;
          });

          currentY += rowHeight;
        });
      }

      // 5. Signatures Block at Bottom
      const sigY = Math.min(pageHeight - 90, currentY + 30);
      if (sigY + 50 <= pageHeight - 40) {
        doc.lineWidth(0.5).strokeColor("#cbd5e1");
        doc.moveTo(leftMargin + 30, sigY + 30).lineTo(leftMargin + 180, sigY + 30).stroke();
        doc.moveTo(contentWidth - 140, sigY + 30).lineTo(contentWidth + leftMargin, sigY + 30).stroke();

        doc.fillColor("#475569").font("Helvetica-Bold").fontSize(8);
        doc.text("Faculty Placement Coordinator", leftMargin + 30, sigY + 35);
        doc.text("Head, Training & Placement Cell", contentWidth - 140, sigY + 35);
      }

      // Page footer
      doc.fillColor("#94a3b8").font("Helvetica").fontSize(7).text(
        "CONFIDENTIAL • Generated exclusively for IPS Academy Placement Cell recruitment records.",
        leftMargin,
        pageHeight - 25,
        { width: contentWidth, align: "center" }
      );

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

// Helper: Pipe PDF Buffer directly to Cloudinary or write locally as fallback
function uploadPdfToCloudinary(buffer, fileName) {
  return new Promise((resolve, reject) => {
    const saveLocally = () => {
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
    };

    if (hasCloudinary) {
      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            resource_type: "raw", 
            folder: "placement_reports",
            public_id: fileName
          },
          (error, result) => {
            if (error || !result?.secure_url) {
              console.warn("Cloudinary upload failed, fallback to local storage:", error?.message);
              saveLocally();
            } else {
              resolve(result.secure_url);
            }
          }
        );
        stream.Readable.from(buffer).pipe(uploadStream);
      } catch (e) {
        console.warn("Cloudinary stream error, fallback to local storage:", e.message);
        saveLocally();
      }
    } else {
      saveLocally();
    }
  });
}

// Helper: Upload Base64 PDF to Cloudinary or write locally as fallback
async function uploadBase64ResumeToCloudinary(base64Data, studentId) {
  try {
    if (base64Data.startsWith("http://") || base64Data.startsWith("https://")) {
      return base64Data;
    }
    
    const saveLocally = () => {
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
    };

    if (hasCloudinary) {
      try {
        const result = await cloudinary.uploader.upload(base64Data, {
          resource_type: "raw",
          folder: "placement_resumes",
          public_id: `resume_${studentId}_${Date.now()}`
        });
        return result.secure_url;
      } catch (err) {
        console.warn("Cloudinary resume upload failed, using local fallback:", err.message);
        return saveLocally();
      }
    } else {
      return saveLocally();
    }
  } catch (err) {
    console.error("Resume upload failed:", err);
    throw new Error("Failed to upload resume: " + err.message);
  }
}

// Helper Matching Engine Implementation
async function runMatchingEngine(jobPostingId, senderId = null, senderRole = "system") {
  const job = await JobPosting.findById(jobPostingId);
  if (!job) return;

  const students = await User.find({ role: "student" });

  for (const student of students) {
    const studentId = student._id;
    const studentProfile = await StudentProfile.findOne({ user: studentId });
    const reg = await PlacementRegistration.findOne({ studentId });

    if (!studentProfile && !reg) continue;

    if (reg && reg.academic && (!reg.academic.cgpa || reg.academic.cgpa === 0) && studentProfile?.cgpa) {
      reg.academic.cgpa = studentProfile.cgpa;
      await reg.save();
    }

    let isEligible = true;
    const failedConditions = [];

    for (const rule of job.eligibilityRules) {
      let actualValue = null;
      const cleanField = rule.field.startsWith("academic.") ? rule.field.replace("academic.", "") : rule.field;

      if (cleanField === "cgpa") {
        actualValue = (reg?.academic?.cgpa !== undefined && reg.academic.cgpa > 0)
          ? reg.academic.cgpa 
          : (studentProfile?.cgpa !== undefined ? studentProfile.cgpa : 0);
      } else if (cleanField === "backlogCount") {
        actualValue = reg?.academic?.backlogCount !== undefined 
          ? reg.academic.backlogCount 
          : (studentProfile?.backlogs !== undefined ? studentProfile.backlogs : 0);
      } else if (cleanField === "tenthPercentage" || cleanField === "tenth.percentage") {
        actualValue = reg?.academic?.tenth?.percentage;
      } else if (cleanField === "twelfthPercentage" || cleanField === "twelfth.percentage") {
        actualValue = reg?.academic?.twelfth?.percentage;
      } else if (cleanField === "branch") {
        actualValue = reg?.academic?.branch || studentProfile?.branch;
      } else if (cleanField === "twelfthToGraduationGap") {
        actualValue = reg?.academic?.twelfthToGraduationGap;
      } else if (cleanField === "tenthToTwelfthGap") {
        actualValue = reg?.academic?.tenthToTwelfthGap;
      } else if (cleanField === "overallEducationGap") {
        actualValue = reg?.academic?.overallEducationGap;
      } else {
        // Resolve nested path safely
        const parts = cleanField.split(".");
        actualValue = parts.reduce((acc, part) => acc && acc[part], reg?.academic);
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

    // Send active drive notification to registered candidate
    try {
      const existingNotif = await Notification.findOne({
        recipientId: studentId,
        jobPostingId: job._id
      });

      if (!existingNotif) {
        const deadlineStr = job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : "Open";
        const eligibilitySummary = isEligible
          ? "You meet all eligibility criteria! Apply with your profile or updated resume."
          : "Drive is currently active. Review eligibility criteria and guidelines.";

        await dispatchNotification({
          recipientRole: "student",
          recipientId: studentId,
          source: "system",
          sentBy: senderId || null,
          type: "placement_drive",
          title: `Campus Drive: ${job.companyName} (${job.role})`,
          jobPostingId: job._id,
          message: `Active Campus Drive: ${job.companyName} is hiring for ${job.role}. Application Deadline: ${deadlineStr}. ${eligibilitySummary}`
        });
      }
    } catch (notifErr) {
      console.error("Error creating auto notification for student:", studentId, notifErr);
    }
  }
}

exports.runMatchingEngineEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    await runMatchingEngine(id, req.user?.id, req.user?.role);
    res.json({ success: true, message: "Matching engine executed successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// I. FACULTY SEND BROADCAST / SHORTLIST ANNOUNCEMENT
exports.sendPlacementBroadcast = async (req, res) => {
  try {
    const {
      title,
      message,
      broadcastType = "general",
      targetType = "all_registered",
      jobPostingId,
      selectedStudentIds = []
    } = req.body;
    const senderId = req.user.id;
    const senderEmail = req.user.email;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message content are required." });
    }

    let targetStudents = [];
    let jobObj = null;
    if (jobPostingId) {
      jobObj = await JobPosting.findById(jobPostingId);
    }

    if (targetType === "all_registered") {
      const registrations = await PlacementRegistration.find({ status: "locked" }).populate("studentId");
      targetStudents = registrations.map((r) => ({
        studentId: r.studentId?._id || r.studentId,
        fullName: r.personal?.fullName || "Student",
        rollNumber: r.academic?.rollNumber || ""
      })).filter((s) => !!s.studentId);
    } else if (targetType === "drive_candidates" && jobPostingId) {
      const matches = await EligibilityMatchResult.find({ jobPostingId, isEligible: true });
      for (const m of matches) {
        const reg = await PlacementRegistration.findOne({ studentId: m.studentId });
        targetStudents.push({
          studentId: m.studentId,
          fullName: reg?.personal?.fullName || "Candidate",
          rollNumber: reg?.academic?.rollNumber || ""
        });
      }
    } else if (targetType === "selected_students" && Array.isArray(selectedStudentIds) && selectedStudentIds.length > 0) {
      for (const sId of selectedStudentIds) {
        let userObjectId = sId;
        if (typeof sId === "string" && sId.includes("@")) {
          const u = await User.findOne({ email: sId });
          if (u) userObjectId = u._id;
        }
        const reg = await PlacementRegistration.findOne({ studentId: userObjectId });
        targetStudents.push({
          studentId: userObjectId,
          fullName: reg?.personal?.fullName || "Student",
          rollNumber: reg?.academic?.rollNumber || ""
        });
      }
    } else {
      const registrations = await PlacementRegistration.find({ status: "locked" }).populate("studentId");
      targetStudents = registrations.map((r) => ({
        studentId: r.studentId?._id || r.studentId,
        fullName: r.personal?.fullName || "Student",
        rollNumber: r.academic?.rollNumber || ""
      })).filter((s) => !!s.studentId);
    }

    // Deduplicate target students by ID
    const uniqueMap = new Map();
    for (const s of targetStudents) {
      if (s.studentId) uniqueMap.set(s.studentId.toString(), s);
    }
    const finalRecipients = Array.from(uniqueMap.values());

    const notifType = broadcastType === "shortlist" ? "shortlist_announcement" : "custom_alert";
    const formattedMessage = `[${title.toUpperCase()}]\n${message}`;

    for (const recipient of finalRecipients) {
      await dispatchNotification({
        recipientRole: "student",
        recipientId: recipient.studentId,
        source: "faculty",
        sentBy: senderId,
        type: notifType,
        jobPostingId: jobPostingId || null,
        message: formattedMessage
      });
    }

    // Save Broadcast Record
    const broadcastRecord = await PlacementBroadcast.create({
      senderId,
      senderEmail,
      title,
      message,
      broadcastType,
      targetType,
      jobPostingId: jobPostingId || null,
      jobTitle: jobObj ? `${jobObj.companyName} (${jobObj.role})` : "",
      recipientCount: finalRecipients.length,
      recipientsSummary: finalRecipients.slice(0, 15).map((r) => `${r.fullName} (${r.rollNumber || "N/A"})`)
    });

    // Save Activity Log
    const activity = await PlacementActivity.create({
      type: "broadcast_sent",
      actorName: senderEmail,
      actorEmail: senderEmail,
      actorRole: req.user.role,
      jobPostingId: jobPostingId || null,
      companyName: jobObj ? jobObj.companyName : "",
      message: `Faculty broadcast: "${title}" (${broadcastType.toUpperCase()}) dispatched to ${finalRecipients.length} student(s).`
    });

    if (global.io) {
      global.io.emit("placement:activity", activity);
    }

    res.json({
      success: true,
      message: `Broadcast successfully dispatched to ${finalRecipients.length} student(s)!`,
      broadcast: broadcastRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// J. GET ALL FACULTY BROADCASTS
exports.getPlacementBroadcasts = async (req, res) => {
  try {
    const broadcasts = await PlacementBroadcast.find({})
      .populate("senderId", "name email")
      .populate("jobPostingId", "companyName role")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, broadcasts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// K. GET REAL-TIME PLACEMENT ACTIVITY FEED
exports.getPlacementActivityFeed = async (req, res) => {
  try {
    const activities = await PlacementActivity.find({})
      .populate("jobPostingId", "companyName role")
      .sort({ createdAt: -1 })
      .limit(60);
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.runMatchingEngine = runMatchingEngine;
