"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function PlacementsPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // States
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

  // Form Fields for Posting Job (Admin / Faculty)
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

  // Apply Modal states (Student)
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyResumeMode, setApplyResumeMode] = useState<"upload" | "saved" | "fallback">("fallback");
  const [applyUploadFile, setApplyUploadFile] = useState<string>("");
  const [applyUploadFileName, setApplyUploadFileName] = useState<string>("");
  const [applySelectedSavedResume, setApplySelectedSavedResume] = useState<string>("");

  useEffect(() => {
    const savedToken = localStorage.getItem("trellis_token");
    const savedRole = localStorage.getItem("trellis_role");
    const savedEmail = localStorage.getItem("trellis_email");
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
      setUserEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (token && userEmail) {
      fetchPlacementRegistration();
      fetchPlacementJobs();
      if (userRole === "admin" || userRole === "faculty") {
        fetchAllRegistrations();
      }
    }
  }, [token, userEmail, userRole]);

  const fetchPlacementRegistration = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/registration/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPlacementReg(data.registration);
        // Pre-fill form if registration exists
        if (data.registration) {
          setRegFullName(data.registration.personalDetails?.fullName || "");
          setRegPhone(data.registration.personalDetails?.phone || "");
          setRegEmail(data.registration.personalDetails?.email || "");
          // eligibility match
          const matchesRes = await fetch(`${BACKEND_URL}/api/placement/jobs?studentEmail=${userEmail}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const mData = await matchesRes.json();
          if (mData.success) setPlacementMatches(mData.jobs);
        }
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
      const res = await fetch(`${BACKEND_URL}/api/placement/registration/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAllRegistrations(data.registrations);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        personalDetails: {
          fullName: regFullName,
          dob: new Date(regDob),
          gender: regGender,
          phone: regPhone,
          email: regEmail || userEmail,
          permanentAddress: regPermanentAddress,
          currentAddress: regCurrentAddress,
          fatherName: regFatherName,
          fatherOccupation: regFatherOccupation,
          fatherContact: regFatherContact,
          motherName: regMotherName,
          motherOccupation: regMotherOccupation,
          motherContact: regMotherContact,
          apaarId: regApaarId,
          photoUrl: regPhotoUrl
        },
        academicDetails: {
          tenthPercentage: parseFloat(regTenthPercentage),
          tenthBoard: regTenthBoard,
          tenthYear: parseInt(regTenthYear),
          twelfthPercentage: parseFloat(regTwelfthPercentage),
          twelfthBoard: regTwelfthBoard,
          twelfthYear: parseInt(regTwelfthYear),
          diplomaPercentage: regDiplomaPercentage ? parseFloat(regDiplomaPercentage) : undefined,
          diplomaBoard: regDiplomaBoard,
          diplomaYear: regDiplomaYear ? parseInt(regDiplomaYear) : undefined,
          branch: regBranch,
          rollNumber: regRollNumber,
          enrollmentNumber: regEnrollmentNumber,
          sgpa: [
            parseFloat(regSgpa1) || 0,
            parseFloat(regSgpa2) || 0,
            parseFloat(regSgpa3) || 0,
            parseFloat(regSgpa4) || 0,
            parseFloat(regSgpa5) || 0
          ],
          cgpa: (
            ((parseFloat(regSgpa1) || 0) +
              (parseFloat(regSgpa2) || 0) +
              (parseFloat(regSgpa3) || 0) +
              (parseFloat(regSgpa4) || 0) +
              (parseFloat(regSgpa5) || 0)) / 5
          ) || 8.0,
          backlogCount: parseInt(regBacklogCount) || 0,
          backlogHistory: regBacklogHistory
        },
        addressDetails: {
          localAddressPincode: regLocalAddressPincode,
          permanentAddressPincode: regPermanentAddressPincode,
          state: regState,
          passportPhotoUrl: regPassportPhotoUrl
        },
        courseDetails: {
          universityName: regUniversityName,
          courseName: regCourseName,
          yearOfAdmission: parseInt(regYearOfAdmission),
          yearOfPassing: parseInt(regYearOfPassing),
          tenthYearOfPassing: parseInt(regTenthYearOfPassing),
          twelfthYearOfPassing: parseInt(regTwelfthYearOfPassing)
        },
        gapDetails: {
          tenthHasGap: regTenthHasGap,
          tenthGapDuration: regTenthGapDuration,
          tenthGapReason: regTenthGapReason,
          twelfthHasGap: regTwelfthHasGap,
          twelfthGapDuration: regTwelfthGapDuration,
          twelfthGapReason: regTwelfthGapReason,
          ugHasGap: regUgHasGap,
          ugGapDuration: regUgGapDuration,
          ugGapReason: regUgGapReason
        },
        internships: regInternships,
        resumeUrl: regResumeUrl || "https://resumebuilder.com/student",
        marksheetUrls: regMarksheetUrls
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
        alert("Placement Profile registered successfully!");
        fetchPlacementRegistration();
      } else {
        alert(data.message || "Failed to register profile.");
      }
    } catch (err) {
      alert("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJobPosting = async (e: React.FormEvent) => {
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
          applicationDeadline: new Date(postDeadline),
          eligibilityRules: postRules
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Job Posting published successfully!");
        setPostCompanyName("");
        setPostRole("");
        setPostDescription("");
        fetchPlacementJobs();
      }
    } catch (err) {
      alert("Error creating job.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToJob = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/jobs/${jobId}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentEmail: userEmail,
          decision: "accepted",
          resumeUrl: "https://cloudinary.com/resume"
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Successfully applied to job posting!");
        fetchPlacementRegistration();
      } else {
        alert(data.message || "Error submitting application.");
      }
    } catch (err) {
      alert("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeNotification = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/placement/jobs/${jobId}/acknowledge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studentEmail: userEmail })
      });
      const data = await res.json();
      if (data.success) {
        alert("Notification acknowledged successfully!");
        fetchPlacementRegistration();
      }
    } catch (err) {
      alert("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 text-zinc-950 font-sans">
        {/* Header Block */}
        <div className="pb-4 border-b border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-emerald-800 tracking-tight">Career Placement & Internships</h3>
            <p className="text-xs text-zinc-500 mt-1">Structured placements dashboard with rule-based auto matching</p>
          </div>
          {(userRole === "admin" || userRole === "faculty") && (
            <div className="flex bg-emerald-50 rounded-lg p-1">
              <button
                onClick={() => setPlacementTab("post-job")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  placementTab === "post-job"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Create Job Opening
              </button>
              <button
                onClick={() => setPlacementTab("registrations")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  placementTab === "registrations"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Verify Profiles ({allRegistrations.length})
              </button>
            </div>
          )}
        </div>

        {/* Dynamic tabs for user type */}
        {userRole === "student" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Student Left Column: Profile State */}
            <div className="lg:col-span-8 space-y-8">
              {!placementReg ? (
                /* Registration Form */
                <form
                  onSubmit={handleSubmitRegistration}
                  className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm space-y-6"
                >
                  <h4 className="text-lg font-black text-emerald-800">Submit Placement Resume Profile</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Mobile Phone *</label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Date of Birth *</label>
                      <input
                        type="date"
                        required
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Gender *</label>
                      <select
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Enrollment No. *</label>
                      <input
                        type="text"
                        required
                        value={regEnrollmentNumber}
                        onChange={(e) => setRegEnrollmentNumber(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Branch *</label>
                      <input
                        type="text"
                        required
                        value={regBranch}
                        onChange={(e) => setRegBranch(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 pt-6">
                    <h5 className="text-sm font-bold text-zinc-700 mb-4">Academic CGPA Track (SGPA per Semester)</h5>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { label: "Sem 1", state: regSgpa1, set: setRegSgpa1 },
                        { label: "Sem 2", state: regSgpa2, set: setRegSgpa2 },
                        { label: "Sem 3", state: regSgpa3, set: setRegSgpa3 },
                        { label: "Sem 4", state: regSgpa4, set: setRegSgpa4 },
                        { label: "Sem 5", state: regSgpa5, set: setRegSgpa5 }
                      ].map((item) => (
                        <div key={item.label}>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{item.label}</label>
                          <input
                            type="text"
                            placeholder="0.0"
                            value={item.state}
                            onChange={(e) => item.set(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-center text-xs font-semibold text-zinc-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-zinc-100 pt-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">10th Board Name *</label>
                      <input
                        type="text"
                        required
                        value={regTenthBoard}
                        onChange={(e) => setRegTenthBoard(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">10th Percentage *</label>
                      <input
                        type="text"
                        required
                        value={regTenthPercentage}
                        onChange={(e) => setRegTenthPercentage(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    Submit Placement Registration
                  </button>
                </form>
              ) : (
                /* Registration Profile Summary */
                <div className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                    <div>
                      <h4 className="text-lg font-black text-emerald-800">{placementReg.personalDetails?.fullName}</h4>
                      <p className="text-xs text-zinc-500">Academic Roll No. {placementReg.academicDetails?.rollNumber}</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                      Audit Approved
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-center">
                      <p className="text-2xl font-black text-zinc-800">
                        {placementReg.academicDetails?.cgpa?.toFixed(2)}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Average CGPA</p>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-center">
                      <p className="text-2xl font-black text-zinc-800">
                        {placementReg.academicDetails?.backlogCount || 0}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Backlogs</p>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-center">
                      <p className="text-sm font-black text-zinc-800 truncate">
                        {placementReg.personalDetails?.phone}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Phone</p>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-center">
                      <p className="text-sm font-black text-zinc-800 truncate">
                        {placementReg.academicDetails?.branch}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Branch</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Student Right Column: Auto Eligibility Matching results */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
                <h4 className="text-base font-bold text-zinc-900 mb-4">Auto-Matched Openings</h4>
                <p className="text-xs text-zinc-500 mb-6">Eligible placement drives based on campus database rules</p>

                {!placementReg ? (
                  <p className="text-xs text-zinc-500 italic text-center py-6">
                    Please submit your placement profile details first to check eligible matches.
                  </p>
                ) : placementMatches.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic text-center py-6">
                    You do not currently meet the eligibility rules for any active placement drives.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {placementMatches.map((match) => {
                      const applied = match.decisions?.some(
                        (d: any) => d.studentEmail === userEmail && d.decision === "accepted"
                      );
                      return (
                        <div key={match._id} className="border border-emerald-50 bg-[#F4FBF7] rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-extrabold text-emerald-800 text-sm">{match.companyName}</h5>
                              <p className="text-xs text-zinc-600 mt-0.5">{match.role}</p>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded">
                              Match
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <span className="text-[10px] font-bold text-zinc-400">
                              Deadline: {new Date(match.applicationDeadline).toLocaleDateString()}
                            </span>
                            <button
                              disabled={applied}
                              onClick={() => handleApplyToJob(match._id)}
                              className={`py-1.5 px-4 text-xs font-black uppercase rounded-lg transition-all ${
                                applied
                                  ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow"
                              }`}
                            >
                              {applied ? "Applied" : "Apply"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Faculty View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {placementTab === "post-job" ? (
              <>
                {/* Left Form: Create Drive */}
                <div className="lg:col-span-5 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm self-start">
                  <h4 className="text-base font-bold text-zinc-900 mb-4">Publish Placement Drive</h4>
                  <form onSubmit={handleCreateJobPosting} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={postCompanyName}
                        onChange={(e) => setPostCompanyName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Job Designation *</label>
                      <input
                        type="text"
                        required
                        value={postRole}
                        onChange={(e) => setPostRole(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Drive Description</label>
                      <textarea
                        value={postDescription}
                        onChange={(e) => setPostDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Deadline *</label>
                      <input
                        type="date"
                        required
                        value={postDeadline}
                        onChange={(e) => setPostDeadline(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-700"
                      />
                    </div>

                    <div className="border-t border-zinc-100 pt-4">
                      <h5 className="text-xs font-bold text-zinc-500 uppercase mb-2">Drive Eligibility Rules</h5>
                      <div className="space-y-2">
                        {postRules.map((rule, idx) => (
                          <div key={idx} className="flex gap-2 items-center text-xs">
                            <span className="font-bold text-zinc-700 uppercase">{rule.field}</span>
                            <span className="text-zinc-500">{rule.operator}</span>
                            <span className="font-black text-emerald-600">{rule.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                    >
                      Publish Placement Drive
                    </button>
                  </form>
                </div>

                {/* Right List: Open Drives */}
                <div className="lg:col-span-7 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
                  <h4 className="text-base font-bold text-zinc-900">Active Placement Drives</h4>
                  <div className="space-y-4">
                    {placementJobs.map((job) => (
                      <div key={job._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-black text-zinc-900 text-base">{job.companyName}</h5>
                            <p className="text-xs text-zinc-500 mt-0.5">{job.role}</p>
                          </div>
                          <a
                            href={`${BACKEND_URL}/api/placement/jobs/${job._id}/report?token=${token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1 px-3 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-[10px] font-black uppercase tracking-wider"
                          >
                            PDF Report
                          </a>
                        </div>
                        <p className="text-xs text-zinc-600 mt-3">{job.description}</p>
                        <div className="flex justify-between text-[10px] text-zinc-400 pt-4 border-t border-zinc-200/50 mt-4">
                          <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                          <span>Applicants: {job.decisions?.length || 0} applied</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Verification/List of Registrations */
              <div className="lg:col-span-12 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
                <h4 className="text-base font-bold text-zinc-900">Verify Registered Placement Resume Profiles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allRegistrations.map((reg) => (
                    <div key={reg._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 space-y-4">
                      <div>
                        <h5 className="font-extrabold text-zinc-900 text-base">{reg.personalDetails?.fullName}</h5>
                        <p className="text-xs text-zinc-500">{reg.personalDetails?.email} | Branch: {reg.academicDetails?.branch}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white p-3 border border-zinc-200 rounded-xl">
                          <p className="text-lg font-black text-zinc-800">{reg.academicDetails?.cgpa?.toFixed(2)}</p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">CGPA</p>
                        </div>
                        <div className="bg-white p-3 border border-zinc-200 rounded-xl">
                          <p className="text-lg font-black text-zinc-800">{reg.academicDetails?.backlogCount || 0}</p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Backlogs</p>
                        </div>
                      </div>

                      <a
                        href={reg.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-center rounded-xl border border-zinc-200 text-xs font-bold"
                      >
                        View Full Resume PDF
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
