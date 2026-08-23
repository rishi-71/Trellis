const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { verifyToken, verifyStudent } = require("../middleware/auth");

// Private endpoints (requires logged-in student)
router.get("/profile", verifyToken, verifyStudent, studentController.getMyProfile);
router.post("/profile", verifyToken, verifyStudent, studentController.createProfile);
router.put("/profile", verifyToken, verifyStudent, studentController.updateProfile);

// Public endpoints (accessible to logged-in users of any role)
router.get("/", verifyToken, studentController.getAllStudents);
router.get("/profile/:rollNumber", verifyToken, studentController.getPublicProfile);

module.exports = router;
