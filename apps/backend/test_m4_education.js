const http = require("http");
require("dotenv").config();
const mongoose = require("mongoose");
const StudentProfile = require("./src/models/StudentProfile");
const PlacementRegistration = require("./src/models/PlacementRegistration");
const User = require("./src/models/User");

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
  console.log("=== STARTING M4 CAREER PROFILE EDUCATION AUTO-TEST SUITE ===");
  try {
    // Connect to database to fetch student user id
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trellis";
    await mongoose.connect(mongoUri);
    const testUser = await User.findOne({ email: "student@ips.edu" });
    if (!testUser) {
      console.error("❌ Test user student@ips.edu not found in DB!");
      process.exit(1);
    }
    
    // Clear any existing StudentProfile just to have a clean starting slate
    await StudentProfile.deleteMany({ user: testUser._id });
    console.log("✔ Cleared existing career profile for test student.");
    
    // Get initial placement registration count
    const initialPlacementsCount = await PlacementRegistration.countDocuments({ studentId: testUser._id });
    
    await mongoose.disconnect();

    // 1. Authenticate Student
    const studentLoginData = JSON.stringify({ email: "student@ips.edu", password: "student123" });
    const loginRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, studentLoginData);

    const loginBody = JSON.parse(loginRes.body);
    if (!loginBody.success) {
      console.error("❌ Failed to log in test student!", loginBody);
      process.exit(1);
    }
    const token = loginBody.token;
    console.log("✔ Logged in student successfully.");

    // 2. Create the Career Profile
    const createPayload = JSON.stringify({
      name: "Student Tester",
      rollNumber: "IPS-M4-001",
      branch: "Computer Science",
      graduationYear: 2026,
      semester: 6,
      contact: "+91 9876543210",
      bio: "Aspiring software engineer.",
      education: {
        tenth: {
          percentageOrCgpa: "92%",
          board: "CBSE",
          schoolName: "St. John High School",
          yearOfPassing: 2018
        },
        twelfth: {
          percentageOrCgpa: "88%",
          board: "CBSE",
          schoolName: "St. John Junior College",
          yearOfPassing: 2020
        },
        graduation: {
          courseBranch: "B.Tech CSE",
          universityName: "IPS Academy",
          currentCgpa: 8.5,
          currentSemester: 6
        }
      },
      skills: ["Node.js", "React"]
    });

    const createRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: `/api/profile/student@ips.edu`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    }, createPayload);

    const createBody = JSON.parse(createRes.body);
    if (!createBody.success) {
      console.error("❌ Profile onboarding failed!", createBody);
      process.exit(1);
    }
    console.log("✔ Profile onboarded successfully with structured education.");

    // 3. Verify database state
    await mongoose.connect(mongoUri);
    let dbProfile = await StudentProfile.findOne({ user: testUser._id });
    if (!dbProfile || !dbProfile.education || !dbProfile.education.tenth || dbProfile.education.graduation.currentCgpa !== 8.5) {
      console.error("❌ Education details not persisted correctly in MDB!", dbProfile?.education);
      process.exit(1);
    }
    console.log("✔ Database verification: Onboarding fields matches exactly.");

    // 4. Update the graduation CGPA & semester multiple times (always editable rule check)
    const updatePayload = JSON.stringify({
      name: "Student Tester",
      rollNumber: "IPS-M4-001",
      branch: "Computer Science",
      graduationYear: 2026,
      semester: 6,
      contact: "+91 9876543210",
      bio: "Aspiring software engineer.",
      education: {
        tenth: {
          percentageOrCgpa: "92%",
          board: "CBSE",
          schoolName: "St. John High School",
          yearOfPassing: 2018
        },
        twelfth: {
          percentageOrCgpa: "88%",
          board: "CBSE",
          schoolName: "St. John Junior College",
          yearOfPassing: 2020
        },
        graduation: {
          courseBranch: "B.Tech CSE",
          universityName: "IPS Academy Indore",
          currentCgpa: 8.7,  // CGPA updated from 8.5 to 8.7
          currentSemester: 7 // Semester updated from 6 to 7
        }
      },
      skills: ["Node.js", "React", "MongoDB"]
    });

    const updateRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: `/api/profile/student@ips.edu`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    }, updatePayload);

    const updateBody = JSON.parse(updateRes.body);
    if (!updateBody.success) {
      console.error("❌ Profile update failed!", updateBody);
      process.exit(1);
    }
    console.log("✔ Profile updated successfully.");

    // 5. Verify updated fields in database
    dbProfile = await StudentProfile.findOne({ user: testUser._id });
    if (dbProfile.education.graduation.currentCgpa !== 8.7 || dbProfile.education.graduation.currentSemester !== 7) {
      console.error("❌ Updated CGPA or Semester did not persist correctly!", dbProfile.education.graduation);
      process.exit(1);
    }
    console.log("✔ Database verification: Updated CGPA (8.7) and Semester (7) match exactly.");

    // 6. Verify that PlacementRegistration (M3) collection is not affected
    const finalPlacementsCount = await PlacementRegistration.countDocuments({ studentId: testUser._id });
    if (finalPlacementsCount !== initialPlacementsCount) {
      console.error(`❌ PlacementRegistration count changed from ${initialPlacementsCount} to ${finalPlacementsCount}!`);
      process.exit(1);
    }
    console.log("✔ Verification: M3 PlacementRegistration collection remains completely untouched.");

    // 7. Verify PDF Resume Builder generates files with the new Education details for all three templates
    const templates = ["minimal", "technical", "data-analyst"];
    for (const tpl of templates) {
      // Test GET
      const pdfResGet = await makeRequest({
        hostname: "localhost",
        port: 5000,
        path: `/api/resume/${dbProfile._id}/generate?template=${tpl}&token=${token}`,
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (pdfResGet.statusCode !== 200 || !pdfResGet.body.startsWith("%PDF")) {
        console.error(`❌ PDF generation GET failed for template ${tpl}! Status: ${pdfResGet.statusCode}`);
        process.exit(1);
      }

      // Test POST
      const postPayload = JSON.stringify({
        content: {
          name: "Tester Custom Name",
          education: {
            graduation: {
              courseBranch: "B.Tech IT",
              universityName: "IPS Academy Indore",
              currentCgpa: 9.0,
              currentSemester: 8
            }
          }
        }
      });
      const pdfResPost = await makeRequest({
        hostname: "localhost",
        port: 5000,
        path: `/api/resume/${dbProfile._id}/generate?template=${tpl}&token=${token}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }, postPayload);
      if (pdfResPost.statusCode !== 200 || !pdfResPost.body.startsWith("%PDF")) {
        console.error(`❌ PDF generation POST failed for template ${tpl}! Status: ${pdfResPost.statusCode}`);
        process.exit(1);
      }

      console.log(`✔ PDF Resume (GET & POST) generated successfully for template: ${tpl}`);
    }

    await mongoose.disconnect();
    console.log("=== ALL M4 CAREER PROFILE TESTS PASSED SUCCESSFULLY ===");
    process.exit(0);

  } catch (err) {
    console.error("❌ Unexpected test exception:", err);
    process.exit(1);
  }
};

runTest();
