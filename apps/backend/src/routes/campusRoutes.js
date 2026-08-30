const express = require("express");
const router = express.Router();
const campusController = require("../controllers/campusController");
const { verifyToken, verifyStudent, verifyFacultyOrAdmin } = require("../middleware/auth");

// M1: Campus Finder
router.get("/locations", campusController.getAllLocations);
router.get("/locations/search", campusController.searchLocations);
router.get("/locations/:id", campusController.getLocationDetail);
router.get("/faculty", campusController.getAllFacultyCabins);
router.patch("/faculty/:id/status", verifyToken, campusController.updateFacultyStatus);
router.get("/route", campusController.getShortestPath);

// M3: Placements & Internships
router.get("/placements", verifyToken, campusController.getAllJobs);
router.post("/placements", verifyToken, verifyFacultyOrAdmin, campusController.createJob);
router.post("/placements/:id/apply", verifyToken, verifyStudent, campusController.applyToJob);

// M4: Career Profile, Achievements & Social Feed Routes
router.get("/profile/:studentId", verifyToken, campusController.getProfile);
router.post("/profile/:studentId", verifyToken, campusController.updateProfile);
router.put("/profile/:studentId", verifyToken, campusController.updateProfile);
router.get("/profile/:studentId/public", verifyToken, campusController.getPublicProfileView);

router.post("/achievements", verifyToken, campusController.createAchievement);
router.get("/achievements/:studentId", verifyToken, campusController.getStudentAchievements);
router.patch("/achievements/:id/verify", verifyToken, verifyFacultyOrAdmin, campusController.verifyAchievement);

router.get("/resume/:studentId/generate", verifyToken, campusController.generateResumePdf);
router.post("/resume/:studentId/generate", verifyToken, campusController.generateResumePdf);
router.post("/resume/:studentId/save", verifyToken, campusController.saveResumeVersion);
router.get("/resume/:studentId/saved", verifyToken, campusController.getSavedResumes);

router.post("/follow/:studentId", verifyToken, campusController.toggleFollowStudent);
router.post("/endorse", verifyToken, campusController.endorseSkill);
router.get("/feed", verifyToken, campusController.getActivityFeed);
router.post("/faculty/recommend", verifyToken, verifyFacultyOrAdmin, campusController.addFacultyRecommendation);
router.post("/upload-file", verifyToken, campusController.uploadFileEndpoint);

router.get("/discover/search", verifyToken, campusController.discoverSearch);
router.get("/discover/trending", verifyToken, campusController.discoverTrending);
router.get("/discover/rising-stars", verifyToken, campusController.discoverRisingStars);
router.get("/faculty/dashboard", verifyToken, verifyFacultyOrAdmin, campusController.getFacultyDashboard);

// M6: Campus Security & SOS
router.post("/sos", verifyToken, verifyStudent, campusController.createSOS);
router.get("/sos", verifyToken, verifyFacultyOrAdmin, campusController.getActiveSOS);
router.put("/sos/:id/resolve", verifyToken, verifyFacultyOrAdmin, campusController.resolveSOS);

// M7: Equipment & Resource Renting
router.get("/resources", verifyToken, verifyStudent, campusController.getMyResources);
router.post("/resources/issue", verifyToken, verifyStudent, campusController.issueResource);
router.post("/resources/:id/return", verifyToken, verifyStudent, campusController.returnResource);

// M8: Lost & Found
router.get("/lostfound", verifyToken, campusController.getAllLostFound);
router.post("/lostfound", verifyToken, campusController.reportLostFound);
router.put("/lostfound/:id/claim", verifyToken, campusController.claimLostFound);

module.exports = router;
