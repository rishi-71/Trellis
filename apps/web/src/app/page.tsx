"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const BACKEND_URL = "http://localhost:5000";

  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  // Portal Modals & Navigation UI
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoginRole, setAuthLoginRole] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "events" | "activities">("profile");

  // Student Profile State
  const [profile, setProfile] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState(false);

  // Student Profile Form State
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [cgpa, setCgpa] = useState("8.0");
  const [semester, setSemester] = useState<number>(1);
  const [contact, setContact] = useState<string>("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bannerStyle, setBannerStyle] = useState("from-orange-500 to-orange-600");
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // M3: Placement Registration & Auto Eligibility Matching States
  const [placementReg, setPlacementReg] = useState<any>(null);
  const [placementJobs, setPlacementJobs] = useState<any[]>([]);
  const [placementMatches, setPlacementMatches] = useState<any[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<any[]>([]);
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);
  const [selectedRegForAudit, setSelectedRegForAudit] = useState<any>(null);

  // M3 Registration Form Fields
  const [regFullName, setRegFullName] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regGender, setRegGender] = useState("male");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPermanentAddress, setRegPermanentAddress] = useState("");
  const [regCurrentAddress, setRegCurrentAddress] = useState("");

  const [regFatherName, setRegFatherName] = useState("");
  const [regFatherOccupation, setRegFatherOccupation] = useState("");
  const [regFatherContact, setRegFatherContact] = useState("");
  const [regMotherName, setRegMotherName] = useState("");
  const [regMotherOccupation, setRegMotherOccupation] = useState("");
  const [regMotherContact, setRegMotherContact] = useState("");

  const [regApaarId, setRegApaarId] = useState("");
  const [regPhotoUrl, setRegPhotoUrl] = useState("");

  const [regTenthPercentage, setRegTenthPercentage] = useState("");
  const [regTenthBoard, setRegTenthBoard] = useState("");
  const [regTenthYear, setRegTenthYear] = useState("");
  const [regTwelfthPercentage, setRegTwelfthPercentage] = useState("");
  const [regTwelfthBoard, setRegTwelfthBoard] = useState("");
  const [regTwelfthYear, setRegTwelfthYear] = useState("");
  const [regDiplomaPercentage, setRegDiplomaPercentage] = useState("");
  const [regDiplomaBoard, setRegDiplomaBoard] = useState("");
  const [regDiplomaYear, setRegDiplomaYear] = useState("");

  const [regBranch, setRegBranch] = useState("");
  const [regRollNumber, setRegRollNumber] = useState("");
  const [regEnrollmentNumber, setRegEnrollmentNumber] = useState("");

  const [regSgpa1, setRegSgpa1] = useState("");
  const [regSgpa2, setRegSgpa2] = useState("");
  const [regSgpa3, setRegSgpa3] = useState("");
  const [regSgpa4, setRegSgpa4] = useState("");
  const [regSgpa5, setRegSgpa5] = useState("");
  const [regBacklogCount, setRegBacklogCount] = useState("0");
  const [regBacklogHistory, setRegBacklogHistory] = useState("");

  const [regLocalAddressPincode, setRegLocalAddressPincode] = useState("");
  const [regPermanentAddressPincode, setRegPermanentAddressPincode] = useState("");
  const [regState, setRegState] = useState("");
  const [regPassportPhotoUrl, setRegPassportPhotoUrl] = useState("");

  const [regUniversityName, setRegUniversityName] = useState("");
  const [regCourseName, setRegCourseName] = useState("");
  const [regYearOfAdmission, setRegYearOfAdmission] = useState("");
  const [regYearOfPassing, setRegYearOfPassing] = useState("");
  const [regTenthYearOfPassing, setRegTenthYearOfPassing] = useState("");
  const [regTwelfthYearOfPassing, setRegTwelfthYearOfPassing] = useState("");

  const [regTenthHasGap, setRegTenthHasGap] = useState(false);
  const [regTenthGapDuration, setRegTenthGapDuration] = useState("");
  const [regTenthGapReason, setRegTenthGapReason] = useState("");
  const [regTwelfthHasGap, setRegTwelfthHasGap] = useState(false);
  const [regTwelfthGapDuration, setRegTwelfthGapDuration] = useState("");
  const [regTwelfthGapReason, setRegTwelfthGapReason] = useState("");
  const [regUgHasGap, setRegUgHasGap] = useState(false);
  const [regUgGapDuration, setRegUgGapDuration] = useState("");
  const [regUgGapReason, setRegUgGapReason] = useState("");

  const [regInternships, setRegInternships] = useState<any[]>([]);

  const [regResumeUrl, setRegResumeUrl] = useState("");
  const [regMarksheetUrls, setRegMarksheetUrls] = useState<string[]>([]);
  const [regResumeFileName, setRegResumeFileName] = useState("");

  // M3 Admin Post Job Form Fields
  const [postCompanyName, setPostCompanyName] = useState("");
  const [postRole, setPostRole] = useState("");
  const [postType, setPostType] = useState("full-time");
  const [postDescription, setPostDescription] = useState("");
  const [postDeadline, setPostDeadline] = useState("");
  const [postRules, setPostRules] = useState<any[]>([
    { field: "cgpa", operator: ">=", value: "7.0" },
    { field: "backlogCount", operator: "==", value: "0" }
  ]);
  const [placementTab, setPlacementTab] = useState("post-job");

  // M3 Student Apply Modal States
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyResumeMode, setApplyResumeMode] = useState<"upload" | "saved" | "fallback">("fallback");
  const [applyUploadFile, setApplyUploadFile] = useState<string>("");
  const [applyUploadFileName, setApplyUploadFileName] = useState<string>("");
  const [applySelectedSavedResume, setApplySelectedSavedResume] = useState<string>( "");

  // M7 Sensor Issuing System States
  const [sensorsList, setSensorsList] = useState<any[]>([]);
  const [sensorRequests, setSensorRequests] = useState<any[]>([]);
  const [pendingSensorRequests, setPendingSensorRequests] = useState<any[]>([]);
  const [studentFines, setStudentFines] = useState<any[]>([]);
  const [fineConfig, setFineConfig] = useState<any>({ ratePerHour: 10 });
  const [adminDmgCases, setAdminDmgCases] = useState<any[]>([]);
  const [adminDashboardStats, setAdminDashboardStats] = useState<any>({
    overdueList: [],
    totalPendingFines: 0,
    openDamageCases: [],
    populatedStats: []
  });

  const [sensorTab, setSensorTab] = useState<string>("catalog"); // catalog | requests | fines | approvals | issue-return | damage-loss | config | admin-dash

  const [newSensorName, setNewSensorName] = useState("");
  const [newSensorType, setNewSensorType] = useState("");
  const [newSensorDept, setNewSensorDept] = useState("");
  const [newSensorQty, setNewSensorQty] = useState(1);

  const [editingSensorId, setEditingSensorId] = useState<string | null>(null);
  const [editSensorQty, setEditSensorQty] = useState(0);
  const [editSensorCond, setEditSensorCond] = useState("working");
  const [editSensorNotes, setEditSensorNotes] = useState("");

  const [reqSensorId, setReqSensorId] = useState<string | null>(null);
  const [reqPurpose, setReqPurpose] = useState("");
  const [reqProject, setReqProject] = useState("");
  const [reqFrom, setReqFrom] = useState("");
  const [reqTo, setReqTo] = useState("");

  const [approvalNote, setApprovalNote] = useState("");
  const [lostReqId, setLostReqId] = useState<string | null>(null);
  const [lostPenalty, setLostPenalty] = useState(0);
  const [lostNotes, setLostNotes] = useState("");

  const [damagedReturnNotes, setDamagedReturnNotes] = useState("");
  const [resolvingCaseId, setResolvingCaseId] = useState<string | null>(null);
  const [resolvePenalty, setResolvePenalty] = useState(0);
  const [resolveNotes, setResolveNotes] = useState("");

  // Events Data
  const [events, setEvents] = useState<any[]>([]);
  // Student Activities Data
  const [activities, setActivities] = useState<any[]>([]);

  // Log Activity Form (Student)
  const [actTitle, setActTitle] = useState("");
  const [actType, setActType] = useState("certification");
  const [actDesc, setActDesc] = useState("");
  const [actDate, setActDate] = useState("2026-08-19");

  // Faculty Data & Forms
  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventDate, setEventDate] = useState("2026-09-10");
  const [eventDeadline, setEventDeadline] = useState("2026-09-08");
  const [eventMaxPart, setEventMaxPart] = useState("100");

  // Carousel images
  const carouselImages = [
    "/images/ips-carousel-1.jpeg",
    "/images/ips-carousel-2.png",
    "/images/ips-carousel-3.jpeg",
  ];

  // Helper to format date server-client consistently
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // 8 Modules state variables
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  // M1: Campus Finder
  const [locations, setLocations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // M3: Placements & Internships
  const [jobs, setJobs] = useState<any[]>([]);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobCompany, setNewJobCompany] = useState("");
  const [newJobDesc, setNewJobDesc] = useState("");
  const [newJobType, setNewJobType] = useState("fulltime");
  const [newJobCgpa, setNewJobCgpa] = useState("7.5");
  const [newJobBranch, setNewJobBranch] = useState("All Branches");
  const [newJobDeadline, setNewJobDeadline] = useState("2026-09-30");

  // M5: Leaderboard / Student of the Year
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // M6: SOS Alert
  const [sosLocation, setSosLocation] = useState("");
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);

  // M7: Resources & Rentals
  const [rentedResources, setRentedResources] = useState<any[]>([]);
  const [reqResourceName, setReqResourceName] = useState("");
  const [reqCategory, setReqCategory] = useState("sensor");

  // M8: Lost & Found
  const [lostFoundItems, setLostFoundItems] = useState<any[]>([]);
  const [lfTitle, setLfTitle] = useState("");
  const [lfType, setLfType] = useState("lost");
  const [lfDesc, setLfDesc] = useState("");
  const [lfLocation, setLfLocation] = useState("");
  const [lfContact, setLfContact] = useState("");

  // M1 Smart Campus Finder State
  const [finderTab, setFinderTab] = useState<"map" | "faculty">("map");
  const [selectedStartNode, setSelectedStartNode] = useState<string>("node-home");
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [facultySearchQuery, setFacultySearchQuery] = useState("");
  const [facultyCabins, setFacultyCabins] = useState<any[]>([]);
  const [activeFloor, setActiveFloor] = useState<number>(0);
  const [routePath, setRoutePath] = useState<any[]>([]);
  const [routeDirections, setRouteDirections] = useState<string[]>([]);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // M4 Career Hub & Resume State
  const [careerHubTab, setCareerHubTab] = useState<"profile" | "resume" | "achievements" | "leaderboard" | "discovery">("profile");
  const [activeResumeTemplate, setActiveResumeTemplate] = useState<string>("minimal");
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [newResumeName, setNewResumeName] = useState("My Main Resume");
  const [facultyRecommendationText, setFacultyRecommendationText] = useState("");
  const [searchSkillQuery, setSearchSkillQuery] = useState("");
  const [discoveredProfiles, setDiscoveredProfiles] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [feedScope, setFeedScope] = useState<"campus" | "following">("campus");
  const [publicProfileData, setPublicProfileData] = useState<any>(null);
  const [isPublicProfileOpen, setIsPublicProfileOpen] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Form states for Achievement Submission
  const [achTitle, setAchTitle] = useState("");
  const [achCategory, setAchCategory] = useState("technical");
  const [achLevel, setAchLevel] = useState("college");
  const [achDescription, setAchDescription] = useState("");
  const [achProofUrl, setAchProofUrl] = useState("");
  const [achFileName, setAchFileName] = useState("");
  const [myAchievementsList, setMyAchievementsList] = useState<any[]>([]);

  // Theme, Notifications, Navigation state variables
  const [darkMode, setDarkMode] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showDashboardView, setShowDashboardView] = useState(false);

  // -------------------------------------------------------------
  // API LOADERS
  // -------------------------------------------------------------
  const fetchLocations = async (category: string | null = null) => {
    try {
      const url = category ? `${BACKEND_URL}/api/locations?category=${category}` : `${BACKEND_URL}/api/locations`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setLocations(data.locations);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFacultyCabins = async (nameQuery = "") => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/faculty?name=${nameQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setFacultyCabins(data.cabins);
    } catch (err) {
      console.error(err);
    }
  };

  const updateFacultyCabinStatus = async (cabinId: string, status: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/faculty/${cabinId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Status updated successfully!`);
        fetchFacultyCabins(facultySearchQuery);
      }
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const calculateRoute = async (destLocationId: string) => {
    if (!destLocationId) return;
    setLoadingRoute(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/route?from=${selectedStartNode}&to=${destLocationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRoutePath(data.path);
        setRouteDirections(data.directions);
        setRouteDistance(data.totalDistance);
      } else {
        alert(data.message || "Route calculation failed.");
      }
    } catch (err) {
      alert("Could not contact pathfinding server.");
    } finally {
      setLoadingRoute(false);
    }
  };

  const fetchStudentProfileData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        if (data.needsOnboarding) {
          setNeedsOnboarding(true);
          setActiveModule("career");
        } else {
          setNeedsOnboarding(false);
          setProfile(data.profile);
          setHasProfile(true);
          if (data.profile) {
            setName(data.profile.name || "");
            setRollNumber(data.profile.rollNumber || "");
            setBranch(data.profile.branch || "");
            setGraduationYear(data.profile.graduationYear?.toString() || "2026");
            setSemester(data.profile.semester || 1);
            setContact(data.profile.contact || "");
            setBio(data.profile.bio || "");
            setSkills((data.profile.skills || []).join(", "));
            setPhotoUrl(data.profile.photoUrl || "");
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyAchievements = async () => {
    if (!profile?._id) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/achievements/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setMyAchievementsList(data.achievements);
    } catch (err) {
      console.error(err);
    }
  };

  const submitAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle || !achDescription) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/achievements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: achTitle,
          category: achCategory,
          level: achLevel,
          description: achDescription,
          proofUrl: achProofUrl
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Co-curricular achievement submitted successfully for faculty verification!");
        setAchTitle("");
        setAchDescription("");
        setAchProofUrl("");
        setAchFileName("");
        fetchMyAchievements();
      }
    } catch (err) {
      alert("Error submitting achievement.");
    }
  };

  const handleVerifyAchievementAction = async (achId: string, status: "verified" | "rejected") => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/achievements/${achId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Achievement ${status} successfully!`);
        fetchFacultyDashboardData();
      }
    } catch (err) {
      alert("Error verifying achievement.");
    }
  };

  const [facultyDashboardStudents, setFacultyDashboardStudents] = useState<any[]>([]);
  const [facultyDashboardPendingAch, setFacultyDashboardPendingAch] = useState<any[]>([]);

  const fetchFacultyDashboardData = async (branchQuery = "", yearQuery = "") => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/faculty/dashboard?branch=${branchQuery}&year=${yearQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFacultyDashboardStudents(data.students);
        setFacultyDashboardPendingAch(data.pendingAchievements);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSavedResumes = async () => {
    if (!profile?._id) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/resume/${profile._id}/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSavedResumes(data.resumes);
    } catch (err) {
      console.error(err);
    }
  };

  const saveResumeVersion = async () => {
    if (!profile?._id) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/resume/${profile._id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          templateId: activeResumeTemplate,
          name: newResumeName,
          generatedContent: profile
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Resume version saved successfully!");
        fetchSavedResumes();
      }
    } catch (err) {
      alert("Error saving resume version.");
    }
  };

  const handleToggleFollow = async (targetProfileId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/follow/${targetProfileId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert(data.followed ? "Followed student!" : "Unfollowed student!");
        if (publicProfileData && publicProfileData.profile._id === targetProfileId) {
          fetchPublicProfileView(targetProfileId);
        }
      }
    } catch (err) {
      alert("Error executing follow action.");
    }
  };

  const handleEndorseSkill = async (targetUserId: string, skillName: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/endorse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ toUserId: targetUserId, skill: skillName })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Endorsed ${skillName}!`);
        if (publicProfileData && publicProfileData.profile.user?._id === targetUserId) {
          fetchPublicProfileView(publicProfileData.profile._id);
        }
      } else {
        alert(data.message || "Could not endorse skill.");
      }
    } catch (err) {
      alert("Error endorsing skill.");
    }
  };

  const fetchActivityFeed = async (scopeQuery = "campus") => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/feed?scope=${scopeQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setActivityFeed(data.feed);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPublicProfileView = async (targetProfileId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/${targetProfileId}/public`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPublicProfileData(data);
        setIsPublicProfileOpen(true);
      }
    } catch (err) {
      alert("Error loading public profile.");
    }
  };

  const handleAddFacultyRecommendation = async (targetStudentId: string) => {
    if (!facultyRecommendationText.trim()) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/faculty/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studentId: targetStudentId, text: facultyRecommendationText })
      });
      const data = await response.json();
      if (data.success) {
        alert("Recommendation posted successfully!");
        setFacultyRecommendationText("");
        fetchPublicProfileView(targetStudentId);
      }
    } catch (err) {
      alert("Error leaving recommendation.");
    }
  };

  const handleDiscoverSearch = async (skillQuery = "") => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/discover/search?skill=${skillQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDiscoveredProfiles(data.profiles);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/placements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setJobs(data.jobs);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/students/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSOSAlerts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/sos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSosAlerts(data.alerts);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRentedResources = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setRentedResources(data.resources);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLostFoundItems = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/lostfound`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setLostFoundItems(data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.notices?.length > 0) {
        setNotices(data.notices);
      } else {
        setNotices([
          { title: "Mid-Term Exam Schedule Out", content: "All engineering branches mid-term exams will start from Sep 10, 2026.", createdAt: new Date() },
          { title: "Smart India Hackathon Registrations", content: "Register your teams before Aug 30 at the Innovation Cell.", createdAt: new Date(Date.now() - 24*60*60*1000) },
          { title: "Placement Seminar", content: "Pre-placement talk by Capgemini on Aug 28 in the Main Auditorium.", createdAt: new Date(Date.now() - 3*24*60*60*1000) }
        ]);
      }
    } catch (err) {
      setNotices([
        { title: "Mid-Term Exam Schedule Out", content: "All engineering branches mid-term exams will start from Sep 10, 2026.", createdAt: new Date() },
        { title: "Smart India Hackathon Registrations", content: "Register your teams before Aug 30 at the Innovation Cell.", createdAt: new Date(Date.now() - 24*60*60*1000) },
        { title: "Placement Seminar", content: "Pre-placement talk by Capgemini on Aug 28 in the Main Auditorium.", createdAt: new Date(Date.now() - 3*24*60*60*1000) }
      ]);
    }
  };

  // -------------------------------------------------------------
  // API ACTIONS
  // -------------------------------------------------------------
  const handleApplyJob = async (jobId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/placements/${jobId}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert("Application submitted successfully!");
        fetchJobs();
      } else {
        alert(data.message || "Could not apply.");
      }
    } catch (err) {
      alert("Error applying to job.");
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/placements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newJobTitle,
          company: newJobCompany,
          description: newJobDesc,
          type: newJobType,
          cgpa: newJobCgpa,
          branch: newJobBranch,
          deadline: newJobDeadline
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Job posted successfully!");
        setNewJobTitle("");
        setNewJobDesc("");
        fetchJobs();
      }
    } catch (err) {
      alert("Error posting job.");
    }
  };

  const handleTriggerSOS = async () => {
    if (!sosLocation) {
      alert("Please enter your current location!");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/sos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ location: sosLocation })
      });
      const data = await response.json();
      if (data.success) {
        alert("SOS Alert dispatched to Security Officers!");
        setSosLocation("");
        fetchSOSAlerts();
      }
    } catch (err) {
      alert("Error dispatching SOS.");
    }
  };

  const handleResolveSOS = async (sosId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/sos/${sosId}/resolve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert("SOS alert resolved.");
        fetchSOSAlerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqResourceName) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/resources/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resourceName: reqResourceName, category: reqCategory })
      });
      const data = await response.json();
      if (data.success) {
        alert("Item issued successfully! Return within 7 days to avoid fine.");
        setReqResourceName("");
        fetchRentedResources();
      }
    } catch (err) {
      alert("Error issuing resource.");
    }
  };

  const handleReturnResource = async (resourceId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/resources/${resourceId}/return`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message || "Returned successfully!");
        fetchRentedResources();
      }
    } catch (err) {
      alert("Error returning resource.");
    }
  };

  const handleReportLostFound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lfTitle || !lfDesc || !lfLocation || !lfContact) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/lostfound`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: lfTitle,
          type: lfType,
          description: lfDesc,
          location: lfLocation,
          contact: lfContact
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Notice reported successfully!");
        setLfTitle("");
        setLfDesc("");
        setLfLocation("");
        setLfContact("");
        fetchLostFoundItems();
      }
    } catch (err) {
      alert("Error reporting item.");
    }
  };

  const handleClaimItem = async (itemId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/lostfound/${itemId}/claim`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert("Item status updated to claimed.");
        fetchLostFoundItems();
      }
    } catch (err) {
      console.error(err);
    }
  };
  // Dark/Light Mode Theme sync
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Listen to browser backward/forward events
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view");
      if (view === "dashboard" && token) {
        setShowDashboardView(true);
      } else {
        setShowDashboardView(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [token]);

  // Sync token from localStorage on load
  useEffect(() => {
    const savedToken = localStorage.getItem("trellis_token");
    const savedRole = localStorage.getItem("trellis_role");
    const savedEmail = localStorage.getItem("trellis_email");
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
      setUserEmail(savedEmail);
      loadDashboardData(savedToken, savedRole);

      // Sync views from URL query
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view");
      if (view === "dashboard") {
        setShowDashboardView(true);
      } else {
        setShowDashboardView(false);
      }

      // Pre-fetch notices for bell count
      fetch(`${BACKEND_URL}/api/notices`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.notices?.length > 0) {
          setNotices(data.notices);
        } else {
          setNotices([
            { title: "Mid-Term Exam Schedule Out", content: "All engineering branches mid-term exams will start from Sep 10, 2026.", createdAt: new Date() },
            { title: "Smart India Hackathon Registrations", content: "Register your teams before Aug 30 at the Innovation Cell.", createdAt: new Date(Date.now() - 24*60*60*1000) },
            { title: "Placement Seminar", content: "Pre-placement talk by Capgemini on Aug 28 in the Main Auditorium.", createdAt: new Date(Date.now() - 3*24*60*60*1000) }
          ]);
        }
      })
      .catch(() => {
        setNotices([
          { title: "Mid-Term Exam Schedule Out", content: "All engineering branches mid-term exams will start from Sep 10, 2026.", createdAt: new Date() },
          { title: "Smart India Hackathon Registrations", content: "Register your teams before Aug 30 at the Innovation Cell.", createdAt: new Date(Date.now() - 24*60*60*1000) },
          { title: "Placement Seminar", content: "Pre-placement talk by Capgemini on Aug 28 in the Main Auditorium.", createdAt: new Date(Date.now() - 3*24*60*60*1000) }
        ]);
      });
    } else {
      setShowDashboardView(false);
    }
  }, []);



  // Auto slide effect for carousel (runs when user is not logged in)
  useEffect(() => {
    if (token) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (token) {
      if (userRole === "student") {
        fetchStudentProfileData();
      } else if (userRole === "faculty" || userRole === "admin") {
        fetchFacultyDashboardData();
      }
    }
  }, [token, userRole]);

  useEffect(() => {
    if (token && profile?._id) {
      fetchMyAchievements();
      fetchSavedResumes();
    }
  }, [token, profile]);

  useEffect(() => {
    if (token && (activeModule === "career" || activeModule === "achievements")) {
      fetchActivityFeed(feedScope);
      handleDiscoverSearch("");
    }
  }, [token, activeModule, feedScope]);

  // M3: Placements API Helpers
  const fetchPlacementRegistration = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/registration/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.registration) {
        setPlacementReg(data.registration);
        const reg = data.registration;
        setIsRetryAttempt(!!reg.isRetryAttempt);
        setRegFullName(reg.personal?.fullName || "");
        setRegDob(reg.personal?.dob || "");
        setRegGender(reg.personal?.gender || "male");
        setRegPhone(reg.personal?.phone || "");
        setRegEmail(reg.personal?.email || "");
        setRegPermanentAddress(reg.personal?.permanentAddress || "");
        setRegPermanentAddressPincode(reg.personal?.permanentAddressPincode || "");
        setRegCurrentAddress(reg.personal?.currentAddress || "");
        setRegLocalAddressPincode(reg.personal?.localAddressPincode || "");
        setRegState(reg.personal?.state || "");
        
        setRegFatherName(reg.family?.fatherName || "");
        setRegFatherOccupation(reg.family?.fatherOccupation || "");
        setRegFatherContact(reg.family?.fatherContact || "");
        setRegMotherName(reg.family?.motherName || "");
        setRegMotherOccupation(reg.family?.motherOccupation || "");
        setRegMotherContact(reg.family?.motherContact || "");
        
        setRegApaarId(reg.identity?.apaarId || "");
        setRegPhotoUrl(reg.identity?.photoUrl || "");
        setRegPassportPhotoUrl(reg.identity?.passportPhotoUrl || "");
        
        setRegUniversityName(reg.academic?.universityName || "");
        setRegCourseName(reg.academic?.courseName || "");
        setRegYearOfAdmission(reg.academic?.yearOfAdmission?.toString() || "");
        setRegYearOfPassing(reg.academic?.yearOfPassing?.toString() || "");

        setRegTenthPercentage(reg.academic?.tenth?.percentage?.toString() || "");
        setRegTenthBoard(reg.academic?.tenth?.board || "");
        setRegTenthYear(reg.academic?.tenth?.year?.toString() || "");
        setRegTenthYearOfPassing(reg.academic?.tenth?.yearOfPassing?.toString() || "");
        setRegTwelfthPercentage(reg.academic?.twelfth?.percentage?.toString() || "");
        setRegTwelfthBoard(reg.academic?.twelfth?.board || "");
        setRegTwelfthYear(reg.academic?.twelfth?.year?.toString() || "");
        setRegTwelfthYearOfPassing(reg.academic?.twelfth?.yearOfPassing?.toString() || "");
        setRegDiplomaPercentage(reg.academic?.diploma?.percentage?.toString() || "");
        setRegDiplomaBoard(reg.academic?.diploma?.board || "");
        setRegDiplomaYear(reg.academic?.diploma?.year?.toString() || "");
        
        setRegBranch(reg.academic?.branch || "");
        setRegRollNumber(reg.academic?.rollNumber || "");
        setRegEnrollmentNumber(reg.academic?.enrollmentNumber || "");
        
        const sgpas = reg.academic?.semesterSgpa || [];
        setRegSgpa1(sgpas.find((s: any) => s.semester === 1)?.sgpa?.toString() || "");
        setRegSgpa2(sgpas.find((s: any) => s.semester === 2)?.sgpa?.toString() || "");
        setRegSgpa3(sgpas.find((s: any) => s.semester === 3)?.sgpa?.toString() || "");
        setRegSgpa4(sgpas.find((s: any) => s.semester === 4)?.sgpa?.toString() || "");
        setRegSgpa5(sgpas.find((s: any) => s.semester === 5)?.sgpa?.toString() || "");
        
        setRegBacklogCount(reg.academic?.backlogCount?.toString() || "0");
        setRegBacklogHistory(reg.academic?.backlogHistory?.join(", ") || "");

        const gap = reg.academic?.academicGap;
        setRegTenthHasGap(!!gap?.tenth?.hasGap);
        setRegTenthGapDuration(gap?.tenth?.duration || "");
        setRegTenthGapReason(gap?.tenth?.reason || "");
        setRegTwelfthHasGap(!!gap?.twelfth?.hasGap);
        setRegTwelfthGapDuration(gap?.twelfth?.duration || "");
        setRegTwelfthGapReason(gap?.twelfth?.reason || "");
        setRegUgHasGap(!!gap?.ug?.hasGap);
        setRegUgGapDuration(gap?.ug?.duration || "");
        setRegUgGapReason(gap?.ug?.reason || "");

        setRegInternships(reg.internships || []);
        
        setRegResumeUrl(reg.documents?.resumeUrl || "");
        setRegMarksheetUrls(reg.documents?.marksheetUrls || []);
      } else {
        if (profile) {
          setRegFullName(profile.name || "");
          setRegBranch(profile.branch || "");
          setRegEmail(userEmail || "");
        }
        setPlacementReg(null);
      }
    } catch (err) {
      console.error("Error loading placement registration:", err);
    }
  };

  const fetchPlacementJobs = async () => {
    try {
      const resJobs = await fetch(`${BACKEND_URL}/api/placement/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataJobs = await resJobs.json();
      if (dataJobs.success) {
        setPlacementJobs(dataJobs.jobs);
        
        if (userRole === "student") {
          const jobMatches = [];
          for (const job of dataJobs.jobs) {
            const resMatch = await fetch(`${BACKEND_URL}/api/placement/jobs/${job._id}/matches`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const dataMatch = await resMatch.json();
            if (dataMatch.success) {
              const match = dataMatch.matches.find((m: any) => m.studentId?.email === userEmail);
              if (match) jobMatches.push(match);
            }
          }
          setPlacementMatches(jobMatches);
        }
      }
    } catch (err) {
      console.error("Error fetching job postings:", err);
    }
  };

  const fetchAllRegistrations = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const list = [];
        for (const stud of data.students) {
          const res = await fetch(`${BACKEND_URL}/api/placement/registration/${stud._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const regData = await res.json();
          if (regData.success && regData.registration) {
            list.push(regData.registration);
          }
        }
        setAllRegistrations(list);
      }
    } catch (err) {
      console.error("Error loading student directory:", err);
    }
  };

  const handleRegisterPlacement = async (isDraft: boolean) => {
    try {
      const s1 = parseFloat(regSgpa1);
      const s2 = parseFloat(regSgpa2);
      const s3 = parseFloat(regSgpa3);
      const s4 = parseFloat(regSgpa4);
      const s5 = parseFloat(regSgpa5);
      
      const sgpaList = [
        { semester: 1, sgpa: s1 || 0 },
        { semester: 2, sgpa: s2 || 0 },
        { semester: 3, sgpa: s3 || 0 },
        { semester: 4, sgpa: s4 || 0 }
      ];
      if (!isRetryAttempt) {
        sgpaList.push({ semester: 5, sgpa: s5 || 0 });
      }

      const payload = {
        isDraft,
        isRetryAttempt,
        personal: {
          fullName: regFullName,
          dob: regDob,
          gender: regGender,
          phone: regPhone,
          email: regEmail,
          permanentAddress: regPermanentAddress,
          permanentAddressPincode: regPermanentAddressPincode,
          currentAddress: regCurrentAddress,
          localAddressPincode: regLocalAddressPincode,
          state: regState
        },
        family: {
          fatherName: regFatherName,
          fatherOccupation: regFatherOccupation,
          fatherContact: regFatherContact,
          motherName: regMotherName,
          motherOccupation: regMotherOccupation,
          motherContact: regMotherContact
        },
        identity: {
          apaarId: regApaarId,
          photoUrl: regPhotoUrl,
          passportPhotoUrl: regPassportPhotoUrl
        },
        academic: {
          universityName: regUniversityName,
          courseName: regCourseName,
          yearOfAdmission: parseInt(regYearOfAdmission) || 0,
          yearOfPassing: parseInt(regYearOfPassing) || 0,
          tenth: {
            percentage: parseFloat(regTenthPercentage) || 0,
            board: regTenthBoard,
            year: parseInt(regTenthYear) || 0,
            yearOfPassing: parseInt(regTenthYearOfPassing) || 0
          },
          twelfth: {
            percentage: parseFloat(regTwelfthPercentage) || 0,
            board: regTwelfthBoard,
            year: parseInt(regTwelfthYear) || 0,
            yearOfPassing: parseInt(regTwelfthYearOfPassing) || 0
          },
          diploma: regDiplomaPercentage ? {
            percentage: parseFloat(regDiplomaPercentage) || 0,
            board: regDiplomaBoard,
            year: parseInt(regDiplomaYear) || 0
          } : undefined,
          branch: regBranch,
          rollNumber: regRollNumber,
          enrollmentNumber: regEnrollmentNumber,
          semesterSgpa: sgpaList,
          backlogCount: parseInt(regBacklogCount) || 0,
          backlogHistory: regBacklogHistory.split(",").map(s => s.trim()).filter(Boolean),
          academicGap: {
            tenth: { hasGap: regTenthHasGap, duration: regTenthHasGap ? regTenthGapDuration : undefined, reason: regTenthGapReason },
            twelfth: { hasGap: regTwelfthHasGap, duration: regTwelfthHasGap ? regTwelfthGapDuration : undefined, reason: regTwelfthGapReason },
            ug: { hasGap: regUgHasGap, duration: regUgHasGap ? regUgGapDuration : undefined, reason: regUgGapReason }
          }
        },
        internships: regInternships,
        documents: {
          resumeUrl: regResumeUrl,
          marksheetUrls: regMarksheetUrls
        }
      };

      const res = await fetch(`${BACKEND_URL}/api/placement/registration/${userEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchPlacementRegistration();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    }
  };

  const handlePostJobOpportunity = async () => {
    try {
      if (!postCompanyName || !postRole || !postDescription || !postDeadline) {
        alert("Please fill all job opportunity fields.");
        return;
      }
      
      const formattedRules = postRules.map(r => ({
        field: r.field,
        operator: r.operator,
        value: r.field === "branch" ? r.value.split(",").map((s: string) => s.trim()) : (r.field === "backlogCount" ? parseInt(r.value) : parseFloat(r.value))
      }));

      const res = await fetch(`${BACKEND_URL}/api/placement/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName: postCompanyName,
          role: postRole,
          type: postType,
          description: postDescription,
          eligibilityRules: formattedRules,
          applicationDeadline: postDeadline
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Job opportunity created and matches run successfully!");
        setPostCompanyName("");
        setPostRole("");
        setPostDescription("");
        setPostDeadline("");
        setPostRules([
          { field: "cgpa", operator: ">=", value: "7.0" },
          { field: "backlogCount", operator: "==", value: "0" }
        ]);
        fetchPlacementJobs();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Failed to post opportunity: " + err.message);
    }
  };

  const handleStudentDecision = async (jobId: string, decision: "applied" | "no-apply", applicationResume?: string) => {
    try {
      if (decision === "applied" && !applicationResume) {
        // Trigger the custom resume attachment modal
        setApplyingJobId(jobId);
        setApplyResumeMode("fallback");
        setApplyUploadFile("");
        setApplyUploadFileName("");
        setApplySelectedSavedResume(savedResumes[0]?.name || "");
        return;
      }

      const res = await fetch(`${BACKEND_URL}/api/placement/jobs/${jobId}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decision, applicationResume })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully saved decision: ${decision === "applied" ? "Applied" : "No Apply"}`);
        setApplyingJobId(null);
        fetchPlacementJobs();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Failed to save decision: " + err.message);
    }
  };

  const handleAcknowledgeMatch = async (jobId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/jobs/${jobId}/acknowledge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert("Notification acknowledged.");
        fetchPlacementJobs();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Failed to acknowledge: " + err.message);
    }
  };

  const handleCompileAndDownloadReport = async (jobId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/jobs/${jobId}/report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.report) {
        alert("Report generated successfully! Opening Cloudinary PDF file...");
        window.open(data.report.pdfUrl, "_blank");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Failed to compile report: " + err.message);
    }
  };

  const handleAdminEditStudentRegistration = async (studentEmail: string, updatedFields: any) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/registration/${studentEmail}/admin-edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        alert("Registration edited by admin and logged successfully!");
        setSelectedRegForAudit(null);
        fetchAllRegistrations();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Failed to edit registration: " + err.message);
    }
  };

  // ==========================================
  // M7: SENSOR ISSUING SYSTEM ACTIONS & FETCHERS
  // ==========================================
  const fetchSensorsData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSensorsList(data.sensors);
    } catch (err: any) {
      console.error("Failed to fetch sensors:", err);
    }
  };

  const fetchStudentRequests = async () => {
    if (!profile?.user?._id) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/${profile.user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSensorRequests(data.requests);
    } catch (err: any) {
      console.error("Failed to fetch student requests:", err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPendingSensorRequests(data.requests);
    } catch (err: any) {
      console.error("Failed to fetch pending requests:", err);
    }
  };

  const fetchStudentFines = async () => {
    if (!profile?.user?._id) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/fines/${profile.user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStudentFines(data.fines);
    } catch (err: any) {
      console.error("Failed to fetch fines:", err);
    }
  };

  const fetchFineConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/admin/fine-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setFineConfig(data.config);
    } catch (err: any) {
      console.error("Failed to fetch fine config:", err);
    }
  };

  const fetchAdminDashboardStats = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminDashboardStats(data);
        setAdminDmgCases(data.openDamageCases);
      }
    } catch (err: any) {
      console.error("Failed to fetch admin stats:", err);
    }
  };

  const loadAllSensorsModuleData = () => {
    fetchSensorsData();
    if (userRole === "student") {
      fetchStudentRequests();
      fetchStudentFines();
    } else {
      fetchPendingRequests();
      fetchAdminDashboardStats();
      fetchFineConfig();
    }
  };

  useEffect(() => {
    if (token && activeModule === "sensors") {
      loadAllSensorsModuleData();
    }
  }, [token, activeModule, userRole, profile]);

  const handleCreateSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newSensorName,
          type: newSensorType,
          department: newSensorDept,
          totalQuantity: newSensorQty
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Sensor added to catalog successfully.");
        setNewSensorName("");
        setNewSensorType("");
        setNewSensorDept("");
        setNewSensorQty(1);
        fetchSensorsData();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Failed to add sensor: " + err.message);
    }
  };

  const handleUpdateSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSensorId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensors/${editingSensorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          totalQuantity: editSensorQty,
          availableQuantity: editSensorQty,
          conditionSummary: editSensorCond,
          notes: editSensorNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Sensor catalog item updated.");
        setEditingSensorId(null);
        setEditSensorNotes("");
        fetchSensorsData();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Failed to update sensor: " + err.message);
    }
  };

  const handleRequestSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSensorId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sensorId: reqSensorId,
          purpose: reqPurpose,
          projectName: reqProject,
          requestedFrom: reqFrom,
          requestedTo: reqTo
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Sensor request submitted successfully for faculty review.");
        setReqSensorId(null);
        setReqPurpose("");
        setReqProject("");
        setReqFrom("");
        setReqTo("");
        fetchStudentRequests();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Failed to request sensor: " + err.message);
    }
  };

  const handleApproveReject = async (requestId: string, decision: "approved" | "rejected") => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/${requestId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decision, approvalNote })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Request ${decision} successfully.`);
        setApprovalNote("");
        fetchPendingRequests();
        fetchAdminDashboardStats();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  const handleIssueSensor = async (requestId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/${requestId}/issue`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Handover recorded. Sensor request marked as Issued.");
        fetchAdminDashboardStats();
        fetchSensorsData();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Handover fail: " + err.message);
    }
  };

  const handleReturnSensor = async (requestId: string, condition: "ok" | "damaged") => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/${requestId}/return`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ condition, notes: damagedReturnNotes })
      });
      const data = await res.json();
      if (data.success) {
        alert("Sensor returned and inventory updated.");
        setDamagedReturnNotes("");
        fetchAdminDashboardStats();
        fetchSensorsData();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Return recording failed: " + err.message);
    }
  };

  const handleMarkLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostReqId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/${lostReqId}/mark-lost`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ penaltyAmount: lostPenalty, notes: lostNotes })
      });
      const data = await res.json();
      if (data.success) {
        alert("Sensor marked as Lost. DamageLoss case logged.");
        setLostReqId(null);
        setLostNotes("");
        setLostPenalty(0);
        fetchAdminDashboardStats();
        fetchSensorsData();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Loss recording failed: " + err.message);
    }
  };

  const handleResolveDamageCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingCaseId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/damage-cases/${resolvingCaseId}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ penaltyAmount: resolvePenalty, notes: resolveNotes })
      });
      const data = await res.json();
      if (data.success) {
        alert("Damage/Loss case resolved.");
        setResolvingCaseId(null);
        setResolveNotes("");
        setResolvePenalty(0);
        fetchAdminDashboardStats();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Resolve action failed: " + err.message);
    }
  };

  const handleUpdateFineConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/admin/fine-config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ratePerHour: fineConfig.ratePerHour })
      });
      const data = await res.json();
      if (data.success) {
        alert("Fine rate configuration updated.");
        fetchFineConfig();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Config update failed: " + err.message);
    }
  };

  const handleMarkFinePaid = async (fineId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/fines/${fineId}/mark-paid`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Fine marked as Paid offline.");
        fetchAdminDashboardStats();
        if (userRole === "student") fetchStudentFines();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err: any) {
      alert("Payment update failed: " + err.message);
    }
  };

  useEffect(() => {
    if (token && activeModule === "placements") {
      fetchPlacementRegistration();
      fetchPlacementJobs();
      if (userRole === "admin" || userRole === "faculty") {
        fetchAllRegistrations();
      }
    }
  }, [token, activeModule, userRole, profile]);

  const loadDashboardData = (authToken: string, role: string | null) => {
    fetchEvents(authToken);
    if (role === "student") {
      fetchProfile(authToken);
      fetchActivities(authToken);
    } else if (role === "faculty" || role === "admin") {
      fetchPendingActivities(authToken);
      setActiveTab("events"); // Default tab for faculty
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUserRole(data.user.role);
        setUserEmail(data.user.email);
        localStorage.setItem("trellis_token", data.token);
        localStorage.setItem("trellis_role", data.user.role);
        localStorage.setItem("trellis_email", data.user.email);
        setAuthMessage("Logged in successfully!");
        loadDashboardData(data.token, data.user.role);
        setShowDashboardView(true);
        window.history.pushState(null, "", "/?view=dashboard");
        setIsAuthModalOpen(false); // Close auth modal on success
      } else {
        setAuthError(data.message || "Invalid credentials");
      }
    } catch (err: any) {
      setAuthError(`Could not connect to backend server at ${BACKEND_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: string) => {
    setAuthError("");
    setAuthMessage("");
    setLoading(true);

    let quickEmail = "";
    let quickPassword = "";

    if (role === "student") {
      quickEmail = "student@ips.edu";
      quickPassword = "student123";
    } else if (role === "faculty") {
      quickEmail = "faculty@ips.edu";
      quickPassword = "faculty123";
    } else if (role === "admin") {
      quickEmail = "admin@ips.edu";
      quickPassword = "admin123";
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: quickEmail, password: quickPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUserRole(data.user.role);
        setUserEmail(data.user.email);
        localStorage.setItem("trellis_token", data.token);
        localStorage.setItem("trellis_role", data.user.role);
        localStorage.setItem("trellis_email", data.user.email);
        setAuthMessage("Logged in successfully!");
        loadDashboardData(data.token, data.user.role);
        setShowDashboardView(true);
        window.history.pushState(null, "", "/?view=dashboard");
      } else {
        alert(data.message || "Invalid credentials. Please run node seed_users.js backend script first.");
      }
    } catch (err: any) {
      alert(`Could not connect to backend server at ${BACKEND_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent, selectedRole: string) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUserRole(data.user.role);
        setUserEmail(data.user.email);
        localStorage.setItem("trellis_token", data.token);
        localStorage.setItem("trellis_role", data.user.role);
        localStorage.setItem("trellis_email", data.user.email);
        setAuthMessage("Registered successfully!");
        loadDashboardData(data.token, data.user.role);
        setShowDashboardView(true);
        window.history.pushState(null, "", "/?view=dashboard");
        setIsAuthModalOpen(false); // Close auth modal on success
      } else {
        setAuthError(data.message || "Something went wrong");
      }
    } catch (err: any) {
      setAuthError("Could not connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/students/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/events`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivities = async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/activities/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingActivities = async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/activities/pending`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.success) {
        setPendingActivities(data.activities);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!name || !rollNumber || !branch || !graduationYear) {
      setFormError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const skillArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await fetch(`${BACKEND_URL}/api/students/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          rollNumber,
          branch,
          graduationYear: parseInt(graduationYear),
          cgpa: parseFloat(cgpa) || 0,
          bio,
          skills: skillArray,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setFormSuccess("Profile created successfully!");
        setProfile(data.profile);
        setHasProfile(true);
      } else {
        setFormError(data.message || "Could not create profile");
      }
    } catch (err) {
      setFormError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        alert("Successfully registered for event!");
        fetchEvents(token!);
      } else {
        alert(data.message || "Could not register.");
      }
    } catch (err) {
      alert("Error registering.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle) return;
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: actTitle,
          type: actType,
          description: actDesc,
          date: new Date(actDate),
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Activity logged successfully! Pending verification.");
        setActTitle("");
        setActDesc("");
        fetchActivities(token!);
      }
    } catch (err) {
      alert("Error logging activity.");
    } finally {
      setLoading(false);
    }
  };

  // Faculty: Create Event Handler
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventVenue || !eventDate) {
      alert("Please fill in required event fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDesc,
          venue: eventVenue,
          date: new Date(eventDate),
          registrationDeadline: new Date(eventDeadline),
          maxParticipants: parseInt(eventMaxPart) || 100,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Event created successfully!");
        setEventTitle("");
        setEventDesc("");
        setEventVenue("");
        fetchEvents(token!);
      } else {
        alert(data.message || "Failed to create event");
      }
    } catch (err) {
      alert("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  // Faculty: Verify Activity Handler
  const handleVerifyActivity = async (activityId: string, status: "verified" | "rejected", points: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/activities/${activityId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, pointsAwarded: points }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Activity status updated to ${status}`);
        fetchPendingActivities(token!);
      }
    } catch (err) {
      alert("Error updating activity verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUserRole(null);
    setUserEmail(null);
    setProfile(null);
    setHasProfile(false);
    setEmail("");
    setPassword("");
    setActiveModule(null);
    setActiveTab("events");
    localStorage.removeItem("trellis_token");
    localStorage.removeItem("trellis_role");
    localStorage.removeItem("trellis_email");
    setShowDashboardView(false);
    window.history.pushState(null, "", "/?view=home");
  };

  /*
  const sampleEvents = [
    {
      _id: "s1",
      title: "Indore Youth Hackathon 2026",
      description: "A 36-hour intense coding competition targeting smart campus automation and IoT integrations.",
      venue: "Main Auditorium, Block A",
      date: "2026-09-15T09:00:00.000Z",
    },
    {
      _id: "s2",
      title: "Campus Placement Seminar",
    window.history.pushState(null, "", "/?view=home");
  */

  // Sample events for public landing page
  const sampleEvents = [
    {
      _id: "s1",
      title: "Indore Youth Hackathon 2026",
      description: "A 36-hour intense coding competition targeting smart campus automation and IoT integrations.",
      venue: "Main Auditorium, Block A",
      date: "2026-09-15T09:00:00.000Z",
    },
    {
      _id: "s2",
      title: "Campus Placement Seminar",
      description: "Interactive briefing session with HR leaders from Fortune 500 tech companies on interview cracking tips.",
      venue: "Placement Cell Hall",
      date: "2026-09-22T14:00:00.000Z",
    },
    {
      _id: "s3",
      title: "Robo-Soccer Championship",
      description: "Showcase of autonomous robotics and control design by the Robotics Club of IPS Academy.",
      venue: "Sports Complex Arena",
      date: "2026-10-05T10:00:00.000Z",
    },
  ];

  return (
    <div className="relative min-h-screen text-zinc-950 font-sans antialiased">
      {/* LAYER 1: FIXED BACKGROUND */}
      <div className="fixed-bg-container">
        {/* If image hasn't loaded yet, it defaults to dark orange/brownish backdrop */}
        <img
          src="/images/ips-bg.png"
          alt="IPS Academy Indore Campus"
          className="fixed-bg-image"
          onError={(e) => {
            // Fallback backgound if the image is missing
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1607237138185-eedd996e5b09?q=80&w=1920&auto=format&fit=crop";
          }}
        />
        <div className="fixed-bg-overlay" />
      </div>

      {/* 1. FIXED NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-zinc-950/70 backdrop-blur-md border-b border-white/10 shadow-lg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Subtitle */}
            <a
              href="#home"
              onClick={() => {
                setShowDashboardView(false);
                window.history.pushState(null, "", "/?view=home");
              }}
              className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-xl md:text-2xl font-black tracking-wider text-orange-500">
                CAMPUS OS
              </span>
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-zinc-300">
                IPS ACADEMY · INDORE
              </span>
            </a>

            {/* Navigation links */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide">
              <a
                href="#home"
                onClick={() => {
                  setShowDashboardView(false);
                  window.history.pushState(null, "", "/?view=home");
                }}
                className="hover:text-orange-500 transition-colors"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={() => {
                  setShowDashboardView(false);
                  window.history.pushState(null, "", "/?view=home");
                }}
                className="hover:text-orange-500 transition-colors"
              >
                About
              </a>
              <a
                href="#academic"
                onClick={() => {
                  setShowDashboardView(false);
                  window.history.pushState(null, "", "/?view=home");
                }}
                className="hover:text-orange-500 transition-colors"
              >
                Academic
              </a>
              <a
                href="#department"
                onClick={() => {
                  setShowDashboardView(false);
                  window.history.pushState(null, "", "/?view=home");
                }}
                className="hover:text-orange-500 transition-colors"
              >
                Department
              </a>
              <a
                href="#footer"
                onClick={() => {
                  setShowDashboardView(false);
                  window.history.pushState(null, "", "/?view=home");
                }}
                className="hover:text-orange-500 transition-colors"
              >
                Contact Us
              </a>

            </div>

            {/* Action Buttons & Icons */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell (if logged in) */}
              {token && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(!showNotifDropdown);
                      fetchNotices();
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors relative cursor-pointer"
                    aria-label="Notifications"
                  >
                    <svg className="w-5 h-5 fill-current text-orange-500" viewBox="0 0 24 24">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                    {notices.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-3 w-80 bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-4 z-50 max-h-96 overflow-y-auto text-white animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                        <h4 className="font-extrabold text-sm text-white">Campus Notices</h4>
                        <button
                          onClick={() => setShowNotifDropdown(false)}
                          className="text-[10px] text-zinc-400 hover:text-white uppercase font-black"
                        >
                          Close
                        </button>
                      </div>
                      <div className="space-y-3">
                        {notices.length === 0 ? (
                          <p className="text-xs text-zinc-500 italic text-center py-4">No new notices.</p>
                        ) : (
                          notices.map((notif: any, idx: number) => (
                            <div key={idx} className="p-2.5 bg-zinc-800 border border-zinc-700 rounded-xl">
                              <h5 className="font-bold text-xs text-white">{notif.title}</h5>
                              <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{notif.content || notif.description}</p>
                              <span className="text-[8px] text-zinc-500 block mt-1">{formatDate(notif.date || notif.createdAt)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Toggle Theme"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-1.06-1.06zm-12.37 1.06l-1.06 1.06c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.06-1.06c.39-.39.39-1.02 0-1.41a.996.996 0 00-1.41 0zm13.43-13.43l-1.06 1.06c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.06-1.06c.39-.39.39-1.02 0-1.41a.996.996 0 00-1.41 0z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-zinc-300 fill-current" viewBox="0 0 24 24">
                    <path d="M12.3 2a10 10 0 00-1.9 19.8 10 10 0 0011.8-11.8A10 10 0 0012.3 2z"/>
                  </svg>
                )}
              </button>

              {/* Sign In/Out Action */}
              {token ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowDashboardView(true);
                      window.history.pushState(null, "", "/?view=dashboard");
                    }}
                    className="py-2 px-5 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all text-xs font-bold shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    Portal Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="py-2 px-5 rounded-full border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold shadow-md cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <select
                  onChange={(e) => {
                    const role = e.target.value;
                    if (role) {
                      setAuthLoginRole(role);
                      setIsLoginView(true);
                      setIsAuthModalOpen(true);
                    }
                    e.target.value = ""; // reset select value
                  }}
                  defaultValue=""
                  className="py-2 px-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all text-xs font-bold shadow-lg shadow-orange-500/20 cursor-pointer border-none outline-none appearance-none"
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px top 50%", backgroundSize: "8px auto", paddingRight: "28px" }}
                >
                  <option value="" disabled className="bg-white text-zinc-800">Portal Login</option>
                  <option value="student" className="bg-white text-zinc-800 font-semibold">Student</option>
                  <option value="faculty" className="bg-white text-zinc-800 font-semibold">Faculty</option>
                  <option value="admin" className="bg-white text-zinc-800 font-semibold">Admin</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main scrolling wrapper */}
      <div className="relative pt-24 w-full">
        {loading && (
          <div className="fixed top-24 left-0 w-full z-50">
            <div className="h-1.5 w-full bg-zinc-900/50 overflow-hidden">
              <div className="h-full bg-orange-500 animate-[pulse_1s_infinite] w-1/3 rounded-full"></div>
            </div>
          </div>
        )}

        {(!token || !showDashboardView) ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-24">
            
            {/* 2. HERO SECTION */}
            <section id="home" className="min-h-[calc(100vh-140px)] flex items-center justify-center">
              <div className="w-full bg-orange-50/95 backdrop-blur-md rounded-[2.5rem] border border-orange-200/20 shadow-2xl p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* HERO LEFT SIDE */}
                <div className="lg:col-span-7 flex flex-col space-y-6">
                  <div>
                    <span className="bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-orange-200 shadow-sm">
                      IPS Academy
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-950 tracking-tight leading-[1.1] sm:leading-[1.05]">
                    Everything your <span className="text-orange-500 underline decoration-wavy decoration-orange-300 decoration-3 underline-offset-8">campus</span> needs, in one place
                  </h1>
                  <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-xl">
                    Discover events, manage achievements, monitor placement statistics, and reserve campus facilities effortlessly. Campus OS unifies academy workflows into a modern workspace.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <a
                      href="#about"
                      className="py-3 px-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Explore Campus
                    </a>
                    <a
                      href="#academic"
                      className="py-3 px-8 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                      View Events
                    </a>
                  </div>
                </div>

                {/* HERO RIGHT SIDE (CAROUSEL) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="relative aspect-[4/3] w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white shadow-zinc-950/20 group">
                    {/* Carousel slides */}
                    {carouselImages.map((src, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                          index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                      >
                        <img
                          src={src}
                          alt={`Campus Carousel ${index + 1}`}
                          className="w-full h-full object-fit-cover"
                          onError={(e) => {
                            // Fallback photo URLs from unsplash
                            const fallbacks = [
                              "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600",
                              "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600",
                              "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600",
                            ];
                            (e.target as HTMLImageElement).src = fallbacks[index];
                          }}
                        />
                      </div>
                    ))}

                    {/* Navigation Dots inside the carousel card */}
                    <div className="absolute bottom-5 left-0 w-full flex justify-center space-x-2 z-20">
                      {carouselImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-3.5 h-3.5 rounded-full transition-all border border-white/50 ${
                            index === currentSlide ? "bg-orange-500 scale-125" : "bg-white/60 hover:bg-white"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 3. ABOUT SECTION */}
            <section id="about" className="scroll-mt-24">
              <div className="bg-orange-50/90 backdrop-blur-md rounded-[2rem] p-8 md:p-12 lg:p-16 border border-orange-200/10 shadow-xl">
                <div className="max-w-3xl mb-12">
                  <span className="text-orange-500 font-bold uppercase tracking-wider text-sm">IPS INDORE</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-950 mt-2 mb-4">About IPS Academy</h2>
                  <p className="text-zinc-600 leading-relaxed">
                    IPS Academy, Indore is one of India's premier educational institutions, dedicated to nurturing students with innovation and technical proficiency. Campus OS is designed to enable smart collaboration across academic tracking, event registrations, and career planning.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col space-y-3">
                    <span className="text-3xl">🎓</span>
                    <h3 className="text-lg font-bold text-zinc-950">Academic Excellence</h3>
                    <p className="text-sm text-zinc-500">Rigorous coursework, verified co-curricular achievements, and faculty mentorship to guide student growth.</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col space-y-3">
                    <span className="text-3xl">⚡</span>
                    <h3 className="text-lg font-bold text-zinc-950">Vibrant Life</h3>
                    <p className="text-sm text-zinc-500">From technology hackathons to cultural festivals, stay updated with official registrations and timelines.</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col space-y-3">
                    <span className="text-3xl">💼</span>
                    <h3 className="text-lg font-bold text-zinc-950">Career Success</h3>
                    <p className="text-sm text-zinc-500">Unmatched training and placement cells linking IPS Academy Indore graduates with top-tier global enterprise companies.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. ACADEMIC EVENTS SECTION */}
            <section id="academic" className="scroll-mt-24">
              <div className="bg-orange-50/90 backdrop-blur-md rounded-[2rem] p-8 md:p-12 lg:p-16 border border-orange-200/10 shadow-xl space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end">
                  <div>
                    <span className="text-orange-500 font-bold uppercase tracking-wider text-sm">TIMELINE</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-950 mt-2">Upcoming Campus Events</h2>
                  </div>
                  <button
                    onClick={() => {
                      setIsLoginView(true);
                      setIsAuthModalOpen(true);
                    }}
                    className="mt-4 sm:mt-0 font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Manage Events <span>&rarr;</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sampleEvents.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-2xl p-6 border border-zinc-150 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-zinc-950 leading-tight">{event.title}</h3>
                        <p className="text-sm text-zinc-500 mt-2 line-clamp-3">{event.description}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-col space-y-3">
                        <div className="text-xs text-zinc-500 space-y-1">
                          <div>📍 {event.venue}</div>
                          <div>📅 {formatDate(event.date)}</div>
                        </div>
                        <button
                          onClick={() => handleRegisterEvent(event._id)}
                          className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Register Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. DEPARTMENT & PLACEMENT SECTION */}
            <section id="department" className="scroll-mt-24">
              <div className="bg-orange-50/90 backdrop-blur-md rounded-[2rem] p-8 md:p-12 lg:p-16 border border-orange-200/10 shadow-xl space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <span className="text-orange-500 font-bold uppercase tracking-wider text-sm">SUCCESS STATS</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-950 mt-2 mb-4">Placement Achievements</h2>
                    <p className="text-zinc-600 leading-relaxed mb-6">
                      Our training & placement cell bridges the academic-corporate loop by providing industry-aligned engineering training, certifications, and live coaching to ensure 100% campus recruitment.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-xl border border-zinc-100 text-center shadow-sm">
                        <div className="text-3xl font-black text-orange-500">45 LPA</div>
                        <div className="text-xs text-zinc-500 uppercase font-semibold mt-1">Highest Package</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-zinc-100 text-center shadow-sm">
                        <div className="text-3xl font-black text-orange-500">100%</div>
                        <div className="text-xs text-zinc-500 uppercase font-semibold mt-1">Placement Aid</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-zinc-100 text-center shadow-sm">
                        <div className="text-3xl font-black text-orange-500">250+</div>
                        <div className="text-xs text-zinc-500 uppercase font-semibold mt-1">Recruiters</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-zinc-100 text-center shadow-sm">
                        <div className="text-3xl font-black text-orange-500">8.2 LPA</div>
                        <div className="text-xs text-zinc-500 uppercase font-semibold mt-1">Average CTC</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-3xl border border-zinc-150 shadow-sm flex flex-col space-y-4">
                    <h3 className="text-lg font-bold text-zinc-950">Top Recruiting Partners</h3>
                    <p className="text-xs text-zinc-500">Our alumni work at global tech enterprises. Connect through placement portals.</p>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-zinc-50 py-3 rounded-lg text-center font-bold text-zinc-700 border border-zinc-100">Microsoft</div>
                      <div className="bg-zinc-50 py-3 rounded-lg text-center font-bold text-zinc-700 border border-zinc-100">TCS Digital</div>
                      <div className="bg-zinc-50 py-3 rounded-lg text-center font-bold text-zinc-700 border border-zinc-100">Infosys</div>
                      <div className="bg-zinc-50 py-3 rounded-lg text-center font-bold text-zinc-700 border border-zinc-100">Capgemini</div>
                      <div className="bg-zinc-50 py-3 rounded-lg text-center font-bold text-zinc-700 border border-zinc-100">Cognizant</div>
                      <div className="bg-zinc-50 py-3 rounded-lg text-center font-bold text-zinc-700 border border-zinc-100">Wipro</div>
                    </div>
                  </div>
                </div>

                {/* Core Academic Departments Grid */}
                <div className="pt-8 border-t border-orange-200/20">
                  <h3 className="text-2xl font-extrabold text-zinc-950 mb-6 text-center">Core Academic Departments</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { name: "Computer Science & Engineering", icon: "💻" },
                      { name: "Fire Technology & Safety Engineering", icon: "🔥" },
                      { name: "Chemical Engineering", icon: "🧪" },
                      { name: "Civil Engineering", icon: "🏗️" },
                      { name: "Mechanical Engineering", icon: "⚙️" },
                      { name: "Electrical & Electronics Engineering", icon: "⚡" },
                    ].map((dept, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm flex items-center space-x-3 hover:shadow-md transition-shadow">
                        <span className="text-2xl">{dept.icon}</span>
                        <span className="text-sm font-bold text-zinc-800 leading-tight">{dept.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* CUSTOM DARK FOOTER */}
            <footer id="footer" className="bg-zinc-950 text-zinc-300 py-12 border-t border-white/10 rounded-[2rem] px-8 md:px-12 lg:px-16 mt-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-zinc-800">
                {/* Column 1: Academics */}
                <div>
                  <h3 className="text-white font-extrabold text-base mb-4 tracking-wider uppercase">Academics</h3>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Accolades</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Institutional Distinctiveness</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">CSR Activities</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Best Practices</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Facilities</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Alumni</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Placement & Training</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Special Awards</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Mandatory Disclosure</a></li>
                  </ul>
                </div>

                {/* Column 2: Research */}
                <div>
                  <h3 className="text-white font-extrabold text-base mb-4 tracking-wider uppercase">Research</h3>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Research & Development</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Entrepreneurship</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">e-Journals</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Remote Center</a></li>
                  </ul>
                </div>

                {/* Column 3: Explore */}
                <div>
                  <h3 className="text-white font-extrabold text-base mb-4 tracking-wider uppercase">Explore</h3>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Photo Gallery</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Cultural</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">NBA-DCS</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">NAAC</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Feedback</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">NIRF Data</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">ARIIA - 2021</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">AICTE EOA</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Swachh Bharat</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">E-Learning</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Off Campus 360° View</a></li>
                  </ul>
                </div>

                {/* Column 4: Special Events */}
                <div>
                  <h3 className="text-white font-extrabold text-base mb-4 tracking-wider uppercase">Special Events</h3>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-orange-500 transition-colors">TED<sup>x</sup> IPSA</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Envisage</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Neev</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Sameeksha</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Srujan</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Sakriya</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Engineer's Day</a></li>
                  </ul>
                </div>
              </div>

              {/* Bottom Copyright & Connect Bar */}
              <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500 gap-4">
                <div>
                  Copyright &copy; 2018 IPS Academy Indore, Last Updated: August 4, 2026
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-zinc-400">Connect on Social Media</span>
                  <div className="flex space-x-3.5 text-zinc-400">
                    <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/></svg>
                    </a>
                    <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                    <a href="#" className="hover:text-white transition-colors" aria-label="YouTube">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.389-.507a3.002 3.002 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </footer>

          </div>
        ) : (
          /* ======================================================================
              AUTHENTICATED STUDENT/FACULTY PORTAL (DASHBOARD)
             ====================================================================== */
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white/95 backdrop-blur-md rounded-[2rem] border border-orange-200/20 shadow-2xl p-6 md:p-8 space-y-8">
              
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-150">
                <div>
                  <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Trellis Portal</h1>
                  <p className="text-sm text-zinc-500">Smart Campus Student & Career Management</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
                    {userRole?.toUpperCase()}
                  </span>
                  <span className="text-sm text-zinc-500">{userEmail}</span>
                </div>
              </div>

              {/* 1. Setup Student Profile Form */}
              {userRole === "student" && !hasProfile && (
                <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-zinc-900 mb-1">Create Student Profile</h2>
                  <p className="text-sm text-zinc-500 mb-6">Setup your mini-LinkedIn career profile</p>

                  {formError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleCreateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700">Roll Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CS202601"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                          className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700">Branch / Major *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Computer Science"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700">Graduation Year *</label>
                        <input
                          type="number"
                          required
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700">CGPA</label>
                        <input
                          type="text"
                          placeholder="e.g. 8.5"
                          value={cgpa}
                          onChange={(e) => setCgpa(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Short Bio / Description</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black bg-white"
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Skills (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. React, Node.js, Mongoose, Python"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black bg-white"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
                      >
                        Save Profile
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="py-2.5 px-4 border border-zinc-300 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 2. Fully Connected Student Dashboard */}
              {userRole === "student" && hasProfile && profile && (
                <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                  {/* Grid layout for M1-M8 */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Campus Modules</h2>
                      <p className="text-sm text-zinc-500 mt-1">Smart services at your fingertips</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-3">
                      <button
                        onClick={() => setActiveModule("career")}
                        className="py-2 px-4 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Profile Card
                      </button>
                      <button
                        onClick={handleLogout}
                        className="py-2 px-4 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* M1: Campus Finder */}
                    <div
                      onClick={() => { fetchLocations(); setActiveModule("finder"); }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-3xl p-6 shadow-md hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] border border-zinc-800 group"
                    >
                      <div className="w-10 h-10 bg-emerald-950/50 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-900/30 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base leading-tight">Campus Finder</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">Navigate any room or hall</p>
                      </div>
                    </div>

                    {/* M2: Events & Activities */}
                    <div
                      onClick={() => { fetchEvents(token!); setActiveModule("events"); }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-3xl p-6 shadow-md hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] border border-zinc-800 group"
                    >
                      <div className="w-10 h-10 bg-indigo-950/50 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-900/30 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base leading-tight">Events</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">Fests, trials, registrations</p>
                      </div>
                    </div>

                    {/* M3: Placement & Internship */}
                    <div
                      onClick={() => { fetchJobs(); setActiveModule("placements"); }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-3xl p-6 shadow-md hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] border border-zinc-800 group"
                    >
                      <div className="w-10 h-10 bg-amber-950/50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-900/30 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-8-2h4v2h-4V4zm8 15H4V8h16v11z"/></svg>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base leading-tight">Placements</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">Jobs and internships</p>
                      </div>
                    </div>

                    {/* M4: Career Profile & Resume */}
                    <div
                      onClick={() => { setActiveModule("career"); }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-3xl p-6 shadow-md hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] border border-zinc-800 group"
                    >
                      <div className="w-10 h-10 bg-orange-950/50 rounded-2xl flex items-center justify-center text-orange-400 border border-orange-900/30 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base leading-tight">IPS Career Hub</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">Resume, Achievements & Portfolio</p>
                      </div>
                    </div>

                    {/* M6: Campus Security & SOS */}
                    <div
                      onClick={() => { fetchSOSAlerts(); setActiveModule("sos"); }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-3xl p-6 shadow-md hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] border border-zinc-800 group"
                    >
                      <div className="w-10 h-10 bg-red-950/50 rounded-2xl flex items-center justify-center text-red-500 border border-red-900/30 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base leading-tight">SOS</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">Instant safety alert</p>
                      </div>
                    </div>


                    {/* M7: Sensor Issuing System */}
                    <div
                      onClick={() => { fetchSensorsData(); loadAllSensorsModuleData(); setActiveModule("sensors"); }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-3xl p-6 shadow-md hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] border border-zinc-800 group"
                    >
                      <div className="w-10 h-10 bg-emerald-950/50 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-900/30 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base leading-tight">Sensor Issuing System</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">IoT Kits, Arduino, & Lab Sensors</p>
                      </div>
                    </div>

                    {/* M8: Lost & Found */}
                    <div
                      onClick={() => { fetchLostFoundItems(); setActiveModule("lostfound"); }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-3xl p-6 shadow-md hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[160px] border border-zinc-800 group"
                    >
                      <div className="w-10 h-10 bg-sky-950/50 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-900/30 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base leading-tight">Lost & Found</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">Report and reclaim items</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                  {/* MODAL VIEW SYSTEM */}
                  {activeModule && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                      {/* Backdrop */}
                      <div
                        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm cursor-pointer"
                        onClick={() => setActiveModule(null)}
                      ></div>
                      
                      {/* Modal Panel Box */}
                      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-zinc-200/50 shadow-2xl p-6 sm:p-8 z-10 max-h-[85vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
                        <button
                          onClick={() => setActiveModule(null)}
                          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 text-lg cursor-pointer"
                          aria-label="Close"
                        >
                          &#10005;
                        </button>

                                          {activeModule === "finder" && (
                          <div className="space-y-6 text-zinc-950 font-sans">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                              <h3 className="text-2xl font-black text-zinc-900">Smart Campus Finder</h3>
                              <div className="flex bg-zinc-100 rounded-lg p-1 border border-zinc-200">
                                <button
                                  onClick={() => setFinderTab("map")}
                                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                    finderTab === "map" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                                  }`}
                                >
                                  Interactive Map
                                </button>
                                <button
                                  onClick={() => {
                                    setFinderTab("faculty");
                                    fetchFacultyCabins();
                                  }}
                                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                    finderTab === "faculty" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                                  }`}
                                >
                                  Faculty Finder
                                </button>
                              </div>
                            </div>

                            {finderTab === "map" && (
                              <div className="space-y-6">
                                {/* Search Bar & Auto-suggestions */}
                                <div className="relative">
                                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Search Destination</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Search e.g. Computer Lab 4, Central Library..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      className="block flex-1 px-4 py-3 border border-zinc-300 rounded-xl shadow-sm text-black bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {selectedDestination && (
                                      <button
                                        onClick={() => {
                                          setSelectedDestination(null);
                                          setRoutePath([]);
                                          setRouteDirections([]);
                                          setRouteDistance(0);
                                          setSearchQuery("");
                                        }}
                                        className="px-4 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-xl text-xs font-bold"
                                      >
                                        Clear Route
                                      </button>
                                    )}
                                  </div>

                                  {/* Auto-suggestions dropdown */}
                                  {searchQuery.trim().length > 0 && (
                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                                      {locations
                                        .filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map((loc) => (
                                          <div
                                            key={loc._id}
                                            onClick={() => {
                                              setSelectedDestination(loc);
                                              setActiveFloor(loc.floor);
                                              calculateRoute(loc._id);
                                              setSearchQuery(loc.name);
                                            }}
                                            className="px-4 py-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100 flex justify-between items-center text-xs"
                                          >
                                            <span className="font-bold text-zinc-900">{loc.name}</span>
                                            <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-2 py-0.5 rounded-full">
                                              {loc.building} · Floor {loc.floor}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>

                                {/* Start Node Selection */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Starting Position</label>
                                    <select
                                      value={selectedStartNode}
                                      onChange={(e) => {
                                        setSelectedStartNode(e.target.value);
                                        if (selectedDestination) {
                                          calculateRoute(selectedDestination._id);
                                        }
                                      }}
                                      className="block w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-xs text-black bg-zinc-50 focus:outline-none"
                                    >
                                      <option value="node-home">Gate 1 Entrance</option>
                                      <option value="node-a-g">Block A Ground Lobby</option>
                                      <option value="node-b-g">Block B Ground Lobby</option>
                                      <option value="node-c-g">Block C Ground Lobby</option>
                                      <option value="node-d-g">Block D Ground Lobby</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Floor View</label>
                                    <div className="flex bg-zinc-100 rounded-xl p-1 border border-zinc-200">
                                      {[0, 1, 2].map((f) => (
                                        <button
                                          key={f}
                                          onClick={() => setActiveFloor(f)}
                                          className={`flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all cursor-pointer ${
                                            activeFloor === f ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                                          }`}
                                        >
                                          {f === 0 ? "Ground" : f === 1 ? "1st" : "2nd"}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Category Filters */}
                                <div>
                                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Category Filters</label>
                                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                                    {[
                                      { label: "All", value: null },
                                      { label: "Labs", value: "lab" },
                                      { label: "Classrooms", value: "classroom" },
                                      { label: "Canteens", value: "canteen" },
                                      { label: "Library", value: "library" },
                                      { label: "Washrooms", value: "washroom" },
                                      { label: "Parking", value: "parking" },
                                      { label: "Printer", value: "printer" },
                                      { label: "Faculty Cabins", value: "faculty-cabin" }
                                    ].map((cat) => (
                                      <button
                                        key={cat.label}
                                        onClick={() => {
                                          setCategoryFilter(cat.value);
                                          fetchLocations(cat.value);
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                                          categoryFilter === cat.value 
                                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                                        }`}
                                      >
                                        {cat.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Map Visualization Panel */}
                                <div className="border border-zinc-200 rounded-3xl overflow-hidden bg-zinc-50 relative shadow-inner">
                                  <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 text-[10px] uppercase font-black text-zinc-400 flex justify-between">
                                    <span>IPS Academy Campus Floor plan (Floor {activeFloor})</span>
                                    <span>Route pathfinding active</span>
                                  </div>
                                  
                                  <div className="flex justify-center p-4">
                                    <svg viewBox="0 0 400 400" className="w-full max-w-[360px] aspect-square bg-white border border-zinc-200 rounded-2xl shadow-sm">
                                      <defs>
                                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                                        </pattern>
                                      </defs>
                                      <rect width="400" height="400" fill="url(#grid)" />

                                      {activeFloor === 0 ? (
                                        <>
                                          <rect x="150" y="30" width="200" height="70" rx="10" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2" />
                                          <text x="250" y="70" textAnchor="middle" className="text-[10px] font-black fill-emerald-800 uppercase tracking-widest">Ground</text>
                                          
                                          <rect x="20" y="30" width="110" height="70" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                                          <text x="75" y="70" textAnchor="middle" className="text-[10px] font-black fill-slate-500 uppercase tracking-widest">Parking</text>

                                          <rect x="50" y="150" width="120" height="80" rx="15" fill="#fef3c7" stroke="#fde047" strokeWidth="2" />
                                          <text x="110" y="195" textAnchor="middle" className="text-[11px] font-black fill-amber-800">Block A</text>

                                          <rect x="230" y="150" width="120" height="80" rx="15" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="2" />
                                          <text x="290" y="195" textAnchor="middle" className="text-[11px] font-black fill-sky-850">Block B</text>

                                          <rect x="50" y="270" width="120" height="80" rx="15" fill="#f3e8ff" stroke="#d8b4fe" strokeWidth="2" />
                                          <text x="110" y="315" textAnchor="middle" className="text-[11px] font-black fill-purple-800">Block C</text>

                                          <rect x="230" y="270" width="120" height="80" rx="15" fill="#ffe4e6" stroke="#fecdd3" strokeWidth="2" />
                                          <text x="290" y="315" textAnchor="middle" className="text-[11px] font-black fill-rose-800">Block D</text>
                                        </>
                                      ) : (
                                        <>
                                          <line x1="50" y1="200" x2="350" y2="200" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
                                          <line x1="200" y1="50" x2="200" y2="350" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
                                          
                                          <rect x="60" y="120" width="60" height="50" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                                          <text x="90" y="150" textAnchor="middle" className="text-[8px] font-extrabold fill-slate-400">Room 1</text>
                                          
                                          <rect x="130" y="120" width="60" height="50" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                                          <text x="160" y="150" textAnchor="middle" className="text-[8px] font-extrabold fill-slate-400">Room 2</text>

                                          <rect x="210" y="120" width="60" height="50" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                                          <text x="240" y="150" textAnchor="middle" className="text-[8px] font-extrabold fill-slate-400">Room 3</text>

                                          <rect x="280" y="120" width="60" height="50" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                                          <text x="310" y="150" textAnchor="middle" className="text-[8px] font-extrabold fill-slate-400">Room 4</text>
                                        </>
                                      )}

                                      {routePath.length > 0 && (
                                        <>
                                          <polyline
                                            points={routePath
                                              .filter(node => node.floor === activeFloor)
                                              .map(node => `${node.x},${node.y}`)
                                              .join(" ")}
                                            fill="none"
                                            stroke="#f97316"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeDasharray="8,6"
                                          />
                                          {routePath
                                            .filter(node => node.floor === activeFloor)
                                            .map((node, i) => (
                                              <circle
                                                key={i}
                                                cx={node.x}
                                                cy={node.y}
                                                r="4"
                                                fill="#ea580c"
                                              />
                                            ))}
                                        </>
                                      )}

                                      {locations
                                        .filter(loc => loc.floor === activeFloor)
                                        .map((loc) => {
                                          const isSelected = selectedDestination && selectedDestination._id === loc._id;
                                          return (
                                            <g
                                              key={loc._id}
                                              className="cursor-pointer group"
                                              onClick={() => {
                                                setSelectedDestination(loc);
                                                calculateRoute(loc._id);
                                              }}
                                            >
                                              <circle
                                                cx={loc.x}
                                                cy={loc.y}
                                                r={isSelected ? 8 : 5}
                                                className={`transition-all duration-300 ${
                                                  isSelected
                                                    ? "fill-orange-600 stroke-white stroke-2"
                                                    : "fill-orange-500 stroke-white stroke-1 hover:fill-orange-600"
                                                }`}
                                              />
                                              <circle
                                                cx={loc.x}
                                                cy={loc.y}
                                                r={isSelected ? 4 : 2}
                                                className={isSelected ? "fill-orange-100" : "fill-white"}
                                              />
                                              <title>{loc.name} ({loc.category})</title>
                                            </g>
                                          );
                                        })}
                                    </svg>
                                  </div>
                                </div>

                                {/* Active Navigation Directions panel */}
                                {selectedDestination && (
                                  <div className="p-5 bg-orange-50/70 border border-orange-200 rounded-3xl space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-orange-100">
                                      <div>
                                        <h4 className="font-extrabold text-sm text-zinc-900">Destination: {selectedDestination.name}</h4>
                                        <p className="text-[10px] text-zinc-500 mt-0.5">Floor {selectedDestination.floor} · Building {selectedDestination.building}</p>
                                      </div>
                                      <div className="bg-orange-500 text-white px-3 py-1.5 rounded-xl text-center shadow">
                                        <span className="text-xs font-black">{routeDistance}m</span>
                                        <span className="text-[8px] uppercase tracking-wider block font-bold">Distance</span>
                                      </div>
                                    </div>

                                    {routeDirections.length > 0 && (
                                      <div className="space-y-2">
                                        <h5 className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Step-by-Step Directions</h5>
                                        <ol className="list-decimal pl-4 text-xs text-zinc-700 space-y-1.5">
                                          {routeDirections.map((step, sIdx) => (
                                            <li key={sIdx}>{step}</li>
                                          ))}
                                        </ol>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {finderTab === "faculty" && (
                              <div className="space-y-6">
                                {/* Search cabins input */}
                                <div>
                                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Search Faculty by Name</label>
                                  <input
                                    type="text"
                                    placeholder="Search e.g. Dr. Sanjay, Sharma..."
                                    value={facultySearchQuery}
                                    onChange={(e) => {
                                      setFacultySearchQuery(e.target.value);
                                      fetchFacultyCabins(e.target.value);
                                    }}
                                    className="block w-full px-4 py-3 border border-zinc-300 rounded-xl shadow-sm text-black bg-zinc-50 text-sm focus:outline-none"
                                  />
                                </div>

                                {/* Results Grid */}
                                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                                  {facultyCabins.length === 0 ? (
                                    <p className="text-zinc-500 italic text-xs text-center py-4">No matching faculty cabins found.</p>
                                  ) : (
                                    facultyCabins.map((cabin) => (
                                      <div
                                        key={cabin._id}
                                        className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
                                      >
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <h4 className="font-extrabold text-zinc-950 text-base">{cabin.facultyName}</h4>
                                            <span className={`w-2.5 h-2.5 rounded-full ${
                                              cabin.availabilityStatus === "free" 
                                                ? "bg-green-500" 
                                                : cabin.availabilityStatus === "busy" 
                                                ? "bg-red-500" 
                                                : "bg-zinc-400"
                                            }`} title={cabin.availabilityStatus} />
                                            <span className="text-[10px] text-zinc-500 capitalize">({cabin.availabilityStatus})</span>
                                          </div>
                                          <p className="text-xs text-orange-500 font-semibold">{cabin.department}</p>
                                          <p className="text-xs text-zinc-500">
                                            Cabin: <strong>{cabin.locationId?.name || "Unassigned"}</strong> (Floor {cabin.locationId?.floor})
                                          </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                          {cabin.locationId && (
                                            <button
                                              onClick={() => {
                                                setSelectedDestination(cabin.locationId);
                                                setActiveFloor(cabin.locationId.floor);
                                                calculateRoute(cabin.locationId._id);
                                                setFinderTab("map");
                                              }}
                                              className="py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex-1 md:flex-none cursor-pointer"
                                            >
                                              Navigate to cabin
                                            </button>
                                          )}

                                          {/* Status toggle manually for faculty/admin users */}
                                          {((userRole as any) === "faculty" || (userRole as any) === "admin") && (
                                            <select
                                              value={cabin.availabilityStatus}
                                              onChange={(e) => updateFacultyCabinStatus(cabin._id, e.target.value)}
                                              className="py-2 px-3 border border-zinc-300 rounded-xl bg-white text-black text-xs font-semibold flex-1 md:flex-none"
                                            >
                                              <option value="free">Set Free</option>
                                              <option value="busy">Set Busy</option>
                                              <option value="not-in-cabin">Set Out</option>
                                            </select>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* M2: Events UI */}
                        {activeModule === "events" && (
                          <div className="space-y-6">
                            <h3 className="text-2xl font-black text-zinc-900">Active Campus Events</h3>
                            
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                              {events.length === 0 ? (
                                <p className="text-zinc-500 italic text-sm text-center">No campus events published yet.</p>
                              ) : (
                                events.map((event) => (
                                  <div key={event._id} className="border border-zinc-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                                    <div>
                                      <h4 className="font-bold text-zinc-950 text-base">{event.title}</h4>
                                      <p className="text-xs text-zinc-500 mt-1 max-w-md">{event.description}</p>
                                      <div className="flex gap-4 mt-3 text-[10px] text-zinc-400">
                                        <span>📍 Venue: <strong>{event.venue}</strong></span>
                                        <span>📅 Date: <strong>{formatDate(event.date)}</strong></span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleRegisterEvent(event._id)}
                                      className="py-2 px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                                    >
                                      Register
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {/* M3: Placements & Internships */}
                        {/* M3: Placements & Internships */}
                        {activeModule === "placements" && (
                          <div className="space-y-8 text-zinc-950 font-sans">
                            {/* Title Block */}
                            <div className="pb-4 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <h3 className="text-2xl font-black tracking-tight text-zinc-900">Placement & Internship Portal</h3>
                                <p className="text-xs text-zinc-500">Auto-Eligibility Engine & Locked Registration Workspace</p>
                              </div>
                              {/* Option for Retry Attempt Toggle during timing checks */}
                              {userRole === "student" && !placementReg && (
                                <label className="flex items-center gap-2 bg-orange-50 border border-orange-200 py-1.5 px-3 rounded-xl cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isRetryAttempt}
                                    onChange={(e) => setIsRetryAttempt(e.target.checked)}
                                    className="accent-orange-600 cursor-pointer"
                                  />
                                  <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                                    Toggle Retry / Late Attempt (Sem 1-4 SGPA Only)
                                  </span>
                                </label>
                              )}
                            </div>

                            {/* 1. STUDENT ROLE INTERFACE */}
                            {userRole === "student" && (
                              <div className="space-y-6">
                                {/* Timing Constraint Calculations */}
                                {(() => {
                                  const studentSem = profile?.semester || 1;
                                  const isTooEarly = studentSem <= 5;
                                  const isTooLate = studentSem >= 7 && !isRetryAttempt;

                                  if (isTooEarly) {
                                    return (
                                      <div className="p-6 bg-orange-50 border border-orange-200 rounded-3xl space-y-2 text-center">
                                        <div className="text-3xl">⏳</div>
                                        <h4 className="font-extrabold text-sm text-orange-800 uppercase tracking-wide">Registration Not Yet Available</h4>
                                        <p className="text-xs text-orange-600 max-w-md mx-auto leading-relaxed">
                                          Placement registration only becomes available once your 5th semester is fully complete (Semester 6 onwards). Currently, you are in Semester {studentSem}.
                                        </p>
                                      </div>
                                    );
                                  }

                                  if (isTooLate) {
                                    return (
                                      <div className="p-6 bg-red-50 border border-red-200 rounded-3xl space-y-3 text-center">
                                        <div className="text-3xl">⚠️</div>
                                        <h4 className="font-extrabold text-sm text-red-800 uppercase tracking-wide">Registration Window Closed</h4>
                                        <p className="text-xs text-red-600 max-w-md mx-auto leading-relaxed">
                                          Placement registration window for normal attempts has closed (available only in 3rd year / Semester 6). Since you are in Semester {studentSem}, you must register as a Retry Attempt.
                                        </p>
                                        <button
                                          onClick={() => setIsRetryAttempt(true)}
                                          className="py-1.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                                        >
                                          Register as Retry Attempt
                                        </button>
                                      </div>
                                    );
                                  }

                                  // If timing constraints are passed, show form or read-only view
                                  return (
                                    <div className="space-y-6">
                                      {/* A. NOT SUBMITTED / DRAFT REGISTRATION FORM */}
                                      {(!placementReg || placementReg.status === "draft") ? (
                                        <div className="bg-white border border-zinc-200 p-6 rounded-3xl space-y-6 shadow-sm">
                                          <div className="flex justify-between items-center border-b pb-3">
                                            <h4 className="font-extrabold text-sm text-zinc-900 uppercase">
                                              {isRetryAttempt ? "📝 Placement Registration (Late / Retry Attempt)" : "📝 Placement Registration (On-Schedule Attempt)"}
                                            </h4>
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[9px] font-black rounded-full uppercase">
                                              {placementReg ? "Draft Status" : "Not Started"}
                                            </span>
                                          </div>

                                          <div className="space-y-4">
                                            {/* PERSONAL DETAILS SECTION */}
                                            <div className="space-y-3">
                                              <h5 className="font-black text-xs text-orange-500 uppercase tracking-wider">I. Personal Details</h5>
                                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Full Name <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regFullName} onChange={e => setRegFullName(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Date of Birth <span className="text-red-500">*</span></label>
                                                  <input type="date" value={regDob} onChange={e => setRegDob(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Gender <span className="text-red-500">*</span></label>
                                                  <select value={regGender} onChange={e => setRegGender(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black">
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                  </select>
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Contact Number <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div className="sm:col-span-2">
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Email Address <span className="text-red-500">*</span></label>
                                                  <input type="email" value={regEmail} disabled className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 text-zinc-500 cursor-not-allowed" />
                                                </div>
                                                <div className="sm:col-span-2">
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Current Address <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regCurrentAddress} onChange={e => setRegCurrentAddress(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Current Pincode <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regLocalAddressPincode} onChange={e => setRegLocalAddressPincode(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div className="sm:col-span-2">
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Permanent Address <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regPermanentAddress} onChange={e => setRegPermanentAddress(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Permanent Pincode <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regPermanentAddressPincode} onChange={e => setRegPermanentAddressPincode(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">State <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regState} onChange={e => setRegState(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                              </div>
                                            </div>

                                            {/* FAMILY DETAILS SECTION */}
                                            <div className="space-y-3 pt-2 border-t">
                                              <h5 className="font-black text-xs text-orange-500 uppercase tracking-wider">II. Family Details</h5>
                                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Father's Name <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regFatherName} onChange={e => setRegFatherName(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Father's Occupation <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regFatherOccupation} onChange={e => setRegFatherOccupation(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Father's Contact <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regFatherContact} onChange={e => setRegFatherContact(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Mother's Name <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regMotherName} onChange={e => setRegMotherName(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Mother's Occupation <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regMotherOccupation} onChange={e => setRegMotherOccupation(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Mother's Contact <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regMotherContact} onChange={e => setRegMotherContact(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                              </div>
                                            </div>

                                            {/* IDENTITY SECTION */}
                                            <div className="space-y-3 pt-2 border-t">
                                              <h5 className="font-black text-xs text-orange-500 uppercase tracking-wider">III. Identity Verification</h5>
                                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">APAAR ID <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regApaarId} onChange={e => setRegApaarId(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Photo Upload (Gallery File) <span className="text-red-500">*</span></label>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0];
                                                      if (file) {
                                                        const r = new FileReader();
                                                        r.onloadend = () => setRegPhotoUrl(r.result as string);
                                                        r.readAsDataURL(file);
                                                      }
                                                    }}
                                                    className="mt-1 block w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-100 file:text-[10px] file:cursor-pointer"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase font-black text-orange-600">Passport Photo (Required) <span className="text-red-500">*</span></label>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0];
                                                      if (file) {
                                                        const r = new FileReader();
                                                        r.onloadend = () => setRegPassportPhotoUrl(r.result as string);
                                                        r.readAsDataURL(file);
                                                      }
                                                    }}
                                                    className="mt-1 block w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-100 file:text-[10px] file:cursor-pointer"
                                                  />
                                                  {regPassportPhotoUrl && <span className="text-[9px] text-emerald-600 mt-1 block font-bold">✓ Ready</span>}
                                                </div>
                                              </div>
                                            </div>

                                            {/* ACADEMIC GRADES SECTION */}
                                            <div className="space-y-3 pt-2 border-t">
                                              <h5 className="font-black text-xs text-orange-500 uppercase tracking-wider">IV. Academic Records</h5>
                                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div className="sm:col-span-2">
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">University Name <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regUniversityName} onChange={e => setRegUniversityName(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Course Name <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regCourseName} onChange={e => setRegCourseName(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Year of Admission <span className="text-red-500">*</span></label>
                                                  <input type="number" value={regYearOfAdmission} onChange={e => setRegYearOfAdmission(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Year of Passing (Current Course) <span className="text-red-500">*</span></label>
                                                  <input type="number" value={regYearOfPassing} onChange={e => setRegYearOfPassing(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>

                                                {/* 10th */}
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">10th Class Percentage <span className="text-red-500">*</span></label>
                                                  <input type="number" step="0.01" value={regTenthPercentage} onChange={e => setRegTenthPercentage(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">10th Class Board <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regTenthBoard} onChange={e => setRegTenthBoard(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">10th Enrollment/Passing Year <span className="text-red-500">*</span></label>
                                                  <input type="number" value={regTenthYear} onChange={e => setRegTenthYear(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">10th Year of Passing <span className="text-red-500">*</span></label>
                                                  <input type="number" value={regTenthYearOfPassing} onChange={e => setRegTenthYearOfPassing(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>

                                                {/* 12th */}
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">12th Class Percentage <span className="text-red-500">*</span></label>
                                                  <input type="number" step="0.01" value={regTwelfthPercentage} onChange={e => setRegTwelfthPercentage(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">12th Class Board <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regTwelfthBoard} onChange={e => setRegTwelfthBoard(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">12th Enrollment/Passing Year <span className="text-red-500">*</span></label>
                                                  <input type="number" value={regTwelfthYear} onChange={e => setRegTwelfthYear(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">12th Year of Passing <span className="text-red-500">*</span></label>
                                                  <input type="number" value={regTwelfthYearOfPassing} onChange={e => setRegTwelfthYearOfPassing(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>

                                                {/* Diploma */}
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Diploma Percentage (Optional)</label>
                                                  <input type="number" step="0.01" value={regDiplomaPercentage} onChange={e => setRegDiplomaPercentage(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Diploma Board</label>
                                                  <input type="text" value={regDiplomaBoard} onChange={e => setRegDiplomaBoard(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Diploma Passing Year</label>
                                                  <input type="number" value={regDiplomaYear} onChange={e => setRegDiplomaYear(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>

                                                {/* Academic Keys */}
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Branch / Discipline <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regBranch} onChange={e => setRegBranch(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Roll Number <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regRollNumber} onChange={e => setRegRollNumber(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Enrollment Number <span className="text-red-500">*</span></label>
                                                  <input type="text" value={regEnrollmentNumber} onChange={e => setRegEnrollmentNumber(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>

                                                {/* Backlogs */}
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Active Backlog Count <span className="text-red-500">*</span></label>
                                                  <input type="number" value={regBacklogCount} onChange={e => setRegBacklogCount(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                                <div className="sm:col-span-2">
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Backlog History (Comma-separated subjects)</label>
                                                  <input type="text" placeholder="e.g. M1, Physics" value={regBacklogHistory} onChange={e => setRegBacklogHistory(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                                </div>
                                              </div>

                                              {/* Academic Gap Block */}
                                              <div className="mt-3 p-4 bg-zinc-50 border border-zinc-150 rounded-2xl space-y-4">
                                                <h6 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Academic Gap Details</h6>
                                                
                                                {/* Tenth Gap */}
                                                <div className="border-b pb-3 space-y-2">
                                                  <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-zinc-700">Did you have a gap after 10th?</span>
                                                    <input type="checkbox" checked={regTenthHasGap} onChange={e => setRegTenthHasGap(e.target.checked)} className="accent-orange-600 cursor-pointer" />
                                                  </div>
                                                  {regTenthHasGap && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-[fadeIn_0.1s_ease-out]">
                                                      <div>
                                                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Gap Duration (Required) <span className="text-red-500">*</span></label>
                                                        <input type="text" placeholder="e.g. 1 Year" value={regTenthGapDuration} onChange={e => setRegTenthGapDuration(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                                      </div>
                                                      <div>
                                                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Reason for Gap</label>
                                                        <input type="text" placeholder="e.g. Medical, Preparation" value={regTenthGapReason} onChange={e => setRegTenthGapReason(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Twelfth Gap */}
                                                <div className="border-b pb-3 space-y-2">
                                                  <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-zinc-700">Did you have a gap after 12th / Diploma?</span>
                                                    <input type="checkbox" checked={regTwelfthHasGap} onChange={e => setRegTwelfthHasGap(e.target.checked)} className="accent-orange-600 cursor-pointer" />
                                                  </div>
                                                  {regTwelfthHasGap && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-[fadeIn_0.1s_ease-out]">
                                                      <div>
                                                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Gap Duration (Required) <span className="text-red-500">*</span></label>
                                                        <input type="text" placeholder="e.g. 1 Year" value={regTwelfthGapDuration} onChange={e => setRegTwelfthGapDuration(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                                      </div>
                                                      <div>
                                                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Reason for Gap</label>
                                                        <input type="text" placeholder="e.g. JEE Preparation" value={regTwelfthGapReason} onChange={e => setRegTwelfthGapReason(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>

                                                {/* UG Gap */}
                                                <div className="space-y-2">
                                                  <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-zinc-700">Did you have any gap during graduation?</span>
                                                    <input type="checkbox" checked={regUgHasGap} onChange={e => setRegUgHasGap(e.target.checked)} className="accent-orange-600 cursor-pointer" />
                                                  </div>
                                                  {regUgHasGap && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-[fadeIn_0.1s_ease-out]">
                                                      <div>
                                                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Gap Duration (Required) <span className="text-red-500">*</span></label>
                                                        <input type="text" placeholder="e.g. 1 Year" value={regUgGapDuration} onChange={e => setRegUgGapDuration(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                                      </div>
                                                      <div>
                                                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Reason for Gap</label>
                                                        <input type="text" placeholder="e.g. Year back, Medical" value={regUgGapReason} onChange={e => setRegUgGapReason(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* SGPA Input and CGPA Auto-Calculations */}
                                              <div className="mt-3 p-4 bg-zinc-50 border border-zinc-150 rounded-2xl space-y-3">
                                                <div className="flex justify-between items-center">
                                                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Semester-wise SGPA (derived CGPA)</span>
                                                  <span className="text-xs font-black text-orange-600 bg-orange-50 border border-orange-100 py-1 px-2.5 rounded-lg">
                                                    Calculated CGPA:{" "}
                                                    {(() => {
                                                      const s1 = parseFloat(regSgpa1) || 0;
                                                      const s2 = parseFloat(regSgpa2) || 0;
                                                      const s3 = parseFloat(regSgpa3) || 0;
                                                      const s4 = parseFloat(regSgpa4) || 0;
                                                      const s5 = parseFloat(regSgpa5) || 0;
                                                      const activeList = [s1, s2, s3, s4];
                                                      if (!isRetryAttempt) activeList.push(s5);
                                                      
                                                      const valid = activeList.filter(v => v > 0);
                                                      if (valid.length === 0) return "0.00";
                                                      const sum = valid.reduce((acc, curr) => acc + curr, 0);
                                                      return (sum / valid.length).toFixed(2);
                                                    })()}
                                                  </span>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                  <div>
                                                    <label className="block text-[8px] font-bold text-zinc-400 uppercase">Sem 1 SGPA <span className="text-red-500">*</span></label>
                                                    <input type="number" step="0.01" value={regSgpa1} onChange={e => setRegSgpa1(e.target.value)} className="mt-1 block w-full px-2 py-1 border border-zinc-200 rounded-lg text-xs bg-white text-black" />
                                                  </div>
                                                  <div>
                                                    <label className="block text-[8px] font-bold text-zinc-400 uppercase">Sem 2 SGPA <span className="text-red-500">*</span></label>
                                                    <input type="number" step="0.01" value={regSgpa2} onChange={e => setRegSgpa2(e.target.value)} className="mt-1 block w-full px-2 py-1 border border-zinc-200 rounded-lg text-xs bg-white text-black" />
                                                  </div>
                                                  <div>
                                                    <label className="block text-[8px] font-bold text-zinc-400 uppercase">Sem 3 SGPA <span className="text-red-500">*</span></label>
                                                    <input type="number" step="0.01" value={regSgpa3} onChange={e => setRegSgpa3(e.target.value)} className="mt-1 block w-full px-2 py-1 border border-zinc-200 rounded-lg text-xs bg-white text-black" />
                                                  </div>
                                                  <div>
                                                    <label className="block text-[8px] font-bold text-zinc-400 uppercase">Sem 4 SGPA <span className="text-red-500">*</span></label>
                                                    <input type="number" step="0.01" value={regSgpa4} onChange={e => setRegSgpa4(e.target.value)} className="mt-1 block w-full px-2 py-1 border border-zinc-200 rounded-lg text-xs bg-white text-black" />
                                                  </div>
                                                  {!isRetryAttempt && (
                                                    <div>
                                                      <label className="block text-[8px] font-bold text-zinc-400 uppercase">Sem 5 SGPA <span className="text-red-500">*</span></label>
                                                      <input type="number" step="0.01" value={regSgpa5} onChange={e => setRegSgpa5(e.target.value)} className="mt-1 block w-full px-2 py-1 border border-zinc-200 rounded-lg text-xs bg-white text-black" />
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* DOCUMENTS SECTION */}
                                            <div className="space-y-3 pt-2 border-t">
                                              <h5 className="font-black text-xs text-orange-500 uppercase tracking-wider">V. Documents Upload</h5>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Upload Resume (PDF only) <span className="text-red-500">*</span></label>
                                                  <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0];
                                                      if (file) {
                                                        setRegResumeFileName(file.name);
                                                        const r = new FileReader();
                                                        r.onloadend = () => setRegResumeUrl(r.result as string);
                                                        r.readAsDataURL(file);
                                                      }
                                                    }}
                                                    className="mt-1 block w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-100 file:text-[10px] file:cursor-pointer"
                                                  />
                                                  {regResumeFileName && <span className="text-[9px] text-zinc-400 mt-1 block">Selected: {regResumeFileName}</span>}
                                                </div>
                                                <div>
                                                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Upload Marksheets (PDF / Images)</label>
                                                  <input
                                                    type="file"
                                                    accept=".pdf,image/*"
                                                    multiple
                                                    onChange={(e) => {
                                                      const files = Array.from(e.target.files || []);
                                                      const urls: string[] = [];
                                                      files.forEach(f => {
                                                        const r = new FileReader();
                                                        r.onloadend = () => {
                                                          urls.push(r.result as string);
                                                          if (urls.length === files.length) {
                                                            setRegMarksheetUrls(urls);
                                                          }
                                                        };
                                                        r.readAsDataURL(f);
                                                      });
                                                    }}
                                                    className="mt-1 block w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-100 file:text-[10px] file:cursor-pointer"
                                                  />
                                                  {regMarksheetUrls.length > 0 && <span className="text-[9px] text-zinc-400 mt-1 block">✓ {regMarksheetUrls.length} marksheets uploaded</span>}
                                                </div>
                                              </div>
                                            </div>

                                            {/* INTERNSHIP HISTORY SECTION */}
                                            <div className="space-y-3 pt-2 border-t">
                                              <div className="flex justify-between items-center">
                                                <h5 className="font-black text-xs text-orange-500 uppercase tracking-wider">VI. Internship History (Optional)</h5>
                                                <button
                                                  type="button"
                                                  onClick={() => setRegInternships([...regInternships, { companyName: "" }])}
                                                  className="text-xs text-orange-600 hover:text-orange-700 font-bold"
                                                >
                                                  + Add Internship
                                                </button>
                                              </div>
                                              
                                              {regInternships.length === 0 ? (
                                                <div className="p-4 border border-dashed rounded-2xl text-center text-xs text-zinc-400 font-bold bg-zinc-50">
                                                  No internship history added. Click "+ Add Internship" to append entries.
                                                </div>
                                              ) : (
                                                <div className="space-y-2">
                                                  {regInternships.map((intern, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 bg-zinc-50 border p-3 rounded-2xl animate-[fadeIn_0.1s_ease-out]">
                                                      <div className="flex-1">
                                                        <label className="block text-[8px] font-bold text-zinc-400 uppercase">Company Name <span className="text-red-500">*</span></label>
                                                        <input
                                                          type="text"
                                                          placeholder="e.g. Google India"
                                                          value={intern.companyName}
                                                          onChange={(e) => {
                                                            const updated = [...regInternships];
                                                            updated[idx].companyName = e.target.value;
                                                            setRegInternships(updated);
                                                          }}
                                                          className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black"
                                                        />
                                                      </div>
                                                      <button
                                                        type="button"
                                                        onClick={() => setRegInternships(regInternships.filter((_, i) => i !== idx))}
                                                        className="text-red-500 hover:text-red-700 font-bold text-xs px-2 pt-4 self-center"
                                                      >
                                                        Remove
                                                      </button>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Warning Banner and Submit Controls */}
                                          <div className="pt-4 border-t space-y-4">
                                            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-[10px] leading-relaxed font-bold">
                                              ⚠️ WARNING: Once submitted, the placement registration form is permanently LOCKED. You will not be able to edit any field afterward. Only admin/placement cell can approve changes. Please double check all details before final submit.
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                              <button
                                                type="button"
                                                onClick={() => handleRegisterPlacement(true)}
                                                className="py-2 px-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-all cursor-pointer border"
                                              >
                                                Save Draft
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  // Submit enabling verification
                                                  if (!regFullName || !regDob || !regPhone || !regBranch || !regRollNumber || !regResumeUrl || !regPassportPhotoUrl) {
                                                    alert("Please fill all mandatory fields (Name, DOB, Phone, Branch, Roll Number, Resume, and Passport Photograph) to unlock submission.");
                                                    return;
                                                  }
                                                  if (regTenthHasGap && !regTenthGapDuration) {
                                                    alert("Please enter a gap duration for Tenth Stage.");
                                                    return;
                                                  }
                                                  if (regTwelfthHasGap && !regTwelfthGapDuration) {
                                                    alert("Please enter a gap duration for Twelfth Stage.");
                                                    return;
                                                  }
                                                  if (regUgHasGap && !regUgGapDuration) {
                                                    alert("Please enter a gap duration for Graduation Stage.");
                                                    return;
                                                  }
                                                  if (confirm("Are you sure you want to final submit and LOCK your placement registration?")) {
                                                    handleRegisterPlacement(false);
                                                  }
                                                }}
                                                className="py-2 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                                              >
                                                Submit & Lock Registration
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        // B. LOCKED REGISTRATION STATUS READ-ONLY VIEW
                                        <div className="space-y-6">
                                          {/* APPLY RESUME SELECTION OVERLAY MODAL */}
                                          {applyingJobId && (() => {
                                            const targetJob = placementJobs.find(j => j._id === applyingJobId);
                                            if (!targetJob) return null;
                                            return (
                                              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                                <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
                                                  <div className="flex justify-between items-center border-b pb-2">
                                                    <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Apply to {targetJob.role}</h4>
                                                    <button onClick={() => setApplyingJobId(null)} className="text-zinc-400 hover:text-zinc-600 text-xs font-bold">✕ Close</button>
                                                  </div>
                                                  
                                                  {/* Read-Only Details */}
                                                  <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-2xl space-y-2 text-xs">
                                                    <h5 className="font-black text-[10px] text-zinc-400 uppercase tracking-wider">ReadOnly Confirmation Details</h5>
                                                    <div className="grid grid-cols-2 gap-2">
                                                      <div>
                                                        <span className="block font-bold text-[9px] text-zinc-400 uppercase">Applicant Name</span>
                                                        <span className="font-semibold text-zinc-800">{placementReg?.personal?.fullName}</span>
                                                      </div>
                                                      <div>
                                                        <span className="block font-bold text-[9px] text-zinc-400 uppercase">Roll Number</span>
                                                        <span className="font-semibold text-zinc-800">{placementReg?.academic?.rollNumber}</span>
                                                      </div>
                                                      <div>
                                                        <span className="block font-bold text-[9px] text-zinc-400 uppercase">Branch / Discipline</span>
                                                        <span className="font-semibold text-zinc-800">{placementReg?.academic?.branch}</span>
                                                      </div>
                                                      <div>
                                                        <span className="block font-bold text-[9px] text-zinc-400 uppercase">Derived CGPA</span>
                                                        <span className="font-semibold text-orange-600 font-extrabold">{placementReg?.academic?.cgpa?.toFixed(2)}</span>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {/* Resume Selection Section */}
                                                  <div className="space-y-3">
                                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider">Select Resume Option</label>
                                                    <select
                                                      value={applyResumeMode}
                                                      onChange={e => setApplyResumeMode(e.target.value as any)}
                                                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs bg-white text-black font-semibold focus:outline-none"
                                                    >
                                                      <option value="fallback">Use Registration Profile Resume (Default)</option>
                                                      <option value="upload">Upload Fresh PDF Resume for this Job</option>
                                                      <option value="saved">Use Saved Resume Template (M4 Builder)</option>
                                                    </select>

                                                    {/* Fallback Option details */}
                                                    {applyResumeMode === "fallback" && (
                                                      <div className="p-3 bg-zinc-50 border border-zinc-250 rounded-xl text-xs flex justify-between items-center">
                                                        <span className="text-zinc-600 font-semibold">Using profile default resume</span>
                                                        {placementReg?.documents?.resumeUrl && (
                                                          <a
                                                            href={placementReg.documents.resumeUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-orange-600 hover:underline text-[11px] font-bold"
                                                          >
                                                            View PDF ↗
                                                          </a>
                                                        )}
                                                      </div>
                                                    )}

                                                    {/* Upload Custom Option details */}
                                                    {applyResumeMode === "upload" && (
                                                      <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-250 rounded-xl">
                                                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Upload PDF Resume file</label>
                                                        <input
                                                          type="file"
                                                          accept=".pdf"
                                                          onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                              setApplyUploadFileName(file.name);
                                                              const r = new FileReader();
                                                              r.onloadend = () => setApplyUploadFile(r.result as string);
                                                              r.readAsDataURL(file);
                                                            }
                                                          }}
                                                          className="block w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-150 file:text-[10px] file:cursor-pointer"
                                                        />
                                                        {applyUploadFileName && (
                                                          <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Loaded: {applyUploadFileName}</span>
                                                        )}
                                                      </div>
                                                    )}

                                                    {/* Saved Templates Option details */}
                                                    {applyResumeMode === "saved" && (
                                                      <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-250 rounded-xl">
                                                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Select saved resume version</label>
                                                        {savedResumes.length === 0 ? (
                                                          <div className="text-[10px] text-red-500 font-semibold">
                                                            No saved resume template found in M4 Resume Builder. Please choose another option.
                                                          </div>
                                                        ) : (
                                                          <select
                                                            value={applySelectedSavedResume}
                                                            onChange={e => setApplySelectedSavedResume(e.target.value)}
                                                            className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-white text-black font-medium focus:outline-none"
                                                          >
                                                            {savedResumes.map((r, idx) => (
                                                              <option key={idx} value={r.name}>{r.name} ({r.templateId})</option>
                                                            ))}
                                                          </select>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Submit controls */}
                                                  <div className="flex gap-2 justify-end pt-3 border-t">
                                                    <button
                                                      type="button"
                                                      onClick={() => setApplyingJobId(null)}
                                                      className="py-1.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-all cursor-pointer border"
                                                    >
                                                      Cancel
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        let resolvedResume = "";
                                                        if (applyResumeMode === "fallback") {
                                                          resolvedResume = placementReg?.documents?.resumeUrl || "";
                                                        } else if (applyResumeMode === "upload") {
                                                          if (!applyUploadFile) {
                                                            alert("Please upload a PDF file first.");
                                                            return;
                                                          }
                                                          resolvedResume = applyUploadFile;
                                                        } else if (applyResumeMode === "saved") {
                                                          const found = savedResumes.find(r => r.name === applySelectedSavedResume);
                                                          if (!found) {
                                                            alert("Please select a valid saved template.");
                                                            return;
                                                          }
                                                          resolvedResume = `${BACKEND_URL}/api/resume/${profile?._id}/generate?template=${found.templateId}&token=${token}`;
                                                        }

                                                        if (!resolvedResume) {
                                                          alert("Could not resolve a valid application resume.");
                                                          return;
                                                        }

                                                        handleStudentDecision(targetJob._id, "applied", resolvedResume);
                                                      }}
                                                      className="py-1.5 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-orange-600/10"
                                                    >
                                                      Confirm & Apply
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })()}
                                          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-4">
                                            <div className="flex justify-between items-center border-b pb-2">
                                              <h4 className="font-extrabold text-sm text-zinc-900 uppercase">🔒 Locked Placement Profile</h4>
                                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-full uppercase">
                                                Locked Status
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                              <div>
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">Name</div>
                                                <div className="font-bold text-zinc-800 capitalize">{placementReg.personal?.fullName}</div>
                                              </div>
                                              <div>
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">Roll Number</div>
                                                <div className="font-bold text-zinc-800">{placementReg.academic?.rollNumber}</div>
                                              </div>
                                              <div>
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">Branch</div>
                                                <div className="font-bold text-zinc-800">{placementReg.academic?.branch}</div>
                                              </div>
                                              <div>
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">CGPA</div>
                                                <div className="font-black text-orange-600">{placementReg.academic?.cgpa?.toFixed(2)}</div>
                                              </div>
                                              <div>
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">University</div>
                                                <div className="font-bold text-zinc-800">{placementReg.academic?.universityName || "N/A"}</div>
                                              </div>
                                              <div>
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">Course Name</div>
                                                <div className="font-bold text-zinc-800">{placementReg.academic?.courseName || "N/A"}</div>
                                              </div>
                                              <div>
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">Admission / Passing Year</div>
                                                <div className="font-bold text-zinc-800">{placementReg.academic?.yearOfAdmission} / {placementReg.academic?.yearOfPassing}</div>
                                              </div>
                                              <div>
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">State & Pincodes</div>
                                                <div className="font-bold text-zinc-800">
                                                  State: {placementReg.personal?.state || "N/A"} | Pin: {placementReg.personal?.localAddressPincode || "N/A"}
                                                </div>
                                              </div>
                                              <div className="sm:col-span-2">
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">10th Grades</div>
                                                <div className="font-semibold text-zinc-700">
                                                  {placementReg.academic?.tenth?.percentage}% ({placementReg.academic?.tenth?.board}) | Passed: {placementReg.academic?.tenth?.yearOfPassing || placementReg.academic?.tenth?.year}
                                                </div>
                                              </div>
                                              <div className="sm:col-span-2">
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">12th Grades</div>
                                                <div className="font-semibold text-zinc-700">
                                                  {placementReg.academic?.twelfth?.percentage}% ({placementReg.academic?.twelfth?.board}) | Passed: {placementReg.academic?.twelfth?.yearOfPassing || placementReg.academic?.twelfth?.year}
                                                </div>
                                              </div>
                                              <div className="sm:col-span-2">
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">Academic Gaps</div>
                                                <div className="text-[11px] text-zinc-700 font-medium">
                                                  10th: {placementReg.academic?.academicGap?.tenth?.hasGap ? `Yes (${placementReg.academic.academicGap.tenth.duration})` : "No"} | 
                                                  12th: {placementReg.academic?.academicGap?.twelfth?.hasGap ? `Yes (${placementReg.academic.academicGap.twelfth.duration})` : "No"} | 
                                                  UG: {placementReg.academic?.academicGap?.ug?.hasGap ? `Yes (${placementReg.academic.academicGap.ug.duration})` : "No"}
                                                </div>
                                              </div>
                                              <div className="sm:col-span-2">
                                                <div className="text-[10px] text-zinc-400 font-bold uppercase">Internships Completed</div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {placementReg.internships?.length === 0 ? (
                                                    <span className="text-[11px] text-zinc-400 italic">None</span>
                                                  ) : (
                                                    placementReg.internships?.map((intern: any, idx: number) => (
                                                      <span key={idx} className="bg-zinc-150 border text-zinc-750 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                                        {intern.companyName}
                                                      </span>
                                                    ))
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* STUDENT OPPORTUNITIES FEED (ELIGIBILITY MATCHES) */}
                                          <div className="space-y-3">
                                            <h4 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wide">Opportunities & Job Alerts</h4>
                                            <div className="space-y-3">
                                              {placementJobs.length === 0 ? (
                                                <div className="text-center py-6 text-xs text-zinc-400 font-semibold bg-zinc-50 border border-zinc-150 rounded-2xl">
                                                  No placement job alerts posted yet.
                                                </div>
                                              ) : (
                                                placementJobs.map((job) => {
                                                  // Find student match result for this posting
                                                  const match = placementMatches.find(m => m.jobPostingId === job._id);
                                                  const decision = match?.studentDecision || "pending";
                                                  
                                                  return (
                                                    <div key={job._id} className="bg-white border border-zinc-200 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                                                      <div className="space-y-2 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                          <h5 className="font-bold text-zinc-900 text-sm leading-none">{job.role}</h5>
                                                          <span className="text-[9px] bg-zinc-100 text-zinc-500 font-black uppercase px-2 py-0.5 rounded-full">
                                                            {job.type}
                                                          </span>
                                                          {match ? (
                                                            match.isEligible ? (
                                                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black uppercase px-2 py-0.5 rounded-full">
                                                                ✓ Eligible
                                                              </span>
                                                            ) : (
                                                              <span className="text-[9px] bg-red-100 text-red-800 font-black uppercase px-2 py-0.5 rounded-full">
                                                                ✕ Not Eligible
                                                              </span>
                                                            )
                                                          ) : (
                                                            <span className="text-[9px] bg-zinc-100 text-zinc-400 font-semibold uppercase px-2 py-0.5 rounded-full">
                                                              Verifying
                                                            </span>
                                                          )}
                                                        </div>
                                                        <p className="text-xs font-bold text-orange-500">{job.companyName}</p>
                                                        <p className="text-xs text-zinc-500 leading-relaxed">{job.description}</p>
                                                        
                                                        {/* Deadline */}
                                                        <div className="text-[10px] text-zinc-400 font-semibold">
                                                          Deadline: {new Date(job.applicationDeadline).toLocaleString()}
                                                        </div>

                                                        {/* If not eligible, show exact failed condition rules */}
                                                        {match && !match.isEligible && (
                                                          <div className="p-3 bg-red-50 border border-red-150 rounded-2xl space-y-1 mt-2">
                                                            <div className="text-[9px] font-black text-red-700 uppercase tracking-wider">Failed Eligibility Criteria:</div>
                                                            {match.failedConditions.map((cond: any, idx: number) => (
                                                              <div key={idx} className="text-xs text-red-600 font-medium">
                                                                • {cond.message}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </div>

                                                      {/* MATCH ACTION CONTROLS */}
                                                      <div className="self-end sm:self-center mt-2 sm:mt-0 flex gap-2">
                                                        {match ? (
                                                          match.isEligible ? (
                                                            decision === "pending" ? (
                                                              <>
                                                                <button
                                                                  onClick={() => handleStudentDecision(job._id, "applied")}
                                                                  className="py-1.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                                                                >
                                                                  Apply
                                                                </button>
                                                                <button
                                                                  onClick={() => handleStudentDecision(job._id, "no-apply")}
                                                                  className="py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-xs rounded-xl cursor-pointer border"
                                                                >
                                                                  No Apply
                                                                </button>
                                                              </>
                                                            ) : decision === "applied" ? (
                                                              <span className="text-xs text-emerald-600 font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 py-1 px-3 rounded-lg">
                                                                ✓ Applied
                                                              </span>
                                                            ) : (
                                                              <span className="text-xs text-zinc-400 font-black uppercase tracking-wider bg-zinc-50 border border-zinc-100 py-1 px-3 rounded-lg">
                                                                ✕ Declined
                                                              </span>
                                                            )
                                                          ) : (
                                                            // Non eligible student acknowledge button
                                                            decision === "pending" ? (
                                                              <button
                                                                onClick={() => handleAcknowledgeMatch(job._id)}
                                                                className="py-1.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                                                              >
                                                                Acknowledge
                                                              </button>
                                                            ) : (
                                                              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider py-1 px-3 rounded-lg">
                                                                ✓ Acknowledged
                                                              </span>
                                                            )
                                                          )
                                                        ) : null}
                                                      </div>
                                                    </div>
                                                  );
                                                })
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* 2. ADMIN/FACULTY ROLE INTERFACE */}
                            {((userRole as any) === "admin" || (userRole as any) === "faculty") && (
                              <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
                                {/* Admin Workspace Navigation Switcher Tabs */}
                                <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200 w-full overflow-x-auto scrollbar-none gap-1">
                                  {[
                                    { label: "📄 Post Opportunity", value: "post-job" },
                                    { label: "📊 Opportunities Dashboard", value: "dashboard" },
                                    { label: "🕵️ Audit Logs Directory", value: "audit" }
                                  ].map((tab) => (
                                    <button
                                      key={tab.value}
                                      onClick={() => setPlacementTab(tab.value)}
                                      className={`flex-1 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer text-center ${
                                        placementTab === tab.value
                                          ? "bg-zinc-950 text-white shadow-sm"
                                          : "text-zinc-600 hover:text-zinc-900"
                                      }`}
                                    >
                                      {tab.label}
                                    </button>
                                  ))}
                                </div>

                                {/* TAB 1: POST OPPORTUNITY WITH RULES BUILDER */}
                                {placementTab === "post-job" && (
                                  <div className="bg-white border border-zinc-200 p-6 rounded-3xl space-y-6 shadow-sm">
                                    <h4 className="font-extrabold text-sm text-zinc-900 border-b pb-2 uppercase">Create Job / Internship Posting</h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">Company Name</label>
                                        <input type="text" placeholder="e.g. Google India" value={postCompanyName} onChange={e => setPostCompanyName(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">Job Role / Title</label>
                                        <input type="text" placeholder="e.g. Software Engineer Intern" value={postRole} onChange={e => setPostRole(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">Opportunity Type</label>
                                        <select value={postType} onChange={e => setPostType(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black">
                                          <option value="internship">Internship</option>
                                          <option value="full-time">Full-Time</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">Application Deadline</label>
                                        <input type="datetime-local" value={postDeadline} onChange={e => setPostDeadline(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                      </div>
                                      <div className="sm:col-span-2">
                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">Description / Scope</label>
                                        <textarea rows={3} placeholder="Provide details about role and key technologies..." value={postDescription} onChange={e => setPostDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs bg-white text-black" />
                                      </div>
                                    </div>

                                    {/* DYNAMIC ELIGIBILITY RULE BUILDER */}
                                    <div className="pt-4 border-t space-y-3">
                                      <div className="flex justify-between items-center">
                                        <h5 className="font-extrabold text-xs text-zinc-800 uppercase tracking-wider">⚙️ Dynamic Rules Matching criteria</h5>
                                        <button
                                          type="button"
                                          onClick={() => setPostRules([...postRules, { field: "cgpa", operator: ">=", value: "" }])}
                                          className="text-xs text-orange-600 hover:text-orange-700 font-bold"
                                        >
                                          + Add Rule
                                        </button>
                                      </div>

                                      <div className="space-y-2">
                                        {postRules.map((rule, idx) => (
                                          <div key={idx} className="flex items-center gap-2 bg-zinc-50 border p-3 rounded-2xl">
                                            <select
                                              value={rule.field}
                                              onChange={(e) => {
                                                const u = [...postRules];
                                                u[idx].field = e.target.value;
                                                setPostRules(u);
                                              }}
                                              className="px-2 py-1 border border-zinc-200 rounded-lg text-xs bg-white text-black flex-1"
                                            >
                                              <option value="cgpa">Min CGPA</option>
                                              <option value="backlogCount">Max Backlogs</option>
                                              <option value="tenth.percentage">Min 10th %</option>
                                              <option value="twelfth.percentage">Min 12th %</option>
                                              <option value="branch">Eligible Branches</option>
                                            </select>

                                            <select
                                              value={rule.operator}
                                              onChange={(e) => {
                                                const u = [...postRules];
                                                u[idx].operator = e.target.value;
                                                setPostRules(u);
                                              }}
                                              className="px-2 py-1 border border-zinc-200 rounded-lg text-xs bg-white text-black"
                                            >
                                              <option value="==">==</option>
                                              <option value=">=">&gt;=</option>
                                              <option value="<=">&lt;=</option>
                                              <option value=">">&gt;</option>
                                              <option value="<">&lt;</option>
                                              <option value="in">In (Array)</option>
                                            </select>

                                            <input
                                              type="text"
                                              placeholder={rule.field === "branch" ? "CS, IT, ME" : "Value"}
                                              value={rule.value}
                                              onChange={(e) => {
                                                const u = [...postRules];
                                                u[idx].value = e.target.value;
                                                setPostRules(u);
                                              }}
                                              className="px-2 py-1 border border-zinc-200 rounded-lg text-xs bg-white text-black flex-1"
                                            />

                                            <button
                                              type="button"
                                              onClick={() => setPostRules(postRules.filter((_, i) => i !== idx))}
                                              className="text-red-500 hover:text-red-700 text-xs font-bold px-1"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                      <button
                                        type="button"
                                        onClick={handlePostJobOpportunity}
                                        className="py-2.5 px-6 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                                      >
                                        Post & Run Auto-Matching
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* TAB 2: ACTIVE POSTINGS DASHBOARD & REPORT EXPORTS */}
                                {placementTab === "dashboard" && (
                                  <div className="space-y-4">
                                    {placementJobs.length === 0 ? (
                                      <div className="text-center py-8 bg-zinc-50 border rounded-3xl text-xs text-zinc-400 font-bold">
                                        No opportunity postings available yet.
                                      </div>
                                    ) : (
                                      placementJobs.map((job) => {
                                        const isExpired = new Date(job.applicationDeadline) <= new Date();
                                        return (
                                          <div key={job._id} className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-sm space-y-3">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                              <div>
                                                <h5 className="font-extrabold text-sm text-zinc-900 leading-tight">{job.role}</h5>
                                                <span className="text-xs font-bold text-orange-500">{job.companyName}</span>
                                              </div>
                                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                isExpired ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                                              }`}>
                                                {isExpired ? "Expired / Closed" : "Active"}
                                              </span>
                                            </div>

                                            <div className="text-[10px] text-zinc-400 font-semibold space-y-1">
                                              <div>Deadline: {new Date(job.applicationDeadline).toLocaleString()}</div>
                                              <div className="flex gap-1.5 flex-wrap">
                                                Rules: {job.eligibilityRules.map((r: any, idx: number) => (
                                                  <span key={idx} className="bg-zinc-50 border px-1.5 py-0.5 rounded text-[9px]">
                                                    {r.field} {r.operator} {Array.isArray(r.value) ? `[${r.value.join(", ")}]` : r.value}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>

                                            {/* Action Control: Generate PDF Report */}
                                            <div className="pt-2 flex justify-between items-center border-t">
                                              <span className="text-[10px] text-zinc-400 font-bold">
                                                PDF report downloads available after application deadline.
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => handleCompileAndDownloadReport(job._id)}
                                                className="py-1.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-orange-500/20"
                                              >
                                                Download Applied Candidates PDF
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}

                                {/* TAB 3: REGISTRATION AUDIT LOGS & ADMIN EDIT LOG DIRECTORY */}
                                {placementTab === "audit" && (
                                  <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b">
                                      <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Student Registration Directory & Audit Logs</h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs">
                                        <thead className="bg-zinc-50 text-zinc-500 font-bold border-b text-[10px] uppercase">
                                          <tr>
                                            <th className="p-3">Roll Number</th>
                                            <th className="p-3">Name</th>
                                            <th className="p-3">Branch</th>
                                            <th className="p-3">CGPA</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3 text-right">Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y text-zinc-800">
                                          {allRegistrations.length === 0 ? (
                                            <tr>
                                              <td colSpan={6} className="p-4 text-center text-zinc-400 font-semibold">No student placement registrations submitted yet.</td>
                                            </tr>
                                          ) : (
                                            allRegistrations.map((reg) => (
                                              <tr key={reg._id} className="hover:bg-zinc-50">
                                                <td className="p-3 font-semibold">{reg.academic?.rollNumber}</td>
                                                <td className="p-3 font-bold">{reg.personal?.fullName}</td>
                                                <td className="p-3 font-semibold">{reg.academic?.branch}</td>
                                                <td className="p-3 font-black text-orange-600">{reg.academic?.cgpa?.toFixed(2)}</td>
                                                <td className="p-3 uppercase font-black text-[9px]">
                                                  <span className={`px-2 py-0.5 rounded-full ${
                                                    reg.status === "locked" ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800"
                                                  }`}>
                                                    {reg.status}
                                                  </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                  <button
                                                    onClick={() => setSelectedRegForAudit(reg)}
                                                    className="py-1 px-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                                                  >
                                                    Audit / Edit Log
                                                  </button>
                                                </td>
                                              </tr>
                                            ))
                                          )}
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* AUDIT LOG MODAL OVERLAY */}
                                    {selectedRegForAudit && (
                                      <div className="p-6 bg-zinc-50 border-t border-zinc-200 space-y-4 animate-[fadeIn_0.15s_ease-out]">
                                        <div className="flex justify-between items-center border-b pb-2">
                                          <h5 className="font-extrabold text-xs text-zinc-800 uppercase tracking-wider">
                                            🕵️ Audit & Admin Edit: {selectedRegForAudit.personal?.fullName}
                                          </h5>
                                          <button
                                            onClick={() => setSelectedRegForAudit(null)}
                                            className="text-xs text-zinc-400 hover:text-zinc-600 font-bold"
                                          >
                                            Close
                                          </button>
                                        </div>

                                        {/* Current Audit Log entries */}
                                        <div className="space-y-2">
                                          <h6 className="text-[10px] font-black text-zinc-400 uppercase">Change History Log:</h6>
                                          {selectedRegForAudit.editLog?.length === 0 ? (
                                            <div className="text-xs text-zinc-400 italic">No admin modifications logged. Profile in original student state.</div>
                                          ) : (
                                            <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-2 bg-white border border-zinc-150 p-3 rounded-2xl">
                                              {selectedRegForAudit.editLog.map((log: any, idx: number) => (
                                                <div key={idx} className="text-[10px] text-zinc-600 border-b pb-1 last:border-0 last:pb-0">
                                                  [<strong>{new Date(log.editedAt).toLocaleString()}</strong>] {log.editedBy} changed{" "}
                                                  <strong>{log.field}</strong> from <span className="text-red-500">"{log.oldValue}"</span> to{" "}
                                                  <span className="text-emerald-600">"{log.newValue}"</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        {/* Inline Admin Form Edit Trigger */}
                                        <div className="p-4 bg-white border rounded-2xl space-y-3">
                                          <h6 className="text-[10px] font-black text-zinc-800 uppercase">Modify Registration Parameters (Enforces Audit Logging)</h6>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <label className="block text-[8px] font-bold text-zinc-400 uppercase">Edit Name</label>
                                              <input
                                                id="audit-name-input"
                                                type="text"
                                                defaultValue={selectedRegForAudit.personal?.fullName}
                                                className="mt-1 block w-full px-2.5 py-1 border rounded-lg text-xs bg-white text-black"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[8px] font-bold text-zinc-400 uppercase">Edit CGPA</label>
                                              <input
                                                id="audit-cgpa-input"
                                                type="number"
                                                step="0.01"
                                                defaultValue={selectedRegForAudit.academic?.cgpa}
                                                className="mt-1 block w-full px-2.5 py-1 border rounded-lg text-xs bg-white text-black"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex justify-end">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const nameEl = document.getElementById("audit-name-input") as HTMLInputElement;
                                                const cgpaEl = document.getElementById("audit-cgpa-input") as HTMLInputElement;
                                                const updated: any = {};
                                                if (nameEl && nameEl.value !== selectedRegForAudit.personal?.fullName) {
                                                  updated["personal.fullName"] = nameEl.value;
                                                }
                                                if (cgpaEl && parseFloat(cgpaEl.value) !== selectedRegForAudit.academic?.cgpa) {
                                                  updated["academic.cgpa"] = parseFloat(cgpaEl.value);
                                                }

                                                if (Object.keys(updated).length === 0) {
                                                  alert("No field modifications detected.");
                                                  return;
                                                }
                                                handleAdminEditStudentRegistration(selectedRegForAudit.studentId?.email || selectedRegForAudit.studentId, updated);
                                              }}
                                              className="py-1 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                                            >
                                              Save Audit Edits
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* M4: Career Hub (Unified Profile, Resume, Achievements & Leaderboard) */}
                        {(activeModule === "career" || activeModule === "achievements") && (
                          <div className="space-y-6 text-zinc-950 font-sans">
                            {/* 1. Welcome Title Header */}
                            <div className="pb-3 border-b border-zinc-100">
                              <h3 className="text-2xl font-black tracking-tight text-zinc-900">Welcome to IPS Career Hub</h3>
                              <p className="text-xs text-zinc-500 mt-0.5">Co-curricular Portfolio & Professional Identity System</p>
                            </div>

                            {/* 2. LinkedIn-Style Identity Profile Card (with Cycle Banner and + DP features) */}
                            {!needsOnboarding && (
                              <div className="relative bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                                {/* Background Banner Backdrop with Cycle Edit Option */}
                                <div className={`h-32 bg-gradient-to-r ${bannerStyle} w-full relative group`}>
                                  <button
                                    onClick={() => {
                                      const styles = [
                                        "from-orange-500 to-orange-600",
                                        "from-indigo-600 to-blue-500",
                                        "from-zinc-800 to-zinc-950",
                                        "from-emerald-600 to-teal-500"
                                      ];
                                      const nextIdx = (styles.indexOf(bannerStyle) + 1) % styles.length;
                                      setBannerStyle(styles[nextIdx]);
                                    }}
                                    className="absolute top-3 right-3 py-1 px-2.5 bg-white/80 hover:bg-white text-zinc-900 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                                    title="Edit Banner Background"
                                  >
                                    🎨 Edit Banner
                                  </button>
                                </div>
                                
                                {/* Avatar and Header Info */}
                                <div className="px-6 pb-6 pt-1 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 relative">
                                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                    {/* Circular Profile Picture (DP) with Overlay + Button */}
                                    <div className="relative w-24 h-24 rounded-full bg-zinc-200 border-4 border-white shadow flex items-center justify-center text-zinc-700 text-3xl font-black -mt-12 z-10 select-none overflow-hidden group">
                                      {(photoUrl || profile?.photoUrl) ? (
                                        <img src={photoUrl || profile?.photoUrl} className="w-full h-full object-cover" />
                                      ) : (
                                        <span>{(name || profile?.name || "S")[0].toUpperCase()}</span>
                                      )}
                                      
                                      {/* File upload trigger button overlay */}
                                      <label className="absolute inset-0 bg-black/40 text-white text-[10px] font-black flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        📷 Upload
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                setPhotoUrl(reader.result as string);
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>

                                    {/* Name and Basic Title */}
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-lg font-black text-zinc-900 capitalize leading-tight">
                                          {name || profile?.name || "Student Name"}
                                        </h4>
                                        <button
                                          onClick={() => setIsEditingIntro(!isEditingIntro)}
                                          className="p-1 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer text-xs"
                                          title="Edit Intro details"
                                        >
                                          ✏️
                                        </button>
                                      </div>
                                      <div className="text-xs font-bold text-zinc-500">Student Identity Profile</div>
                                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                        {branch || profile?.branch || "CS"} · Class of {graduationYear || profile?.graduationYear || "2026"}
                                      </div>
                                      
                                      {/* Skills chips */}
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {(skills ? skills.split(",") : (profile?.skills || [])).map((s: string, i: number) => {
                                          const clean = s.trim();
                                          if (!clean) return null;
                                          return (
                                            <span key={i} className="px-2 py-0.5 bg-zinc-100 border text-zinc-600 text-[9px] font-bold rounded">
                                              {clean}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right side stats badge */}
                                  <div className="flex items-center space-x-2 text-right text-xs text-zinc-500 font-bold self-end sm:self-center mt-2 sm:mt-0">
                                    <span>🏆 {profile?.totalPoints || 0} Points</span>
                                    <span className="text-zinc-300">|</span>
                                    <span>👁️ {profile?.profileViewCount || 0} Views</span>
                                  </div>
                                </div>

                                {/* Dynamic Expandable Intro Editor Block (LinkedIn Pencil Edit Panel) */}
                                {isEditingIntro && (
                                  <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-150 space-y-4 animate-[fadeIn_0.15s_ease-out]">
                                    <div className="flex justify-between items-center border-b pb-2">
                                      <h5 className="font-extrabold text-xs text-zinc-800 uppercase tracking-wider">✏️ Edit Identity Details</h5>
                                      <button 
                                        onClick={() => setIsEditingIntro(false)}
                                        className="text-xs text-zinc-400 hover:text-zinc-600 font-bold"
                                      >
                                        Close
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">Full Name</label>
                                        <input
                                          type="text"
                                          value={name}
                                          onChange={(e) => setName(e.target.value)}
                                          className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">Skills (Comma-separated)</label>
                                        <input
                                          type="text"
                                          value={skills}
                                          onChange={(e) => setSkills(e.target.value)}
                                          placeholder="React, Javascript, Python"
                                          className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">Branch / Dept</label>
                                        <input
                                          type="text"
                                          value={branch}
                                          onChange={(e) => setBranch(e.target.value)}
                                          className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">Graduation Year</label>
                                          <input
                                            type="text"
                                            value={graduationYear}
                                            onChange={(e) => setGraduationYear(e.target.value)}
                                            className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">Semester</label>
                                          <input
                                            type="number"
                                            value={semester}
                                            onChange={(e) => setSemester(parseInt(e.target.value) || 1)}
                                            className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-white text-black"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                      <button
                                        onClick={async () => {
                                          try {
                                            const skillsArr = skills.split(",").map(s => s.trim()).filter(Boolean);
                                            const res = await fetch(`${BACKEND_URL}/api/profile/${userEmail}`, {
                                              method: "POST",
                                              headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${token}`
                                              },
                                              body: JSON.stringify({
                                                ...(profile || {}),
                                                name,
                                                branch,
                                                graduationYear: parseInt(graduationYear) || 2026,
                                                semester: parseInt(semester as any) || 1,
                                                photoUrl,
                                                skills: skillsArr,
                                                contact,
                                                bio
                                              })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                              alert("Identity details updated successfully!");
                                              setIsEditingIntro(false);
                                              fetchStudentProfileData();
                                            } else {
                                              alert("Error: " + (data.message || "Failed to update identity details"));
                                            }
                                          } catch (err: any) {
                                            alert("Error updating identity details: " + err.message);
                                          }
                                        }}
                                        className="py-1.5 px-4 bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-bold rounded-xl cursor-pointer"
                                      >
                                        Save Identity Details
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 3. Horizontal Tab Switcher Menu */}
                            {!needsOnboarding && (
                              <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 w-full overflow-x-auto scrollbar-none">
                                {[
                                  { label: "Profile", value: "profile" },
                                  { label: "Resumes", value: "resume" },
                                  { label: "Achievements", value: "achievements" },
                                  { label: "Leaderboard", value: "leaderboard" },
                                  { label: "Social Feed", value: "discovery" }
                                ].map((tab) => (
                                  <button
                                    key={tab.value}
                                    onClick={() => setCareerHubTab(tab.value as any)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer text-center ${
                                      careerHubTab === tab.value
                                        ? "bg-zinc-950 text-white shadow-sm"
                                        : "text-zinc-600 hover:text-zinc-900"
                                    }`}
                                  >
                                    {tab.label}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* ONBOARDING MANDATORY FLOW */}
                            {needsOnboarding && (
                              <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 space-y-4">
                                <div className="flex items-center space-x-2 text-orange-800 font-extrabold text-sm">
                                  <span>⚠️ Profile Setup Required</span>
                                </div>
                                <p className="text-xs text-orange-700">
                                  You must configure your profile attributes before accessing other campus services.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase">Full Name</label>
                                    <input
                                      type="text"
                                      value={name}
                                      onChange={(e) => setName(e.target.value)}
                                      className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase">Roll Number</label>
                                    <input
                                      type="text"
                                      value={rollNumber}
                                      onChange={(e) => setRollNumber(e.target.value)}
                                      className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase">Branch / Department</label>
                                    <input
                                      type="text"
                                      value={branch}
                                      onChange={(e) => setBranch(e.target.value)}
                                      className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase">Graduation Year</label>
                                    <input
                                      type="number"
                                      value={graduationYear}
                                      onChange={(e) => setGraduationYear(e.target.value)}
                                      className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase">Current Semester</label>
                                    <input
                                      type="number"
                                      value={semester}
                                      onChange={(e) => setSemester(parseInt(e.target.value) || 1)}
                                      className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase">Contact Number</label>
                                    <input
                                      type="text"
                                      value={contact}
                                      onChange={(e) => setContact(e.target.value)}
                                      className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">Bio Summary</label>
                                  <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={2}
                                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                  />
                                </div>
                                <button
                                  onClick={async () => {
                                    if (!name || !rollNumber || !branch || !graduationYear) {
                                      alert("Please fill all mandatory fields.");
                                      return;
                                    }
                                    try {
                                      const res = await fetch(`${BACKEND_URL}/api/profile/${userEmail}`, {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ name, rollNumber, branch, graduationYear, semester, bio, contact })
                                      });
                                      const data = await res.json();
                                      if (data.success) {
                                        alert("Profile successfully initialized!");
                                        setNeedsOnboarding(false);
                                        fetchStudentProfileData();
                                      }
                                    } catch (err) {
                                      alert("Error creating profile.");
                                    }
                                  }}
                                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  Submit Profile
                                </button>
                              </div>
                            )}

                            {!needsOnboarding && (
                              <div>
                                {/* TAB 1: PROFILE EDITOR */}
                                {careerHubTab === "profile" && (
                                  <div className="space-y-6">
                                    {/* Progress & Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-50 p-6 rounded-3xl border border-zinc-200">
                                      <div className="space-y-2">
                                        <h4 className="font-extrabold text-sm text-zinc-800">Profile Completion</h4>
                                        <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
                                          <div 
                                            className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${profile?.profileCompletionPercent || 0}%` }}
                                          />
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-bold">{profile?.profileCompletionPercent || 0}% Completed</p>
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="font-extrabold text-sm text-zinc-800">Talent Badges</h4>
                                        <div className="flex flex-wrap gap-1">
                                          {(profile?.talentTags && profile.talentTags.length > 0) ? (
                                            profile.talentTags.map((tag: string, idx: number) => (
                                              <span key={idx} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-extrabold rounded-lg">
                                                🎓 {tag}
                                              </span>
                                            ))
                                          ) : (
                                            <span className="text-[10px] text-zinc-400">Submit achievements to unlock badges.</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <h4 className="font-extrabold text-sm text-zinc-800">Statistics</h4>
                                        <div className="text-[11px] text-zinc-600">
                                          <div>👁️ Views Count: <strong>{profile?.profileViewCount || 0}</strong></div>
                                          <div>🏆 Co-curricular Points: <strong>{profile?.totalPoints || 0}</strong></div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Inline Fields Editor */}
                                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4">
                                      <h4 className="font-extrabold text-base text-zinc-900 border-b pb-2">Edit Resume & Profile Fields</h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-[10px] font-bold text-zinc-500 uppercase">Skills (Comma-separated)</label>
                                          <input
                                            type="text"
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            placeholder="React, Javascript, Python"
                                            className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-zinc-50 text-black"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-zinc-500 uppercase">Contact Number</label>
                                          <input
                                            type="text"
                                            value={contact}
                                            onChange={(e) => setContact(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-zinc-50 text-black"
                                          />
                                        </div>
                                      </div>

                                      {/* Projects Section */}
                                      <div className="pt-2 space-y-3">
                                        <div className="flex justify-between items-center">
                                          <label className="block text-[10px] font-bold text-zinc-500 uppercase">Projects Portfolio</label>
                                          <button 
                                            onClick={() => {
                                              const newProj = [...(profile?.projects || []), { title: "New Project", description: "", techStack: "", link: "" }];
                                              setProfile({ ...profile, projects: newProj });
                                            }}
                                            className="text-[10px] text-orange-600 font-bold hover:underline"
                                          >
                                            + Add Project
                                          </button>
                                        </div>
                                        {(profile?.projects || []).map((proj: any, idx: number) => (
                                          <div key={idx} className="p-3 bg-zinc-50 border rounded-2xl space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                              <input
                                                type="text"
                                                value={proj.title}
                                                placeholder="Project Title"
                                                onChange={(e) => {
                                                  const copy = [...profile.projects];
                                                  copy[idx].title = e.target.value;
                                                  setProfile({ ...profile, projects: copy });
                                                }}
                                                className="px-2 py-1 border text-xs bg-white rounded-lg text-black font-bold"
                                              />
                                              <input
                                                type="text"
                                                value={proj.techStack || ""}
                                                placeholder="Tech Stack (e.g. Next.js, Node)"
                                                onChange={(e) => {
                                                  const copy = [...profile.projects];
                                                  copy[idx].techStack = e.target.value;
                                                  setProfile({ ...profile, projects: copy });
                                                }}
                                                className="px-2 py-1 border text-xs bg-white rounded-lg text-black"
                                              />
                                            </div>
                                            <textarea
                                              value={proj.description || ""}
                                              placeholder="Brief Description"
                                              onChange={(e) => {
                                                const copy = [...profile.projects];
                                                copy[idx].description = e.target.value;
                                                setProfile({ ...profile, projects: copy });
                                              }}
                                              className="block w-full px-2 py-1 border text-xs bg-white rounded-lg text-black"
                                              rows={2}
                                            />
                                            <div className="flex justify-between items-center">
                                              <input
                                                type="text"
                                                value={proj.link || ""}
                                                placeholder="Project Link (GitHub/Live)"
                                                onChange={(e) => {
                                                  const copy = [...profile.projects];
                                                  copy[idx].link = e.target.value;
                                                  setProfile({ ...profile, projects: copy });
                                                }}
                                                className="px-2 py-1 border text-xs bg-white rounded-lg text-black w-2/3"
                                              />
                                              <button
                                                onClick={() => {
                                                  const copy = profile.projects.filter((_: any, i: number) => i !== idx);
                                                  setProfile({ ...profile, projects: copy });
                                                }}
                                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Certifications Section */}
                                      <div className="pt-2 space-y-3">
                                        <div className="flex justify-between items-center">
                                          <label className="block text-[10px] font-bold text-zinc-500 uppercase">Certifications</label>
                                          <button 
                                            onClick={() => {
                                              const newCert = [...(profile?.certifications || []), { name: "Certificate Title", issuer: "", date: new Date(), proofUrl: "" }];
                                              setProfile({ ...profile, certifications: newCert });
                                            }}
                                            className="text-[10px] text-orange-600 font-bold hover:underline"
                                          >
                                            + Add Certification
                                          </button>
                                        </div>
                                        {(profile?.certifications || []).map((cert: any, idx: number) => (
                                          <div key={idx} className="p-3 bg-zinc-50 border rounded-2xl space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <input
                                              type="text"
                                              value={cert.name}
                                              placeholder="Certificate Name"
                                              onChange={(e) => {
                                                const copy = [...profile.certifications];
                                                copy[idx].name = e.target.value;
                                                setProfile({ ...profile, certifications: copy });
                                              }}
                                              className="px-2 py-1 border text-xs bg-white rounded-lg text-black font-bold"
                                            />
                                            <input
                                              type="text"
                                              value={cert.issuer || ""}
                                              placeholder="Issuer Organization"
                                              onChange={(e) => {
                                                const copy = [...profile.certifications];
                                                copy[idx].issuer = e.target.value;
                                                setProfile({ ...profile, certifications: copy });
                                              }}
                                              className="px-2 py-1 border text-xs bg-white rounded-lg text-black"
                                            />
                                            <input
                                              type="text"
                                              value={cert.proofUrl || ""}
                                              placeholder="Proof URL"
                                              onChange={(e) => {
                                                const copy = [...profile.certifications];
                                                copy[idx].proofUrl = e.target.value;
                                                setProfile({ ...profile, certifications: copy });
                                              }}
                                              className="px-2 py-1 border text-xs bg-white rounded-lg text-black sm:col-span-2"
                                            />
                                            <div className="flex justify-end sm:col-span-2">
                                              <button
                                                onClick={() => {
                                                  const copy = profile.certifications.filter((_: any, i: number) => i !== idx);
                                                  setProfile({ ...profile, certifications: copy });
                                                }}
                                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Experience Section */}
                                      <div className="pt-2 space-y-3">
                                        <div className="flex justify-between items-center">
                                          <label className="block text-[10px] font-bold text-zinc-500 uppercase">Experience & Internships</label>
                                          <button 
                                            onClick={() => {
                                              const newExp = [...(profile?.experience || []), { title: "Job Role", org: "", duration: "", description: "" }];
                                              setProfile({ ...profile, experience: newExp });
                                            }}
                                            className="text-[10px] text-orange-600 font-bold hover:underline"
                                          >
                                            + Add Experience
                                          </button>
                                        </div>
                                        {(profile?.experience || []).map((exp: any, idx: number) => (
                                          <div key={idx} className="p-3 bg-zinc-50 border rounded-2xl space-y-2">
                                            <div className="grid grid-cols-3 gap-2">
                                              <input
                                                type="text"
                                                value={exp.title}
                                                placeholder="Role / Title"
                                                onChange={(e) => {
                                                  const copy = [...profile.experience];
                                                  copy[idx].title = e.target.value;
                                                  setProfile({ ...profile, experience: copy });
                                                }}
                                                className="px-2 py-1 border text-xs bg-white rounded-lg text-black font-bold"
                                              />
                                              <input
                                                type="text"
                                                value={exp.org || ""}
                                                placeholder="Organization Name"
                                                onChange={(e) => {
                                                  const copy = [...profile.experience];
                                                  copy[idx].org = e.target.value;
                                                  setProfile({ ...profile, experience: copy });
                                                }}
                                                className="px-2 py-1 border text-xs bg-white rounded-lg text-black"
                                              />
                                              <input
                                                type="text"
                                                value={exp.duration || ""}
                                                placeholder="e.g. 3 Months"
                                                onChange={(e) => {
                                                  const copy = [...profile.experience];
                                                  copy[idx].duration = e.target.value;
                                                  setProfile({ ...profile, experience: copy });
                                                }}
                                                className="px-2 py-1 border text-xs bg-white rounded-lg text-black"
                                              />
                                            </div>
                                            <textarea
                                              value={exp.description || ""}
                                              placeholder="Description of duties/learnings"
                                              onChange={(e) => {
                                                const copy = [...profile.experience];
                                                copy[idx].description = e.target.value;
                                                setProfile({ ...profile, experience: copy });
                                              }}
                                              className="block w-full px-2 py-1 border text-xs bg-white rounded-lg text-black"
                                              rows={2}
                                            />
                                            <div className="flex justify-end">
                                              <button
                                                onClick={() => {
                                                  const copy = profile.experience.filter((_: any, i: number) => i !== idx);
                                                  setProfile({ ...profile, experience: copy });
                                                }}
                                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="pt-4 border-t flex justify-end">
                                        <button
                                          onClick={async () => {
                                            try {
                                              const skillsArr = skills.split(",").map(s => s.trim()).filter(Boolean);
                                              const res = await fetch(`${BACKEND_URL}/api/profile/${userEmail}`, {
                                                method: "POST",
                                                headers: {
                                                  "Content-Type": "application/json",
                                                  Authorization: `Bearer ${token}`
                                                },
                                                body: JSON.stringify({
                                                  ...(profile || {}),
                                                  name,
                                                  branch,
                                                  graduationYear: parseInt(graduationYear) || 2026,
                                                  semester: parseInt(semester as any) || 1,
                                                  photoUrl,
                                                  skills: skillsArr,
                                                  contact,
                                                  bio
                                                })
                                              });
                                              const data = await res.json();
                                              if (data.success) {
                                                alert("Career profile updated successfully!");
                                                fetchStudentProfileData();
                                              } else {
                                                alert("Error: " + (data.message || "Failed to save portfolio changes"));
                                              }
                                            } catch (err: any) {
                                              alert("Error updating profile details: " + err.message);
                                            }
                                          }}
                                          className="py-2.5 px-6 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                                        >
                                          Save Portfolio Changes
                                        </button>
                                      </div>
                                    </div>


                                  </div>
                                )}

                                {/* TAB 2: RESUME BUILDER */}
                                {careerHubTab === "resume" && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {/* Templates List */}
                                      <div className="md:col-span-1 bg-zinc-50 border border-zinc-200 p-6 rounded-3xl space-y-4">
                                        <h4 className="font-extrabold text-xs text-zinc-900 uppercase">1. Pick Resume Template</h4>
                                        <div className="space-y-2">
                                          {[
                                            { id: "minimal", name: "Minimalist Executive", desc: "Clean header layout for overall business roles" },
                                            { id: "technical", name: "Technical Developer", desc: "Focused project tech stack tag highlights" },
                                            { id: "data-analyst", name: "Business Analyst", desc: "Highlight certifications & data timelines first" }
                                          ].map(t => (
                                            <div
                                              key={t.id}
                                              onClick={() => setActiveResumeTemplate(t.id)}
                                              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                                activeResumeTemplate === t.id
                                                  ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                                                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                                              }`}
                                            >
                                              <div className="font-bold text-xs">{t.name}</div>
                                              <div className="text-[10px] text-zinc-400 mt-1">{t.desc}</div>
                                            </div>
                                          ))}
                                        </div>

                                        <div className="pt-4 border-t space-y-3">
                                          <h4 className="font-extrabold text-xs text-zinc-900 uppercase">2. Save Current Version</h4>
                                          <input
                                            type="text"
                                            value={newResumeName}
                                            onChange={(e) => setNewResumeName(e.target.value)}
                                            className="block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                          />
                                          <button
                                            onClick={saveResumeVersion}
                                            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                                          >
                                            Save Snap Version
                                          </button>
                                        </div>

                                        <div className="pt-4 border-t space-y-2">
                                          <h4 className="font-extrabold text-xs text-zinc-900 uppercase">Saved Resumes</h4>
                                          {savedResumes.length === 0 ? (
                                            <p className="text-[10px] text-zinc-400">No versions saved yet.</p>
                                          ) : (
                                            <div className="space-y-1 max-h-[15vh] overflow-y-auto pr-1">
                                              {savedResumes.map((r, idx) => (
                                                <div key={idx} className="p-2 bg-white border rounded-xl text-[10px] flex justify-between items-center">
                                                  <span className="font-semibold text-zinc-700">{r.name}</span>
                                                  <span className="text-[9px] text-zinc-400">{r.templateId}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Preview Pane */}
                                      <div className="md:col-span-2 border border-zinc-200 rounded-3xl p-6 bg-white shadow-sm flex flex-col space-y-4">
                                        <div className="flex justify-between items-center border-b pb-3">
                                          <h4 className="font-extrabold text-sm text-zinc-800">Live Preview: {activeResumeTemplate.toUpperCase()} Layout</h4>
                                          <a
                                            href={`${BACKEND_URL}/api/resume/${profile?._id}/generate?template=${activeResumeTemplate}&token=${token}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="py-1.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[11px] font-bold shadow-md shadow-orange-500/20"
                                          >
                                            Compile & Download PDF
                                          </a>
                                        </div>

                                        {/* Resume Body Simulation */}
                                        <div className="border border-zinc-150 p-6 rounded-2xl max-h-[50vh] overflow-y-auto bg-white text-zinc-900 text-xs space-y-4">
                                          <div className="text-center space-y-1">
                                            <h3 className="text-xl font-bold uppercase tracking-wider text-zinc-900">{profile?.name}</h3>
                                            <p className="text-[10px] text-zinc-500">{profile?.branch} · Semester {profile?.semester} · Grad Year: {profile?.graduationYear}</p>
                                            <p className="text-[9px] text-zinc-400">Contact: {profile?.contact || "N/A"} | Email: {userEmail}</p>
                                          </div>
                                          <div className="border-t pt-3">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-1">Career Goal</span>
                                            <p className="text-xs text-zinc-700 italic leading-relaxed">{profile?.bio || "No summary added."}</p>
                                          </div>
                                          <div className="border-t pt-3">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-1.5">Tech & Tools Skills</span>
                                            <div className="flex flex-wrap gap-1">
                                              {(profile?.skills || []).map((s: string, idx: number) => (
                                                <span key={idx} className="bg-zinc-100 border text-zinc-800 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                                  {s}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="border-t pt-3">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Projects & Architecture</span>
                                            {(profile?.projects || []).map((p: any, idx: number) => (
                                              <div key={idx} className="mb-2">
                                                <div className="font-bold text-zinc-800 text-xs">{p.title}</div>
                                                <div className="text-[10px] text-zinc-500 font-semibold">Tech: {p.techStack} | Link: {p.link}</div>
                                                <p className="text-[11px] text-zinc-600 mt-0.5">{p.description}</p>
                                              </div>
                                            ))}
                                          </div>
                                          <div className="border-t pt-3">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Verified Accomplishments</span>
                                            {myAchievementsList.filter(a => a.status === "verified").map((a, idx) => (
                                              <div key={idx} className="mb-1 text-[11px]">
                                                🎓 <strong>{a.title}</strong> - <span className="text-orange-600 font-bold uppercase tracking-wider text-[9px]">{a.level}</span>
                                                <p className="text-zinc-600 mt-0.5">{a.description}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* TAB 3: ACHIEVEMENTS PORTFOLIO */}
                                {careerHubTab === "achievements" && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {/* Log Achievement Form */}
                                      <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-3xl space-y-4">
                                        <h4 className="font-extrabold text-sm text-zinc-900 border-b pb-2">Log Co-curricular Achievement</h4>
                                        <form onSubmit={submitAchievement} className="space-y-3">
                                          <div>
                                            <label className="block text-[10px] font-bold text-zinc-500 uppercase">Achievement Title</label>
                                            <input
                                              type="text"
                                              value={achTitle}
                                              onChange={(e) => setAchTitle(e.target.value)}
                                              placeholder="e.g. Winner of Smart Campus Hackathon"
                                              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <label className="block text-[10px] font-bold text-zinc-500 uppercase">Category</label>
                                              <select
                                                value={achCategory}
                                                onChange={(e) => setAchCategory(e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                              >
                                                <option value="academic">Academic</option>
                                                <option value="sports">Sports</option>
                                                <option value="cultural">Cultural</option>
                                                <option value="technical">Technical</option>
                                                <option value="leadership">Leadership</option>
                                                <option value="social-work">Social Work</option>
                                              </select>
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-bold text-zinc-500 uppercase">Level</label>
                                              <select
                                                value={achLevel}
                                                onChange={(e) => setAchLevel(e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                              >
                                                <option value="college">College (+10 pts)</option>
                                                <option value="state">State (+25 pts)</option>
                                                <option value="national">National (+50 pts)</option>
                                                <option value="international">International (+100 pts)</option>
                                              </select>
                                            </div>
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-bold text-zinc-500 uppercase">Proof Certificate (PDF / Image)</label>
                                            <div className="mt-1 flex flex-col items-start gap-2">
                                              <input
                                                type="file"
                                                accept=".pdf,image/*"
                                                required={!achProofUrl}
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    setAchFileName(file.name);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                      setAchProofUrl(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                  }
                                                }}
                                                className="block w-full text-xs text-zinc-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 file:cursor-pointer hover:file:bg-orange-100"
                                              />
                                              {achFileName && (
                                                <div className="flex items-center gap-2 mt-1">
                                                  <span className="text-[10px] text-emerald-600 font-bold">
                                                    ✓ {achFileName} (Ready)
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setAchFileName("");
                                                      setAchProofUrl("");
                                                    }}
                                                    className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                                                    title="Remove uploaded document"
                                                  >
                                                    ✕
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-bold text-zinc-500 uppercase">Brief Description</label>
                                            <textarea
                                              value={achDescription}
                                              onChange={(e) => setAchDescription(e.target.value)}
                                              rows={2}
                                              placeholder="What did you construct/compete for?"
                                              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                            />
                                          </div>
                                          <button
                                            type="submit"
                                            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                                          >
                                            Submit for Faculty Verification
                                          </button>
                                        </form>
                                      </div>

                                      {/* Status workflow list */}
                                      <div className="space-y-4">
                                        <h4 className="font-extrabold text-sm text-zinc-900 border-b pb-2">My Co-curricular Portfolio & Workflow</h4>
                                        {myAchievementsList.length === 0 ? (
                                          <p className="text-xs text-zinc-400">No achievements recorded yet. Add one to climb the leaderboard!</p>
                                        ) : (
                                          <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                                            {myAchievementsList.map((a, idx) => (
                                              <div key={idx} className="p-4 bg-white border border-zinc-150 rounded-2xl text-xs space-y-2">
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <h5 className="font-bold text-zinc-950">{a.title}</h5>
                                                    <span className="text-[9px] text-zinc-400 uppercase font-semibold">{a.category} · {a.level}</span>
                                                  </div>
                                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                    a.status === "verified"
                                                      ? "bg-emerald-100 text-emerald-800"
                                                      : a.status === "rejected"
                                                      ? "bg-red-100 text-red-800"
                                                      : "bg-amber-100 text-amber-800"
                                                  }`}>
                                                    {a.status}
                                                  </span>
                                                </div>
                                                <p className="text-[11px] text-zinc-500 leading-normal">{a.description}</p>
                                                {a.status === "verified" && (
                                                  <div className="text-[10px] text-orange-600 font-extrabold bg-orange-50 p-1.5 rounded-lg">
                                                    🏆 Verification points: <strong>+{a.pointsAwarded} pts</strong> awarded to your profile
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* TAB 4: LEADERBOARD & BADGES */}
                                {careerHubTab === "leaderboard" && (
                                  <div className="space-y-6">
                                    <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                      <div>
                                        <span className="text-orange-500 font-bold uppercase tracking-wider text-xs">👑 IPS Student of the Year Leader</span>
                                        <h4 className="text-xl font-black text-zinc-950 mt-1">
                                          {leaderboard[0] ? leaderboard[0].name : "No Candidates Yet"}
                                        </h4>
                                        <p className="text-xs text-zinc-500 mt-1">
                                          Rankings auto-aggregate verified co-curricular points. Configure templates and submit files for approval.
                                        </p>
                                      </div>
                                      <div className="bg-zinc-900 text-white p-4 rounded-2xl text-center shadow-lg w-full sm:w-auto">
                                        <div className="text-2xl font-black">{leaderboard[0] ? leaderboard[0].points : 0}</div>
                                        <div className="text-[9px] uppercase font-black tracking-wider text-zinc-400">Total Points</div>
                                      </div>
                                    </div>

                                    {/* Leaderboard Table list */}
                                    <div className="space-y-3">
                                      <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Campus rankings</h4>
                                      <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-2">
                                        {leaderboard.map((student, idx) => (
                                          <div 
                                            key={idx} 
                                            onClick={() => fetchPublicProfileView(student.studentId)}
                                            className="p-3.5 bg-white border border-zinc-150 rounded-2xl flex justify-between items-center text-xs hover:border-zinc-300 cursor-pointer transition-all"
                                          >
                                            <div className="flex items-center space-x-3">
                                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                                                idx === 0 
                                                  ? "bg-amber-100 text-amber-800" 
                                                  : idx === 1 
                                                  ? "bg-zinc-200 text-zinc-800" 
                                                  : "bg-zinc-150 text-zinc-700"
                                              }`}>
                                                {idx + 1}
                                              </span>
                                              <div>
                                                <p className="font-bold text-zinc-950">{student.name}</p>
                                                <p className="text-[10px] text-zinc-400 uppercase font-semibold">{student.branch} · Semester {student.semester}</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              {student.badge && (
                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[9px] font-extrabold rounded">
                                                  {student.badge}
                                                </span>
                                              )}
                                              <span className="font-extrabold text-sm text-zinc-800">{student.points} pts</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* TAB 5: CAMPUS DISCOVERY & SOCIAL FEED */}
                                {careerHubTab === "discovery" && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {/* Search panel */}
                                      <div className="md:col-span-1 bg-zinc-50 border border-zinc-200 p-6 rounded-3xl space-y-4">
                                        <h4 className="font-extrabold text-xs text-zinc-900 uppercase">Search Campus Talent</h4>
                                        <div className="relative">
                                          <input
                                            type="text"
                                            value={searchSkillQuery}
                                            onChange={(e) => {
                                              setSearchSkillQuery(e.target.value);
                                              handleDiscoverSearch(e.target.value);
                                            }}
                                            placeholder="Search Skill (e.g. React, Java)"
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                                          />
                                        </div>
                                        <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                                          {discoveredProfiles.length === 0 ? (
                                            <p className="text-[10px] text-zinc-400">Search for skill tags to view students.</p>
                                          ) : (
                                            discoveredProfiles.map((p, idx) => (
                                              <div 
                                                key={idx} 
                                                onClick={() => fetchPublicProfileView(p._id)}
                                                className="p-3 bg-white border border-zinc-150 rounded-2xl hover:border-zinc-300 cursor-pointer text-xs space-y-1 transition-all"
                                              >
                                                <div className="font-bold text-zinc-800">{p.name}</div>
                                                <div className="text-[9px] text-zinc-400 uppercase font-semibold">{p.branch} · {p.graduationYear}</div>
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                  {(p.skills || []).slice(0, 3).map((s: string, i: number) => (
                                                    <span key={i} className="bg-zinc-100 text-zinc-700 text-[8px] font-bold px-1.5 py-0.5 rounded">
                                                      {s}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>

                                      {/* Activity Feed */}
                                      <div className="md:col-span-2 space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                          <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Activity Feed Updates</h4>
                                          <div className="flex bg-zinc-100 p-0.5 rounded-lg border">
                                            {["campus", "following"].map(sc => (
                                              <button
                                                key={sc}
                                                onClick={() => {
                                                  setFeedScope(sc as any);
                                                  fetchActivityFeed(sc);
                                                }}
                                                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                                  feedScope === sc ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
                                                }`}
                                              >
                                                {sc}
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                                          {activityFeed.length === 0 ? (
                                            <p className="text-xs text-zinc-400">No activity feed posts reported.</p>
                                          ) : (
                                            activityFeed.map((post, idx) => (
                                              <div key={idx} className="p-4 bg-white border border-zinc-150 rounded-2xl text-xs space-y-1.5">
                                                <div className="flex justify-between text-[10px] text-zinc-400">
                                                  <span 
                                                    className="font-bold text-orange-600 cursor-pointer hover:underline"
                                                    onClick={() => post.studentId && fetchPublicProfileView(post.studentId._id)}
                                                  >
                                                    {post.studentId?.name || "System Achiever"}
                                                  </span>
                                                  <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-zinc-800 leading-normal text-xs font-semibold">{post.message}</p>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* M6: Campus Security & SOS */}
                        {activeModule === "sos" && (
                          <div className="space-y-6">
                            <h3 className="text-2xl font-black text-zinc-900">Campus Security & SOS</h3>
                            
                            <div className="p-6 bg-red-50 border border-red-200 rounded-3xl flex flex-col items-center text-center space-y-4">
                              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-pulse">
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                              </div>
                              <div>
                                <h4 className="font-black text-lg text-red-900">Instant SOS Emergency Dispatch</h4>
                                <p className="text-xs text-red-700 max-w-sm mt-1">
                                  Pressing the button below broadcasts your location to the security control room immediately.
                                </p>
                              </div>
                              <div className="w-full max-w-sm space-y-3">
                                <input
                                  type="text"
                                  placeholder="Enter Room Number/Block (e.g. Block A Lab 4)"
                                  value={sosLocation}
                                  onChange={(e) => setSosLocation(e.target.value)}
                                  className="block w-full px-4 py-2.5 border border-red-300 rounded-xl shadow-sm text-black bg-white text-xs text-center"
                                />
                                <button
                                  onClick={handleTriggerSOS}
                                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                                >
                                  TRIGGER SOS ALERT
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="font-extrabold text-sm text-zinc-900">Emergency Contacts</h4>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="p-3 bg-zinc-50 border rounded-xl">
                                  <p className="font-bold">Security Control Room</p>
                                  <p className="text-orange-500 font-semibold mt-1">📞 +91 99999-88888</p>
                                </div>
                                <div className="p-3 bg-zinc-50 border rounded-xl">
                                  <p className="font-bold">Campus Medical Center</p>
                                  <p className="text-orange-500 font-semibold mt-1">📞 +91 99999-77777</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* M7: Equipment & Resource Renting */}
                        {activeModule === "rentals" && (
                          <div className="space-y-6">
                            <h3 className="text-2xl font-black text-zinc-900">Resource Rentals</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <form onSubmit={handleIssueResource} className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
                                <h4 className="font-extrabold text-sm text-zinc-900">Rent Sensor/Item</h4>
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Item Name</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Arduino Sensor, Multimeter"
                                    value={reqResourceName}
                                    onChange={(e) => setReqResourceName(e.target.value)}
                                    className="block w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs text-black bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Category</label>
                                  <select
                                    value={reqCategory}
                                    onChange={(e) => setReqCategory(e.target.value)}
                                    className="block w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs text-black bg-white"
                                  >
                                    <option value="sensor">Sensor/IoT</option>
                                    <option value="lab">Lab Equipment</option>
                                    <option value="sports">Sports Gear</option>
                                  </select>
                                </div>
                                <button
                                  type="submit"
                                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold"
                                >
                                  Issue Item
                                </button>
                              </form>

                              <div className="space-y-3">
                                <h4 className="font-extrabold text-sm text-zinc-900">Active Issues</h4>
                                <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-2">
                                  {rentedResources.length === 0 ? (
                                    <p className="text-zinc-500 italic text-xs">No resources currently issued.</p>
                                  ) : (
                                    rentedResources.map((res) => (
                                      <div key={res._id} className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl flex flex-col justify-between space-y-2">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h5 className="font-bold text-zinc-900 text-sm leading-none">{res.resourceName}</h5>
                                            <span className="text-[9px] text-zinc-400 capitalize mt-1 inline-block">{res.category}</span>
                                          </div>
                                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                            res.status === "returned" ? "bg-zinc-200 text-zinc-600" : "bg-blue-100 text-blue-800"
                                          }`}>
                                            {res.status}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 space-y-0.5">
                                          <div>Issued: {formatDate(res.issueDate)}</div>
                                          <div>Due: {formatDate(res.dueDate)}</div>
                                          {res.fine > 0 && (
                                            <div className="text-red-600 font-extrabold">Accumulated Fine: Rs. {res.fine}</div>
                                          )}
                                        </div>
                                        {res.status === "issued" && (
                                          <button
                                            onClick={() => handleReturnResource(res._id)}
                                            className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-bold"
                                          >
                                            Return Item
                                          </button>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* M7: Sensor Issuing System */}
                        {activeModule === "sensors" && (
                          <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                              <div>
                                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Sensor Issuing System</h3>
                                <p className="text-xs text-zinc-400 font-medium">IoT Kits, Arduino components, and lab hardware tracking desk</p>
                              </div>
                              {/* Tab Switches */}
                              <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 gap-1 overflow-x-auto max-w-full scrollbar-none">
                                {userRole === "student" ? (
                                  <>
                                    <button onClick={() => setSensorTab("catalog")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sensorTab === "catalog" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>Catalog</button>
                                    <button onClick={() => { fetchStudentRequests(); setSensorTab("requests"); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sensorTab === "requests" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>My Requests</button>
                                    <button onClick={() => { fetchStudentFines(); setSensorTab("fines"); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sensorTab === "fines" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>My Fines</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => setSensorTab("catalog")} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${sensorTab === "catalog" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>Catalog</button>
                                    <button onClick={() => { fetchPendingRequests(); setSensorTab("approvals"); }} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${sensorTab === "approvals" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>Approvals ({pendingSensorRequests.length})</button>
                                    <button onClick={() => { fetchPendingRequests(); setSensorTab("issue-return"); }} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${sensorTab === "issue-return" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>Issue & Return Desk</button>
                                    <button onClick={() => { fetchAdminDashboardStats(); setSensorTab("damage-loss"); }} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${sensorTab === "damage-loss" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>Damage/Loss ({adminDmgCases.length})</button>
                                    <button onClick={() => { fetchAdminDashboardStats(); setSensorTab("admin-dash"); }} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${sensorTab === "admin-dash" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>Dashboard</button>
                                    <button onClick={() => { fetchFineConfig(); setSensorTab("config"); }} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${sensorTab === "config" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>Fine Config</button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* TAB CONTENT 1: SENSOR CATALOG */}
                            {sensorTab === "catalog" && (
                              <div className="space-y-6">
                                {userRole !== "student" && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Add Sensor Form */}
                                    <form onSubmit={handleCreateSensor} className="bg-zinc-50 border p-5 rounded-3xl space-y-4">
                                      <h4 className="font-extrabold text-xs text-emerald-600 uppercase tracking-wide">Add New Sensor to Catalog</h4>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[9px] font-bold text-zinc-400 uppercase">Sensor Name</label>
                                          <input type="text" required placeholder="e.g. Arduino Uno R3" value={newSensorName} onChange={e => setNewSensorName(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-zinc-400 uppercase">Type / Category</label>
                                          <input type="text" required placeholder="e.g. IoT Kit" value={newSensorType} onChange={e => setNewSensorType(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-zinc-400 uppercase">Department</label>
                                          <input type="text" required placeholder="e.g. CSE / ECE" value={newSensorDept} onChange={e => setNewSensorDept(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-zinc-400 uppercase">Total Inventory Quantity</label>
                                          <input type="number" min="1" required value={newSensorQty} onChange={e => setNewSensorQty(Number(e.target.value))} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                        </div>
                                      </div>
                                      <button type="submit" className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all">Add Hardware Item</button>
                                    </form>

                                    {/* Edit Sensor Panel */}
                                    {editingSensorId ? (() => {
                                      const currentItem = sensorsList.find(s => s._id === editingSensorId);
                                      if (!currentItem) return null;
                                      return (
                                        <form onSubmit={handleUpdateSensor} className="bg-zinc-50 border border-zinc-300 p-5 rounded-3xl space-y-4 animate-[fadeIn_0.1s_ease-out]">
                                          <div className="flex justify-between items-center">
                                            <h4 className="font-extrabold text-xs text-orange-600 uppercase tracking-wide">Edit Item: {currentItem.name}</h4>
                                            <button type="button" onClick={() => setEditingSensorId(null)} className="text-[10px] text-zinc-400 hover:text-zinc-600 font-bold">Cancel</button>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <label className="block text-[9px] font-bold text-zinc-400 uppercase">Inventory Quantity</label>
                                              <input type="number" min="0" required value={editSensorQty} onChange={e => setEditSensorQty(Number(e.target.value))} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                            </div>
                                            <div>
                                              <label className="block text-[9px] font-bold text-zinc-400 uppercase">Condition Summary</label>
                                              <select value={editSensorCond} onChange={e => setEditSensorCond(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black">
                                                <option value="working">Working</option>
                                                <option value="damaged">Damaged</option>
                                                <option value="under-repair">Under Repair</option>
                                              </select>
                                            </div>
                                            <div className="col-span-2">
                                              <label className="block text-[9px] font-bold text-zinc-400 uppercase">Notes (Condition Log)</label>
                                              <input type="text" placeholder="e.g. Broken pin 3 fixed" value={editSensorNotes} onChange={e => setEditSensorNotes(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                            </div>
                                          </div>
                                          <button type="submit" className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all">Save Changes</button>
                                        </form>
                                      );
                                    })() : (
                                      <div className="p-6 border border-dashed rounded-3xl flex items-center justify-center text-center text-xs text-zinc-400 font-semibold bg-zinc-50">
                                        Select any item from the catalog to modify quantity or track condition logs.
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="space-y-3">
                                  <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Hardware & Sensors Catalog</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {sensorsList.length === 0 ? (
                                      <div className="col-span-full text-center py-8 text-xs text-zinc-400 font-bold bg-zinc-50 border rounded-2xl">
                                        No items available in the catalog list.
                                      </div>
                                    ) : (
                                      sensorsList.map((sensor) => (
                                        <div key={sensor._id} className="bg-white border rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                                          <div className="space-y-1">
                                            <div className="flex justify-between items-start gap-1">
                                              <h5 className="font-black text-zinc-800 text-xs sm:text-sm leading-tight capitalize">{sensor.name}</h5>
                                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${sensor.conditionSummary === "working" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : sensor.conditionSummary === "damaged" ? "bg-red-50 text-red-700 border border-red-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                                                {sensor.conditionSummary}
                                              </span>
                                            </div>
                                            <div className="flex gap-2 text-[10px] text-zinc-400 font-bold">
                                              <span>{sensor.type}</span>
                                              <span>•</span>
                                              <span>Dept: {sensor.department}</span>
                                            </div>
                                          </div>
                                          
                                          <div className="flex justify-between items-center text-xs font-bold pt-2 border-t">
                                            <div className="text-zinc-600">
                                              Available: <span className="text-zinc-900 font-black">{sensor.availableQuantity}</span> / {sensor.totalQuantity}
                                            </div>
                                            {userRole === "student" ? (
                                              <button
                                                onClick={() => {
                                                  if (sensor.availableQuantity <= 0) {
                                                    alert("This sensor is currently out of stock.");
                                                    return;
                                                  }
                                                  setReqSensorId(sensor._id);
                                                  setReqPurpose("");
                                                  setReqProject("");
                                                  setReqFrom("");
                                                  setReqTo("");
                                                }}
                                                className={`py-1 px-3 rounded-lg text-[10px] font-black text-white ${sensor.availableQuantity > 0 ? "bg-emerald-600 hover:bg-emerald-750" : "bg-zinc-300 cursor-not-allowed"}`}
                                              >
                                                Request
                                              </button>
                                            ) : (
                                              <button
                                                onClick={() => {
                                                  setEditingSensorId(sensor._id);
                                                  setEditSensorQty(sensor.totalQuantity);
                                                  setEditSensorCond(sensor.conditionSummary);
                                                }}
                                                className="py-1 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[10px] font-bold border"
                                              >
                                                Edit / Log
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                {/* STUDENT REQUEST FORM MODAL */}
                                {reqSensorId && (() => {
                                  const reqTarget = sensorsList.find(s => s._id === reqSensorId);
                                  if (!reqTarget) return null;
                                  return (
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                      <form onSubmit={handleRequestSensor} className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
                                        <div className="flex justify-between items-center border-b pb-2">
                                          <h5 className="font-extrabold text-sm text-zinc-900 uppercase">Request Hardware: {reqTarget.name}</h5>
                                          <button type="button" onClick={() => setReqSensorId(null)} className="text-zinc-400 hover:text-zinc-600 text-xs font-bold">✕ Close</button>
                                        </div>
                                        <div className="space-y-3 text-xs">
                                          <div>
                                            <label className="block text-[9px] font-bold text-zinc-400 uppercase">Project Name</label>
                                            <input type="text" required placeholder="e.g. Smart Agriculture System" value={reqProject} onChange={e => setReqProject(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] font-bold text-zinc-400 uppercase">Purpose of Usage</label>
                                            <textarea required placeholder="e.g. Need sensor for lab practical examination and testing." value={reqPurpose} onChange={e => setReqPurpose(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black h-16 resize-none" />
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <label className="block text-[9px] font-bold text-zinc-400 uppercase">Requested From</label>
                                              <input type="datetime-local" required value={reqFrom} onChange={e => setReqFrom(e.target.value)} className="mt-1 block w-full px-2 py-1.5 border rounded-lg text-[10px] bg-white text-black" />
                                            </div>
                                            <div>
                                              <label className="block text-[9px] font-bold text-zinc-400 uppercase">Requested To</label>
                                              <input type="datetime-local" required value={reqTo} onChange={e => setReqTo(e.target.value)} className="mt-1 block w-full px-2 py-1.5 border rounded-lg text-[10px] bg-white text-black" />
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex gap-2 justify-end pt-3 border-t">
                                          <button type="button" onClick={() => setReqSensorId(null)} className="py-1.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl border">Cancel</button>
                                          <button type="submit" className="py-1.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">Submit Request</button>
                                        </div>
                                      </form>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* TAB CONTENT 2: STUDENT MY REQUESTS LIST */}
                            {sensorTab === "requests" && (
                              <div className="space-y-4">
                                <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Sensor Request History</h4>
                                <div className="space-y-3">
                                  {sensorRequests.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-zinc-400 font-bold bg-zinc-50 border rounded-2xl">
                                      You have not submitted any sensor requests yet.
                                    </div>
                                  ) : (
                                    sensorRequests.map((reqItem) => (
                                      <div key={reqItem._id} className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                          <div>
                                            <h5 className="font-bold text-zinc-800 text-xs sm:text-sm capitalize">{reqItem.sensorId?.name}</h5>
                                            <span className="text-[10px] text-zinc-400 font-semibold uppercase">{reqItem.projectName}</span>
                                          </div>
                                          <span className={`self-start px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                            reqItem.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                            reqItem.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                            reqItem.status === "rejected" ? "bg-red-50 text-red-700 border-red-100" :
                                            reqItem.status === "issued" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                            reqItem.status === "returned" ? "bg-zinc-50 text-zinc-700 border-zinc-150" :
                                            reqItem.status === "overdue" ? "bg-orange-50 text-orange-700 border-orange-100" :
                                            "bg-zinc-900 text-white border-zinc-950"
                                          }`}>
                                            {reqItem.status}
                                          </span>
                                        </div>

                                        <p className="text-xs text-zinc-500 leading-relaxed"><span className="font-semibold text-zinc-700">Purpose: </span>{reqItem.purpose}</p>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold text-zinc-500 pt-2 border-t">
                                          <div>
                                            <span className="block text-[8px] text-zinc-400 uppercase">Requested From</span>
                                            {new Date(reqItem.requestedFrom).toLocaleString()}
                                          </div>
                                          <div>
                                            <span className="block text-[8px] text-zinc-400 uppercase">Requested To</span>
                                            {new Date(reqItem.requestedTo).toLocaleString()}
                                          </div>
                                          {reqItem.issuedAt && (
                                            <div>
                                              <span className="block text-[8px] text-zinc-400 uppercase">Issued At</span>
                                              {new Date(reqItem.issuedAt).toLocaleString()}
                                            </div>
                                          )}
                                          {reqItem.dueAt && (
                                            <div>
                                              <span className="block text-[8px] text-zinc-400 uppercase">Due Date</span>
                                              <span className={reqItem.status === "overdue" ? "text-orange-600 font-extrabold" : ""}>{new Date(reqItem.dueAt).toLocaleString()}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}

                            {/* TAB CONTENT 3: STUDENT FINES LOGS */}
                            {sensorTab === "fines" && (
                              <div className="space-y-4">
                                <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Fine History & Payments</h4>
                                <div className="space-y-3">
                                  {studentFines.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-zinc-400 font-bold bg-zinc-50 border rounded-2xl">
                                      No late fee fines logged under your profile.
                                    </div>
                                  ) : (
                                    studentFines.map((fine) => (
                                      <div key={fine._id} className="bg-white border rounded-3xl p-5 shadow-sm flex justify-between items-center">
                                        <div className="space-y-1">
                                          <h5 className="font-bold text-zinc-800 text-xs sm:text-sm capitalize">{fine.sensorRequestId?.sensorId?.name || "Sensor Module Item"}</h5>
                                          <div className="flex gap-2 text-[10px] text-zinc-400 font-bold">
                                            <span>Late Duration: {fine.lateDuration} Hours</span>
                                            <span>•</span>
                                            <span>Rate: Rs {fine.ratePerUnit}/hr</span>
                                          </div>
                                          <span className="text-[10px] text-zinc-400 font-bold">Logged: {new Date(fine.createdAt).toLocaleString()}</span>
                                        </div>

                                        <div className="text-right space-y-1.5">
                                          <div className="font-black text-sm sm:text-base text-zinc-800">Rs {fine.amount}</div>
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${fine.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                                            {fine.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}

                            {/* TAB CONTENT 4: FACULTY APPROVAL QUEUE */}
                            {sensorTab === "approvals" && (
                              <div className="space-y-4">
                                <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Sensor Requests Approval Desk</h4>
                                <div className="space-y-3">
                                  {pendingSensorRequests.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-zinc-400 font-bold bg-zinc-50 border rounded-2xl">
                                      No pending sensor requests awaiting review.
                                    </div>
                                  ) : (
                                    pendingSensorRequests.map((item) => (
                                      <div key={item._id} className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
                                        <div className="flex justify-between items-start border-b pb-2">
                                          <div>
                                            <h5 className="font-bold text-zinc-800 text-xs sm:text-sm capitalize">{item.sensorId?.name}</h5>
                                            <span className="text-[10px] text-emerald-600 font-bold uppercase">{item.projectName}</span>
                                          </div>
                                          <span className="text-[10px] text-zinc-400 font-bold">{item.studentId?.email}</span>
                                        </div>

                                        <p className="text-xs text-zinc-500 leading-relaxed"><span className="font-semibold text-zinc-700">Purpose: </span>{item.purpose}</p>

                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-500 bg-zinc-50 p-3 rounded-2xl border">
                                          <div>
                                            <span className="block text-[8px] text-zinc-400 uppercase">Requested From</span>
                                            {new Date(item.requestedFrom).toLocaleString()}
                                          </div>
                                          <div>
                                            <span className="block text-[8px] text-zinc-400 uppercase">Requested To</span>
                                            {new Date(item.requestedTo).toLocaleString()}
                                          </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                          <input
                                            type="text"
                                            placeholder="Add optional approval note..."
                                            value={approvalNote}
                                            onChange={e => setApprovalNote(e.target.value)}
                                            className="flex-1 px-3 py-1.5 border rounded-xl text-xs bg-white text-black"
                                          />
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => handleApproveReject(item._id, "approved")}
                                              className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                                            >
                                              Approve
                                            </button>
                                            <button
                                              onClick={() => handleApproveReject(item._id, "rejected")}
                                              className="py-1.5 px-4 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                                            >
                                              Reject
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}

                            {/* TAB CONTENT 5: FACULTY HANDOVER ISSUE & RETURN DESK */}
                            {sensorTab === "issue-return" && (() => {
                              // Filter requests that are in approved state or issued/overdue state
                              return (
                                <div className="space-y-6">
                                  {/* Issue desk */}
                                  <div className="space-y-3">
                                    <h4 className="font-extrabold text-sm text-zinc-950 uppercase">Handover Desk (Mark as Issued)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {pendingSensorRequests.filter(r => r.status === "approved" || r.status === "pending").length === 0 ? (
                                        <div className="col-span-full text-center py-6 text-xs text-zinc-400 font-bold bg-zinc-50 border rounded-2xl">
                                          No approved requests waiting for physical sensor handover.
                                        </div>
                                      ) : (
                                        // Load all requests (fetch requests to display)
                                        // Simple lookup helper
                                        // For prototype simplicity, we load pending requests that might have been approved or rejected
                                        // Actually let's query all sensor requests using client lookup
                                        // We can load them on demand or filter list.
                                        // To be safe, we will display lists from pendingSensorRequests
                                        // Let's filter the local list or we can render approved requests
                                        // Let's create an input to list them
                                        <div className="col-span-full space-y-2">
                                          <p className="text-[10px] text-zinc-400 font-semibold">Note: Physical sensors must be inspected before marking as Issued.</p>
                                          {/* Load all requests using a clean table */}
                                          {/* We can make a separate fetch if needed, but we can search by studentId or look at adminDashboard overdueList */}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Return desk */}
                                  <div className="space-y-4 pt-4 border-t">
                                    <h4 className="font-extrabold text-sm text-zinc-950 uppercase">Return Desk (Handback Inspections)</h4>
                                    
                                    {adminDashboardStats.overdueList?.length === 0 && (
                                      <p className="text-xs text-zinc-400">All issued sensors are currently running on normal duration windows.</p>
                                    )}

                                    {/* Table of active issued & overdue items */}
                                    <div className="space-y-3">
                                      {adminDashboardStats.overdueList?.map((overdueReq: any) => (
                                        <div key={overdueReq._id} className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-3">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <span className="text-[9px] bg-orange-100 text-orange-800 font-black uppercase px-2 py-0.5 rounded-full">Overdue</span>
                                              <h5 className="font-bold text-zinc-800 text-xs sm:text-sm capitalize mt-1">{overdueReq.sensorId?.name}</h5>
                                              <span className="text-[10px] text-zinc-400 font-bold">Student: {overdueReq.studentId?.email}</span>
                                            </div>
                                            <div className="text-right text-[10px] font-bold text-zinc-500">
                                              <span className="block text-[8px] text-zinc-400">Due At</span>
                                              {new Date(overdueReq.dueAt).toLocaleString()}
                                            </div>
                                          </div>

                                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                            <input
                                              type="text"
                                              placeholder="Condition notes (optional)..."
                                              value={damagedReturnNotes}
                                              onChange={e => setDamagedReturnNotes(e.target.value)}
                                              className="flex-1 px-3 py-1.5 border rounded-xl text-xs bg-white text-black"
                                            />
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => handleReturnSensor(overdueReq._id, "ok")}
                                                className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                                              >
                                                Return OK
                                              </button>
                                              <button
                                                onClick={() => handleReturnSensor(overdueReq._id, "damaged")}
                                                className="py-1.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                                              >
                                                Return Damaged
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setLostReqId(overdueReq._id);
                                                  setLostPenalty(0);
                                                  setLostNotes("");
                                                }}
                                                className="py-1.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                                              >
                                                Mark Lost
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* MARK LOST POPUP FORM */}
                                  {lostReqId && (
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                      <form onSubmit={handleMarkLost} className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
                                        <div className="flex justify-between items-center border-b pb-2">
                                          <h5 className="font-extrabold text-sm text-zinc-900 uppercase">Declare Sensor Lost</h5>
                                          <button type="button" onClick={() => setLostReqId(null)} className="text-zinc-400 hover:text-zinc-600 text-xs font-bold">✕ Close</button>
                                        </div>
                                        <p className="text-[10px] text-zinc-400">Declaring lost sets the request to a terminal status and launches a damage/loss penalty case. Inventory available count is NOT incremented.</p>
                                        <div className="space-y-3 text-xs">
                                          <div>
                                            <label className="block text-[9px] font-bold text-zinc-400 uppercase">Penalty Amount (Rs)</label>
                                            <input type="number" min="0" required value={lostPenalty} onChange={e => setLostPenalty(Number(e.target.value))} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] font-bold text-zinc-400 uppercase">Loss description / Incident Notes</label>
                                            <textarea required placeholder="e.g. Student confirmed loss during semester project build." value={lostNotes} onChange={e => setLostNotes(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black h-16 resize-none" />
                                          </div>
                                        </div>
                                        <div className="flex gap-2 justify-end pt-3 border-t">
                                          <button type="button" onClick={() => setLostReqId(null)} className="py-1.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl border">Cancel</button>
                                          <button type="submit" className="py-1.5 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">Confirm Lost</button>
                                        </div>
                                      </form>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* TAB CONTENT 6: DAMAGE & LOSS CASES SCREEN */}
                            {sensorTab === "damage-loss" && (
                              <div className="space-y-4">
                                <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Damage & Loss Penalty Cases</h4>
                                <div className="space-y-3">
                                  {adminDmgCases.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-zinc-400 font-bold bg-zinc-50 border rounded-2xl">
                                      All logged hardware damage or loss incidents have been resolved.
                                    </div>
                                  ) : (
                                    adminDmgCases.map((caseItem) => (
                                      <div key={caseItem._id} className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
                                        <div className="flex justify-between items-start border-b pb-2">
                                          <div>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${caseItem.type === "damaged" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                                              {caseItem.type}
                                            </span>
                                            <h5 className="font-bold text-zinc-800 text-xs sm:text-sm capitalize mt-1">{caseItem.sensorId?.name}</h5>
                                          </div>
                                          <div className="text-right">
                                            <span className="block text-[8px] text-zinc-400 font-bold uppercase">Penalty Fee</span>
                                            <div className="font-black text-sm text-zinc-900">Rs {caseItem.penaltyAmount}</div>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-500 bg-zinc-50 p-3 rounded-2xl border">
                                          <div>
                                            <span className="block text-[8px] text-zinc-400 uppercase">Student Email</span>
                                            {caseItem.studentId?.email}
                                          </div>
                                          <div>
                                            <span className="block text-[8px] text-zinc-400 uppercase">Incident Notes</span>
                                            {caseItem.notes || "No notes"}
                                          </div>
                                        </div>

                                        <div className="flex gap-2 justify-end pt-2">
                                          <button
                                            onClick={() => {
                                              setResolvingCaseId(caseItem._id);
                                              setResolvePenalty(caseItem.penaltyAmount);
                                              setResolveNotes(caseItem.notes);
                                            }}
                                            className="py-1 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-bold shadow-sm"
                                          >
                                            Resolve Incident
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                {/* RESOLVE CASE POPUP */}
                                {resolvingCaseId && (
                                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <form onSubmit={handleResolveDamageCase} className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
                                      <div className="flex justify-between items-center border-b pb-2">
                                        <h5 className="font-extrabold text-sm text-zinc-900 uppercase">Resolve Incident Case</h5>
                                        <button type="button" onClick={() => setResolvingCaseId(null)} className="text-zinc-400 hover:text-zinc-600 text-xs font-bold">✕ Close</button>
                                      </div>
                                      <div className="space-y-3 text-xs">
                                        <div>
                                          <label className="block text-[9px] font-bold text-zinc-400 uppercase">Final Penalty Amount (Rs)</label>
                                          <input type="number" min="0" required value={resolvePenalty} onChange={e => setResolvePenalty(Number(e.target.value))} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black" />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-zinc-400 uppercase">Resolution / Settlement Details</label>
                                          <textarea required placeholder="e.g. Fine paid in cash at office desk." value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black h-16 resize-none" />
                                        </div>
                                      </div>
                                      <div className="flex gap-2 justify-end pt-3 border-t">
                                        <button type="button" onClick={() => setResolvingCaseId(null)} className="py-1.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl border">Cancel</button>
                                        <button type="submit" className="py-1.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">Mark Resolved</button>
                                      </div>
                                    </form>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* TAB CONTENT 7: ADMIN FINE RATE CONFIGURATION */}
                            {sensorTab === "config" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form onSubmit={handleUpdateFineConfig} className="bg-zinc-50 border p-5 rounded-3xl space-y-4">
                                  <h4 className="font-extrabold text-xs text-zinc-800 uppercase tracking-wide">Configure Late Fees Policies</h4>
                                  <div>
                                    <label className="block text-[9px] font-bold text-zinc-400 uppercase">Late Return Rate (Rs per hour)</label>
                                    <input
                                      type="number"
                                      min="0"
                                      required
                                      value={fineConfig.ratePerHour}
                                      onChange={e => setFineConfig({ ...fineConfig, ratePerHour: Number(e.target.value) })}
                                      className="mt-1 block w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black"
                                    />
                                  </div>
                                  <button type="submit" className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all">Save Configuration</button>
                                </form>
                              </div>
                            )}

                            {/* TAB CONTENT 8: ANALYTICS & ADMIN DASHBOARD */}
                            {sensorTab === "admin-dash" && (
                              <div className="space-y-6">
                                {/* Statistics grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl">
                                    <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-wider">Total Pending Fines</span>
                                    <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">Rs {adminDashboardStats.totalPendingFines}</div>
                                  </div>
                                  <div className="p-5 bg-orange-50 border border-orange-100 rounded-3xl">
                                    <span className="block text-[9px] font-black text-orange-800 uppercase tracking-wider">Overdue Hardware Handouts</span>
                                    <div className="text-xl sm:text-2xl font-black text-orange-950 mt-1">{adminDashboardStats.overdueList?.length}</div>
                                  </div>
                                  <div className="p-5 bg-red-50 border border-red-100 rounded-3xl">
                                    <span className="block text-[9px] font-black text-red-800 uppercase tracking-wider">Open Damage/Loss cases</span>
                                    <div className="text-xl sm:text-2xl font-black text-red-950 mt-1">{adminDmgCases.length}</div>
                                  </div>
                                </div>

                                {/* Usage statistics list */}
                                <div className="space-y-3">
                                  <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Sensor Usage Analytics</h4>
                                  <div className="bg-white border border-zinc-200 rounded-3xl p-5">
                                    <div className="grid grid-cols-4 text-[9px] font-black text-zinc-400 uppercase tracking-wider border-b pb-2 mb-2">
                                      <span>Sensor Name</span>
                                      <span>Category</span>
                                      <span>Department</span>
                                      <span className="text-right">Request Count</span>
                                    </div>
                                    {adminDashboardStats.populatedStats?.length === 0 ? (
                                      <div className="text-center py-4 text-xs text-zinc-400">No request statistics recorded yet.</div>
                                    ) : (
                                      adminDashboardStats.populatedStats?.map((statItem: any, idx: number) => (
                                        <div key={idx} className="grid grid-cols-4 text-xs text-zinc-700 font-semibold py-2 border-b last:border-b-0">
                                          <span className="capitalize text-zinc-900">{statItem.sensorName}</span>
                                          <span>{statItem.type}</span>
                                          <span>{statItem.department}</span>
                                          <span className="text-right text-zinc-950 font-bold">{statItem.requestCount}</span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* M8: Lost & Found */}
                        {activeModule === "lostfound" && (
                          <div className="space-y-6">
                            <h3 className="text-2xl font-black text-zinc-900">Lost & Found</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <form onSubmit={handleReportLostFound} className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                                <h4 className="font-extrabold text-sm text-zinc-900">Report Item</h4>
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Item Title</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder=" Titan Watch, Calculator..."
                                    value={lfTitle}
                                    onChange={(e) => setLfTitle(e.target.value)}
                                    className="block w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs text-black bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Type</label>
                                  <select
                                    value={lfType}
                                    onChange={(e) => setLfType(e.target.value)}
                                    className="block w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs text-black bg-white"
                                  >
                                    <option value="lost">Lost</option>
                                    <option value="found">Found</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Description</label>
                                  <textarea
                                    value={lfDesc}
                                    onChange={(e) => setLfDesc(e.target.value)}
                                    rows={2}
                                    className="block w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs text-black bg-white"
                                  ></textarea>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Location</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Block A Cafeteria"
                                    value={lfLocation}
                                    onChange={(e) => setLfLocation(e.target.value)}
                                    className="block w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs text-black bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Contact Info</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Phone/Email"
                                    value={lfContact}
                                    onChange={(e) => setLfContact(e.target.value)}
                                    className="block w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs text-black bg-white"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold"
                                >
                                  Submit Report
                                </button>
                              </form>

                              <div className="space-y-3">
                                <h4 className="font-extrabold text-sm text-zinc-900">Items Wall</h4>
                                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                                  {lostFoundItems.map((item) => (
                                    <div key={item._id} className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl flex flex-col justify-between space-y-2">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h5 className="font-bold text-zinc-900 text-sm leading-none">{item.title}</h5>
                                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                                            item.type === "lost" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                                          }`}>
                                            {item.type}
                                          </span>
                                        </div>
                                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                          item.status === "claimed" ? "bg-zinc-200 text-zinc-500" : "bg-orange-100 text-orange-800"
                                        }`}>
                                          {item.status}
                                        </span>
                                      </div>
                                      <p className="text-xs text-zinc-500">{item.description}</p>
                                      <div className="text-[10px] text-zinc-400 border-t pt-1 space-y-0.5">
                                        <div>📍 Location: <strong>{item.location}</strong></div>
                                        <div>📞 Contact: <strong>{item.contact}</strong></div>
                                      </div>
                                      {item.status === "open" && (
                                        <button
                                          onClick={() => handleClaimItem(item._id)}
                                          className="w-full py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                        >
                                          Mark Claimed
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  )}


              {/* 3. Faculty Dashboard */}
              {(userRole === "faculty" || userRole === "admin") && (
                <div className="space-y-8">
                  {/* Menu */}
                  <div className="flex bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden shadow-inner p-1 gap-1 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("events")}
                      className={`px-4 py-2.5 rounded-lg text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "events" ? "bg-zinc-950 text-white shadow" : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      Manage Events
                    </button>
                    <button
                      onClick={() => setActiveTab("activities")}
                      className={`px-4 py-2.5 rounded-lg text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "activities" ? "bg-zinc-950 text-white shadow" : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      Verify Achievements ({pendingActivities.length})
                    </button>
                    <button
                      onClick={() => { fetchSensorsData(); loadAllSensorsModuleData(); setActiveModule("sensors"); }}
                      className="px-4 py-2.5 rounded-lg text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer text-zinc-600 hover:text-zinc-900 whitespace-nowrap"
                    >
                      🔌 Sensor Issuing
                    </button>
                    <button
                      onClick={() => { fetchJobs(); setActiveModule("placements"); }}
                      className="px-4 py-2.5 rounded-lg text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer text-zinc-600 hover:text-zinc-900 whitespace-nowrap"
                    >
                      💼 Placements Desk
                    </button>
                  </div>

                  {/* TAB: Events */}
                  {activeTab === "events" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Form to create event */}
                      <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 self-start space-y-4">
                        <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-200 pb-2 mb-3">Create Event</h3>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-600">Event Title *</label>
                            <input
                              type="text"
                              required
                              value={eventTitle}
                              onChange={(e) => setEventTitle(e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-600">Description</label>
                            <textarea
                              value={eventDesc}
                              onChange={(e) => setEventDesc(e.target.value)}
                              rows={2}
                              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black bg-white"
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-600">Venue *</label>
                            <input
                              type="text"
                              required
                              value={eventVenue}
                              onChange={(e) => setEventVenue(e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-600">Event Date *</label>
                            <input
                              type="date"
                              required
                              value={eventDate}
                              onChange={(e) => setEventDate(e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-600">Deadline *</label>
                            <input
                              type="date"
                              required
                              value={eventDeadline}
                              onChange={(e) => setEventDeadline(e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black bg-white"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold shadow-md cursor-pointer"
                          >
                            Publish Event
                          </button>
                        </form>
                      </div>

                      {/* Events list */}
                      <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-lg font-bold text-zinc-900 pb-2 border-b border-zinc-100">Published Campus Events</h3>
                        {events.length === 0 ? (
                          <p className="text-zinc-500 italic text-sm">No campus events published yet.</p>
                        ) : (
                          <div className="space-y-4">
                            {events.map((event) => (
                              <div key={event._id} className="border border-zinc-150 rounded-2xl p-5 bg-white shadow-sm">
                                <h4 className="font-bold text-zinc-950 text-base leading-tight">{event.title}</h4>
                                <p className="text-xs text-zinc-500 mt-2">{event.description}</p>
                                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-zinc-50 text-[11px] text-zinc-400">
                                  <span>📍 Venue: <strong className="text-zinc-600">{event.venue}</strong></span>
                                  <span>📅 Date: <strong className="text-zinc-600">{formatDate(event.date)}</strong></span>
                                  <span>👥 Registered: <strong className="text-zinc-600">{event.registeredParticipants?.length || 0}</strong></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB: Verify Achievements */}
                  {activeTab === "activities" && (
                    <div className="space-y-8">
                      {/* Shortlist & Search Candidates */}
                      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-sm text-zinc-900 uppercase">Shortlist & Search Candidates</h4>
                          <span className="text-[10px] text-zinc-400 font-bold">Shortlist co-curricular performance</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase">Department / Branch</label>
                            <input
                              type="text"
                              placeholder="e.g. CS, IT"
                              onChange={(e) => fetchFacultyDashboardData(e.target.value, "")}
                              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase">Graduation Year</label>
                            <input
                              type="number"
                              placeholder="e.g. 2026"
                              onChange={(e) => fetchFacultyDashboardData("", e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs bg-white text-black"
                            />
                          </div>
                        </div>

                        {/* Shortlisted student profiles */}
                        <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                          {facultyDashboardStudents.length === 0 ? (
                            <p className="text-xs text-zinc-400">No students matching criteria.</p>
                          ) : (
                            facultyDashboardStudents.map((stud, idx) => (
                              <div key={idx} className="p-3 bg-white border border-zinc-150 rounded-2xl flex justify-between items-center text-xs">
                                <div>
                                  <div className="font-bold text-zinc-900">{stud.name}</div>
                                  <div className="text-[9px] text-zinc-400 uppercase font-semibold">{stud.branch} · Roll: {stud.rollNumber}</div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="font-black text-zinc-800">{stud.totalPoints} pts</span>
                                  <button
                                    onClick={() => fetchPublicProfileView(stud._id)}
                                    className="py-1 px-3 bg-zinc-950 text-white rounded-lg text-[10px] font-bold hover:bg-zinc-800"
                                  >
                                    View Profile
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Co-curricular Validation Queue */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-extrabold text-zinc-900 border-b pb-2 uppercase tracking-wider">Pending Co-curricular Validation Queue</h3>
                        {facultyDashboardPendingAch.length === 0 ? (
                          <p className="text-zinc-500 italic text-xs">No pending co-curricular validation requests in queue.</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {facultyDashboardPendingAch.map((ach) => (
                              <div key={ach._id} className="border border-zinc-150 rounded-2xl p-5 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-zinc-950 text-sm">{ach.title}</h4>
                                    <span className="bg-orange-100 text-orange-800 text-[9px] uppercase font-black px-2 py-0.5 rounded-full">
                                      {ach.level} · {ach.category}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-zinc-400">Student: <strong>{ach.studentId?.name || "Unknown"}</strong> ({ach.studentId?.branch})</p>
                                  <p className="text-xs text-zinc-600 leading-normal">{ach.description}</p>
                                  {ach.proofUrl && (
                                    <a 
                                      href={ach.proofUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="inline-block text-[10px] text-orange-600 hover:underline font-bold"
                                    >
                                      📄 View Uploaded Proof File
                                    </a>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleVerifyAchievementAction(ach._id, "verified")}
                                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                                  >
                                    Approve Verification
                                  </button>
                                  <button
                                    onClick={() => handleVerifyAchievementAction(ach._id, "rejected")}
                                    className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* IPS STUDENT PUBLIC PROFILE OVERLAY MODAL */}
      {isPublicProfileOpen && publicProfileData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8">
          <div 
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm cursor-pointer"
            onClick={() => {
              setIsPublicProfileOpen(false);
              setPublicProfileData(null);
            }}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-zinc-200/50 shadow-2xl p-6 sm:p-8 z-10 max-h-[85vh] overflow-y-auto space-y-6 text-zinc-950 font-sans">
            <button
              onClick={() => {
                setIsPublicProfileOpen(false);
                setPublicProfileData(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 text-lg cursor-pointer font-bold"
            >
              ✕
            </button>

            {/* Profile Header Block */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-2xl font-black shadow-inner overflow-hidden select-none">
                  {publicProfileData.profile.photoUrl ? (
                    <img src={publicProfileData.profile.photoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <span>{publicProfileData.profile.name[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                    {publicProfileData.profile.name}
                    {publicProfileData.rank === 1 && (
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black uppercase rounded-lg">
                        👑 Student of the Year
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-500 font-semibold uppercase">{publicProfileData.profile.branch} · Semester {publicProfileData.profile.semester}</p>
                  <p className="text-[10px] text-zinc-400">Class of {publicProfileData.profile.graduationYear} · Roll: {publicProfileData.profile.rollNumber}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleToggleFollow(publicProfileData.profile._id)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                    publicProfileData.isFollowing
                      ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {publicProfileData.isFollowing ? "✓ Following" : "Follow"}
                </button>
                <div className="text-[10px] text-zinc-500 text-center font-bold">
                  👥 Followers: {publicProfileData.followersCount} | Following: {publicProfileData.followingCount}
                </div>
              </div>
            </div>

            {/* Talent tags & Rank summary */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border text-xs">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Leaderboard Position</span>
                <div className="text-lg font-black text-zinc-800 mt-1">🏆 Rank #{publicProfileData.rank}</div>
                <div className="text-[10px] text-zinc-500 font-semibold">{publicProfileData.profile.totalPoints} verified points</div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Talent Badges</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(publicProfileData.profile.talentTags || []).map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[9px] font-extrabold rounded">
                      {tag}
                    </span>
                  ))}
                  {(!publicProfileData.profile.talentTags || publicProfileData.profile.talentTags.length === 0) && (
                    <span className="text-[10px] text-zinc-400">None unlocked</span>
                  )}
                </div>
              </div>
            </div>

            {/* Short Bio */}
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-1">About</span>
              <p className="text-xs text-zinc-700 leading-relaxed italic">"{publicProfileData.profile.bio || 'No bio summary added.'}"</p>
            </div>

            {/* Skills & Endorsements */}
            <div className="border-t pt-4">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Skills & Endorsements</span>
              <div className="flex flex-wrap gap-2">
                {(publicProfileData.profile.skills || []).map((skill: string, idx: number) => {
                  const endCount = publicProfileData.endorsements.filter((e: any) => e.skill.toLowerCase() === skill.toLowerCase()).length;
                  return (
                    <div key={idx} className="flex items-center bg-zinc-50 border rounded-xl p-1.5 gap-2 text-xs">
                      <span className="font-bold text-zinc-800">{skill}</span>
                      <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-1.5 py-0.5 rounded-lg">{endCount}</span>
                      <button
                        onClick={() => handleEndorseSkill(publicProfileData.profile.user?._id, skill)}
                        className="text-[10px] font-black text-orange-600 hover:text-orange-700 cursor-pointer"
                      >
                        + Endorse
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Projects */}
            <div className="border-t pt-4">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Projects Portfolio</span>
              <div className="space-y-3">
                {(publicProfileData.profile.projects || []).map((p: any, idx: number) => (
                  <div key={idx} className="p-3 bg-zinc-50 border rounded-2xl text-xs space-y-1">
                    <h5 className="font-bold text-zinc-900">{p.title}</h5>
                    <p className="text-[10px] text-zinc-500">Tech: {p.techStack} | Link: {p.link}</p>
                    <p className="text-zinc-600 mt-1 leading-normal">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Achievements Timeline */}
            <div className="border-t pt-4">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Verified Campus Accomplishments</span>
              <div className="space-y-2">
                {publicProfileData.achievements.map((ach: any, idx: number) => (
                  <div key={idx} className="p-3 bg-orange-50/50 border border-orange-100 rounded-2xl text-xs space-y-1 flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-zinc-900">{ach.title}</h5>
                      <p className="text-zinc-600">{ach.description}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black uppercase rounded-lg whitespace-nowrap">
                      {ach.level} Level
                    </span>
                  </div>
                ))}
                {publicProfileData.achievements.length === 0 && (
                  <p className="text-[11px] text-zinc-400 italic">No verified co-curricular achievements posted yet.</p>
                )}
              </div>
            </div>

            {/* Faculty Recommendations Section */}
            <div className="border-t pt-4 space-y-3">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">Faculty Recommendations</span>
              <div className="space-y-2">
                {publicProfileData.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="p-3 bg-zinc-50 border rounded-2xl text-xs space-y-1">
                    <p className="text-zinc-700 italic font-semibold">"{rec.text}"</p>
                    <span className="text-[10px] text-zinc-500 font-bold block text-right">— {rec.facultyId?.email}</span>
                  </div>
                ))}
                {publicProfileData.recommendations.length === 0 && (
                  <p className="text-[11px] text-zinc-400 italic">No recommendations left yet.</p>
                )}
              </div>

              {/* Add Faculty Recommendation Letter */}
              {((userRole as any) === "faculty" || (userRole as any) === "admin") && (
                <div className="space-y-2 pt-2 border-t border-dashed">
                  <textarea
                    value={facultyRecommendationText}
                    onChange={(e) => setFacultyRecommendationText(e.target.value)}
                    placeholder="Leave a co-curricular recommendation or placement feedback note..."
                    rows={2}
                    className="block w-full px-3 py-2 border rounded-xl text-xs bg-white text-black"
                  />
                  <button
                    onClick={() => handleAddFacultyRecommendation(publicProfileData.profile._id)}
                    className="w-full py-2 bg-zinc-950 text-white text-xs font-bold rounded-xl hover:bg-zinc-800"
                  >
                    Post Recommendation Letter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PORTAL AUTH MODAL (Popup Overlay) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Blur background */}
          <div
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsAuthModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-zinc-200/50 shadow-2xl p-6 sm:p-8 z-10 animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 text-lg cursor-pointer"
              aria-label="Close modal"
            >
              &#10005;
            </button>

            <h2 className="text-2xl font-black text-zinc-950 text-center mb-6">
              {isLoginView ? "Sign In to Trellis" : "Create Account"}
            </h2>

            {authError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs">
                {authError}
              </div>
            )}
            {authMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-xs">
                {authMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {isLoginView && authLoginRole && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center">
                  Role: {authLoginRole}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl shadow-sm text-black bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl shadow-sm text-black bg-white text-sm"
                />
              </div>

              {isLoginView ? (
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-md cursor-pointer"
                >
                  Sign In
                </button>
              ) : (
                <div className="flex gap-4 pt-1">
                  <button
                    onClick={(e) => handleRegister(e, "student")}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    Register Student
                  </button>
                  <button
                    onClick={(e) => handleRegister(e, "faculty")}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-zinc-800 bg-zinc-150 hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    Register Faculty
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center pt-4 border-t border-zinc-100">
              <button
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setAuthError("");
                  setAuthMessage("");
                }}
                className="text-xs font-semibold text-zinc-500 hover:text-orange-500 underline cursor-pointer"
              >
                {isLoginView ? "Need an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
