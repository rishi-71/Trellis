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

  // Top Header
  doc.fillColor(primaryColor).fontSize(22).font("Helvetica-Bold").text((pInfo.fullName || "FULL NAME").toUpperCase(), { lineGap: 3 });
  
  // Contact details sub-header
  const contactParts = [];
  if (pInfo.email) contactParts.push(pInfo.email);
  if (pInfo.phone) contactParts.push(pInfo.phone);
  if (pInfo.location) contactParts.push(pInfo.location);
  
  doc.fillColor(grayColor).fontSize(9.5).font("Helvetica").text(contactParts.join("  |  "), { lineGap: 3 });

  const linkParts = [];
  if (pInfo.linkedin) linkParts.push(`LinkedIn: ${pInfo.linkedin}`);
  if (pInfo.github) linkParts.push(`GitHub: ${pInfo.github}`);
  if (pInfo.portfolio) linkParts.push(`Portfolio: ${pInfo.portfolio}`);
  if (linkParts.length > 0) {
    doc.fillColor(primaryColor).fontSize(8.5).font("Helvetica").text(linkParts.join("  |  "), { lineGap: 6 });
  }

  // Accent Line
  doc.moveDown(0.3);
  doc.strokeColor(primaryColor).lineWidth(1.5).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.6);

  // Helper for Section Heading
  const addModernSectionHeader = (title) => {
    doc.moveDown(0.5);
    doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text(title.toUpperCase(), { lineGap: 2 });
    doc.strokeColor(lightGray).lineWidth(0.8).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(0.4);
  };

  // Summary
  if (data.summary && data.summary.trim()) {
    addModernSectionHeader("Professional Summary");
    doc.fillColor(darkColor).fontSize(9.5).font("Helvetica").text(data.summary.trim(), { align: "justify", lineGap: 3 });
  }

  // Education
  if (data.education && data.education.length > 0) {
    addModernSectionHeader("Education");
    data.education.forEach(edu => {
      doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text(edu.degree ? `${edu.degree} in ${edu.branch || ""}`.trim() : edu.branch || edu.institution);
      
      const subLine = [];
      if (edu.institution) subLine.push(edu.institution);
      if (edu.startYear || edu.endYear) subLine.push(`${edu.startYear || ""} - ${edu.endYear || "Present"}`);
      if (edu.cgpa) subLine.push(`CGPA/Marks: ${edu.cgpa}`);
      
      doc.fillColor(grayColor).fontSize(9).font("Helvetica").text(subLine.join("  •  "), { lineGap: 4 });
      doc.moveDown(0.2);
    });
  }

  // Skills
  const skills = data.skills || {};
  const hasSkills = Object.values(skills).some(arr => Array.isArray(arr) && arr.length > 0);
  if (hasSkills) {
    addModernSectionHeader("Technical Skills");
    const skillCategories = [
      { label: "Programming Languages", items: skills.programmingLanguages },
      { label: "Frameworks & Libraries", items: skills.frameworks },
      { label: "Databases", items: skills.databases },
      { label: "Tools & Platforms", items: skills.tools },
      { label: "Other Skills", items: skills.otherSkills }
    ];

    skillCategories.forEach(cat => {
      if (cat.items && cat.items.length > 0) {
        doc.fillColor(darkColor).fontSize(9).font("Helvetica-Bold").text(`${cat.label}: `, { continued: true });
        doc.fillColor(grayColor).font("Helvetica").text(cat.items.join(", "), { lineGap: 3 });
      }
    });
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    addModernSectionHeader("Experience / Internships");
    data.experience.forEach(exp => {
      doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text(exp.role || "Role", { continued: true });
      if (exp.company) {
        doc.fillColor(primaryColor).font("Helvetica").text(`  @ ${exp.company}`);
      } else {
        doc.text("");
      }

      if (exp.startDate || exp.endDate) {
        doc.fillColor(grayColor).fontSize(8.5).font("Helvetica-Oblique").text(`${exp.startDate || ""} - ${exp.endDate || "Present"}`);
      }

      if (exp.description) {
        doc.fillColor(darkColor).fontSize(9).font("Helvetica").text(exp.description, { lineGap: 4 });
      }
      doc.moveDown(0.3);
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    addModernSectionHeader("Projects");
    data.projects.forEach(proj => {
      doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text(proj.name || "Project Title");
      
      const techAndLinks = [];
      if (proj.technologies) techAndLinks.push(`Tech: ${proj.technologies}`);
      if (proj.githubUrl) techAndLinks.push(`GitHub: ${proj.githubUrl}`);
      if (proj.liveDemoUrl) techAndLinks.push(`Live: ${proj.liveDemoUrl}`);

      if (techAndLinks.length > 0) {
        doc.fillColor(grayColor).fontSize(8.5).font("Helvetica-Oblique").text(techAndLinks.join("  |  "));
      }

      if (proj.description) {
        doc.fillColor(darkColor).fontSize(9).font("Helvetica").text(proj.description, { lineGap: 4 });
      }
      doc.moveDown(0.3);
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    addModernSectionHeader("Certifications");
    data.certifications.forEach(cert => {
      doc.fillColor(darkColor).fontSize(9.5).font("Helvetica-Bold").text(`• ${cert.name || "Certificate"}`, { continued: true });
      if (cert.organization) doc.fillColor(grayColor).font("Helvetica").text(` - ${cert.organization}`, { continued: true });
      if (cert.date) doc.fillColor(grayColor).font("Helvetica-Oblique").text(` (${cert.date})`, { continued: true });
      doc.text("");
      if (cert.credentialUrl) {
        doc.fillColor(primaryColor).fontSize(8).font("Helvetica").text(`   Credential: ${cert.credentialUrl}`, { lineGap: 2 });
      }
    });
  }

  // Achievements
  if (data.achievements && data.achievements.length > 0) {
    addModernSectionHeader("Key Achievements");
    data.achievements.forEach(ach => {
      doc.fillColor(darkColor).fontSize(9.5).font("Helvetica-Bold").text(`• ${ach.title || "Achievement"}`, { continued: true });
      if (ach.date) doc.fillColor(grayColor).font("Helvetica-Oblique").text(` (${ach.date})`, { continued: true });
      doc.text("");
      if (ach.description) {
        doc.fillColor(grayColor).fontSize(9).font("Helvetica").text(`   ${ach.description}`, { lineGap: 2 });
      }
    });
  }
}

// 2. CLASSIC TEMPLATE
function renderClassicPdf(doc, data) {
  const pInfo = data.personalInfo || {};
  const black = "#111827";
  const darkGray = "#374151";

  // Center aligned classical header
  doc.fillColor(black).fontSize(22).font("Times-Bold").text(pInfo.fullName || "FULL NAME", { align: "center", lineGap: 4 });
  
  const contactList = [];
  if (pInfo.location) contactList.push(pInfo.location);
  if (pInfo.phone) contactList.push(pInfo.phone);
  if (pInfo.email) contactList.push(pInfo.email);
  if (pInfo.linkedin) contactList.push(pInfo.linkedin);
  if (pInfo.github) contactList.push(pInfo.github);
  if (pInfo.portfolio) contactList.push(pInfo.portfolio);

  doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman").text(contactList.join("  •  "), { align: "center", lineGap: 6 });
  
  // Clean horizontal divider
  doc.strokeColor("#9ca3af").lineWidth(1).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.6);

  const addClassicHeader = (title) => {
    doc.moveDown(0.5);
    doc.fillColor(black).fontSize(11).font("Times-Bold").text(title.toUpperCase(), { lineGap: 2 });
    doc.strokeColor("#d1d5db").lineWidth(0.5).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(0.3);
  };

  // Summary
  if (data.summary && data.summary.trim()) {
    addClassicHeader("Professional Summary");
    doc.fillColor(darkGray).fontSize(10).font("Times-Roman").text(data.summary.trim(), { align: "justify", lineGap: 3 });
  }

  // Education
  if (data.education && data.education.length > 0) {
    addClassicHeader("Education");
    data.education.forEach(edu => {
      doc.fillColor(black).fontSize(10).font("Times-Bold").text(edu.institution || "University/College", { continued: true });
      if (edu.startYear || edu.endYear) {
        doc.fillColor(darkGray).font("Times-Italic").text(` (${edu.startYear || ""} - ${edu.endYear || "Present"})`, { align: "right" });
      } else {
        doc.text("");
      }

      const degreeLine = [];
      if (edu.degree) degreeLine.push(edu.degree);
      if (edu.branch) degreeLine.push(edu.branch);
      if (edu.cgpa) degreeLine.push(`CGPA: ${edu.cgpa}`);

      if (degreeLine.length > 0) {
        doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman").text(degreeLine.join(", "), { lineGap: 4 });
      }
      doc.moveDown(0.2);
    });
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    addClassicHeader("Professional Experience");
    data.experience.forEach(exp => {
      doc.fillColor(black).fontSize(10).font("Times-Bold").text(exp.company || "Company", { continued: true });
      if (exp.startDate || exp.endDate) {
        doc.fillColor(darkGray).font("Times-Italic").text(` (${exp.startDate || ""} - ${exp.endDate || "Present"})`, { align: "right" });
      } else {
        doc.text("");
      }

      if (exp.role) {
        doc.fillColor(darkGray).fontSize(9.5).font("Times-Italic").text(exp.role);
      }

      if (exp.description) {
        doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman").text(exp.description, { lineGap: 4 });
      }
      doc.moveDown(0.2);
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    addClassicHeader("Academic & Personal Projects");
    data.projects.forEach(proj => {
      doc.fillColor(black).fontSize(10).font("Times-Bold").text(proj.name || "Project Title", { continued: true });
      if (proj.technologies) {
        doc.fillColor(darkGray).font("Times-Italic").text(` | ${proj.technologies}`);
      } else {
        doc.text("");
      }

      const links = [];
      if (proj.githubUrl) links.push(`GitHub: ${proj.githubUrl}`);
      if (proj.liveDemoUrl) links.push(`Demo: ${proj.liveDemoUrl}`);
      if (links.length > 0) {
        doc.fillColor(darkGray).fontSize(8.5).font("Times-Roman").text(links.join("  •  "));
      }

      if (proj.description) {
        doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman").text(proj.description, { lineGap: 4 });
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
      doc.fillColor(black).fontSize(9.5).font("Times-Bold").text("Languages: ", { continued: true });
      doc.fillColor(darkGray).font("Times-Roman").text(skills.programmingLanguages.join(", "));
    }
    if (skills.frameworks?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Times-Bold").text("Frameworks: ", { continued: true });
      doc.fillColor(darkGray).font("Times-Roman").text(skills.frameworks.join(", "));
    }
    if (skills.databases?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Times-Bold").text("Databases: ", { continued: true });
      doc.fillColor(darkGray).font("Times-Roman").text(skills.databases.join(", "));
    }
    if (skills.tools?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Times-Bold").text("Tools: ", { continued: true });
      doc.fillColor(darkGray).font("Times-Roman").text(skills.tools.join(", "));
    }
    if (skills.otherSkills?.length > 0) {
      doc.fillColor(black).fontSize(9.5).font("Times-Bold").text("Other: ", { continued: true });
      doc.fillColor(darkGray).font("Times-Roman").text(skills.otherSkills.join(", "));
    }
  }

  // Certifications & Achievements
  if ((data.certifications && data.certifications.length > 0) || (data.achievements && data.achievements.length > 0)) {
    addClassicHeader("Certifications & Honors");
    (data.certifications || []).forEach(cert => {
      doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman").text(`• ${cert.name || ""}${cert.organization ? ` - ${cert.organization}` : ""}${cert.date ? ` (${cert.date})` : ""}`);
    });
    (data.achievements || []).forEach(ach => {
      doc.fillColor(darkGray).fontSize(9.5).font("Times-Roman").text(`• ${ach.title || ""}${ach.description ? `: ${ach.description}` : ""}${ach.date ? ` (${ach.date})` : ""}`);
    });
  }
}

// 3. ATS FRIENDLY TEMPLATE
function renderAtsPdf(doc, data) {
  const pInfo = data.personalInfo || {};
  const black = "#000000";

  // Standard ATS Left-Aligned / Simple Header
  doc.fillColor(black).fontSize(18).font("Helvetica-Bold").text((pInfo.fullName || "FULL NAME").toUpperCase(), { lineGap: 3 });
  
  const atsContacts = [];
  if (pInfo.email) atsContacts.push(pInfo.email);
  if (pInfo.phone) atsContacts.push(pInfo.phone);
  if (pInfo.location) atsContacts.push(pInfo.location);
  if (pInfo.linkedin) atsContacts.push(pInfo.linkedin);
  if (pInfo.github) atsContacts.push(pInfo.github);
  if (pInfo.portfolio) atsContacts.push(pInfo.portfolio);

  doc.fontSize(9.5).font("Helvetica").text(atsContacts.join(" | "), { lineGap: 8 });

  const addAtsSection = (title) => {
    doc.moveDown(0.4);
    doc.fillColor(black).fontSize(11).font("Helvetica-Bold").text(title.toUpperCase());
    doc.strokeColor("#000000").lineWidth(0.75).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(0.3);
  };

  // Summary
  if (data.summary && data.summary.trim()) {
    addAtsSection("Professional Summary");
    doc.fillColor(black).fontSize(9.5).font("Helvetica").text(data.summary.trim(), { lineGap: 3 });
  }

  // Skills
  const skills = data.skills || {};
  const hasSkills = Object.values(skills).some(arr => Array.isArray(arr) && arr.length > 0);
  if (hasSkills) {
    addAtsSection("Technical Skills");
    if (skills.programmingLanguages?.length > 0) {
      doc.fontSize(9.5).font("Helvetica-Bold").text("Programming Languages: ", { continued: true });
      doc.font("Helvetica").text(skills.programmingLanguages.join(", "));
    }
    if (skills.frameworks?.length > 0) {
      doc.fontSize(9.5).font("Helvetica-Bold").text("Frameworks: ", { continued: true });
      doc.font("Helvetica").text(skills.frameworks.join(", "));
    }
    if (skills.databases?.length > 0) {
      doc.fontSize(9.5).font("Helvetica-Bold").text("Databases: ", { continued: true });
      doc.font("Helvetica").text(skills.databases.join(", "));
    }
    if (skills.tools?.length > 0) {
      doc.fontSize(9.5).font("Helvetica-Bold").text("Tools & Technologies: ", { continued: true });
      doc.font("Helvetica").text(skills.tools.join(", "));
    }
    if (skills.otherSkills?.length > 0) {
      doc.fontSize(9.5).font("Helvetica-Bold").text("Other Skills: ", { continued: true });
      doc.font("Helvetica").text(skills.otherSkills.join(", "));
    }
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    addAtsSection("Work Experience");
    data.experience.forEach(exp => {
      doc.fontSize(10).font("Helvetica-Bold").text(exp.role || "Role", { continued: true });
      if (exp.company) doc.text(` | ${exp.company}`, { continued: true });
      if (exp.startDate || exp.endDate) doc.font("Helvetica").text(` | ${exp.startDate || ""} - ${exp.endDate || "Present"}`);
      else doc.text("");

      if (exp.description) {
        doc.fontSize(9.5).font("Helvetica").text(`• ${exp.description}`, { lineGap: 3 });
      }
      doc.moveDown(0.2);
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    addAtsSection("Projects");
    data.projects.forEach(proj => {
      doc.fontSize(10).font("Helvetica-Bold").text(proj.name || "Project", { continued: true });
      if (proj.technologies) doc.font("Helvetica").text(` (${proj.technologies})`);
      else doc.text("");

      if (proj.githubUrl || proj.liveDemoUrl) {
        const links = [];
        if (proj.githubUrl) links.push(`GitHub: ${proj.githubUrl}`);
        if (proj.liveDemoUrl) links.push(`Live: ${proj.liveDemoUrl}`);
        doc.fontSize(8.5).font("Helvetica").text(links.join(" | "));
      }

      if (proj.description) {
        doc.fontSize(9.5).font("Helvetica").text(`• ${proj.description}`, { lineGap: 3 });
      }
      doc.moveDown(0.2);
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    addAtsSection("Education");
    data.education.forEach(edu => {
      doc.fontSize(10).font("Helvetica-Bold").text(edu.institution || "Institution", { continued: true });
      if (edu.startYear || edu.endYear) doc.font("Helvetica").text(` | ${edu.startYear || ""} - ${edu.endYear || "Present"}`);
      else doc.text("");

      const eduDetails = [];
      if (edu.degree) eduDetails.push(edu.degree);
      if (edu.branch) eduDetails.push(edu.branch);
      if (edu.cgpa) eduDetails.push(`CGPA: ${edu.cgpa}`);

      if (eduDetails.length > 0) {
        doc.fontSize(9.5).font("Helvetica").text(eduDetails.join(" - "), { lineGap: 3 });
      }
      doc.moveDown(0.2);
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    addAtsSection("Certifications");
    data.certifications.forEach(cert => {
      doc.fontSize(9.5).font("Helvetica").text(`• ${cert.name || ""}${cert.organization ? ` (${cert.organization})` : ""}${cert.date ? ` - ${cert.date}` : ""}${cert.credentialUrl ? ` [${cert.credentialUrl}]` : ""}`);
    });
  }

  // Achievements
  if (data.achievements && data.achievements.length > 0) {
    addAtsSection("Achievements");
    data.achievements.forEach(ach => {
      doc.fontSize(9.5).font("Helvetica").text(`• ${ach.title || ""}${ach.description ? `: ${ach.description}` : ""}${ach.date ? ` (${ach.date})` : ""}`);
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
