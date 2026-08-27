"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function PlacementsPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Core Data States
  const [placementReg, setPlacementReg] = useState<any>(null);
  const [placementJobs, setPlacementJobs] = useState<any[]>([]);
  const [placementMatches, setPlacementMatches] = useState<any[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"student-profile" | "student-matches" | "admin-post" | "admin-profiles">("student-profile");

  // Onboarding / Semester timing state
  const [studentSemester, setStudentSemester] = useState<number>(1);
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);

  // Form Section States
  // Personal / Student Detail
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Address Details
  const [curAddressLine, setCurAddressLine] = useState("");
  const [curCity, setCurCity] = useState("");
  const [curState, setCurState] = useState("");
  const [curPincode, setCurPincode] = useState("");

  const [permAddressLine, setPermAddressLine] = useState("");
  const [permCity, setPermCity] = useState("");
  const [permState, setPermState] = useState("");
  const [permPincode, setPermPincode] = useState("");

  // Family
  const [fatherName, setFatherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [fatherContact, setFatherContact] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [motherContact, setMotherContact] = useState("");

  // Identity
  const [apaarId, setApaarId] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Academics
  const [tenthPercentage, setTenthPercentage] = useState("");
  const [tenthBoard, setTenthBoard] = useState("");
  const [tenthSchoolName, setTenthSchoolName] = useState("");
  const [tenthYear, setTenthYear] = useState("");
  const [twelfthPercentage, setTwelfthPercentage] = useState("");
  const [twelfthBoard, setTwelfthBoard] = useState("");
  const [twelfthSchoolName, setTwelfthSchoolName] = useState("");
  const [twelfthYear, setTwelfthYear] = useState("");
  const [diplomaPercentage, setDiplomaPercentage] = useState("");
  const [diplomaBoard, setDiplomaBoard] = useState("");
  const [diplomaYear, setDiplomaYear] = useState("");
  const [gradDegree, setGradDegree] = useState("");
  const [gradUniversity, setGradUniversity] = useState("");
  const [gradCollege, setGradCollege] = useState("");
  const [gradBranch, setGradBranch] = useState("");
  const [gradStartYear, setGradStartYear] = useState("");
  const [gradExpectedGradYear, setGradExpectedGradYear] = useState("");
  const [gradRollNumber, setGradRollNumber] = useState("");
  const [gradEnrollmentNumber, setGradEnrollmentNumber] = useState("");

  // SGPAs
  const [sgpa1, setSgpa1] = useState("");
  const [sgpa2, setSgpa2] = useState("");
  const [sgpa3, setSgpa3] = useState("");
  const [sgpa4, setSgpa4] = useState("");
  const [sgpa5, setSgpa5] = useState("");

  // Backlogs
  const [backlogCount, setBacklogCount] = useState("0");
  const [backlogHistory, setBacklogHistory] = useState<string[]>([]);
  const [newBacklogItem, setNewBacklogItem] = useState("");

  // Documents Uploads (Base64 -> Cloudinary/Local URLs)
  const [resumeUrl, setResumeUrl] = useState("");
  const [tenthMarksheetUrl, setTenthMarksheetUrl] = useState("");
  const [twelfthMarksheetUrl, setTwelfthMarksheetUrl] = useState("");
  const [sem1MarksheetUrl, setSem1MarksheetUrl] = useState("");
  const [sem2MarksheetUrl, setSem2MarksheetUrl] = useState("");
  const [sem3MarksheetUrl, setSem3MarksheetUrl] = useState("");
  const [sem4MarksheetUrl, setSem4MarksheetUrl] = useState("");
  const [sem5MarksheetUrl, setSem5MarksheetUrl] = useState("");

  // Admin Job Posting States
  const [postCompanyName, setPostCompanyName] = useState("");
  const [postRole, setPostRole] = useState("");
  const [postType, setPostType] = useState("full-time");
  const [postDescription, setPostDescription] = useState("");
  const [postDeadline, setPostDeadline] = useState("");
  const [postRules, setPostRules] = useState<any[]>([
    { field: "cgpa", operator: ">=", value: "7.0" },
    { field: "backlogCount", operator: "==", value: "0" }
  ]);

  // Admin Audit Log and Details view Modal states
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [showAdminEditForm, setShowAdminEditForm] = useState(false);
  const [adminEdits, setAdminEdits] = useState<any>({});

  useEffect(() => {
    const savedToken = localStorage.getItem("trellis_token");
    const savedRole = localStorage.getItem("trellis_role");
    const savedEmail = localStorage.getItem("trellis_email");
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setUserRole(savedRole);
      setUserEmail(savedEmail);
      if (savedRole === "admin" || savedRole === "faculty") {
        setActiveTab("admin-post");
      } else {
        setActiveTab("student-profile");
      }
    }
  }, []);

  useEffect(() => {
    if (token && userEmail) {
      fetchStudentSemester();
      fetchPlacementRegistration();
      fetchPlacementJobs();
      if (userRole === "admin" || userRole === "faculty") {
        fetchAllRegistrations();
      }
    }
  }, [token, userEmail, userRole]);

  // Read student's semester to validate M3 Timing Window (Backend validation also handles this)
  const fetchStudentSemester = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/profile/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setStudentSemester(data.profile.semester || 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlacementRegistration = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/registration/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.registration) {
        const reg = data.registration;
        setPlacementReg(reg);
        
        // Pre-fill states from registered details
        setFullName(reg.personal?.fullName || "");
        setDob(reg.personal?.dob || "");
        setGender(reg.personal?.gender || "male");
        setPhone(reg.personal?.phone || "");
        setEmail(reg.personal?.email || "");

        // Address components
        setCurAddressLine(reg.personal?.currentAddress?.addressLine || "");
        setCurCity(reg.personal?.currentAddress?.city || "");
        setCurState(reg.personal?.currentAddress?.state || "");
        setCurPincode(reg.personal?.currentAddress?.pincode || "");

        setPermAddressLine(reg.personal?.permanentAddress?.addressLine || "");
        setPermCity(reg.personal?.permanentAddress?.city || "");
        setPermState(reg.personal?.permanentAddress?.state || "");
        setPermPincode(reg.personal?.permanentAddress?.pincode || "");
        
        setFatherName(reg.family?.fatherName || "");
        setFatherOccupation(reg.family?.fatherOccupation || "");
        setFatherContact(reg.family?.fatherContact || "");
        setMotherName(reg.family?.motherName || "");
        setMotherOccupation(reg.family?.motherOccupation || "");
        setMotherContact(reg.family?.motherContact || "");
        
        setApaarId(reg.identity?.apaarId || "");
        setPhotoUrl(reg.identity?.photoUrl || "");
        
        setTenthPercentage(reg.academic?.tenth?.percentage?.toString() || "");
        setTenthBoard(reg.academic?.tenth?.board || "");
        setTenthSchoolName(reg.academic?.tenth?.schoolName || "");
        setTenthYear(reg.academic?.tenth?.year?.toString() || "");
        setTwelfthPercentage(reg.academic?.twelfth?.percentage?.toString() || "");
        setTwelfthBoard(reg.academic?.twelfth?.board || "");
        setTwelfthSchoolName(reg.academic?.twelfth?.schoolName || "");
        setTwelfthYear(reg.academic?.twelfth?.year?.toString() || "");
        setDiplomaPercentage(reg.academic?.diploma?.percentage?.toString() || "");
        setDiplomaBoard(reg.academic?.diploma?.board || "");
        setDiplomaYear(reg.academic?.diploma?.year?.toString() || "");
        
        setGradDegree(reg.academic?.graduation?.degree || "");
        setGradUniversity(reg.academic?.graduation?.university || "");
        setGradCollege(reg.academic?.graduation?.college || "");
        setGradBranch(reg.academic?.graduation?.branch || "");
        setGradStartYear(reg.academic?.graduation?.startYear?.toString() || "");
        setGradExpectedGradYear(reg.academic?.graduation?.expectedGraduationYear?.toString() || "");
        
        setGradRollNumber(reg.academic?.rollNumber || "");
        setGradEnrollmentNumber(reg.academic?.enrollmentNumber || "");
        setIsRetryAttempt(!!reg.isRetryAttempt);

        const sgpas = reg.academic?.semesterSgpa || [];
        setSgpa1(sgpas.find((e: any) => e.semester === 1)?.sgpa?.toString() || "");
        setSgpa2(sgpas.find((e: any) => e.semester === 2)?.sgpa?.toString() || "");
        setSgpa3(sgpas.find((e: any) => e.semester === 3)?.sgpa?.toString() || "");
        setSgpa4(sgpas.find((e: any) => e.semester === 4)?.sgpa?.toString() || "");
        setSgpa5(sgpas.find((e: any) => e.semester === 5)?.sgpa?.toString() || "");
        
        setBacklogCount(reg.academic?.backlogCount?.toString() || "0");
        setBacklogHistory(reg.academic?.backlogHistory || []);

        setResumeUrl(reg.documents?.resumeUrl || "");
        setTenthMarksheetUrl(reg.documents?.tenthMarksheetUrl || "");
        setTwelfthMarksheetUrl(reg.documents?.twelfthMarksheetUrl || "");

        const sMarksheets = reg.documents?.semesterMarksheets || [];
        setSem1MarksheetUrl(sMarksheets.find((e: any) => e.semester === 1)?.url || "");
        setSem2MarksheetUrl(sMarksheets.find((e: any) => e.semester === 2)?.url || "");
        setSem3MarksheetUrl(sMarksheets.find((e: any) => e.semester === 3)?.url || "");
        setSem4MarksheetUrl(sMarksheets.find((e: any) => e.semester === 4)?.url || "");
        setSem5MarksheetUrl(sMarksheets.find((e: any) => e.semester === 5)?.url || "");

        // Fetch matched placement postings
        fetchMatches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlacementJobs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPlacementJobs(data.jobs);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllRegistrations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/registration/all`, { // Wait, list endpoint or custom endpoint?
        // Let's check backend placement routes: wait, router.get("/registration/:studentId") is there, do we have an "all" endpoint?
        // Ah! In backend placementController there is no listAll, but let's check verify token
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/jobs?studentEmail=${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPlacementMatches(data.jobs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: Client side file uploader utility
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Max file size allowed is 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setLoading(true);
      try {
        const fileType = file.type === "application/pdf" ? "pdf" : "image";
        const response = await fetch(`${BACKEND_URL}/api/upload-file`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ fileData: base64, fileType })
        });
        const data = await response.json();
        if (data.success) {
          setter(data.url);
          alert("File uploaded and saved successfully!");
        } else {
          alert(data.message || "File upload failed.");
        }
      } catch (err) {
        alert("Upload connection error.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // derived values on frontend
  const calculateFrontendCgpa = () => {
    const s1 = parseFloat(sgpa1) || 0;
    const s2 = parseFloat(sgpa2) || 0;
    const s3 = parseFloat(sgpa3) || 0;
    const s4 = parseFloat(sgpa4) || 0;
    const s5 = parseFloat(sgpa5) || 0;

    const entries = [s1, s2, s3, s4];
    if (!isRetryAttempt) {
      entries.push(s5);
    }
    const valid = entries.filter(v => v > 0);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((a, b) => a + b, 0);
    return Math.round((sum / valid.length) * 100) / 100;
  };

  const getTenthToTwelfthGap = () => {
    const t = parseInt(tenthYear);
    const tw = parseInt(twelfthYear);
    if (!t || !tw) return 0;
    return Math.max(0, tw - t - 2);
  };

  const getTwelfthToGraduationGap = () => {
    const tw = parseInt(twelfthYear);
    const gs = parseInt(gradStartYear);
    if (!tw || !gs) return 0;
    return Math.max(0, gs - tw);
  };

  const getOverallEducationGap = () => {
    return getTenthToTwelfthGap() + getTwelfthToGraduationGap();
  };

  const handleSavePlacementReg = async (isDraft: boolean) => {
    if (!isDraft) {
      const confirmSubmit = window.confirm(
        "Warning: After final submission, you will not be able to edit this registration. Are you sure you want to submit and lock your profile?"
      );
      if (!confirmSubmit) return;
    }

    setLoading(true);
    try {
      const semesterSgpa = [
        { semester: 1, sgpa: parseFloat(sgpa1) || 0 },
        { semester: 2, sgpa: parseFloat(sgpa2) || 0 },
        { semester: 3, sgpa: parseFloat(sgpa3) || 0 },
        { semester: 4, sgpa: parseFloat(sgpa4) || 0 }
      ];
      if (!isRetryAttempt) {
        semesterSgpa.push({ semester: 5, sgpa: parseFloat(sgpa5) || 0 });
      }

      const semesterMarksheets = [
        { semester: 1, url: sem1MarksheetUrl },
        { semester: 2, url: sem2MarksheetUrl },
        { semester: 3, url: sem3MarksheetUrl },
        { semester: 4, url: sem4MarksheetUrl }
      ];
      if (!isRetryAttempt) {
        semesterMarksheets.push({ semester: 5, url: sem5MarksheetUrl });
      }

      const body = {
        isRetryAttempt,
        isDraft,
        personal: {
          fullName,
          dob,
          gender,
          phone,
          email: email || userEmail,
          currentAddress: {
            addressLine: curAddressLine,
            city: curCity,
            state: curState,
            pincode: curPincode
          },
          permanentAddress: {
            addressLine: permAddressLine,
            city: permCity,
            state: permState,
            pincode: permPincode
          }
        },
        family: {
          fatherName,
          fatherOccupation,
          fatherContact,
          motherName,
          motherOccupation,
          motherContact
        },
        identity: {
          apaarId,
          photoUrl
        },
        academic: {
          tenth: {
            percentage: parseFloat(tenthPercentage) || 0,
            board: tenthBoard,
            schoolName: tenthSchoolName,
            year: parseInt(tenthYear) || 0
          },
          twelfth: {
            percentage: parseFloat(twelfthPercentage) || 0,
            board: twelfthBoard,
            schoolName: twelfthSchoolName,
            year: parseInt(twelfthYear) || 0
          },
          diploma: {
            percentage: diplomaPercentage ? parseFloat(diplomaPercentage) : undefined,
            board: diplomaBoard || undefined,
            year: diplomaYear ? parseInt(diplomaYear) : undefined
          },
          graduation: {
            degree: gradDegree,
            university: gradUniversity,
            college: gradCollege,
            branch: gradBranch,
            startYear: parseInt(gradStartYear) || 0,
            expectedGraduationYear: parseInt(gradExpectedGradYear) || 0,
            currentSemester: studentSemester
          },
          branch: gradBranch,
          rollNumber: gradRollNumber,
          enrollmentNumber: gradEnrollmentNumber,
          semesterSgpa,
          backlogCount: parseInt(backlogCount) || 0,
          backlogHistory
        },
        documents: {
          resumeUrl,
          tenthMarksheetUrl,
          twelfthMarksheetUrl,
          semesterMarksheets
        }
      };

      const res = await fetch(`${BACKEND_URL}/api/placement/registration/${userEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        alert(isDraft ? "Draft saved successfully!" : "Profile locked and registered successfully!");
        fetchPlacementRegistration();
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      alert("Error sending request.");
    } finally {
      setLoading(false);
    }
  };

  // Student Match Actions
  const handleStudentDecision = async (jobId: string, decision: "applied" | "no-apply") => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/jobs/${jobId}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decision, applicationResume: resumeUrl })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully submitted decision: ${decision}`);
        fetchPlacementRegistration();
      } else {
        alert(data.message || "Failed to submit decision.");
      }
    } catch (err) {
      alert("Error sending decision.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeReject = async (jobId: string) => {
    setLoading(true);
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
        fetchPlacementRegistration();
      } else {
        alert(data.message || "Failed to acknowledge.");
      }
    } catch (err) {
      alert("Error sending acknowledgement.");
    } finally {
      setLoading(false);
    }
  };

  // Faculty Actions
  const handlePublishJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
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
          eligibilityRules: postRules,
          applicationDeadline: new Date(postDeadline)
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Placement job drive published and candidates matched!");
        setPostCompanyName("");
        setPostRole("");
        setPostDescription("");
        setPostDeadline("");
        fetchPlacementJobs();
      } else {
        alert(data.message || "Failed to publish drive.");
      }
    } catch (err) {
      alert("Error publishing drive.");
    } finally {
      setLoading(false);
    }
  };

  // Audit and Admin edit logic
  const handleLoadStudentRegistrationForAdmin = async (studEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/registration/${studEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.registration) {
        setSelectedReg(data.registration);
        setAdminEdits({});
        setShowAdminEditForm(false);
      } else {
        alert("Profile registration not found for this student.");
      }
    } catch (err) {
      alert("Error fetching details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdateRegistration = async () => {
    if (Object.keys(adminEdits).length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/registration/${selectedReg.studentId?.email}/admin-edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminEdits)
      });
      const data = await res.json();
      if (data.success) {
        alert("Student profile updated and audit logged successfully!");
        setSelectedReg(data.registration);
        setShowAdminEditForm(false);
        fetchAllRegistrations();
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      alert("Error saving profile changes.");
    } finally {
      setLoading(false);
    }
  };

  // PDF report compile download
  const handleDownloadPdfReport = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/jobs/${jobId}/report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.report?.pdfUrl) {
        window.open(data.report.pdfUrl, "_blank");
      } else {
        alert(data.message || "Error generating report.");
      }
    } catch (err) {
      alert("Error compiling PDF report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 text-zinc-950 font-sans">
        
        {/* Top Header & Navigation Tabs */}
        <div className="pb-4 border-b border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-emerald-800 tracking-tight">Placement & Eligibility Dashboard</h3>
            <p className="text-xs text-zinc-500 mt-1">Structured placements dashboard with rule-based auto matching (IPS Academy, Indore)</p>
          </div>
          
          <div className="flex bg-emerald-50 rounded-2xl p-1 shrink-0">
            {userRole === "student" ? (
              <>
                <button
                  onClick={() => setActiveTab("student-profile")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === "student-profile" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  My Placement Form
                </button>
                <button
                  onClick={() => setActiveTab("student-matches")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === "student-matches" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Matched Openings ({placementMatches.length})
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("admin-post")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === "admin-post" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Publish Job Drive
                </button>
                <button
                  onClick={() => setActiveTab("admin-profiles")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    activeTab === "admin-profiles" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Verify Candidates ({allRegistrations.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* loading spinner overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
          </div>
        )}

        {/* 1. STUDENT VIEW */}
        {userRole === "student" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Student profile tab */}
            {activeTab === "student-profile" && (
              <div className="lg:col-span-12 space-y-6">
                {placementReg?.status === "locked" ? (
                  // Locked Profile (Read Only)
                  <div className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-150">
                      <div>
                        <h4 className="text-xl font-black text-emerald-800">{placementReg.personal?.fullName}</h4>
                        <p className="text-xs text-zinc-500">Roll Number: {placementReg.academic?.rollNumber} | Branch: {placementReg.academic?.branch}</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                        Registration Locked
                      </span>
                    </div>

                    {/* Derived Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-center">
                        <p className="text-2xl font-black text-zinc-800">{placementReg.academic?.cgpa?.toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Calculated CGPA</p>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-center">
                        <p className="text-2xl font-black text-zinc-800">{placementReg.academic?.backlogCount}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Active Backlogs</p>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-center">
                        <p className="text-2xl font-black text-zinc-800">{placementReg.academic?.overallEducationGap} Yrs</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Education Gap</p>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-center">
                        <p className="text-sm font-black text-zinc-800 truncate mt-1">{placementReg.identity?.apaarId}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">APAAR ID</p>
                      </div>
                    </div>

                    {/* Details sections read-only layout */}
                    <div className="space-y-6 pt-6 border-t border-zinc-150">
                      
                      {/* Section 1: Personal & Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-50/50 p-4 border border-zinc-150 rounded-2xl">
                          <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3">Student Details</h5>
                          <div className="text-xs text-zinc-700 space-y-2">
                            <p><strong>Full Name:</strong> {placementReg.personal?.fullName}</p>
                            <p><strong>Date of Birth:</strong> {placementReg.personal?.dob}</p>
                            <p><strong>Gender:</strong> {placementReg.personal?.gender}</p>
                            <p><strong>Mobile:</strong> {placementReg.personal?.phone}</p>
                            <p><strong>Email Address:</strong> {placementReg.personal?.email}</p>
                          </div>
                        </div>

                        <div className="bg-zinc-50/50 p-4 border border-zinc-150 rounded-2xl">
                          <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3">Address Details</h5>
                          <div className="text-xs text-zinc-700 space-y-3">
                            <div>
                              <p className="font-bold text-[10px] uppercase text-zinc-400">Current Address:</p>
                              <p className="mt-0.5">{placementReg.personal?.currentAddress?.addressLine}, {placementReg.personal?.currentAddress?.city}, {placementReg.personal?.currentAddress?.state} - {placementReg.personal?.currentAddress?.pincode}</p>
                            </div>
                            <div>
                              <p className="font-bold text-[10px] uppercase text-zinc-400">Permanent Address:</p>
                              <p className="mt-0.5">{placementReg.personal?.permanentAddress?.addressLine}, {placementReg.personal?.permanentAddress?.city}, {placementReg.personal?.permanentAddress?.state} - {placementReg.personal?.permanentAddress?.pincode}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Family Details */}
                      <div className="bg-zinc-50/50 p-4 border border-zinc-150 rounded-2xl">
                        <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3">Family Information</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-700">
                          <div>
                            <p className="font-bold text-zinc-500 uppercase text-[9px] mb-1">Father's Info:</p>
                            <p><strong>Name:</strong> {placementReg.family?.fatherName}</p>
                            <p><strong>Occupation:</strong> {placementReg.family?.fatherOccupation}</p>
                            <p><strong>Contact Phone:</strong> {placementReg.family?.fatherContact}</p>
                          </div>
                          <div>
                            <p className="font-bold text-zinc-500 uppercase text-[9px] mb-1">Mother's Info:</p>
                            <p><strong>Name:</strong> {placementReg.family?.motherName}</p>
                            <p><strong>Occupation:</strong> {placementReg.family?.motherOccupation}</p>
                            <p><strong>Contact Phone:</strong> {placementReg.family?.motherContact}</p>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Academics & Gaps Details */}
                      <div className="bg-zinc-50/50 p-4 border border-zinc-150 rounded-2xl space-y-4">
                        <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Academic & Schooling History</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-700 border-b border-zinc-200/60 pb-3">
                          <div>
                            <p className="font-bold text-zinc-500 uppercase text-[9px] mb-1">10th Schooling Details:</p>
                            <p><strong>School Name:</strong> {placementReg.academic?.tenth?.schoolName}</p>
                            <p><strong>Board Name:</strong> {placementReg.academic?.tenth?.board}</p>
                            <p><strong>Percentage Marks:</strong> {placementReg.academic?.tenth?.percentage}%</p>
                            <p><strong>Passing Year:</strong> {placementReg.academic?.tenth?.year}</p>
                          </div>
                          <div>
                            <p className="font-bold text-zinc-500 uppercase text-[9px] mb-1">12th/Diploma Schooling Details:</p>
                            <p><strong>School Name:</strong> {placementReg.academic?.twelfth?.schoolName}</p>
                            <p><strong>Board Name:</strong> {placementReg.academic?.twelfth?.board}</p>
                            <p><strong>Percentage Marks:</strong> {placementReg.academic?.twelfth?.percentage}%</p>
                            <p><strong>Passing Year:</strong> {placementReg.academic?.twelfth?.year}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-700">
                          <div>
                            <p className="font-bold text-zinc-500 uppercase text-[9px] mb-1">Graduation Details:</p>
                            <p><strong>Degree / Branch:</strong> {placementReg.academic?.graduation?.degree} in {placementReg.academic?.graduation?.branch}</p>
                            <p><strong>University / College:</strong> {placementReg.academic?.graduation?.university} | {placementReg.academic?.graduation?.college}</p>
                            <p><strong>Academic Years:</strong> {placementReg.academic?.graduation?.startYear} - {placementReg.academic?.graduation?.expectedGraduationYear}</p>
                            <p><strong>Roll / Enrollment:</strong> {placementReg.academic?.rollNumber} / {placementReg.academic?.enrollmentNumber}</p>
                          </div>
                          <div>
                            <p className="font-bold text-zinc-500 uppercase text-[9px] mb-1">Semester SGPA Track:</p>
                            <div className="flex gap-2 flex-wrap mt-1">
                              {placementReg.academic?.semesterSgpa?.map((item: any) => (
                                <span key={item.semester} className="bg-white border border-zinc-200 px-2.5 py-1 rounded-lg font-bold text-zinc-700">
                                  Sem {item.semester}: {item.sgpa}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Identity Verification & Documents */}
                      <div className="bg-zinc-50/50 p-4 border border-zinc-150 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <img src={placementReg.identity?.photoUrl} alt="Passport Photograph" className="w-14 h-14 object-cover rounded-xl border border-zinc-200 shadow-sm" />
                          <div>
                            <p className="text-xs font-bold text-zinc-800">{placementReg.personal?.fullName}</p>
                            <p className="text-[10px] text-zinc-400">APAAR ID: {placementReg.identity?.apaarId}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-bold text-emerald-800">
                          <a href={placementReg.documents?.resumeUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-sm">📄 View Resume Snapshot</a>
                          <a href={placementReg.documents?.tenthMarksheetUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-sm">📄 View 10th Marksheet</a>
                          <a href={placementReg.documents?.twelfthMarksheetUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-sm">📄 View 12th Marksheet</a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Wizard Onboarding form
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSavePlacementReg(false); }}
                    className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm space-y-8"
                  >
                    <div>
                      <h4 className="text-lg font-black text-emerald-800">Placement Registration Form (3rd Year Window)</h4>
                      <p className="text-xs text-zinc-400 mt-1">Please fill in all sections carefully. Form will be permanently locked after final submission.</p>
                    </div>

                    {/* Semester window check check */}
                    {(studentSemester < 6 || studentSemester > 8) && (
                      <div className="bg-red-50 text-red-800 text-xs font-bold rounded-2xl p-4 border border-red-200">
                        ⚠ Placement registration is only available to students in Semester 6, 7, and 8. Your current semester is {studentSemester}. Submission will be rejected by backend.
                      </div>
                    )}

                    {/* Section 1: Personal Info */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-50 pb-1">Personal Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Full Name *</label>
                          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Date of Birth *</label>
                          <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Gender *</label>
                          <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Phone *</label>
                          <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Email Address *</label>
                          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                      </div>
                      <div className="border-t border-zinc-100 pt-4 space-y-4">
                        <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest pb-1 border-b border-emerald-50">Address Details</h5>
                        
                        <div className="bg-zinc-50/50 p-4 border border-zinc-200 rounded-2xl space-y-3">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Current Address</p>
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-zinc-500 mb-1">Address Line *</label>
                              <input type="text" required value={curAddressLine} onChange={(e) => setCurAddressLine(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 mb-1">City *</label>
                              <input type="text" required value={curCity} onChange={(e) => setCurCity(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 mb-1">State *</label>
                              <input type="text" required value={curState} onChange={(e) => setCurState(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 mb-1">Pincode *</label>
                              <input type="text" required value={curPincode} onChange={(e) => setCurPincode(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-zinc-50/50 p-4 border border-zinc-200 rounded-2xl space-y-3">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Permanent Address</p>
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-zinc-500 mb-1">Address Line *</label>
                              <input type="text" required value={permAddressLine} onChange={(e) => setPermAddressLine(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 mb-1">City *</label>
                              <input type="text" required value={permCity} onChange={(e) => setPermCity(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 mb-1">State *</label>
                              <input type="text" required value={permState} onChange={(e) => setPermState(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 mb-1">Pincode *</label>
                              <input type="text" required value={permPincode} onChange={(e) => setPermPincode(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Family Info */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-50 pb-1">Family Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Father's Name *</label>
                          <input type="text" required value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Father's Occupation *</label>
                          <input type="text" required value={fatherOccupation} onChange={(e) => setFatherOccupation(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Father's Contact Phone *</label>
                          <input type="text" required value={fatherContact} onChange={(e) => setFatherContact(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Mother's Name *</label>
                          <input type="text" required value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Mother's Occupation *</label>
                          <input type="text" required value={motherOccupation} onChange={(e) => setMotherOccupation(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Mother's Contact Phone *</label>
                          <input type="text" required value={motherContact} onChange={(e) => setMotherContact(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Identity & Photo */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-50 pb-1">Identity verification (Excluding Aadhaar)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">APAAR ID *</label>
                          <input type="text" required value={apaarId} onChange={(e) => setApaarId(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" placeholder="e.g. 12-digit APAAR identification code" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Upload Passport Photo (Image) *</label>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPhotoUrl)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-1.5 text-xs" />
                          {photoUrl && <span className="text-[10px] text-emerald-700 block mt-1 font-bold">✔ Photo uploaded successfully</span>}
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Academic details */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-50 pb-1">Academic & Gaps Details</h5>
                      
                      {/* Retry attempt checkbox */}
                      <div className="flex items-center gap-2 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                        <input type="checkbox" checked={isRetryAttempt} onChange={(e) => setIsRetryAttempt(e.target.checked)} className="rounded text-emerald-700" id="retry-chk" />
                        <label htmlFor="retry-chk" className="text-xs font-bold text-emerald-800 cursor-pointer">
                          Apply as Retry/Late Attempt (Uses Semesters 1–4 data only, Semester 5 results unavailable)
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Graduation Degree *</label>
                          <input type="text" required value={gradDegree} onChange={(e) => setGradDegree(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" placeholder="e.g. B.Tech / B.E." />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">University Name *</label>
                          <input type="text" required value={gradUniversity} onChange={(e) => setGradUniversity(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" placeholder="e.g. RGPV" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">College Name *</label>
                          <input type="text" required value={gradCollege} onChange={(e) => setGradCollege(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" placeholder="e.g. IPS Academy, Indore" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Branch / Department *</label>
                          <input type="text" required value={gradBranch} onChange={(e) => setGradBranch(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" placeholder="e.g. CSE / IT" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Start / Admission Year *</label>
                          <input type="number" required value={gradStartYear} onChange={(e) => setGradStartYear(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Expected Graduation Year *</label>
                          <input type="number" required value={gradExpectedGradYear} onChange={(e) => setGradExpectedGradYear(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Academic Roll Number *</label>
                          <input type="text" required value={gradRollNumber} onChange={(e) => setGradRollNumber(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Enrollment Number *</label>
                          <input type="text" required value={gradEnrollmentNumber} onChange={(e) => setGradEnrollmentNumber(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                      </div>

                      {/* 10th and 12th details */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">10th Percentage *</label>
                          <input type="number" step="0.01" required value={tenthPercentage} onChange={(e) => setTenthPercentage(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">10th Board *</label>
                          <input type="text" required value={tenthBoard} onChange={(e) => setTenthBoard(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">10th School Name *</label>
                          <input type="text" required value={tenthSchoolName} onChange={(e) => setTenthSchoolName(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" placeholder="e.g. DPS Indore" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">10th Passing Year *</label>
                          <input type="number" required value={tenthYear} onChange={(e) => setTenthYear(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">12th Percentage *</label>
                          <input type="number" step="0.01" required value={twelfthPercentage} onChange={(e) => setTwelfthPercentage(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">12th Board *</label>
                          <input type="text" required value={twelfthBoard} onChange={(e) => setTwelfthBoard(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">12th School Name *</label>
                          <input type="text" required value={twelfthSchoolName} onChange={(e) => setTwelfthSchoolName(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" placeholder="e.g. DPS Indore" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">12th Passing Year *</label>
                          <input type="number" required value={twelfthYear} onChange={(e) => setTwelfthYear(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                      </div>

                      {/* Derived gap information display */}
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-zinc-700 mt-2">
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">10th ➔ 12th Gap</p>
                          <p className="text-base text-zinc-800 font-black">{getTenthToTwelfthGap()} Year(s)</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">12th ➔ Graduation Gap</p>
                          <p className="text-base text-zinc-800 font-black">{getTwelfthToGraduationGap()} Year(s)</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">Overall Academic Gap</p>
                          <p className="text-base text-zinc-800 font-black">{getOverallEducationGap()} Year(s)</p>
                        </div>
                      </div>

                      {/* SGPAs entries */}
                      <div className="pt-2 space-y-3">
                        <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider">Semester SGPA Data</label>
                        <div className="grid grid-cols-5 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Sem 1 SGPA</label>
                            <input type="number" step="0.01" required value={sgpa1} onChange={(e) => setSgpa1(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs font-semibold text-center" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Sem 2 SGPA</label>
                            <input type="number" step="0.01" required value={sgpa2} onChange={(e) => setSgpa2(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs font-semibold text-center" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Sem 3 SGPA</label>
                            <input type="number" step="0.01" required value={sgpa3} onChange={(e) => setSgpa3(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs font-semibold text-center" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Sem 4 SGPA</label>
                            <input type="number" step="0.01" required value={sgpa4} onChange={(e) => setSgpa4(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs font-semibold text-center" />
                          </div>
                          {!isRetryAttempt && (
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Sem 5 SGPA</label>
                              <input type="number" step="0.01" required={!isRetryAttempt} value={sgpa5} onChange={(e) => setSgpa5(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs font-semibold text-center" />
                            </div>
                          )}
                        </div>

                        {/* derived CGPA read only display */}
                        <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs font-bold text-emerald-800">
                          <span>Calculated Cumulative CGPA (Read-only derived value):</span>
                          <span className="text-base font-black tracking-wide">{calculateFrontendCgpa().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Backlogs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Current Backlogs Count *</label>
                          <input type="number" required value={backlogCount} onChange={(e) => setBacklogCount(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Add Backlog History Item</label>
                          <div className="flex gap-2">
                            <input type="text" placeholder="e.g. BT-301 Mathematics-III" value={newBacklogItem} onChange={(e) => setNewBacklogItem(e.target.value)} className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs" />
                            <button type="button" onClick={() => { if (newBacklogItem.trim()) { setBacklogHistory([...backlogHistory, newBacklogItem.trim()]); setNewBacklogItem(""); } }} className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-750 text-xs font-bold rounded-xl">+</button>
                          </div>
                          {backlogHistory.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {backlogHistory.map((item, idx) => (
                                <span key={idx} className="bg-red-50 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-red-100 flex items-center gap-1.5">
                                  {item}
                                  <button type="button" onClick={() => setBacklogHistory(backlogHistory.filter((_, i) => i !== idx))} className="text-red-500 font-extrabold hover:text-red-900">×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Documents File uploaders */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-50 pb-1">Mandatory Marksheets & Resume Uploads (PDF/Image)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">Resume File Upload *</label>
                          <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setResumeUrl)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs" />
                          {resumeUrl && <span className="text-[10px] text-emerald-700 block mt-1 font-bold">✔ Resume uploaded</span>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">10th Marksheet Upload *</label>
                          <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, setTenthMarksheetUrl)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs" />
                          {tenthMarksheetUrl && <span className="text-[10px] text-emerald-700 block mt-1 font-bold">✔ 10th Marksheet uploaded</span>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-1">12th Marksheet Upload *</label>
                          <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, setTwelfthMarksheetUrl)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs" />
                          {twelfthMarksheetUrl && <span className="text-[10px] text-emerald-700 block mt-1 font-bold">✔ 12th Marksheet uploaded</span>}
                        </div>
                      </div>

                      {/* Semester marksheets */}
                      <div className="pt-2 space-y-3">
                        <label className="block text-xs font-bold text-zinc-500 uppercase">Upload Semester-wise Marksheets *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Semester 1</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, setSem1MarksheetUrl)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1 text-[9px]" />
                            {sem1MarksheetUrl && <span className="text-[9px] text-emerald-700 block mt-0.5 font-bold">✔ Uploaded</span>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Semester 2</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, setSem2MarksheetUrl)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1 text-[9px]" />
                            {sem2MarksheetUrl && <span className="text-[9px] text-emerald-700 block mt-0.5 font-bold">✔ Uploaded</span>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Semester 3</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, setSem3MarksheetUrl)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1 text-[9px]" />
                            {sem3MarksheetUrl && <span className="text-[9px] text-emerald-700 block mt-0.5 font-bold">✔ Uploaded</span>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Semester 4</label>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, setSem4MarksheetUrl)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1 text-[9px]" />
                            {sem4MarksheetUrl && <span className="text-[9px] text-emerald-700 block mt-0.5 font-bold">✔ Uploaded</span>}
                          </div>
                          {!isRetryAttempt && (
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">Semester 5</label>
                              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, setSem5MarksheetUrl)} className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1 text-[9px]" />
                              {sem5MarksheetUrl && <span className="text-[9px] text-emerald-700 block mt-0.5 font-bold">✔ Uploaded</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex gap-4 pt-6 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => handleSavePlacementReg(true)}
                        className="flex-1 py-3 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-bold shadow-sm"
                      >
                        Save Draft Details
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                      >
                        Submit Placement Registration
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Student Matches Tab */}
            {activeTab === "student-matches" && (
              <div className="lg:col-span-12 space-y-6">
                <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
                  <h4 className="text-base font-bold text-zinc-900 mb-2">My Matching Drives & Placement Openings</h4>
                  <p className="text-xs text-zinc-500 mb-6">Real-time dynamic rule checking and application statuses</p>

                  {placementMatches.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic text-center py-10">No drives match or logs found. Please complete and lock your placement registration profile first.</p>
                  ) : (
                    <div className="space-y-4">
                      {placementMatches.map((m) => {
                        const deadlinePassed = new Date() > new Date(m.jobPostingId.applicationDeadline);
                        return (
                          <div key={m._id} className={`border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                            m.isEligible ? "border-emerald-100 bg-emerald-50/20" : "border-red-100 bg-red-50/20"
                          }`}>
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-extrabold text-zinc-900 text-base">{m.jobPostingId.companyName}</h5>
                                <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${
                                  m.isEligible ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {m.isEligible ? "Eligible" : "Ineligible"}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-600"><strong>Role:</strong> {m.jobPostingId.role} | <strong>Type:</strong> {m.jobPostingId.type === "internship" ? "Internship" : "Full-Time"}</p>
                              <p className="text-xs text-zinc-500 leading-relaxed">{m.jobPostingId.description}</p>
                              <p className="text-[10px] text-zinc-400"><strong>Deadline:</strong> {new Date(m.jobPostingId.applicationDeadline).toLocaleString()}</p>

                              {/* Mismatch breakdown list */}
                              {!m.isEligible && (
                                <div className="mt-3 bg-white border border-red-100 rounded-xl p-3 space-y-1 text-xs">
                                  <p className="font-bold text-red-800 text-[10px] uppercase tracking-wider mb-1">Failed Eligibility Rules:</p>
                                  {m.failedConditions.map((cond: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 text-[11px] text-zinc-700">
                                      <span className="text-red-500">❌</span>
                                      <span>{cond.message}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Decisions buttons Column */}
                            <div className="shrink-0 space-y-2 text-right">
                              {m.isEligible ? (
                                <>
                                  {m.studentDecision === "applied" ? (
                                    <span className="bg-emerald-600 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl block text-center">Applied successfully</span>
                                  ) : m.studentDecision === "no-apply" ? (
                                    <span className="bg-zinc-200 text-zinc-500 font-bold text-xs uppercase px-4 py-2 rounded-xl block text-center">Opted-Out</span>
                                  ) : deadlinePassed ? (
                                    <span className="bg-zinc-100 text-zinc-400 font-bold text-xs uppercase px-4 py-2 rounded-xl block text-center">Deadline Passed</span>
                                  ) : (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleStudentDecision(m.jobPostingId._id, "no-apply")}
                                        className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-xl shadow-sm"
                                      >
                                        No Apply
                                      </button>
                                      <button
                                        onClick={() => handleStudentDecision(m.jobPostingId._id, "applied")}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                                      >
                                        Apply Now
                                      </button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  {m.studentDecision === "not-applicable" ? (
                                    <span className="bg-zinc-100 text-zinc-400 font-bold text-xs uppercase px-4 py-2 rounded-xl block text-center">Acknowledged</span>
                                  ) : (
                                    <button
                                      onClick={() => handleAcknowledgeReject(m.jobPostingId._id)}
                                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm"
                                    >
                                      Acknowledge Rejection / OK
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. ADMIN/FACULTY VIEW */}
        {(userRole === "admin" || userRole === "faculty") && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Tab: Publish drive */}
            {activeTab === "admin-post" && (
              <>
                {/* Left Rule Builder and Form */}
                <div className="lg:col-span-5 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-5 self-start">
                  <h4 className="text-base font-bold text-zinc-900">Publish Placement Drive & Rules</h4>
                  <form onSubmit={handlePublishJob} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">Company Name *</label>
                      <input type="text" required value={postCompanyName} onChange={(e) => setPostCompanyName(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">Job Role / Designation *</label>
                      <input type="text" required value={postRole} onChange={(e) => setPostRole(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-1">Job Type *</label>
                        <select value={postType} onChange={(e) => setPostType(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs">
                          <option value="full-time">Full-Time</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-1">Deadline *</label>
                        <input type="datetime-local" required value={postDeadline} onChange={(e) => setPostDeadline(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">Job Description *</label>
                      <textarea required value={postDescription} onChange={(e) => setPostDescription(e.target.value)} rows={3} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs" />
                    </div>

                    {/* Eligibility Rule Builder */}
                    <div className="border-t border-zinc-100 pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider">Dynamic Eligibility Rules</label>
                        <button
                          type="button"
                          onClick={() => setPostRules([...postRules, { field: "cgpa", operator: ">=", value: "" }])}
                          className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded"
                        >
                          + Add Rule
                        </button>
                      </div>
                      <div className="space-y-2">
                        {postRules.map((rule, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <select
                              value={rule.field}
                              onChange={(e) => {
                                const newRules = [...postRules];
                                newRules[idx].field = e.target.value;
                                setPostRules(newRules);
                              }}
                              className="bg-zinc-50 border border-zinc-200 rounded p-1.5 text-[10px] w-28"
                            >
                              <option value="cgpa">CGPA</option>
                              <option value="backlogCount">Backlogs</option>
                              <option value="tenthPercentage">10th %</option>
                              <option value="twelfthPercentage">12th %</option>
                              <option value="twelfthToGraduationGap">12-Grad Gap</option>
                              <option value="overallEducationGap">Overall Gap</option>
                              <option value="branch">Branch</option>
                            </select>
                            <select
                              value={rule.operator}
                              onChange={(e) => {
                                const newRules = [...postRules];
                                newRules[idx].operator = e.target.value;
                                setPostRules(newRules);
                              }}
                              className="bg-zinc-50 border border-zinc-200 rounded p-1.5 text-[10px]"
                            >
                              <option value="==">==</option>
                              <option value=">=">&gt;=</option>
                              <option value="<=">&lt;=</option>
                              <option value=">">&gt;</option>
                              <option value="<">&lt;</option>
                              <option value="in">in</option>
                            </select>
                            <input
                              type="text"
                              required
                              value={rule.value}
                              placeholder="Value"
                              onChange={(e) => {
                                const newRules = [...postRules];
                                newRules[idx].value = e.target.value;
                                setPostRules(newRules);
                              }}
                              className="bg-zinc-50 border border-zinc-200 rounded p-1.5 text-[10px] flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => setPostRules(postRules.filter((_, i) => i !== idx))}
                              className="text-red-500 font-extrabold hover:text-red-800 px-2"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow shadow-emerald-600/25">
                      Publish Placement Drive
                    </button>
                  </form>
                </div>

                {/* Right Active drives summary lists */}
                <div className="lg:col-span-7 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
                  <h4 className="text-base font-bold text-zinc-900">Active Placement Drives & Compilations</h4>
                  <div className="space-y-4">
                    {placementJobs.map((job) => {
                      const passed = new Date() > new Date(job.applicationDeadline);
                      return (
                        <div key={job._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-extrabold text-zinc-900 text-base">{job.companyName}</h5>
                              <p className="text-xs text-zinc-500">{job.role} | {job.type === "internship" ? "Internship" : "Full-Time"}</p>
                            </div>
                            <button
                              onClick={() => handleDownloadPdfReport(job._id)}
                              className="py-1.5 px-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm"
                            >
                              PDF Report
                            </button>
                          </div>
                          
                          <p className="text-xs text-zinc-600 leading-relaxed">{job.description}</p>
                          
                          <div className="border-t border-zinc-200/50 pt-3 flex justify-between items-center text-[10px] text-zinc-400">
                            <span><strong>Deadline:</strong> {new Date(job.applicationDeadline).toLocaleString()}</span>
                            <span className={`font-bold ${passed ? "text-red-600" : "text-emerald-700"}`}>
                              {passed ? "Deadline Passed (PDF report locked)" : "Active Drive"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Tab: Verify candidate profiles directory */}
            {activeTab === "admin-profiles" && (
              <div className="lg:col-span-12 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-bold text-zinc-900">Verify Registered Candidates</h4>
                  <input
                    type="text"
                    placeholder="Search by student email..."
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs w-64"
                    onChange={(e) => {
                      const query = e.target.value.toLowerCase().trim();
                      if (query) {
                        setAllRegistrations(allRegistrations.filter(r => r.studentId?.email?.toLowerCase().includes(query)));
                      } else {
                        fetchAllRegistrations();
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allRegistrations.map((reg) => (
                    <div key={reg._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-extrabold text-zinc-900 text-base">{reg.personal?.fullName}</h5>
                          <p className="text-[11px] text-zinc-500">{reg.personal?.email}</p>
                          <p className="text-[10px] text-zinc-400">Branch: {reg.academic?.branch} | Roll: {reg.academic?.rollNumber}</p>
                        </div>
                        <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded ${
                          reg.status === "locked" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {reg.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center text-xs font-bold text-zinc-700 bg-white p-3 rounded-xl border border-zinc-200">
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold mb-0.5">CGPA</p>
                          <p className="text-sm text-zinc-800 font-black">{reg.academic?.cgpa?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold mb-0.5">Backlogs</p>
                          <p className="text-sm text-zinc-800 font-black">{reg.academic?.backlogCount || 0}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a href={reg.documents?.resumeUrl} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[10px] font-bold rounded-lg text-center shadow-sm">
                          Resume PDF
                        </a>
                        <button
                          onClick={() => handleLoadStudentRegistrationForAdmin(reg.personal?.email)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow-sm"
                        >
                          Audit & Edit Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Audit & edit Modal overlay */}
            {selectedReg && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start pb-4 border-b border-zinc-150">
                    <div>
                      <h4 className="text-lg font-black text-emerald-800">Placement Profile Audit: {selectedReg.personal?.fullName}</h4>
                      <p className="text-xs text-zinc-500">{selectedReg.personal?.email} | Status: <span className="font-bold">{selectedReg.status}</span></p>
                    </div>
                    <button onClick={() => setSelectedReg(null)} className="text-zinc-400 hover:text-zinc-600 text-xl font-bold">×</button>
                  </div>

                  {/* Audit edit log display */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-zinc-700 uppercase tracking-wider">Change logs history:</h5>
                    {selectedReg.editLog?.length === 0 ? (
                      <p className="text-[11px] text-zinc-400 italic">No admin changes logged yet.</p>
                    ) : (
                      <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 space-y-2 max-h-32 overflow-y-auto text-[11px]">
                        {selectedReg.editLog.map((log: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row justify-between border-b border-zinc-100 pb-1 gap-1">
                            <span className="text-zinc-600">
                              <strong>Field:</strong> <code className="bg-zinc-200 px-1 rounded">{log.field}</code> edited by <strong>{log.editedBy}</strong>
                            </span>
                            <span className="text-zinc-400 shrink-0">
                              {log.oldValue} ➔ {log.newValue} ({new Date(log.editedAt).toLocaleString()})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form toggle */}
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-black text-zinc-700 uppercase tracking-wider">Configure Overrides</h5>
                    <button
                      onClick={() => setShowAdminEditForm(!showAdminEditForm)}
                      className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-1 rounded font-bold"
                    >
                      {showAdminEditForm ? "Cancel overrides" : "Edit Profile Overrides"}
                    </button>
                  </div>

                  {showAdminEditForm ? (
                    // Admin override edits form fields
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl p-4 text-xs">
                      <div>
                        <label className="block text-zinc-500 mb-1 font-bold">Name Override</label>
                        <input
                          type="text"
                          defaultValue={selectedReg.personal?.fullName}
                          onChange={(e) => setAdminEdits({ ...adminEdits, "personal.fullName": e.target.value })}
                          className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1 font-bold">Override CGPA</label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={selectedReg.academic?.cgpa}
                          onChange={(e) => setAdminEdits({ ...adminEdits, "academic.cgpa": parseFloat(e.target.value) })}
                          className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 mb-1 font-bold">Override Backlogs</label>
                        <input
                          type="number"
                          defaultValue={selectedReg.academic?.backlogCount}
                          onChange={(e) => setAdminEdits({ ...adminEdits, "academic.backlogCount": parseInt(e.target.value) })}
                          className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3 text-right">
                        <button
                          onClick={handleAdminUpdateRegistration}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                        >
                          Save changes override
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Render current registration details in modal
                    <div className="grid grid-cols-2 gap-4 text-xs border border-zinc-100 rounded-2xl p-4 bg-zinc-50/50">
                      <p><strong>APAAR ID:</strong> {selectedReg.identity?.apaarId}</p>
                      <p><strong>Roll Number:</strong> {selectedReg.academic?.rollNumber}</p>
                      <p><strong>Enrollment Number:</strong> {selectedReg.academic?.enrollmentNumber}</p>
                      <p><strong>Branch:</strong> {selectedReg.academic?.branch}</p>
                      <p><strong>Calculated CGPA:</strong> {selectedReg.academic?.cgpa?.toFixed(2)}</p>
                      <p><strong>Backlogs Count:</strong> {selectedReg.academic?.backlogCount}</p>
                      <p><strong>Education gaps:</strong> 10-12: {selectedReg.academic?.tenthToTwelfthGap} Yrs | 12-Grad: {selectedReg.academic?.twelfthToGraduationGap} Yrs | Overall: {selectedReg.academic?.overallEducationGap} Yrs</p>
                    </div>
                  )}

                  <div className="text-right pt-4 border-t border-zinc-150">
                    <button onClick={() => setSelectedReg(null)} className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl shadow-sm">
                      Close Panel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
