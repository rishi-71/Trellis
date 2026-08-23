const Location = require("../models/Location");
const Job = require("../models/Job");
const ResourceIssue = require("../models/ResourceIssue");
const LostFound = require("../models/LostFound");
const SOSAlert = require("../models/SOSAlert");
const Activity = require("../models/Activity");
const StudentProfile = require("../models/StudentProfile");
const FacultyCabin = require("../models/FacultyCabin");
const NavNode = require("../models/NavNode");
const mongoose = require("mongoose");
const Achievement = require("../models/Achievement");
const Resume = require("../models/Resume");
const Endorsement = require("../models/Endorsement");
const Follow = require("../models/Follow");
const ActivityFeedPost = require("../models/ActivityFeedPost");
const FacultyRecommendation = require("../models/FacultyRecommendation");
const PointsConfig = require("../models/PointsConfig");
const User = require("../models/User");

// -------------------------------------------------------------
// M1: CAMPUS FINDER
// -------------------------------------------------------------
exports.getAllLocations = async (req, res) => {
  try {
    let query = {};
    if (req.query.category) {
      query.category = req.query.category;
    }

    let locations = await Location.find({});
    const hasCategory = locations.some(l => l.category);
    if (locations.length === 0 || !hasCategory) {
      await Location.deleteMany({});
      const defaultLocations = [
        { name: "Computer Lab 4", category: "lab", building: "Block A", floor: 2, x: 80, y: 130, description: "Go to Block A, take the stairs to the 2nd floor, turn left past the library." },
        { name: "Fire Safety Lab", category: "lab", building: "Block C", floor: 0, x: 110, y: 320, description: "C-Block Ground floor, next to the main workshop exit." },
        { name: "Chemistry Lab", category: "lab", building: "Block B", floor: 1, x: 220, y: 170, description: "B-Block 1st floor, opposite to the seminar room." },
        { name: "Main Auditorium", category: "classroom", building: "Block A", floor: 0, x: 120, y: 170, description: "Entrance from the central lawn, Block A ground floor." },
        { name: "Mechanical Workshop", category: "lab", building: "Block D", floor: 0, x: 220, y: 320, description: "D-Block ground floor, spacious hangar behind Block C." },
        { name: "Placement Cell", category: "other", building: "Block B", floor: 2, x: 230, y: 160, description: "B-Block 2nd floor, Room 204 near Faculty Cabin." },
        
        { name: "Indore Central Canteen", category: "canteen", building: "Block C", floor: 0, x: 80, y: 280, description: "Canteen serving Indian snacks, located in Block C ground floor." },
        { name: "Main Sports Ground", category: "ground", building: "Outdoors", floor: 0, x: 150, y: 80, description: "Outdoor sports track and cricket ground." },
        { name: "Central Library", category: "library", building: "Block A", floor: 1, x: 130, y: 140, description: "Silent reading rooms and textbook issue center, Block A 1st floor." },
        { name: "Block A Washrooms", category: "washroom", building: "Block A", floor: 1, x: 70, y: 160, description: "Hygiene utilities in Block A 1st floor lobby." },
        { name: "Main Parking Lot", category: "parking", building: "Outdoors", floor: 0, x: 50, y: 40, description: "Staff and student vehicle parking area near main gate." },
        { name: "Central Printer Center", category: "printer", building: "Block B", floor: 0, x: 180, y: 140, description: "Photocopy and document print services, Block B ground floor." },

        { name: "Cabin B-201 (HOD CSE)", category: "faculty-cabin", building: "Block B", floor: 2, x: 210, y: 150, description: "CSE Department Head office room, Block B 2nd floor." },
        { name: "Cabin B-202 (Prof. Sharma)", category: "faculty-cabin", building: "Block B", floor: 2, x: 220, y: 150, description: "Senior faculty cabin, Block B 2nd floor." },
        { name: "Cabin A-105 (Dean Office)", category: "faculty-cabin", building: "Block A", floor: 1, x: 90, y: 150, description: "Academic dean cabin room, Block A 1st floor." }
      ];
      locations = await Location.insertMany(defaultLocations);

      // Auto-seed Faculty Cabins
      await FacultyCabin.deleteMany({});
      const hodCse = await Location.findOne({ name: "Cabin B-201 (HOD CSE)" });
      const profSharma = await Location.findOne({ name: "Cabin B-202 (Prof. Sharma)" });
      const deanOffice = await Location.findOne({ name: "Cabin A-105 (Dean Office)" });

      const defaultCabins = [
        { facultyName: "Dr. Sanjay Kumar", department: "Computer Science & Eng", locationId: hodCse?._id, availabilityStatus: "free" },
        { facultyName: "Prof. Ritesh Sharma", department: "Information Technology", locationId: profSharma?._id, availabilityStatus: "busy" },
        { facultyName: "Dr. Anjali Verma", department: "Electrical Engineering", locationId: deanOffice?._id, availabilityStatus: "not-in-cabin" }
      ];
      await FacultyCabin.insertMany(defaultCabins);

      // Auto-seed Nav Nodes
      await NavNode.deleteMany({});
      const defaultNodes = [
        {
          idStr: "node-home", floor: 0, x: 10, y: 10, name: "Gate 1 Entrance",
          connectedNodeIds: [
            { nodeId: "node-a-g", distance: 50 },
            { nodeId: "node-c-g", distance: 100 }
          ]
        },
        {
          idStr: "node-a-g", floor: 0, x: 100, y: 150, name: "Block A Entrance",
          connectedNodeIds: [
            { nodeId: "node-home", distance: 50 },
            { nodeId: "node-b-g", distance: 100 },
            { nodeId: "node-a-1", distance: 20 }
          ]
        },
        {
          idStr: "node-b-g", floor: 0, x: 200, y: 150, name: "Block B Entrance",
          connectedNodeIds: [
            { nodeId: "node-a-g", distance: 100 },
            { nodeId: "node-d-g", distance: 150 },
            { nodeId: "node-b-1", distance: 20 }
          ]
        },
        {
          idStr: "node-c-g", floor: 0, x: 100, y: 300, name: "Block C Entrance",
          connectedNodeIds: [
            { nodeId: "node-home", distance: 100 },
            { nodeId: "node-d-g", distance: 100 }
          ]
        },
        {
          idStr: "node-d-g", floor: 0, x: 200, y: 300, name: "Block D Entrance",
          connectedNodeIds: [
            { nodeId: "node-b-g", distance: 150 },
            { nodeId: "node-c-g", distance: 100 }
          ]
        },
        {
          idStr: "node-a-1", floor: 1, x: 100, y: 150, name: "Block A 1st Floor",
          connectedNodeIds: [
            { nodeId: "node-a-g", distance: 20 },
            { nodeId: "node-a-2", distance: 20 },
            { nodeId: "node-b-1", distance: 100 }
          ]
        },
        {
          idStr: "node-a-2", floor: 2, x: 100, y: 150, name: "Block A 2nd Floor",
          connectedNodeIds: [
            { nodeId: "node-a-1", distance: 20 }
          ]
        },
        {
          idStr: "node-b-1", floor: 1, x: 200, y: 150, name: "Block B 1st Floor",
          connectedNodeIds: [
            { nodeId: "node-b-g", distance: 20 },
            { nodeId: "node-b-2", distance: 20 },
            { nodeId: "node-a-1", distance: 100 }
          ]
        },
        {
          idStr: "node-b-2", floor: 2, x: 200, y: 150, name: "Block B 2nd Floor",
          connectedNodeIds: [
            { nodeId: "node-b-1", distance: 20 }
          ]
        }
      ];
      await NavNode.insertMany(defaultNodes);
    }

    if (req.query.category) {
      locations = await Location.find(query);
    } else {
      locations = await Location.find({});
    }

    res.json({ success: true, locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// M3: PLACEMENTS & INTERNSHIPS
// -------------------------------------------------------------
exports.getAllJobs = async (req, res) => {
  try {
    let jobs = await Job.find({}).populate("applicants", "email");
    // Seed default jobs if empty
    if (jobs.length === 0) {
      const defaultJobs = [
        {
          title: "Software Engineer Intern",
          company: "Microsoft",
          description: "Develop cloud infrastructures and web services. Requirements: JavaScript/Python.",
          type: "internship",
          eligibility: { cgpa: 8.5, branch: "Computer Science" },
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        },
        {
          title: "Graduate Engineer Trainee (GET)",
          company: "TCS Digital",
          description: "Full stack web development, cloud solutions. Training program included.",
          type: "fulltime",
          eligibility: { cgpa: 7.0, branch: "All Branches" },
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        },
        {
          title: "Safety Inspector Trainee",
          company: "Capgemini",
          description: "Manage safety systems audit, fire risk assessments on cloud environments.",
          type: "fulltime",
          eligibility: { cgpa: 7.5, branch: "Fire Technology & Safety Engineering" },
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
        }
      ];
      jobs = await Job.insertMany(defaultJobs);
    }
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { title, company, description, type, cgpa, branch, deadline } = req.body;
    const job = new Job({
      title,
      company,
      description,
      type,
      eligibility: { cgpa: parseFloat(cgpa) || 0, branch: branch || "All Branches" },
      deadline: new Date(deadline)
    });
    await job.save();
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    if (job.applicants.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: "Already applied to this job" });
    }
    job.applicants.push(req.user.id);
    await job.save();
    res.json({ success: true, message: "Application submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// M5: STUDENT OF THE YEAR & LEADERBOARD
// -------------------------------------------------------------
exports.getLeaderboard = async (req, res) => {
  try {
    const { branch, year, category, scope } = req.query;
    
    let filter = {};
    if (branch) filter.branch = branch;
    if (year) filter.graduationYear = parseInt(year);
    
    let profiles = await StudentProfile.find(filter).populate("user", "email").sort({ totalPoints: -1 });
    
    if (scope === "category" && category) {
      const achievements = await Achievement.find({ category, status: "verified" });
      const studentPointsMap = new Map();
      achievements.forEach(ach => {
        const sid = ach.studentId.toString();
        studentPointsMap.set(sid, (studentPointsMap.get(sid) || 0) + ach.pointsAwarded);
      });
      
      profiles = profiles.map(p => {
        const pObj = p.toObject();
        pObj.categoryPoints = studentPointsMap.get(p._id.toString()) || 0;
        return pObj;
      }).filter(p => p.categoryPoints > 0)
        .sort((a, b) => b.categoryPoints - a.categoryPoints);
    }

    const leaderboard = profiles.map((p, index) => ({
      rank: index + 1,
      studentId: p._id,
      name: p.name,
      rollNumber: p.rollNumber,
      branch: p.branch,
      graduationYear: p.graduationYear,
      semester: p.semester,
      points: p.categoryPoints !== undefined ? p.categoryPoints : p.totalPoints,
      talentTags: p.talentTags,
      badge: index === 0 ? "Student of the Year" : index === 1 ? "Top Runner-Up" : null
    }));

    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// M6: CAMPUS SECURITY & SOS
// -------------------------------------------------------------
exports.createSOS = async (req, res) => {
  try {
    const { location } = req.body;
    const alert = new SOSAlert({
      student: req.user.id,
      location: location || "Unknown Location"
    });
    await alert.save();
    res.json({ success: true, alert, message: "SOS Emergency Alert dispatched to Security Officers!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActiveSOS = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ status: "active" })
      .populate("student", "email")
      .sort({ timestamp: -1 });
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resolveSOS = async (req, res) => {
  try {
    const alert = await SOSAlert.findByIdAndUpdate(req.params.id, { status: "resolved" }, { new: true });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// M7: EQUIPMENT & RESOURCE ISSUE
// -------------------------------------------------------------
exports.getMyResources = async (req, res) => {
  try {
    const issues = await ResourceIssue.find({ student: req.user.id });
    
    // Update live fine calculations for active issues
    const now = new Date();
    const updatedIssues = issues.map(issue => {
      const finePerDay = 50; // Fine rate: Rs 50/day
      let calculatedFine = 0;
      if (issue.status === 'issued' && now > new Date(issue.dueDate)) {
        const diffTime = Math.abs(now.getTime() - new Date(issue.dueDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        calculatedFine = diffDays * finePerDay;
      } else {
        calculatedFine = issue.fine;
      }
      return {
        ...issue.toObject(),
        fine: calculatedFine
      };
    });

    res.json({ success: true, resources: updatedIssues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.issueResource = async (req, res) => {
  try {
    const { resourceName, category } = req.body;
    
    // Default rent period: 7 days
    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const issue = new ResourceIssue({
      student: req.user.id,
      resourceName,
      category,
      issueDate,
      dueDate,
      status: 'issued'
    });
    await issue.save();
    res.json({ success: true, issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.returnResource = async (req, res) => {
  try {
    const issue = await ResourceIssue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: "Rental record not found" });
    }

    const now = new Date();
    const finePerDay = 50;
    let finalFine = 0;
    if (now > new Date(issue.dueDate)) {
      const diffTime = Math.abs(now.getTime() - new Date(issue.dueDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      finalFine = diffDays * finePerDay;
    }

    issue.status = 'returned';
    issue.returnDate = now;
    issue.fine = finalFine;
    await issue.save();

    res.json({ success: true, issue, message: `Resource returned successfully. Total Fine: Rs. ${finalFine}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// M8: LOST & FOUND
// -------------------------------------------------------------
exports.getAllLostFound = async (req, res) => {
  try {
    const items = await LostFound.find({}).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reportLostFound = async (req, res) => {
  try {
    const { title, type, description, location, contact } = req.body;
    const item = new LostFound({
      reporter: req.user.id,
      title,
      type,
      description,
      location,
      contact
    });
    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.claimLostFound = async (req, res) => {
  try {
    const item = await LostFound.findByIdAndUpdate(req.params.id, { status: "claimed" }, { new: true });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLocationDetail = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: "Location not found" });
    res.json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchLocations = async (req, res) => {
  try {
    const query = req.query.q || "";
    const locations = await Location.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { building: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ]
    });
    res.json({ success: true, locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllFacultyCabins = async (req, res) => {
  try {
    const search = req.query.name || "";
    let filter = {};
    if (search) {
      filter.facultyName = { $regex: search, $options: "i" };
    }
    const cabins = await FacultyCabin.find(filter).populate("locationId");
    res.json({ success: true, cabins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFacultyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const cabin = await FacultyCabin.findByIdAndUpdate(
      req.params.id,
      { availabilityStatus: status },
      { new: true }
    ).populate("locationId");
    res.json({ success: true, cabin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getShortestPath = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ success: false, message: "Missing from or to parameters" });
    }

    const mongoose = require("mongoose");
    let startNodeId = from;
    let endNodeId = to;

    if (mongoose.Types.ObjectId.isValid(from)) {
      const loc = await Location.findById(from);
      if (loc) {
        const nearNodes = await NavNode.find({ floor: loc.floor });
        if (nearNodes.length > 0) {
          nearNodes.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.x - loc.x, 2) + Math.pow(a.y - loc.y, 2));
            const distB = Math.sqrt(Math.pow(b.x - loc.x, 2) + Math.pow(b.y - loc.y, 2));
            return distA - distB;
          });
          startNodeId = nearNodes[0].idStr;
        }
      }
    }

    if (mongoose.Types.ObjectId.isValid(to)) {
      const loc = await Location.findById(to);
      if (loc) {
        const nearNodes = await NavNode.find({ floor: loc.floor });
        if (nearNodes.length > 0) {
          nearNodes.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.x - loc.x, 2) + Math.pow(a.y - loc.y, 2));
            const distB = Math.sqrt(Math.pow(b.x - loc.x, 2) + Math.pow(b.y - loc.y, 2));
            return distA - distB;
          });
          endNodeId = nearNodes[0].idStr;
        }
      }
    }

    const nodes = await NavNode.find({});
    const nodeMap = new Map();
    nodes.forEach(n => nodeMap.set(n.idStr, n));

    if (!nodeMap.has(startNodeId)) startNodeId = "node-home";
    if (!nodeMap.has(endNodeId)) endNodeId = "node-a-g";

    const pathResult = await findAStarPath(startNodeId, endNodeId);
    if (!pathResult) {
      return res.status(404).json({ success: false, message: "No path found between nodes." });
    }

    const directions = [];
    const path = pathResult.path;
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      if (current.floor !== next.floor) {
        directions.push(`Take the stairs or elevator to the ${next.floor === 0 ? "Ground" : next.floor === 1 ? "1st" : "2nd"} floor.`);
      } else {
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        let desc = `Go straight from ${current.name || "corridor"} towards ${next.name || "lobby"}`;
        if (Math.abs(dx) > Math.abs(dy)) {
          desc += dx > 0 ? " (heading East)" : " (heading West)";
        } else {
          desc += dy > 0 ? " (heading South)" : " (heading North)";
        }
        directions.push(`${desc} for approximately ${Math.abs(dx || dy)} meters.`);
      }
    }

    res.json({
      success: true,
      path: path.map(n => ({ id: n.idStr, floor: n.floor, x: n.x, y: n.y, name: n.name })),
      totalDistance: pathResult.distance,
      directions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function findAStarPath(startNodeId, endNodeId) {
  const nodes = await NavNode.find({});
  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.idStr, n));

  if (!nodeMap.has(startNodeId) || !nodeMap.has(endNodeId)) return null;

  const openSet = [startNodeId];
  const closedSet = new Set();

  const gScore = new Map();
  const fScore = new Map();
  const cameFrom = new Map();

  nodes.forEach(n => {
    gScore.set(n.idStr, Infinity);
    fScore.set(n.idStr, Infinity);
  });

  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, heuristic(nodeMap.get(startNodeId), nodeMap.get(endNodeId)));

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore.get(a) - fScore.get(b));
    const currentId = openSet.shift();

    if (currentId === endNodeId) {
      const path = [];
      let temp = currentId;
      while (cameFrom.has(temp)) {
        path.push(nodeMap.get(temp));
        temp = cameFrom.get(temp);
      }
      path.push(nodeMap.get(startNodeId));
      return { path: path.reverse(), distance: gScore.get(endNodeId) };
    }

    closedSet.add(currentId);
    const current = nodeMap.get(currentId);

    for (const conn of current.connectedNodeIds) {
      const neighborId = conn.nodeId;
      if (closedSet.has(neighborId)) continue;

      const neighbor = nodeMap.get(neighborId);
      if (!neighbor) continue;

      const tentativeG = gScore.get(currentId) + conn.distance;

      if (!openSet.includes(neighborId)) {
        openSet.push(neighborId);
      } else if (tentativeG >= gScore.get(neighborId)) {
        continue;
      }

      cameFrom.set(neighborId, currentId);
      gScore.set(neighborId, tentativeG);
      fScore.set(neighborId, tentativeG + heuristic(neighbor, nodeMap.get(endNodeId)));
    }
  }

  return null;
}

function heuristic(nodeA, nodeB) {
  const floorDiff = Math.abs(nodeA.floor - nodeB.floor);
  return Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2)) + floorDiff * 100;
}

// -------------------------------------------------------------
// M4: CAREER PROFILE & SOCIAL DISCOVERY
// -------------------------------------------------------------

exports.getProfile = async (req, res) => {
  try {
    let { studentId } = req.params;
    if (studentId && studentId.includes("@")) {
      const userObj = await User.findOne({ email: studentId });
      if (userObj) studentId = userObj._id;
    }
    let profile = await StudentProfile.findOne({ user: studentId }).populate("user", "email");
    if (!profile) {
      return res.json({ success: true, needsOnboarding: true });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let { studentId } = req.params;
    if (studentId && studentId.includes("@")) {
      const userObj = await User.findOne({ email: studentId });
      if (userObj) studentId = userObj._id;
    }
    const { 
      name, rollNumber, branch, graduationYear, semester, bio, contact, 
      skills, projects, certifications, experience, photoUrl 
    } = req.body;

    let profile = await StudentProfile.findOne({ user: studentId });
    
    if (!profile) {
      profile = new StudentProfile({ user: studentId });
    }

    if (name !== undefined) profile.name = name;
    if (rollNumber !== undefined) profile.rollNumber = rollNumber;
    if (branch !== undefined) profile.branch = branch;
    if (graduationYear !== undefined) profile.graduationYear = graduationYear;
    if (semester !== undefined) profile.semester = semester;
    if (bio !== undefined) profile.bio = bio;
    if (contact !== undefined) profile.contact = contact;
    if (skills !== undefined) profile.skills = skills;
    if (projects !== undefined) profile.projects = projects;
    if (certifications !== undefined) profile.certifications = certifications;
    if (experience !== undefined) profile.experience = experience;
    if (photoUrl !== undefined) profile.photoUrl = photoUrl;

    profile.profileCompletionPercent = calculateCompletionPercent(profile);
    
    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function calculateCompletionPercent(profile) {
  let fields = 0;
  let filled = 0;
  fields += 6;
  if (profile.name) filled++;
  if (profile.branch) filled++;
  if (profile.graduationYear) filled++;
  if (profile.semester) filled++;
  if (profile.bio) filled++;
  if (profile.contact) filled++;

  fields += 4;
  if (profile.skills && profile.skills.length > 0) filled++;
  if (profile.projects && profile.projects.length > 0) filled++;
  if (profile.certifications && profile.certifications.length > 0) filled++;
  if (profile.experience && profile.experience.length > 0) filled++;

  return Math.round((filled / fields) * 100);
}

exports.getPublicProfileView = async (req, res) => {
  try {
    const { studentId } = req.params;
    const profile = await StudentProfile.findById(studentId).populate("user", "email");
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    profile.profileViewCount += 1;
    await profile.save();

    const achievements = await Achievement.find({ studentId, status: "verified" });
    const endorsements = await Endorsement.find({ toUserId: profile.user?._id });
    
    const followersCount = await Follow.countDocuments({ followingId: profile.user?._id });
    const followingCount = await Follow.countDocuments({ followerId: profile.user?._id });
    const isFollowing = await Follow.exists({ followerId: req.user.id, followingId: profile.user?._id });

    const recommendations = await FacultyRecommendation.find({ studentId }).populate("facultyId", "email");

    const allProfiles = await StudentProfile.find({}).sort({ totalPoints: -1 });
    const rank = allProfiles.findIndex(p => p._id.toString() === studentId) + 1;

    res.json({
      success: true,
      profile,
      rank,
      achievements,
      endorsements,
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
      recommendations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// ACHIEVEMENTS WORKFLOW
// -------------------------------------------------------------

exports.createAchievement = async (req, res) => {
  try {
    const { title, category, level, description, proofUrl } = req.body;
    
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(400).json({ success: false, message: "Please create a profile first" });

    const achievement = new Achievement({
      studentId: profile._id,
      title,
      category,
      level,
      description,
      proofUrl,
      status: "pending"
    });
    
    await achievement.save();
    res.json({ success: true, achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentAchievements = async (req, res) => {
  try {
    const { studentId } = req.params;
    const achievements = await Achievement.find({ studentId });
    res.json({ success: true, achievements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyAchievement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { status, pointsAwarded } = req.body;
    
    const achievement = await Achievement.findById(id).session(session);
    if (!achievement) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }

    if (achievement.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Achievement already processed" });
    }

    if (status === "rejected") {
      achievement.status = "rejected";
      achievement.verifiedBy = req.user.id;
      achievement.verifiedAt = new Date();
      await achievement.save({ session });
      await session.commitTransaction();
      session.endSession();
      return res.json({ success: true, achievement });
    }

    let points = pointsAwarded;
    if (!points) {
      const config = await PointsConfig.findOne({ 
        category: achievement.category, 
        level: achievement.level 
      }).session(session);
      
      if (config) {
        points = config.points;
      } else {
        const defaultTable = {
          college: 10,
          state: 25,
          national: 50,
          international: 100
        };
        points = defaultTable[achievement.level] || 10;
      }
    }

    achievement.status = "verified";
    achievement.pointsAwarded = points;
    achievement.verifiedBy = req.user.id;
    achievement.verifiedAt = new Date();
    await achievement.save({ session });

    const profile = await StudentProfile.findById(achievement.studentId).session(session);
    if (profile) {
      profile.totalPoints += points;

      const verifiedAchievements = await Achievement.find({ 
        studentId: profile._id, 
        status: "verified" 
      }).session(session);

      const techCount = verifiedAchievements.filter(a => a.category === "technical").length;
      const sportsCount = verifiedAchievements.filter(a => a.category === "sports").length;

      const tagsSet = new Set(profile.talentTags || []);
      if (techCount >= 3) tagsSet.add("Top Coder");
      if (sportsCount >= 3) tagsSet.add("Sports Achiever");
      profile.talentTags = Array.from(tagsSet);
      await profile.save({ session });

      const post = new ActivityFeedPost({
        studentId: profile._id,
        type: "achievement",
        refId: achievement._id,
        message: `${profile.name} earned verified achievement: "${achievement.title}" (+${points} pts)`
      });
      await post.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, achievement });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// RESUME PDF GENERATION & SAVED VERSIONS
// -------------------------------------------------------------

exports.generateResumePdf = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { template = "minimal" } = req.query;

    const profile = await StudentProfile.findById(studentId);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const achievements = await Achievement.find({ studentId, status: "verified" });

    const htmlResume = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #18181b; }
            h1 { font-size: 28px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
            .subtitle { font-size: 14px; color: #71717a; margin-bottom: 20px; }
            .section-title { font-size: 16px; border-bottom: 2px solid #e4e4e7; padding-bottom: 5px; margin-top: 25px; margin-bottom: 10px; font-weight: bold; text-transform: uppercase; color: #ea580c; }
            .item { margin-bottom: 15px; }
            .item-title { font-weight: bold; font-size: 13px; }
            .item-meta { font-size: 11px; color: #a1a1aa; }
            .item-desc { font-size: 12px; margin-top: 4px; line-height: 1.4; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
            .skill-badge { background: #f4f4f5; padding: 4px 10px; border-radius: 6px; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>${profile.name}</h1>
          <div class="subtitle">${profile.branch} | Year ${profile.graduationYear - 4}-${profile.graduationYear} | Contact: ${profile.contact || "N/A"}</div>
          <p style="font-size: 12px; line-height: 1.5;">${profile.bio || ""}</p>
          
          <div class="section-title">Skills</div>
          <div class="skills-list">
            ${(profile.skills || []).map(s => `<span class="skill-badge">${s}</span>`).join('')}
          </div>

          <div class="section-title">Projects</div>
          ${(profile.projects || []).map(p => `
            <div class="item">
              <div class="item-title">${p.title}</div>
              <div class="item-meta">Tech: ${p.techStack || ""} | Link: ${p.link || "N/A"}</div>
              <div class="item-desc">${p.description || ""}</div>
            </div>
          `).join('')}

          <div class="section-title">Experience & Internships</div>
          ${(profile.experience || []).map(exp => `
            <div class="item">
              <div class="item-title">${exp.title} - ${exp.org}</div>
              <div class="item-meta">Duration: ${exp.duration || ""}</div>
              <div class="item-desc">${exp.description || ""}</div>
            </div>
          `).join('')}

          <div class="section-title">Verified Achievements</div>
          ${achievements.map(a => `
            <div class="item" style="margin-bottom:8px;">
              <span class="item-title">${a.title}</span> - <span class="item-meta" style="color:#ea580c; font-weight:bold;">${a.level.toUpperCase()} LEVEL</span>
              <div class="item-desc" style="margin-top:2px;">${a.description}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.send(htmlResume);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveResumeVersion = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { templateId, name, generatedContent } = req.body;

    const resume = new Resume({
      studentId,
      templateId,
      name,
      generatedContent
    });
    
    await resume.save();
    res.json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSavedResumes = async (req, res) => {
  try {
    const { studentId } = req.params;
    const resumes = await Resume.find({ studentId });
    res.json({ success: true, resumes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// SOCIAL CONTROLLERS
// -------------------------------------------------------------

exports.toggleFollowStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const targetProfile = await StudentProfile.findById(studentId);
    if (!targetProfile) return res.status(404).json({ success: false, message: "Target profile not found" });
    
    const targetUserId = targetProfile.user;

    const followExists = await Follow.findOne({ 
      followerId: req.user.id, 
      followingId: targetUserId 
    });

    if (followExists) {
      await Follow.deleteOne({ _id: followExists._id });
      res.json({ success: true, followed: false });
    } else {
      const follow = new Follow({ 
        followerId: req.user.id, 
        followingId: targetUserId 
      });
      await follow.save();
      res.json({ success: true, followed: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.endorseSkill = async (req, res) => {
  try {
    const { toUserId, skill } = req.body;

    const existing = await Endorsement.findOne({
      fromUserId: req.user.id,
      toUserId,
      skill
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "You have already endorsed this skill" });
    }

    const endorsement = new Endorsement({
      fromUserId: req.user.id,
      toUserId,
      skill
    });
    
    await endorsement.save();
    res.json({ success: true, endorsement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActivityFeed = async (req, res) => {
  try {
    const { scope = "campus" } = req.query;
    let query = {};

    if (scope === "following") {
      const follows = await Follow.find({ followerId: req.user.id });
      const followingUserIds = follows.map(f => f.followingId);
      
      const profiles = await StudentProfile.find({ user: { $in: followingUserIds } });
      const profileIds = profiles.map(p => p._id);
      
      query = { studentId: { $in: profileIds } };
    }

    const feed = await ActivityFeedPost.find(query)
      .populate("studentId")
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ success: true, feed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addFacultyRecommendation = async (req, res) => {
  try {
    const { studentId, text } = req.body;
    
    const rec = new FacultyRecommendation({
      facultyId: req.user.id,
      studentId,
      text
    });
    
    await rec.save();
    res.json({ success: true, recommendation: rec });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// INTELLIGENCE & DISCOVERY CONTROLLERS
// -------------------------------------------------------------

exports.discoverSearch = async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) return res.status(400).json({ success: false, message: "Missing skill query parameter" });

    const profiles = await StudentProfile.find({
      skills: { $regex: skill, $options: "i" }
    }).populate("user", "email");

    res.json({ success: true, profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.discoverTrending = async (req, res) => {
  try {
    const profiles = await StudentProfile.find({})
      .populate("user", "email")
      .sort({ profileViewCount: -1, totalPoints: -1 })
      .limit(10);
    res.json({ success: true, profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.discoverRisingStars = async (req, res) => {
  try {
    const profiles = await StudentProfile.find({
      graduationYear: { $gte: new Date().getFullYear() + 2 },
      totalPoints: { $gt: 0 }
    })
      .populate("user", "email")
      .sort({ totalPoints: -1 })
      .limit(10);
    res.json({ success: true, profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFacultyDashboard = async (req, res) => {
  try {
    const { branch, year, category } = req.query;
    let query = {};
    if (branch) query.branch = branch;
    if (year) query.graduationYear = parseInt(year);

    let profiles = await StudentProfile.find(query).populate("user", "email").sort({ totalPoints: -1 });
    const pendingAchievements = await Achievement.find({ status: "pending" }).populate("studentId");

    res.json({
      success: true,
      students: profiles,
      pendingAchievements
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
