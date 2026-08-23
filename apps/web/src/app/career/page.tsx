"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function CareerPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Career hub state variables
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

  // Student Profile State
  const [profile, setProfile] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [cgpa, setCgpa] = useState("8.0");
  const [semester, setSemester] = useState<number>(1);
  const [contact, setContact] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bannerStyle, setBannerStyle] = useState("from-emerald-500 to-emerald-600");
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Co-curricular achievements
  const [achTitle, setAchTitle] = useState("");
  const [achCategory, setAchCategory] = useState("technical");
  const [achLevel, setAchLevel] = useState("college");
  const [achDescription, setAchDescription] = useState("");
  const [achProofUrl, setAchProofUrl] = useState("");
  const [achFileName, setAchFileName] = useState("");
  const [myAchievementsList, setMyAchievementsList] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Social feed post
  const [newPostText, setNewPostText] = useState("");

  // Faculty views
  const [facultyDashboardStudents, setFacultyDashboardStudents] = useState<any[]>([]);
  const [facultyDashboardPendingAch, setFacultyDashboardPendingAch] = useState<any[]>([]);

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
      fetchStudentProfileData();
      fetchLeaderboard();
      fetchActivityFeed(feedScope);
      handleDiscoverSearch("");
      if (userRole === "admin" || userRole === "faculty") {
        fetchFacultyDashboardData();
      }
    }
  }, [token, userEmail, userRole, feedScope]);

  useEffect(() => {
    if (profile?._id) {
      fetchMyAchievements();
      fetchSavedResumes();
    }
  }, [profile]);

  const fetchStudentProfileData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        if (data.needsOnboarding) {
          setNeedsOnboarding(true);
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

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setLoading(true);
    try {
      const skillArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await fetch(`${BACKEND_URL}/api/profile/${userEmail}`, {
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
          cgpa: parseFloat(cgpa) || 0.0,
          semester: semester,
          contact,
          bio,
          skills: skillArray,
          photoUrl
        }),
      });
      const data = await response.json();
      if (data.success) {
        setFormSuccess("Profile saved successfully!");
        setProfile(data.profile);
        setHasProfile(true);
        setNeedsOnboarding(false);
      } else {
        setFormError(data.message || "Failed to save profile.");
      }
    } catch (err) {
      setFormError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/achievements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "Posted an update",
          description: newPostText,
          category: "general"
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewPostText("");
        fetchActivityFeed(feedScope);
      }
    } catch (err) {
      alert("Error posting status update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-zinc-950 font-sans">
        {/* Welcome Header */}
        <div className="pb-3 border-b border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-emerald-800">Trellis Career Hub</h3>
            <p className="text-xs text-zinc-500 mt-1">Connect, endorse skills, export resumes, and verify points</p>
          </div>
          <div className="flex bg-emerald-50 rounded-lg p-1">
            <button
              onClick={() => setCareerHubTab("profile")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                careerHubTab === "profile" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setCareerHubTab("resume")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                careerHubTab === "resume" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Resume PDF
            </button>
            <button
              onClick={() => setCareerHubTab("achievements")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                careerHubTab === "achievements" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Co-Curriculars
            </button>
            <button
              onClick={() => setCareerHubTab("leaderboard")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                careerHubTab === "leaderboard" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setCareerHubTab("discovery")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                careerHubTab === "discovery" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Student Directory
            </button>
          </div>
        </div>

        {/* Tab 1: Profile intro setup & dashboard card */}
        {careerHubTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {needsOnboarding || !hasProfile ? (
                /* Profile setup onboarding */
                <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
                  <h4 className="text-base font-bold text-zinc-900 mb-4">Complete Student Profile Setup</h4>
                  <form onSubmit={handleCreateProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-1">Roll Number *</label>
                        <input
                          type="text"
                          required
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">Bio / About</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                    >
                      Onboard Profile
                    </button>
                  </form>
                </div>
              ) : (
                /* Profile Display Card */
                <div className="bg-white border border-emerald-100 rounded-3xl overflow-hidden shadow-sm">
                  <div className="h-32 bg-emerald-600"></div>
                  <div className="p-6 relative -mt-16">
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow flex items-center justify-center font-black text-3xl text-emerald-800">
                      {name ? name[0].toUpperCase() : "S"}
                    </div>
                    <h4 className="text-xl font-black text-zinc-950 mt-4">{name}</h4>
                    <p className="text-xs text-zinc-500 mt-1">Roll No. {rollNumber} | {branch}</p>
                    <p className="text-xs text-zinc-600 mt-4 leading-relaxed">{bio}</p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {skills.split(",").map((s, i) => (
                        <span key={i} className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Feed Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
                <h4 className="text-base font-bold text-zinc-900 mb-3">Campus Feed</h4>
                {hasProfile && (
                  <form onSubmit={handleCreatePost} className="space-y-3 mb-6">
                    <textarea
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder="Share achievements or ideas..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-xs"
                      rows={2}
                    ></textarea>
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                    >
                      Post Status
                    </button>
                  </form>
                )}

                <div className="space-y-4">
                  {activityFeed.map((post) => (
                    <div key={post._id} className="border border-zinc-100 rounded-2xl p-4 bg-zinc-50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-[10px] text-emerald-800 uppercase">
                          {post.student?.name ? post.student.name[0] : "S"}
                        </div>
                        <span className="text-xs font-black text-emerald-800">{post.student?.name}</span>
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed">{post.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Resume builder */}
        {careerHubTab === "resume" && (
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h4 className="text-base font-bold text-zinc-900">Academic Resume PDF Generator</h4>
            <div className="flex gap-4">
              <a
                href={`${BACKEND_URL}/api/resume/${profile?._id || ""}/generate?token=${token}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow"
              >
                Download Compiled Resume PDF
              </a>
              <button
                onClick={saveResumeVersion}
                className="py-3 px-6 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-2xl text-xs font-bold"
              >
                Save Version
              </button>
            </div>

            {/* List of saved versions */}
            <div className="border-t border-zinc-100 pt-6">
              <h5 className="text-xs font-bold text-zinc-500 uppercase mb-4">Saved Versions ({savedResumes.length})</h5>
              <div className="space-y-3">
                {savedResumes.map((res) => (
                  <div key={res._id} className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <span className="text-xs font-bold text-zinc-800">{res.name}</span>
                    <span className="text-[10px] text-zinc-400">{new Date(res.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Achievements */}
        {careerHubTab === "achievements" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm self-start">
              <h4 className="text-base font-bold text-zinc-900 mb-4">Log Co-curricular</h4>
              <form onSubmit={submitAchievement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={achTitle}
                    onChange={(e) => setAchTitle(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Details *</label>
                  <textarea
                    required
                    value={achDescription}
                    onChange={(e) => setAchDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Certificate Proof Link</label>
                  <input
                    type="text"
                    value={achProofUrl}
                    onChange={(e) => setAchProofUrl(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Submit for Verification
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-zinc-900 mb-2">My Submissions</h4>
              {myAchievementsList.map((ach) => (
                <div key={ach._id} className="border border-zinc-150 rounded-2xl p-4 bg-zinc-50 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-zinc-900 text-sm">{ach.title}</h5>
                    <p className="text-xs text-zinc-500 mt-1">{ach.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${
                      ach.verificationStatus === "verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {ach.verificationStatus}
                    </span>
                    {ach.verificationStatus === "verified" && (
                      <p className="text-[10px] font-black text-emerald-600 mt-1">+{ach.pointsAwarded} pts</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Leaderboard */}
        {careerHubTab === "leaderboard" && (
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h4 className="text-base font-bold text-zinc-900 mb-4">Student of the Year Leaderboard 🏆</h4>
            <div className="space-y-3">
              {leaderboard.map((item, index) => (
                <div key={item._id} className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-xs font-bold text-zinc-800">#{index+1} {item.name}</span>
                  <span className="text-xs font-black text-emerald-600">{item.cgpa * 10 + (item.verifiedAchievementsPoints || 0)} points</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Discovery Directory */}
        {careerHubTab === "discovery" && (
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h4 className="text-base font-bold text-zinc-900">Discover Classmates & Skills</h4>
            <input
              type="text"
              placeholder="Search skills (e.g. React, Node.js)"
              value={searchSkillQuery}
              onChange={(e) => {
                setSearchSkillQuery(e.target.value);
                handleDiscoverSearch(e.target.value);
              }}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoveredProfiles.map((p) => (
                <div key={p._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 space-y-3">
                  <div>
                    <h5 className="font-extrabold text-zinc-900 text-sm">{p.name}</h5>
                    <p className="text-xs text-zinc-500">{p.rollNumber} | Branch: {p.branch}</p>
                  </div>
                  <button
                    onClick={() => fetchPublicProfileView(p._id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                  >
                    View Career Card
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Public Profile Modal Dialog */}
      {isPublicProfileOpen && publicProfileData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-emerald-100 shadow-2xl p-6 relative">
            <button onClick={() => setIsPublicProfileOpen(false)} className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-700 text-lg">
              ✕
            </button>
            <h4 className="text-lg font-black text-emerald-800">{publicProfileData.profile.name}</h4>
            <p className="text-xs text-zinc-500 mt-1">{publicProfileData.profile.branch} | Class of {publicProfileData.profile.graduationYear}</p>
            <p className="text-xs text-zinc-600 mt-4 leading-relaxed">{publicProfileData.profile.bio}</p>

            <div className="mt-6 border-t border-zinc-100 pt-4">
              <h5 className="text-xs font-bold text-zinc-500 uppercase mb-3">Skills & Endorsements</h5>
              <div className="space-y-2">
                {publicProfileData.profile.skills?.map((skill: string, i: number) => {
                  const endorsementsCount = publicProfileData.endorsements?.filter((e: any) => e.skill === skill).length || 0;
                  return (
                    <div key={i} className="flex justify-between items-center bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                      <span className="text-xs font-bold text-zinc-800">{skill}</span>
                      <button
                        onClick={() => handleEndorseSkill(publicProfileData.profile.user?._id, skill)}
                        className="py-1 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-black rounded-lg"
                      >
                        Endorse ({endorsementsCount})
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
