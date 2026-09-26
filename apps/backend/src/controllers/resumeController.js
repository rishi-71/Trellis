const Resume = require("../models/Resume");
const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");
const PDFDocument = require("pdfkit");

// Helper to get student profile from user id
const getStudentProfileForUser = async (userId) => {
  return await StudentProfile.findOne({ user: userId });
};

// -------------------------------------------------------------
// CRUD Operations
// -------------------------------------------------------------

// @desc    Create a new resume
// @route   POST /api/resume
// @access  Private (Student)
exports.createResume = async (req, res) => {
  try {
    const profile = await getStudentProfileForUser(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found. Please create your profile first." });
    }

    const {
      title,
      template = "modern",
      personalInfo,
      summary,
      education,
      skills,
      projects,
      experience,
      certifications,
      achievements,
      sectionOrder
    } = req.body;

    const newResume = new Resume({
      studentId: profile._id,
      userId: req.user.id,
      title: title || "My Resume",
      template: template || "modern",
      personalInfo: personalInfo || {},
      summary: summary || "",
      education: education || [],
      skills: skills || {},
      projects: projects || [],
      experience: experience || [],
      certifications: certifications || [],
      achievements: achievements || [],
      sectionOrder: sectionOrder || [
        "summary",
        "education",
        "skills",
        "experience",
        "projects",
        "certifications",
        "achievements"
      ]
    });

    await newResume.save();
    res.status(201).json({ success: true, resume: newResume });
  } catch (err) {
    console.error("Error creating resume:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all resumes for the current student
// @route   GET /api/resume
// @access  Private
exports.getResumes = async (req, res) => {
  try {
    const profile = await getStudentProfileForUser(req.user.id);
    const query = profile ? { $or: [{ userId: req.user.id }, { studentId: profile._id }] } : { userId: req.user.id };
    
    const resumes = await Resume.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, resumes });
  } catch (err) {
    console.error("Error fetching resumes:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single resume by ID
// @route   GET /api/resume/:id
// @access  Private
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    // Role or owner check
    if (req.user.role === "student" && resume.userId && resume.userId.toString() !== req.user.id) {
      const profile = await getStudentProfileForUser(req.user.id);
      if (!profile || resume.studentId.toString() !== profile._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to access this resume" });
      }
    }

    res.json({ success: true, resume });
  } catch (err) {
    console.error("Error fetching resume by ID:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update an existing resume
// @route   PUT /api/resume/:id
// @access  Private
exports.updateResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    // Owner check
    if (req.user.role === "student" && resume.userId && resume.userId.toString() !== req.user.id) {
      const profile = await getStudentProfileForUser(req.user.id);
      if (!profile || resume.studentId.toString() !== profile._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to update this resume" });
      }
    }

    const {
      title,
      template,
      personalInfo,
      summary,
      education,
      skills,
      projects,
      experience,
      certifications,
      achievements,
      sectionOrder
    } = req.body;

    if (title !== undefined) resume.title = title;
    if (template !== undefined) resume.template = template;
    if (personalInfo !== undefined) resume.personalInfo = personalInfo;
    if (summary !== undefined) resume.summary = summary;
    if (education !== undefined) resume.education = education;
    if (skills !== undefined) resume.skills = skills;
    if (projects !== undefined) resume.projects = projects;
    if (experience !== undefined) resume.experience = experience;
    if (certifications !== undefined) resume.certifications = certifications;
    if (achievements !== undefined) resume.achievements = achievements;
    if (sectionOrder !== undefined) resume.sectionOrder = sectionOrder;

    await resume.save();
    res.json({ success: true, resume });
  } catch (err) {
    console.error("Error updating resume:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resume/:id
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    if (req.user.role === "student" && resume.userId && resume.userId.toString() !== req.user.id) {
      const profile = await getStudentProfileForUser(req.user.id);
      if (!profile || resume.studentId.toString() !== profile._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to delete this resume" });
      }
    }

    await Resume.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (err) {
    console.error("Error deleting resume:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// PDF Generation with PDFKit
// -------------------------------------------------------------

// Main PDF Generator function that handles all 3 templates
const generatePdfFromData = (data, template, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: template === "ats" ? 36 : 40,
    info: {
      Title: `${data.personalInfo?.fullName || "Resume"} - Trellis`,
      Author: data.personalInfo?.fullName || "Student",
      Subject: "Professional Resume"
    }
  });

  const fileName = `Resume_${(data.personalInfo?.fullName || "Candidate").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  if (template === "classic") {
    renderClassicPdf(doc, data);
  } else if (template === "ats") {
    renderAtsPdf(doc, data);
  } else {
    renderModernPdf(doc, data);
  }

  doc.end();
};

// 1. MODERN TEMPLATE
function renderModernPdf(doc, data) {
  const pInfo = data.personalInfo || {};
  const primaryColor = "#0f766e"; // Teal / Emerald
  const darkColor = "#0f172a"; // Slate 900
  const grayColor = "#475569"; // Slate 600
  const lightGray = "#e2e8f0";

  const leftMargin = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Top Header (Exact entered name casing, matching preview)
  doc.fillColor(primaryColor).fontSize(22).font("Helvetica-Bold").text(pInfo.fullName || "Your Full Name", leftMargin, doc.y, { lineGap: 3 });
  
  // Contact details sub-header
  const contactParts = [];
  if (pInfo.email) contactParts.push(pInfo.email);
  if (pInfo.phone) contactParts.push(pInfo.phone);
  if (pInfo.location) contactParts.push(pInfo.location);
  
  if (contactParts.length > 0) {
    doc.fillColor(grayColor).fontSize(9.5).font("Helvetica").text(contactParts.join("  •  "), leftMargin, doc.y, { lineGap: 3 });
  }

  // Social & portfolio links
  const linkParts = [];
  if (pInfo.linkedin) linkParts.push({ label: "LinkedIn", val: pInfo.linkedin });
  if (pInfo.github) linkParts.push({ label: "GitHub", val: pInfo.github });
  if (pInfo.portfolio) linkParts.push({ label: "Portfolio", val: pInfo.portfolio });
  
  if (linkParts.length > 0) {
    linkParts.forEach((lp, idx) => {
      const isLast = idx === linkParts.length - 1;
      doc.fillColor(primaryColor).fontSize(8.5).font("Helvetica-Bold").text(`${lp.label}: `, { continued: true });
      doc.fillColor(grayColor).fontSize(8.5).font("Helvetica").text(lp.val + (isLast ? "" : "   "), { continued: !isLast });
    });
    doc.moveDown(0.3);
  }

  // Accent Line
  doc.moveDown(0.3);
  doc.strokeColor(primaryColor).lineWidth(1.5).moveTo(leftMargin, doc.y).lineTo(leftMargin + contentWidth, doc.y).stroke();
  doc.moveDown(0.6);

  // Helper for Section Heading
  const addModernSectionHeader = (title) => {
    doc.moveDown(0.5);
    doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text(title.toUpperCase(), leftMargin, doc.y, { lineGap: 2 });
    doc.strokeColor(lightGray).lineWidth(0.8).moveTo(leftMargin, doc.y).lineTo(leftMargin + contentWidth, doc.y).stroke();
    doc.moveDown(0.4);
  };

  // Summary
  if (data.summary && data.summary.trim()) {
    addModernSectionHeader("Professional Summary");
    doc.fillColor(darkColor).fontSize(9.5).font("Helvetica").text(data.summary.trim(), leftMargin, doc.y, { align: "justify", lineGap: 3 });
  }

  // Education
  if (data.education && data.education.length > 0) {
    addModernSectionHeader("Education");
    data.education.forEach(edu => {
      let mainTitle = "";
      if (edu.degree && edu.branch) {
        if (edu.level === "10th" || edu.level === "12th") {
          mainTitle = `${edu.degree} • ${edu.branch}`;
        } else {
          mainTitle = `${edu.degree} in ${edu.branch}`;
        }
      } else {
        mainTitle = edu.degree || edu.branch || edu.institution;
      }

      const dateStr = edu.startYear && edu.endYear
        ? `${edu.startYear} - ${edu.endYear}`
        : edu.endYear
        ? `Passing Year: ${edu.endYear}`
        : edu.startYear || "Present";

      // Row 1: Title on Left, Date on Right
      const y1 = doc.y;
      doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold")
         .text(mainTitle, leftMargin, y1, { width: contentWidth - 140 });
      const left1End = doc.y;

      if (dateStr) {
        doc.fillColor(grayColor).fontSize(9).font("Helvetica")
           .text(dateStr, leftMargin, y1, { width: contentWidth, align: "right" });
      }
      const right1End = doc.y;
      doc.y = Math.max(left1End, right1End);

      // Row 2: Institution on Left, Teal Score on Right
      const y2 = doc.y + 1;
      let left2End = y2;
      if (edu.institution) {
        doc.fillColor(grayColor).fontSize(9).font("Helvetica")
           .text(edu.institution, leftMargin, y2, { width: contentWidth - 140 });
        left2End = doc.y;
      }

      let right2End = y2;
      if (edu.cgpa) {
        doc.fillColor(primaryColor).fontSize(9).font("Helvetica-Bold")
           .text(`Score: ${edu.cgpa}`, leftMargin, y2, { width: contentWidth, align: "right" });
        right2End = doc.y;
      }

      doc.y = Math.max(left2End, right2End) + 4;
    });
  }

  // Skills
  const skills = data.skills || {};
  const hasSkills = Object.values(skills).some(arr => Array.isArray(arr) && arr.length > 0);
  if (hasSkills) {
    addModernSectionHeader("Technical Skills");
    const skillCategories = [
      { label: "Languages", items: skills.programmingLanguages },
      { label: "Frameworks", items: skills.frameworks },
      { label: "Databases", items: skills.databases },
      { label: "Tools", items: skills.tools },
      { label: "Other", items: skills.otherSkills }
    ];

    skillCategories.forEach(cat => {
      if (cat.items && cat.items.length > 0) {
        doc.fillColor(darkColor).fontSize(9).font("Helvetica-Bold").text(`${cat.label}: `, leftMargin, doc.y, { continued: true });
        doc.fillColor(grayColor).font("Helvetica").text(cat.items.join(", "), { lineGap: 3 });
      }
    });
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    addModernSectionHeader("Experience / Internships");
    data.experience.forEach(exp => {
      const y1 = doc.y;
      doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text(exp.role || "Role", leftMargin, y1, { continued: true });
      if (exp.company) {
        doc.fillColor(primaryColor).font("Helvetica-Bold").text(`  @ ${exp.company}`, { continued: false });
      } else {
        doc.text("", { continued: false });
      }
      const left1End = doc.y;

      const dateStr = exp.startDate || exp.endDate ? `${exp.startDate || ""} - ${exp.endDate || "Present"}` : "";
      if (dateStr) {
        doc.fillColor(grayColor).fontSize(8.5).font("Helvetica")
           .text(dateStr, leftMargin, y1, { width: contentWidth, align: "right" });
      }
      const right1End = doc.y;
      doc.y = Math.max(left1End, right1End);

      if (exp.description) {
        doc.fillColor(darkColor).fontSize(9).font("Helvetica")
           .text(exp.description, leftMargin, doc.y + 1, { lineGap: 3 });
      }
      doc.moveDown(0.3);
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    addModernSectionHeader("Projects");
    data.projects.forEach(proj => {
      const y1 = doc.y;
      doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text(proj.name || "Project Title", leftMargin, y1, { width: contentWidth - 180 });
      const left1End = doc.y;

      const techAndLinks = [];
      if (proj.technologies) techAndLinks.push(`Tech: ${proj.technologies}`);
      if (proj.githubUrl) techAndLinks.push(`GitHub: ${proj.githubUrl}`);
      if (proj.liveDemoUrl) techAndLinks.push(`Live: ${proj.liveDemoUrl}`);

      if (techAndLinks.length > 0) {
        doc.fillColor(grayColor).fontSize(8.5).font("Helvetica-Oblique")
           .text(techAndLinks.join("  |  "), leftMargin, y1, { width: contentWidth, align: "right" });
      }
      const right1End = doc.y;
      doc.y = Math.max(left1End, right1End);

      if (proj.description) {
        doc.fillColor(darkColor).fontSize(9).font("Helvetica")
           .text(proj.description, leftMargin, doc.y + 1, { lineGap: 3 });
      }
      doc.moveDown(0.3);
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    addModernSectionHeader("Certifications");
    data.certifications.forEach(cert => {
      doc.fillColor(darkColor).fontSize(9.5).font("Helvetica-Bold").text(`• ${cert.name || "Certificate"}`, leftMargin, doc.y, { continued: true });
      if (cert.organization) doc.fillColor(grayColor).font("Helvetica").text(` - ${cert.organization}`, { continued: true });
      if (cert.date) doc.fillColor(grayColor).font("Helvetica-Oblique").text(` (${cert.date})`, { continued: true });
      doc.text("");
      if (cert.credentialUrl) {
        doc.fillColor(primaryColor).fontSize(8).font("Helvetica").text(`   Credential: ${cert.credentialUrl}`, leftMargin, doc.y, { lineGap: 2 });
      }
    });
  }

  // Achievements
  if (data.achievements && data.achievements.length > 0) {
    addModernSectionHeader("Key Achievements");
    data.achievements.forEach(ach => {
      doc.fillColor(darkColor).fontSize(9.5).font("Helvetica-Bold").text(`• ${ach.title || "Achievement"}`, leftMargin, doc.y, { continued: true });
      if (ach.date) doc.fillColor(grayColor).font("Helvetica-Oblique").text(` (${ach.date})`, { continued: true });
      doc.text("");
      if (ach.description) {
        doc.fillColor(grayColor).fontSize(9).font("Helvetica").text(`   ${ach.description}`, leftMargin, doc.y, { lineGap: 2 });
      }
    });
  }
}

// 2. CLASSIC TEMPLATE
function renderClassicPdf(doc, data) {
  const pInfo = data.personalInfo || {};
  const black = "#111827";
  const darkGray = "#374151";

  const leftMargin = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Center aligned classical header
  doc.fillColor(black).fontSize(22).font("Times-Bold").text(pInfo.fullName || "FULL NAME", leftMargin, doc.y, { align: "center", lineGap: 4 });
  
  const contactList = [];
  if (pInfo.location) contactList.push(pInfo.location);
  if (pInfo.phone) contactList.push(pInfo.phone);
  if (pInfo.email) contactList.push(pInfo.email);
  if (pInfo.linkedin) contactList.push(pInfo.linkedin);
  if (pInfo.github) contactList.push(pInfo.github);
  if (pInfo.portfolio) contactList.push(pInfo.portfolio);

  if (contactList.length > 0) {
    doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman").text(contactList.join("  •  "), leftMargin, doc.y, { align: "center", lineGap: 6 });
  }
  
  // Clean horizontal divider
  doc.strokeColor("#9ca3af").lineWidth(1).moveTo(leftMargin, doc.y).lineTo(leftMargin + contentWidth, doc.y).stroke();
  doc.moveDown(0.6);

  const addClassicHeader = (title) => {
    doc.moveDown(0.5);
    doc.fillColor(black).fontSize(11).font("Times-Bold").text(title.toUpperCase(), leftMargin, doc.y, { lineGap: 2 });
    doc.strokeColor("#d1d5db").lineWidth(0.5).moveTo(leftMargin, doc.y).lineTo(leftMargin + contentWidth, doc.y).stroke();
    doc.moveDown(0.3);
  };

  // Summary
  if (data.summary && data.summary.trim()) {
    addClassicHeader("Professional Summary");
    doc.fillColor(darkGray).fontSize(10).font("Times-Roman").text(data.summary.trim(), leftMargin, doc.y, { align: "justify", lineGap: 3 });
  }

  // Education
  if (data.education && data.education.length > 0) {
    addClassicHeader("Education");
    data.education.forEach(edu => {
      const dateText = edu.startYear && edu.endYear
        ? `${edu.startYear} - ${edu.endYear}`
        : edu.endYear
        ? `Passing Year: ${edu.endYear}`
        : edu.startYear || "Present";

      const y1 = doc.y;
      doc.fillColor(black).fontSize(10).font("Times-Bold")
         .text(edu.institution || "University/College", leftMargin, y1, { width: contentWidth - 140 });
      const left1End = doc.y;

      if (dateText) {
        doc.fillColor(darkGray).fontSize(9.5).font("Times-Italic")
           .text(dateText, leftMargin, y1, { width: contentWidth, align: "right" });
      }
      const right1End = doc.y;
      doc.y = Math.max(left1End, right1End);

      // Line 2: Degree/Branch on left, Score on right
      const y2 = doc.y + 1;
      const eduSubtitle = [edu.degree, edu.branch].filter(Boolean).join(" • ");
      let left2End = y2;
      if (eduSubtitle) {
        doc.fillColor(darkGray).fontSize(9.5).font("Times-Italic")
           .text(eduSubtitle, leftMargin, y2, { width: contentWidth - 140 });
        left2End = doc.y;
      }

      let right2End = y2;
      if (edu.cgpa) {
        doc.fillColor(black).fontSize(9.5).font("Times-Bold")
           .text(`Score: ${edu.cgpa}`, leftMargin, y2, { width: contentWidth, align: "right" });
        right2End = doc.y;
      }
      doc.y = Math.max(left2End, right2End) + 4;
    });
  }

  // Professional Experience
  if (data.experience && data.experience.length > 0) {
    addClassicHeader("Professional Experience");
    data.experience.forEach(exp => {
      const y1 = doc.y;
      doc.fillColor(black).fontSize(10).font("Times-Bold")
         .text(exp.company || "Company", leftMargin, y1, { width: contentWidth - 140 });
      const left1End = doc.y;

      const dateStr = exp.startDate || exp.endDate ? `${exp.startDate || ""} - ${exp.endDate || "Present"}` : "";
      if (dateStr) {
        doc.fillColor(darkGray).fontSize(9.5).font("Times-Italic")
           .text(dateStr, leftMargin, y1, { width: contentWidth, align: "right" });
      }
      const right1End = doc.y;
      doc.y = Math.max(left1End, right1End);

      if (exp.role) {
        doc.fillColor(darkGray).fontSize(9.5).font("Times-Italic")
           .text(exp.role, leftMargin, doc.y + 1);
      }

      if (exp.description) {
        doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman")
           .text(exp.description, leftMargin, doc.y + 2, { lineGap: 3 });
      }
      doc.moveDown(0.3);
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    addClassicHeader("Key Projects");
    data.projects.forEach(proj => {
      const y1 = doc.y;
      doc.fillColor(black).fontSize(10).font("Times-Bold")
         .text(proj.name || "Project Title", leftMargin, y1, { continued: true });
      if (proj.technologies) {
        doc.fillColor(darkGray).font("Times-Italic").text(` | ${proj.technologies}`, { continued: false });
      } else {
        doc.text("", { continued: false });
      }
      const left1End = doc.y;

      const links = [];
      if (proj.githubUrl) links.push(`GitHub: ${proj.githubUrl}`);
      if (proj.liveDemoUrl) links.push(`Demo: ${proj.liveDemoUrl}`);
      if (links.length > 0) {
        doc.fillColor(darkGray).fontSize(8.5).font("Times-Roman")
           .text(links.join("  •  "), leftMargin, y1, { width: contentWidth, align: "right" });
      }
      const right1End = doc.y;
      doc.y = Math.max(left1End, right1End);

      if (proj.description) {
        doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman").text(proj.description, leftMargin, doc.y + 1, { lineGap: 3 });
      }
      doc.moveDown(0.2);
    });
  }

  // Skills
  const skills = data.skills || {};
  const hasSkills = Object.values(skills).some(arr => Array.isArray(arr) && arr.length > 0);
  if (hasSkills) {
    addClassicHeader("Skills & Competencies");
    if (skills.programmingLanguages?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Times-Bold").text("Languages: ", leftMargin, doc.y, { continued: true });
      doc.fillColor(darkGray).font("Times-Roman").text(skills.programmingLanguages.join(", "));
    }
    if (skills.frameworks?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Times-Bold").text("Frameworks: ", leftMargin, doc.y, { continued: true });
      doc.fillColor(darkGray).font("Times-Roman").text(skills.frameworks.join(", "));
    }
    if (skills.databases?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Times-Bold").text("Databases: ", leftMargin, doc.y, { continued: true });
      doc.fillColor(darkGray).font("Times-Roman").text(skills.databases.join(", "));
    }
    if (skills.tools?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Times-Bold").text("Tools: ", leftMargin, doc.y, { continued: true });
      doc.fillColor(darkGray).font("Times-Roman").text(skills.tools.join(", "));
    }
    if (skills.otherSkills?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Times-Bold").text("Other: ", leftMargin, doc.y, { continued: true });
      doc.fillColor(darkGray).font("Times-Roman").text(skills.otherSkills.join(", "));
    }
  }

  // Certifications & Achievements
  if ((data.certifications && data.certifications.length > 0) || (data.achievements && data.achievements.length > 0)) {
    addClassicHeader("Certifications & Honors");
    (data.certifications || []).forEach(cert => {
      doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman").text(`• ${cert.name || ""}${cert.organization ? ` - ${cert.organization}` : ""}${cert.date ? ` (${cert.date})` : ""}`, leftMargin, doc.y);
    });
    (data.achievements || []).forEach(ach => {
      doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman").text(`• ${ach.title || ""}${ach.description ? `: ${ach.description}` : ""}${ach.date ? ` (${ach.date})` : ""}`, leftMargin, doc.y);
    });
  }
}

// 3. ATS FRIENDLY TEMPLATE
function renderAtsPdf(doc, data) {
  const pInfo = data.personalInfo || {};
  const black = "#000000";

  const leftMargin = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Standard ATS Header
  doc.fillColor(black).fontSize(18).font("Helvetica-Bold").text((pInfo.fullName || "FULL NAME").toUpperCase(), leftMargin, doc.y, { lineGap: 3 });
  
  const atsContacts = [];
  if (pInfo.email) atsContacts.push(pInfo.email);
  if (pInfo.phone) atsContacts.push(pInfo.phone);
  if (pInfo.location) atsContacts.push(pInfo.location);
  if (pInfo.linkedin) atsContacts.push(pInfo.linkedin);
  if (pInfo.github) atsContacts.push(pInfo.github);
  if (pInfo.portfolio) atsContacts.push(pInfo.portfolio);

  if (atsContacts.length > 0) {
    doc.fillColor(black).fontSize(9.5).font("Helvetica").text(atsContacts.join(" | "), leftMargin, doc.y, { lineGap: 8 });
  }

  const addAtsSection = (title) => {
    doc.moveDown(0.4);
    doc.fillColor(black).fontSize(11).font("Helvetica-Bold").text(title.toUpperCase(), leftMargin, doc.y);
    doc.strokeColor("#000000").lineWidth(0.75).moveTo(leftMargin, doc.y).lineTo(leftMargin + contentWidth, doc.y).stroke();
    doc.moveDown(0.3);
  };

  // Summary
  if (data.summary && data.summary.trim()) {
    addAtsSection("Professional Summary");
    doc.fillColor(black).fontSize(9.5).font("Helvetica").text(data.summary.trim(), leftMargin, doc.y, { lineGap: 3 });
  }

  // Skills
  const skills = data.skills || {};
  const hasSkills = Object.values(skills).some(arr => Array.isArray(arr) && arr.length > 0);
  if (hasSkills) {
    addAtsSection("Technical Skills");
    if (skills.programmingLanguages?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Helvetica-Bold").text("Programming Languages: ", leftMargin, doc.y, { continued: true });
      doc.font("Helvetica").text(skills.programmingLanguages.join(", "));
    }
    if (skills.frameworks?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Helvetica-Bold").text("Frameworks & Libraries: ", leftMargin, doc.y, { continued: true });
      doc.font("Helvetica").text(skills.frameworks.join(", "));
    }
    if (skills.databases?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Helvetica-Bold").text("Databases: ", leftMargin, doc.y, { continued: true });
      doc.font("Helvetica").text(skills.databases.join(", "));
    }
    if (skills.tools?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Helvetica-Bold").text("Tools & Technologies: ", leftMargin, doc.y, { continued: true });
      doc.font("Helvetica").text(skills.tools.join(", "));
    }
    if (skills.otherSkills?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Helvetica-Bold").text("Other Skills: ", leftMargin, doc.y, { continued: true });
      doc.font("Helvetica").text(skills.otherSkills.join(", "));
    }
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    addAtsSection("Work Experience");
    data.experience.forEach(exp => {
      const y1 = doc.y;
      const roleCompany = [exp.role, exp.company].filter(Boolean).join(" | ");
      doc.fillColor(black).fontSize(10).font("Helvetica-Bold")
         .text(roleCompany || "Role", leftMargin, y1, { width: contentWidth - 140 });
      const left1End = doc.y;

      const dateStr = exp.startDate || exp.endDate ? `${exp.startDate || ""} - ${exp.endDate || "Present"}` : "";
      if (dateStr) {
        doc.fillColor(black).fontSize(9.5).font("Helvetica")
           .text(dateStr, leftMargin, y1, { width: contentWidth, align: "right" });
      }
      const right1End = doc.y;
      doc.y = Math.max(left1End, right1End);

      if (exp.description) {
        doc.fillColor(black).fontSize(9.5).font("Helvetica")
           .text(`• ${exp.description}`, leftMargin + 6, doc.y + 1, { lineGap: 3 });
      }
      doc.moveDown(0.25);
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    addAtsSection("Projects");
    data.projects.forEach(proj => {
      const projTitle = proj.name || "Project";
      const techStr = proj.technologies ? ` (${proj.technologies})` : "";
      const links = [];
      if (proj.githubUrl) links.push(`GitHub: ${proj.githubUrl}`);
      if (proj.liveDemoUrl) links.push(`Demo: ${proj.liveDemoUrl}`);
      const linkStr = links.length > 0 ? ` | ${links.join(" | ")}` : "";

      doc.fillColor(black).fontSize(10).font("Helvetica-Bold").text(projTitle, leftMargin, doc.y, { continued: Boolean(techStr || linkStr) });
      if (techStr) {
        doc.font("Helvetica").text(techStr, { continued: Boolean(linkStr) });
      }
      if (linkStr) {
        doc.fontSize(8.5).font("Helvetica").text(linkStr, { continued: false });
      } else if (!techStr) {
        doc.text("", { continued: false });
      }

      if (proj.description) {
        doc.fillColor(black).fontSize(9.5).font("Helvetica")
           .text(`• ${proj.description}`, leftMargin + 6, doc.y + 1, { lineGap: 3 });
      }
      doc.moveDown(0.25);
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    addAtsSection("Education");
    data.education.forEach(edu => {
      const dateText = edu.startYear && edu.endYear
        ? `${edu.startYear} - ${edu.endYear}`
        : edu.endYear
        ? `Passing Year: ${edu.endYear}`
        : edu.startYear || "Present";

      const y1 = doc.y;
      doc.fillColor(black).fontSize(10).font("Helvetica-Bold")
         .text(edu.institution || "Institution", leftMargin, y1, { width: contentWidth - 140 });
      const left1End = doc.y;

      if (dateText) {
        doc.fillColor(black).fontSize(9.5).font("Helvetica")
           .text(dateText, leftMargin, y1, { width: contentWidth, align: "right" });
      }
      const right1End = doc.y;
      doc.y = Math.max(left1End, right1End);

      const detailStr = [edu.degree, edu.branch].filter(Boolean).join(" - ");
      const subLine = `${detailStr}${edu.cgpa ? ` (Score: ${edu.cgpa})` : ""}`;
      if (subLine) {
        doc.fillColor(black).fontSize(9.5).font("Helvetica")
           .text(subLine, leftMargin, doc.y + 1, { lineGap: 3 });
      }
      doc.moveDown(0.25);
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    addAtsSection("Certifications");
    data.certifications.forEach(cert => {
      doc.fillColor(black).fontSize(9.5).font("Helvetica")
         .text(`• ${cert.name || ""}${cert.organization ? ` - ${cert.organization}` : ""}${cert.date ? ` (${cert.date})` : ""}`, leftMargin, doc.y);
    });
  }

  // Achievements
  if (data.achievements && data.achievements.length > 0) {
    addAtsSection("Achievements");
    data.achievements.forEach(ach => {
      doc.fillColor(black).fontSize(9.5).font("Helvetica")
         .text(`• ${ach.title || ""}${ach.date ? ` (${ach.date})` : ""}${ach.description ? `: ${ach.description}` : ""}`, leftMargin, doc.y);
    });
  }
}

// @desc    Download PDF for a saved resume
// @route   GET /api/resume/:id/pdf
// @access  Private (supports ?token= query or Authorization header)
exports.generateResumePdf = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    const template = req.query.template || resume.template || "modern";
    generatePdfFromData(resume, template, res);
  } catch (err) {
    console.error("Error generating resume PDF:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Generate PDF on the fly from POST body (for live builder export without saving first)
// @route   POST /api/resume/preview-pdf
// @access  Private
exports.generatePreviewPdf = async (req, res) => {
  try {
    const data = req.body || {};
    const template = data.template || "modern";
    generatePdfFromData(data, template, res);
  } catch (err) {
    console.error("Error generating preview PDF:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
