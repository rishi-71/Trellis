const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/sensorController");
const { verifyToken } = require("../middleware/auth");

// 1. SENSOR CATALOG ENDPOINTS
router.get("/sensors", verifyToken, sensorController.listSensors);
router.post("/sensors", verifyToken, sensorController.createSensor);
router.patch("/sensors/:id", verifyToken, sensorController.updateSensor);

// 2. REQUESTS lifecycles
router.post("/sensor-requests", verifyToken, sensorController.submitRequest);
router.get("/sensor-requests/pending", verifyToken, sensorController.getPendingRequests);
router.get("/sensor-requests/:studentId", verifyToken, sensorController.getStudentRequests);
router.patch("/sensor-requests/:id/approve", verifyToken, sensorController.approveRequest);
router.patch("/sensor-requests/:id/issue", verifyToken, sensorController.issueRequest);
router.patch("/sensor-requests/:id/return", verifyToken, sensorController.returnRequest);
router.patch("/sensor-requests/:id/mark-lost", verifyToken, sensorController.markLostRequest);

// 3. FINES ENDPOINTS
router.get("/fines/:studentId", verifyToken, sensorController.getStudentFines);
router.patch("/fines/:id/mark-paid", verifyToken, sensorController.markFinePaid);

// 4. DAMAGE/LOSS CASES ENDPOINTS
router.post("/damage-cases", verifyToken, sensorController.logDamageLossCase);
router.patch("/damage-cases/:id/resolve", verifyToken, sensorController.resolveDamageLossCase);

// 5. CONFIGURATION ENDPOINTS
router.get("/admin/fine-config", verifyToken, sensorController.getFineConfig);
router.patch("/admin/fine-config", verifyToken, sensorController.updateFineConfig);

// 6. DASHBOARDS ENDPOINTS
router.get("/admin/dashboard", verifyToken, sensorController.getAdminDashboard);

module.exports = router;
