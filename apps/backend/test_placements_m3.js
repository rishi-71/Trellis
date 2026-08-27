const http = require("http");
require("dotenv").config();
const mongoose = require("mongoose");
const PlacementRegistration = require("./src/models/PlacementRegistration");
const EligibilityMatchResult = require("./src/models/EligibilityMatchResult");
const User = require("./src/models/User");
const JobPosting = require("./src/models/JobPosting");
const AdminReport = require("./src/models/AdminReport");

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
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
  console.log("=== STARTING M3 PLACEMENT AUTO-TEST SUITE ===");
  try {
    // 0. Clean DB Sandbox
    console.log("Cleaning database sandbox records...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/trellis");
    const testUser = await User.findOne({ email: "student@ips.edu" });
    if (testUser) {
      await PlacementRegistration.deleteMany({ studentId: testUser._id });
      await EligibilityMatchResult.deleteMany({ studentId: testUser._id });
    }
    await JobPosting.deleteMany({ companyName: "Google Indore" });
    await AdminReport.deleteMany({});
    await mongoose.disconnect();
    console.log("✔ Sandbox cleaned successfully.");
    // 1. Authenticate Student
    const studentLoginData = JSON.stringify({ email: "student@ips.edu", password: "student123" });
    const studentLogin = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, studentLoginData);
    
    const studentToken = JSON.parse(studentLogin.body).token;
    console.log("✔ Student Authenticated successfully.");

    // 2. Authenticate Admin
    const adminLoginData = JSON.stringify({ email: "admin@ips.edu", password: "admin123" });
    const adminLogin = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, adminLoginData);
    
    const adminToken = JSON.parse(adminLogin.body).token;
    console.log("✔ Admin Authenticated successfully.");

    // Helper to change student semester to test window checks
    const setStudentSemester = async (semester) => {
      const payload = JSON.stringify({ semester });
      const res = await makeRequest({
        hostname: "localhost",
        port: 5000,
        path: "/api/profile/student@ips.edu",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          "Authorization": `Bearer ${studentToken}`
        }
      }, payload);
      console.log(`Semester set to ${semester}: status ${res.statusCode}, response: ${res.body}`);
    };

    // Case 1: Semester 5 student attempts registration -> Expect 403
    console.log("\nTesting Case 1: Semester 5 timing check...");
    await setStudentSemester(5);
    const regPayload1 = JSON.stringify({
      isDraft: true,
      personal: { 
        fullName: "Test Student", 
        dob: "2000-01-01", 
        gender: "male", 
        phone: "12345", 
        email: "student@ips.edu", 
        currentAddress: { addressLine: "Indore St", city: "Indore", state: "MP", pincode: "452012" },
        permanentAddress: { addressLine: "Indore St", city: "Indore", state: "MP", pincode: "452012" }
      },
      family: { fatherName: "F", fatherOccupation: "O", fatherContact: "123456", motherName: "M", motherOccupation: "O", motherContact: "654321" },
      identity: { apaarId: "APAAR123", photoUrl: "http://photo.png" },
      academic: { 
        tenth: { percentage: 80, board: "CBSE", schoolName: "Indore School", year: 2018 }, 
        twelfth: { percentage: 80, board: "CBSE", schoolName: "Indore School", year: 2020 }, 
        branch: "CSE", 
        rollNumber: "R123", 
        enrollmentNumber: "E123", 
        cgpa: 9.9, 
        semesterSgpa: [{ semester: 1, sgpa: 8.0 }] 
      },
      documents: { resumeUrl: "http://res.pdf", tenthMarksheetUrl: "http://10.pdf", twelfthMarksheetUrl: "http://12.pdf" }
    });
    const res1 = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/registration/student@ips.edu",
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${studentToken}` }
    }, regPayload1);
    console.log(`- Status code: ${res1.statusCode} (Expected: 403)`);
    console.log(`- Response: ${res1.body}`);

    // Case 2: Semester 6 student attempts registration -> Expect Allowed (200)
    console.log("\nTesting Case 2: Semester 6 timing check...");
    await setStudentSemester(6);
    const res2 = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/registration/student@ips.edu",
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${studentToken}` }
    }, regPayload1);
    console.log(`- Status code: ${res2.statusCode} (Expected: 200)`);

    // Case 5: Semester 9 student attempts registration -> Expect 403
    console.log("\nTesting Case 5: Semester 9 timing check...");
    await setStudentSemester(9);
    const res5 = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/registration/student@ips.edu",
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${studentToken}` }
    }, regPayload1);
    console.log(`- Status code: ${res5.statusCode} (Expected: 403)`);

    // Reset student semester to 6 for the remainder of the tests
    await setStudentSemester(6);

    // Case 6 & 7: Manual CGPA input override and SGPA derived verification
    console.log("\nTesting Case 6 & 7: Server-side CGPA calculation derivation...");
    const regPayload2 = JSON.stringify({
      isDraft: true,
      personal: { 
        fullName: "Test Student", 
        dob: "2000-01-01", 
        gender: "male", 
        phone: "12345", 
        email: "student@ips.edu", 
        currentAddress: { addressLine: "Indore St", city: "Indore", state: "MP", pincode: "452012" },
        permanentAddress: { addressLine: "Indore St", city: "Indore", state: "MP", pincode: "452012" }
      },
      family: { fatherName: "F", fatherOccupation: "O", fatherContact: "123456", motherName: "M", motherOccupation: "O", motherContact: "654321" },
      identity: { apaarId: "APAAR123", photoUrl: "http://photo.png" },
      academic: { 
        tenth: { percentage: 80, board: "CBSE", schoolName: "Indore School", year: 2018 }, 
        twelfth: { percentage: 80, board: "CBSE", schoolName: "Indore School", year: 2020 }, 
        branch: "CSE", 
        rollNumber: "R123", 
        enrollmentNumber: "E123", 
        cgpa: 9.9, // Send override CGPA
        semesterSgpa: [
          { semester: 1, sgpa: 7.5 },
          { semester: 2, sgpa: 8.0 },
          { semester: 3, sgpa: 7.8 },
          { semester: 4, sgpa: 8.2 },
          { semester: 5, sgpa: 8.5 }
        ] 
      },
      documents: { resumeUrl: "http://res.pdf", tenthMarksheetUrl: "http://10.pdf", twelfthMarksheetUrl: "http://12.pdf" }
    });
    const res6 = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/registration/student@ips.edu",
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${studentToken}` }
    }, regPayload2);
    const body6 = JSON.parse(res6.body);
    console.log(`- Recalculated CGPA: ${body6.registration.academic.cgpa} (Expected: 8.0)`);
    console.log(`- Mapped education gaps: Tenth-Twelfth Gap = ${body6.registration.academic.tenthToTwelfthGap}`);

    // Case 8: Normal submission validation checklist checks
    console.log("\nTesting Case 8: Normal validation verification (Semesters 1-5 required)...");
    const regPayloadNormalFailed = JSON.stringify({
      isDraft: false, // Locking submit
      personal: { 
        fullName: "Test Student", 
        dob: "2000-01-01", 
        gender: "male", 
        phone: "12345", 
        email: "student@ips.edu", 
        currentAddress: { addressLine: "Indore St", city: "Indore", state: "MP", pincode: "452012" },
        permanentAddress: { addressLine: "Indore St", city: "Indore", state: "MP", pincode: "452012" }
      },
      family: { fatherName: "F", fatherOccupation: "O", fatherContact: "123456", motherName: "M", motherOccupation: "O", motherContact: "654321" },
      identity: { apaarId: "APAAR123", photoUrl: "http://photo.png" },
      academic: { 
        tenth: { percentage: 80, board: "CBSE", schoolName: "Indore School", year: 2018 }, 
        twelfth: { percentage: 80, board: "CBSE", schoolName: "Indore School", year: 2020 }, 
        branch: "CSE", 
        rollNumber: "R123", 
        enrollmentNumber: "E123", 
        semesterSgpa: [
          { semester: 1, sgpa: 7.5 },
          { semester: 2, sgpa: 8.0 }
        ] // Missing Semesters 3-5
      },
      documents: { resumeUrl: "http://res.pdf", tenthMarksheetUrl: "http://10.pdf", twelfthMarksheetUrl: "http://12.pdf" }
    });
    const res8 = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/registration/student@ips.edu",
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${studentToken}` }
    }, regPayloadNormalFailed);
    console.log(`- Normal Locked Submit missing semesters status: ${res8.statusCode} (Expected: 400)`);
    console.log(`- Message: ${res8.body}`);

    // Case 9: Retry flow validation (uses Semester 1-4)
    console.log("\nTesting Case 9: Retry submission validation (uses Semesters 1-4)...");
    const regPayloadRetrySuccess = JSON.stringify({
      isDraft: false, // Lock profile
      isRetryAttempt: true,
      personal: { 
        fullName: "Test Student", 
        dob: "2000-01-01", 
        gender: "male", 
        phone: "12345", 
        email: "student@ips.edu", 
        currentAddress: { addressLine: "Indore St", city: "Indore", state: "MP", pincode: "452012" },
        permanentAddress: { addressLine: "Indore St", city: "Indore", state: "MP", pincode: "452012" }
      },
      family: { fatherName: "F", fatherOccupation: "O", fatherContact: "123456", motherName: "M", motherOccupation: "O", motherContact: "654321" },
      identity: { apaarId: "APAAR123", photoUrl: "http://photo.png" },
      academic: { 
        tenth: { percentage: 80, board: "CBSE", schoolName: "Indore School", year: 2018 }, 
        twelfth: { percentage: 80, board: "CBSE", schoolName: "Indore School", year: 2020 }, 
        branch: "CSE", 
        rollNumber: "R123", 
        enrollmentNumber: "E123", 
        semesterSgpa: [
          { semester: 1, sgpa: 8.0 },
          { semester: 2, sgpa: 8.0 },
          { semester: 3, sgpa: 8.0 },
          { semester: 4, sgpa: 8.0 }
        ] 
      },
      documents: { resumeUrl: "http://res.pdf", tenthMarksheetUrl: "http://10.pdf", twelfthMarksheetUrl: "http://12.pdf" }
    });
    const res9 = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/registration/student@ips.edu",
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${studentToken}` }
    }, regPayloadRetrySuccess);
    console.log(`- Retry Locked Submit status code: ${res9.statusCode} (Expected: 200)`);

    // Case 11: Edit draft after lock is blocked
    console.log("\nTesting Case 11: Block editing of locked registration...");
    const res11 = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/registration/student@ips.edu",
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${studentToken}` }
    }, regPayload2);
    console.log(`- Lock edit block status code: ${res11.statusCode} (Expected: 403)`);

    // Case 12: Admin edit locked registration and audit log entry
    console.log("\nTesting Case 12: Admin edit verification and audit logging...");
    const adminEditPayload = JSON.stringify({
      "academic.backlogCount": 2,
      "personal.fullName": "Test Student Audited"
    });
    const res12 = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/registration/student@ips.edu/admin-edit",
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${adminToken}` 
      }
    }, adminEditPayload);
    const body12 = JSON.parse(res12.body);
    console.log(`- Admin edit status code: ${res12.statusCode} (Expected: 200)`);
    console.log(`- Audit logs length: ${body12.registration.editLog.length}`);
    console.log(`- Audit log entry: ${JSON.stringify(body12.registration.editLog[0])}`);

    // Case 13: Job creation triggers matching
    console.log("\nTesting Case 13: Job posting creation auto-matching...");
    const jobPayload = JSON.stringify({
      companyName: "Google Indore",
      role: "Software Development Engineer",
      type: "full-time",
      description: "Indore campus hiring",
      eligibilityRules: [
        { field: "cgpa", operator: ">=", value: 8.5 }, // Student has 8.0, should be INELIGIBLE
        { field: "branch", operator: "in", value: ["cse", "it"] }
      ],
      applicationDeadline: new Date(Date.now() + 5000) // 5 seconds deadline
    });
    const res13 = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/placement/jobs",
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` }
    }, jobPayload);
    const jobData = JSON.parse(res13.body).job;
    console.log(`- Job created status code: ${res13.statusCode} (Expected: 200)`);

    // Case 14 & 15: Fetch eligibility matches
    console.log("\nTesting Case 14 & 15: Matching decision eligible vs ineligible failure breakdown...");
    const res14 = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: `/api/placement/jobs?studentEmail=student@ips.edu`,
      method: "GET",
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    const matchObj = JSON.parse(res14.body).jobs.find(j => j.jobPostingId._id === jobData._id);
    console.log(`- Student is Eligible: ${matchObj.isEligible} (Expected: false)`);
    console.log(`- Failed conditions message: ${matchObj.failedConditions[0].message}`);

    console.log("\n=== M3 PLACEMENT AUTO-TEST SUITE COMPLETED ===");
    process.exit(0);
  } catch (err) {
    console.error("Test suite failed:", err);
    process.exit(1);
  }
};

runTest();
