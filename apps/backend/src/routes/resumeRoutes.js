const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");
const { verifyToken, verifyStudent } = require("../middleware/auth");

// All resume operations require authentication
router.post("/", verifyToken, verifyStudent, resumeController.createResume);
router.get("/", verifyToken, resumeController.getResumes);
router.post("/preview-pdf", verifyToken, resumeController.generatePreviewPdf);

router.get("/:id", verifyToken, resumeController.getResumeById);
router.put("/:id", verifyToken, verifyStudent, resumeController.updateResume);
router.delete("/:id", verifyToken, verifyStudent, resumeController.deleteResume);

// PDF Download
router.get("/:id/pdf", verifyToken, resumeController.generateResumePdf);

module.exports = router;
