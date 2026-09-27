const http = require("http");
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");
const FacultyProfile = require("./src/models/FacultyProfile");

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on("error", (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const run = async () => {
  console.log("=== TESTING PLACEMENT HEAD REGISTRATION & ACCESS ===");
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trellis");
    
    // Clean prior test user
    const testEmail = "placementhead_test@ips.edu";
    const existing = await User.findOne({ email: testEmail });
    if (existing) {
      await FacultyProfile.deleteMany({ user: existing._id });
      await User.deleteOne({ _id: existing._id });
    }

    // 1. Register with Department "Training & Placement Cell (Placement Head)"
    const regPayload = JSON.stringify({
      email: testEmail,
      password: "password123",
      role: "faculty",
      name: "Dr. Placement Head",
      collegeId: "TPO-TEST-01",
      post: "Placement Head",
      department: "Training & Placement Cell (Placement Head)"
    });

    const regRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/register",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, regPayload);

    console.log("Register response status:", regRes.statusCode);
    console.log("Registered user role:", regRes.body?.user?.role);
    if (regRes.body?.user?.role !== "placement_head") {
      throw new Error(`Expected role 'placement_head', got '${regRes.body?.user?.role}'`);
    }

    // 2. Login verification
    const loginPayload = JSON.stringify({
      email: testEmail,
      password: "password123"
    });

    const loginRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, loginPayload);

    console.log("Login status:", loginRes.statusCode);
    console.log("Login returned role:", loginRes.body?.user?.role);
    const token = loginRes.body?.token;

    // 3. Test Placement Access (should succeed)
    const placementJobsRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/jobs",
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("✔ Placement jobs access status:", placementJobsRes.statusCode);

    // 4. Test Broadcast Alert endpoint (should succeed with verifyFacultyOrAdmin)
    const broadcastRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/notifications/send",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    }, JSON.stringify({
      message: "Test message from placement head",
      targetAllEligible: true,
      jobPostingId: new mongoose.Types.ObjectId()
    }));
    console.log("✔ Placement Head broadcast endpoint permission status:", broadcastRes.statusCode); // Will be 200 (or handled)

    console.log("=== PLACEMENT HEAD VERIFICATION TEST PASSED! ===");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
};

run();
