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
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

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
    }
  }, []);

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
      } else {
        setAuthError(data.message || "Invalid credentials");
      }
    } catch (err: any) {
      setAuthError(`Could not connect to backend server at ${BACKEND_URL}.`);
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
    localStorage.removeItem("trellis_token");
    localStorage.removeItem("trellis_role");
    localStorage.removeItem("trellis_email");
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-zinc-950 tracking-tight">Trellis Portal</h1>
          <p className="mt-2 text-lg text-zinc-600">Smart Campus Student & Career Management</p>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-800"></div>
          </div>
        )}

        {/* 1. Auth Form */}
        {!token && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md border border-zinc-200 overflow-hidden p-8">
            <h2 className="text-2xl font-bold text-zinc-900 text-center mb-6">
              {isLoginView ? "Sign In to Trellis" : "Create Account"}
            </h2>

            {authError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}
            {authMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {authMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm focus:ring-zinc-500 focus:border-zinc-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm focus:ring-zinc-500 focus:border-zinc-500 text-black"
                />
              </div>

              {isLoginView ? (
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800"
                >
                  Sign In
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={(e) => handleRegister(e, "student")}
                    className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800"
                  >
                    Register Student
                  </button>
                  <button
                    onClick={(e) => handleRegister(e, "faculty")}
                    className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-zinc-800 bg-zinc-200 hover:bg-zinc-300"
                  >
                    Register Faculty
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setAuthError("");
                  setAuthMessage("");
                }}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 underline"
              >
                {isLoginView ? "Need an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        )}

        {/* 2. Setup Student Profile Form */}
        {token && userRole === "student" && !hasProfile && (
          <div className="bg-white rounded-xl shadow-md border border-zinc-200 p-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Create Student Profile</h2>
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
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black"
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
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black"
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
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">Graduation Year *</label>
                  <input
                    type="number"
                    required
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">CGPA</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.5"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">Short Bio / Description</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black"
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
                  className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg shadow-sm text-black"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-2 px-4 border border-zinc-300 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. Fully Connected Student Dashboard (Profile, Events, Achievements) */}
        {token && userRole === "student" && hasProfile && profile && (
          <div className="space-y-8">
            {/* Nav Menu */}
            <div className="flex bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-3 text-center text-sm font-medium ${
                  activeTab === "profile" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Profile Card
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`flex-1 py-3 text-center text-sm font-medium ${
                  activeTab === "events" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Campus Events
              </button>
              <button
                onClick={() => setActiveTab("activities")}
                className={`flex-1 py-3 text-center text-sm font-medium ${
                  activeTab === "activities" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                My Achievements
              </button>
            </div>

            {/* TAB: Profile */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-md border border-zinc-200 overflow-hidden">
                <div className="h-32 bg-zinc-900 w-full relative"></div>
                <div className="px-8 pb-8 relative">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 mb-6">
                    <div className="flex items-end">
                      <div className="h-32 w-32 rounded-full border-4 border-white bg-zinc-200 flex items-center justify-center text-zinc-500 text-5xl font-black shadow-sm">
                        {profile.name ? profile.name[0].toUpperCase() : "S"}
                      </div>
                      <div className="ml-0 sm:ml-6 mt-4 sm:mt-0">
                        <h2 className="text-3xl font-extrabold text-zinc-950">{profile.name}</h2>
                        <p className="text-lg font-medium text-zinc-600">Student Identity Profile</p>
                        <p className="text-sm text-zinc-500 mt-1">
                          {profile.branch} | Class of {profile.graduationYear}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-4 sm:mt-0 py-2 px-4 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50"
                    >
                      Log Out
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 border-b pb-2 mb-3">About</h3>
                        <p className="text-zinc-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 border-b pb-2 mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills?.map((skill: string, i: number) => (
                            <span
                              key={i}
                              className="bg-zinc-100 text-zinc-800 text-sm font-medium px-3 py-1 rounded-full border border-zinc-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-6 self-start space-y-4">
                      <h3 className="text-lg font-bold text-zinc-900 border-b pb-2">Academic Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-zinc-200 text-center">
                          <div className="text-2xl font-black text-zinc-900">{profile.cgpa?.toFixed(2)}</div>
                          <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mt-1">CGPA</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-zinc-200 text-center">
                          <div className="text-2xl font-black text-zinc-900">{profile.backlogs}</div>
                          <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mt-1">Backlogs</div>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500 text-center pt-2">
                        Roll Number: <span className="font-bold text-zinc-700">{profile.rollNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Events */}
            {activeTab === "events" && (
              <div className="bg-white rounded-xl shadow-md border border-zinc-200 p-8 space-y-6">
                <h2 className="text-2xl font-bold text-zinc-950">Campus Events</h2>
                {events.length === 0 ? (
                  <p className="text-zinc-500 italic">No events listed.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {events.map((event) => (
                      <div key={event._id} className="border border-zinc-200 rounded-lg p-5 hover:bg-zinc-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <h3 className="text-xl font-bold text-zinc-950">{event.title}</h3>
                          <p className="text-zinc-600 mt-1 max-w-lg">{event.description}</p>
                          <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                            <span>📍 Venue: <strong className="text-zinc-700">{event.venue}</strong></span>
                            <span>📅 Date: <strong className="text-zinc-700">{new Date(event.date).toLocaleDateString()}</strong></span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRegisterEvent(event._id)}
                          className="mt-4 md:mt-0 py-2 px-5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold shadow-sm"
                        >
                          Register
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Achievements / Activities */}
            {activeTab === "activities" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form to log activity */}
                <div className="bg-white rounded-xl border border-zinc-200 p-6 self-start space-y-4">
                  <h3 className="text-lg font-bold text-zinc-900 border-b pb-2 mb-3">Log Co-curricular</h3>
                  <form onSubmit={handleLogActivity} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600">Achievement Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AWS Certification"
                        value={actTitle}
                        onChange={(e) => setActTitle(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600">Type</label>
                      <select
                        value={actType}
                        onChange={(e) => setActType(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black bg-white"
                      >
                        <option value="certification">Certification</option>
                        <option value="hackathon">Hackathon</option>
                        <option value="sports">Sports / Athletics</option>
                        <option value="nss_ncc">NSS / NCC</option>
                        <option value="research">Research Publication</option>
                        <option value="other">Other Activity</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600">Description</label>
                      <textarea
                        value={actDesc}
                        onChange={(e) => setActDesc(e.target.value)}
                        rows={2}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold"
                    >
                      Log Achievement
                    </button>
                  </form>
                </div>

                {/* List of achievements */}
                <div className="md:col-span-2 bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
                  <h3 className="text-lg font-bold text-zinc-900 border-b pb-2 mb-3">Logged Achievements</h3>
                  {activities.length === 0 ? (
                    <p className="text-zinc-500 italic text-sm">No achievements logged yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((act) => (
                        <div key={act._id} className="border border-zinc-100 rounded-lg p-4 bg-zinc-50 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-zinc-950">{act.title}</h4>
                            <p className="text-xs text-zinc-500 mt-1">Category: {act.type}</p>
                            <p className="text-sm text-zinc-600 mt-1">{act.description}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                              act.verificationStatus === "verified"
                                ? "bg-emerald-100 text-emerald-800"
                                : act.verificationStatus === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {act.verificationStatus}
                            </span>
                            {act.verificationStatus === "verified" && (
                              <div className="text-xs font-bold text-emerald-600 mt-1">
                                +{act.pointsAwarded} points
                              </div>
                            )}
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

        {/* 4. Faculty Dashboard */}
        {token && (userRole === "faculty" || userRole === "admin") && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-zinc-950">Faculty Dashboard</h2>
                <p className="text-sm text-zinc-500">Log: {userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="py-2 px-4 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                Log Out
              </button>
            </div>

            {/* Menu */}
            <div className="flex bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveTab("events")}
                className={`flex-1 py-3 text-center text-sm font-medium ${
                  activeTab === "events" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Manage Events
              </button>
              <button
                onClick={() => setActiveTab("activities")}
                className={`flex-1 py-3 text-center text-sm font-medium ${
                  activeTab === "activities" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                Verify Achievements ({pendingActivities.length})
              </button>
            </div>

            {/* TAB: Events (Create event form & event list) */}
            {activeTab === "events" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form to create event */}
                <div className="bg-white rounded-xl border border-zinc-200 p-6 self-start space-y-4">
                  <h3 className="text-lg font-bold text-zinc-900 border-b pb-2 mb-3">Create Event</h3>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600">Event Title *</label>
                      <input
                        type="text"
                        required
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600">Description</label>
                      <textarea
                        value={eventDesc}
                        onChange={(e) => setEventDesc(e.target.value)}
                        rows={2}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600">Venue *</label>
                      <input
                        type="text"
                        required
                        value={eventVenue}
                        onChange={(e) => setEventVenue(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600">Event Date *</label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600">Deadline *</label>
                      <input
                        type="date"
                        required
                        value={eventDeadline}
                        onChange={(e) => setEventDeadline(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-black"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold"
                    >
                      Publish Event
                    </button>
                  </form>
                </div>

                {/* Events list */}
                <div className="md:col-span-2 bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
                  <h3 className="text-lg font-bold text-zinc-900 border-b pb-2 mb-3">Published Campus Events</h3>
                  {events.length === 0 ? (
                    <p className="text-zinc-500 italic text-sm">No campus events published yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event._id} className="border border-zinc-100 rounded-lg p-4 bg-zinc-50">
                          <h4 className="font-bold text-zinc-950 text-lg">{event.title}</h4>
                          <p className="text-sm text-zinc-600 mt-1">{event.description}</p>
                          <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                            <span>📍 Venue: <strong>{event.venue}</strong></span>
                            <span>📅 Date: <strong>{new Date(event.date).toLocaleDateString()}</strong></span>
                            <span>👥 Registered: <strong>{event.registeredParticipants?.length || 0}</strong></span>
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
              <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
                <h3 className="text-lg font-bold text-zinc-900 border-b pb-2 mb-3">
                  Pending Co-curricular Submissions
                </h3>
                {pendingActivities.length === 0 ? (
                  <p className="text-zinc-500 italic text-sm">No pending activity requests.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingActivities.map((act) => {
                      // Inline points state for each card
                      return (
                        <div
                          key={act._id}
                          className="border border-zinc-150 rounded-lg p-5 bg-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-zinc-950 text-lg">{act.title}</h4>
                              <span className="bg-zinc-200 text-zinc-800 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                                {act.type}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">Submitted by: {act.student?.email}</p>
                            <p className="text-sm text-zinc-600 mt-2">{act.description}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleVerifyActivity(act._id, "verified", 20)}
                              className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                            >
                              Verify (+20 pts)
                            </button>
                            <button
                              onClick={() => handleVerifyActivity(act._id, "rejected", 0)}
                              className="py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
