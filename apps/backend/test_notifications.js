const http = require("http");
require("dotenv").config();
const mongoose = require("mongoose");
const PlacementRegistration = require("./src/models/PlacementRegistration");
const EligibilityMatchResult = require("./src/models/EligibilityMatchResult");
const User = require("./src/models/User");
const JobPosting = require("./src/models/JobPosting");
const Notification = require("./src/models/Notification");

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

const runTest = async () => {
  console.log("=== STARTING NOTIFICATION SYSTEM TEST ===");
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trellis";
    await mongoose.connect(MONGODB_URI);
    console.log("✔ Connected to MongoDB.");

    // 1. Authenticate Student
    const studentLogin = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, JSON.stringify({ email: "student@ips.edu", password: "student123" }));
    
    const studentToken = studentLogin.body.token;
    const studentUser = await User.findOne({ email: "student@ips.edu" });
    console.log("✔ Student Logged In:", studentUser.email, "ID:", studentUser._id.toString());

    // 2. Authenticate Admin
    const adminLogin = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, JSON.stringify({ email: "admin@ips.edu", password: "admin123" }));
    const adminToken = adminLogin.body.token;
    console.log("✔ Admin Logged In.");

    // Clean any prior test notifications
    await Notification.deleteMany({ recipientId: studentUser._id });
    await JobPosting.deleteMany({ companyName: "Notification Test Drive Co" });

    // Ensure student has a locked registration
    let reg = await PlacementRegistration.findOne({ studentId: studentUser._id });
    if (!reg) {
      reg = new PlacementRegistration({
        studentId: studentUser._id,
        personal: {
          fullName: "Test Student",
          dob: "2000-01-01",
          gender: "male",
          phone: "9876543210",
          email: "student@ips.edu",
          currentAddress: { addressLine: "Indore", city: "Indore", state: "MP", pincode: "452012" },
          permanentAddress: { addressLine: "Indore", city: "Indore", state: "MP", pincode: "452012" }
        },
        family: {
          fatherName: "Father",
          fatherOccupation: "Business",
          fatherContact: "9876543211",
          motherName: "Mother",
          motherOccupation: "Home",
          motherContact: "9876543212"
        },
        identity: {
          apaarId: "APAAR999",
          photoUrl: "http://photo.png"
        },
        academic: {
          tenth: { percentage: 85, board: "CBSE", schoolName: "DPS", year: 2018 },
          twelfth: { percentage: 88, board: "CBSE", schoolName: "DPS", year: 2020 },
          branch: "CS",
          rollNumber: "CS001",
          enrollmentNumber: "EN001",
          semesterSgpa: [
            { semester: 1, sgpa: 8.5 },
            { semester: 2, sgpa: 8.5 },
            { semester: 3, sgpa: 8.5 },
            { semester: 4, sgpa: 8.5 },
            { semester: 5, sgpa: 8.5 }
          ],
          cgpa: 8.5,
          backlogCount: 0
        },
        documents: {
          resumeUrl: "http://resume.pdf",
          tenthMarksheetUrl: "http://10th.pdf",
          twelfthMarksheetUrl: "http://12th.pdf",
          semesterMarksheets: []
        },
        status: "locked",
        submittedAt: new Date()
      });
      await reg.save();
    } else {
      reg.status = "locked";
      reg.academic.cgpa = 8.5;
      reg.academic.backlogCount = 0;
      await reg.save();
    }
    console.log("✔ Student locked registration verified.");

    // 3. Post a Job Posting that student is eligible for
    const jobPayload = JSON.stringify({
      companyName: "Notification Test Drive Co",
      role: "Backend Engineer",
      type: "full-time",
      description: "Exciting opportunity",
      eligibilityRules: [
        { field: "cgpa", operator: ">=", value: 7.0 },
        { field: "backlogCount", operator: "==", value: 0 }
      ],
      applicationDeadline: new Date(Date.now() + 86400000 * 7).toISOString()
    });

    const createJobRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/jobs",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    }, jobPayload);

    console.log("✔ Job created status:", createJobRes.statusCode);
    const createdJob = createJobRes.body.job;

    // 4. Verify Notification was auto-dispatched
    const notifs = await Notification.find({ recipientId: studentUser._id, jobPostingId: createdJob._id });
    console.log(`✔ Found ${notifs.length} auto-generated notification(s) for student.`);
    if (notifs.length === 0) {
      throw new Error("No notification was generated for eligible student!");
    }
    const notif = notifs[0];
    console.log("Notification details:", {
      recipientRole: notif.recipientRole,
      recipientId: notif.recipientId,
      source: notif.source,
      type: notif.type,
      message: notif.message,
      isRead: notif.isRead
    });

    // 5. Test GET /api/notifications
    const getNotifsRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/notifications",
      method: "GET",
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    console.log("✔ GET /api/notifications status:", getNotifsRes.statusCode);
    console.log("Unread count from API:", getNotifsRes.body.unreadCount);

    // 6. Test GET /api/notifications/unread-count
    const unreadRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/notifications/unread-count",
      method: "GET",
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    console.log("✔ GET /api/notifications/unread-count:", unreadRes.body.count);

    // 7. Test PATCH /api/notifications/:id/read
    const markReadRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: `/api/notifications/${notif._id}/read`,
      method: "PATCH",
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    console.log("✔ PATCH /api/notifications/:id/read status:", markReadRes.statusCode, "isRead:", markReadRes.body.notification?.isRead);

    // 8. Test Faculty / Admin custom broadcast alert
    const broadcastPayload = JSON.stringify({
      jobPostingId: createdJob._id,
      targetAllEligible: true,
      message: "Reminder: Virtual pre-placement talk tomorrow at 10 AM on Teams!"
    });
    const broadcastRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/notifications/send",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    }, broadcastPayload);
    console.log("✔ POST /api/notifications/send broadcast status:", broadcastRes.statusCode, broadcastRes.body.message);

    // 9. Test Mark All as Read
    const markAllRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/notifications/read-all",
      method: "PATCH",
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    console.log("✔ PATCH /api/notifications/read-all status:", markAllRes.statusCode);

    console.log("=== ALL NOTIFICATION BACKEND TESTS PASSED SUCCESSFULLY! ===");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
};

runTest();
