"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function EventsPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // States
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const [events, setEvents] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventDate, setEventDate] = useState(getTodayStr());
  const [eventDeadline, setEventDeadline] = useState(getTodayStr());
  const [eventMaxPart, setEventMaxPart] = useState("100");

  // Participant Roster modal states (Faculty / Admin)
  const [selectedEventRoster, setSelectedEventRoster] = useState<any | null>(null);
  const [rosterParticipants, setRosterParticipants] = useState<any[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterFilterAttended, setRosterFilterAttended] = useState<"all" | "present" | "absent">("all");

  // Student Profile & Registration Form Modal states
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [eventToRegister, setEventToRegister] = useState<any | null>(null);
  const [regName, setRegName] = useState("");
  const [regRoll, setRegRoll] = useState("");
  const [regBranch, setRegBranch] = useState("");
  const [regSemester, setRegSemester] = useState<number | string>(1);
  const [regEmail, setRegEmail] = useState("");
  const [regContact, setRegContact] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccessMessage, setRegSuccessMessage] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("trellis_token");
    const savedRole = localStorage.getItem("trellis_role");
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
      fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUserId(data.user._id || data.user.id);
            setCurrentUserEmail(data.user.email || "");
          }
          if (data.success && data.profile) {
            setCurrentUserProfile(data.profile);
          }
        })
        .catch((err) => console.error("Error fetching user info:", err));
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventVenue || !eventDate || !eventDeadline) {
      alert("Please fill in required fields");
      return;
    }
    setLoading(true);

    // Set deadline to the end of that chosen day (23:59:59.999)
    const deadlineObj = new Date(eventDeadline);
    deadlineObj.setHours(23, 59, 59, 999);

    try {
      const response = await fetch(`${BACKEND_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDesc,
          venue: eventVenue,
          date: new Date(eventDate),
          registrationDeadline: deadlineObj,
          maxParticipants: parseInt(eventMaxPart) || 100
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Event created successfully!");
        setEventTitle("");
        setEventDesc("");
        setEventVenue("");
        setEventDate(getTodayStr());
        setEventDeadline(getTodayStr());
        setEventMaxPart("100");
        fetchEvents();
      } else {
        alert(data.message || "Failed to create event");
      }
    } catch (err) {
      alert("Error creating event.");
    } finally {
      setLoading(false);
    }
  };

  const openRegistrationModal = (event: any) => {
    setEventToRegister(event);
    setRegError("");
    setRegSuccessMessage("");
    setRegName(currentUserProfile?.name || "");
    setRegRoll(currentUserProfile?.rollNumber || "");
    setRegBranch(currentUserProfile?.branch || "");
    setRegSemester(currentUserProfile?.semester || 1);
    setRegEmail(currentUserEmail || "");
    setRegContact(currentUserProfile?.contact || "");
  };

  const handleConfirmRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventToRegister) return;
    if (!regName.trim()) {
      setRegError("Full Name is required.");
      return;
    }
    if (!regRoll.trim()) {
      setRegError("Enrollment Number is required.");
      return;
    }
    if (!regContact.trim()) {
      setRegError("Please provide a valid Mobile / Contact Number for event coordination.");
      return;
    }

    setRegSubmitting(true);
    setRegError("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${eventToRegister._id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: regName.trim(),
          rollNumber: regRoll.trim(),
          branch: regBranch.trim(),
          semester: regSemester,
          contact: regContact.trim()
        })
      });
      const data = await response.json();
      if (data.success) {
        setRegSuccessMessage(`🎉 You're registered! A seat for "${eventToRegister.title}" has been reserved for you.`);
        fetchEvents();
        if (currentUserProfile) {
          setCurrentUserProfile({ ...currentUserProfile, contact: regContact.trim() });
        }
        setTimeout(() => {
          setEventToRegister(null);
          setRegSuccessMessage("");
        }, 1800);
      } else {
        setRegError(data.message || "Failed to register for event.");
      }
    } catch (err) {
      setRegError("Error submitting registration. Please verify connection.");
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to remove the event "${eventTitle}"?`)) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert("Event removed successfully!");
        fetchEvents();
      } else {
        alert(data.message || "Failed to remove event.");
      }
    } catch (err) {
      alert("Error removing event.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewParticipants = async (event: any) => {
    setSelectedEventRoster(event);
    setRosterLoading(true);
    setRosterSearch("");
    setRosterFilterAttended("all");
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${event._id}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRosterParticipants(data.participants || []);
      } else {
        alert(data.message || "Failed to load participants.");
      }
    } catch (err) {
      alert("Error fetching event participants.");
    } finally {
      setRosterLoading(false);
    }
  };

  const handleToggleAttendance = async (studentUserId: string) => {
    if (!selectedEventRoster?._id) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${selectedEventRoster._id}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studentId: studentUserId })
      });
      const data = await response.json();
      if (data.success) {
        setRosterParticipants((prev) =>
          prev.map((p) =>
            p.userId === studentUserId || p._id === studentUserId
              ? { ...p, attended: data.attended !== undefined ? data.attended : !p.attended }
              : p
          )
        );
      } else {
        alert(data.message || "Could not update attendance.");
      }
    } catch (err) {
      alert("Error updating attendance.");
    }
  };

  const handleExportCSV = () => {
    if (!selectedEventRoster || rosterParticipants.length === 0) return;
    const headers = ["S.No", "Student Name", "Enrollment Number", "Branch", "Semester", "Email", "Contact", "Attendance Status"];
    const rows = rosterParticipants.map((p, idx) => [
      idx + 1,
      `"${p.name || ''}"`,
      `"${p.rollNumber || ''}"`,
      `"${p.branch || ''}"`,
      p.semester || 1,
      `"${p.email || ''}"`,
      `"${p.contact || 'N/A'}"`,
      p.attended ? "Present" : "Absent"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const safeTitle = selectedEventRoster.title.replace(/[^a-zA-Z0-9]/g, "_");
    link.setAttribute("download", `${safeTitle}_participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredParticipants = rosterParticipants.filter((p) => {
    const q = rosterSearch.toLowerCase();
    const matchesSearch =
      (p.name || "").toLowerCase().includes(q) ||
      (p.rollNumber || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.branch || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (rosterFilterAttended === "present") return p.attended;
    if (rosterFilterAttended === "absent") return !p.attended;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 text-zinc-950 font-sans">
        <div className="pb-2 border-b border-emerald-100">
          <h3 className="text-2xl font-black text-emerald-800">Notices and Event Management</h3>
          <p className="text-xs text-zinc-500 mt-1">Browse and register for campus activities, workshops, or publish and manage notices and events.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Event Form (Faculty / Admin only) */}
          {(userRole === "admin" || userRole === "faculty") && (
            <div className="lg:col-span-5 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm self-start">
              <h4 className="text-base font-bold text-zinc-900 mb-4 font-sans">Publish Event</h4>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. AI & Robotics Workshop"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Description</label>
                  <textarea
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    rows={2}
                    placeholder="Provide details about the event..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    placeholder="e.g. Block A Auditorium"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => {
                        setEventDate(e.target.value);
                        if (!eventDeadline || eventDeadline === eventDate) {
                          setEventDeadline(e.target.value);
                        }
                      }}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Registration Deadline *</label>
                    <input
                      type="date"
                      required
                      value={eventDeadline}
                      onChange={(e) => setEventDeadline(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Max Participants / Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={eventMaxPart}
                    onChange={(e) => setEventMaxPart(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Publish Event Drive
                </button>
              </form>
            </div>
          )}

          {/* Events list */}
          <div className={`${(userRole === "admin" || userRole === "faculty") ? "lg:col-span-7" : "lg:col-span-12"} bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6`}>
            <h4 className="text-base font-bold text-zinc-900">Active Campus Events</h4>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No campus events published yet.</p>
              ) : (
                events.map((event) => {
                  const isRegistered = Boolean(
                    currentUserId &&
                    event.registeredParticipants?.some((p: any) => {
                      const pid = typeof p === "object" && p !== null ? (p._id || p.id) : p;
                      return pid?.toString() === currentUserId.toString();
                    })
                  );

                  const deadlineDate = new Date(event.registrationDeadline);
                  if (deadlineDate.getHours() === 0 && deadlineDate.getMinutes() === 0 && deadlineDate.getSeconds() === 0) {
                    deadlineDate.setHours(23, 59, 59, 999);
                  }
                  const isDeadlinePassed = new Date() > deadlineDate;
                  const isCapacityFull = Boolean(event.maxParticipants && (event.registeredParticipants?.length || 0) >= event.maxParticipants);

                  const organizerId = typeof event.organizer === "object" && event.organizer !== null
                    ? (event.organizer._id || event.organizer.id)
                    : event.organizer;

                  const canDelete = userRole === "admin" || (
                    userRole === "faculty" && currentUserId && (
                      !organizerId || organizerId.toString() === currentUserId.toString()
                    )
                  );

                  return (
                    <div key={event._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h5 className="font-extrabold text-zinc-900 text-base">{event.title}</h5>
                        <p className="text-xs text-zinc-600 mt-1">{event.description}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-zinc-400">
                          <span>📍 Venue: {event.venue}</span>
                          <span>📅 Date: {new Date(event.date).toLocaleDateString()}</span>
                          <span>⏰ Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</span>
                          <span>👥 Capacity: {event.registeredParticipants?.length || 0} / {event.maxParticipants || 100}</span>
                          {event.organizer?.email && (
                            <span>👤 Host: {event.organizer.email}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {userRole === "student" && (
                          <div>
                            {isRegistered ? (
                              <span className="py-2 px-4 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 whitespace-nowrap inline-flex items-center gap-1">
                                ✓ Registered
                              </span>
                            ) : isDeadlinePassed ? (
                              <span className="py-2 px-4 bg-zinc-200 text-zinc-500 text-xs font-bold rounded-xl border border-zinc-300 whitespace-nowrap inline-flex">
                                Registration Closed
                              </span>
                            ) : isCapacityFull ? (
                              <span className="py-2 px-4 bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 whitespace-nowrap inline-flex">
                                Event Full
                              </span>
                            ) : (
                              <button
                                onClick={() => openRegistrationModal(event)}
                                className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5"
                              >
                                <span>✍️</span>
                                <span>Register</span>
                              </button>
                            )}
                          </div>
                        )}
                        {(userRole === "admin" || userRole === "faculty") && (
                          <button
                            onClick={() => handleViewParticipants(event)}
                            className="py-2 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                            title="View registered student entries"
                          >
                            <span>👥</span>
                            <span>Entries ({event.registeredParticipants?.length || 0})</span>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteEvent(event._id, event.title)}
                            className="py-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                            title="Remove this event"
                          >
                            🗑️ Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Registered Students Entries Modal (Faculty / Admin) */}
        {selectedEventRoster && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] flex flex-col shadow-2xl border border-emerald-100">
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xl font-extrabold text-zinc-950">
                      {selectedEventRoster.title}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      👥 {rosterParticipants.length} Registered
                    </span>
                    {selectedEventRoster.maxParticipants && (
                      <span className="text-xs text-zinc-400">
                        (Capacity: {selectedEventRoster.maxParticipants})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    📍 {selectedEventRoster.venue} &bull; 📅 {new Date(selectedEventRoster.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleExportCSV}
                    disabled={rosterParticipants.length === 0}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Download attendee list as CSV"
                  >
                    <span>📥</span>
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setSelectedEventRoster(null)}
                    className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Filter toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search student by name, enrollment no, or email..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {rosterSearch && (
                    <button
                      onClick={() => setRosterSearch("")}
                      className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto">
                  {(["all", "present", "absent"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setRosterFilterAttended(mode)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg capitalize transition-all ${
                        rosterFilterAttended === mode ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      {mode} ({mode === "all" ? rosterParticipants.length : mode === "present" ? rosterParticipants.filter(p => p.attended).length : rosterParticipants.filter(p => !p.attended).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Participants list/table */}
              <div className="flex-1 overflow-y-auto border border-zinc-100 rounded-2xl">
                {rosterLoading ? (
                  <div className="py-16 text-center text-xs text-zinc-400">
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mb-2" />
                    <p>Loading registered participants...</p>
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="py-16 text-center text-xs text-zinc-400 italic">
                    {rosterParticipants.length === 0
                      ? "No students have registered for this event yet."
                      : "No students matching your search criteria."}
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] uppercase font-bold text-zinc-400 sticky top-0">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Student Details</th>
                        <th className="py-3 px-4">Branch & Sem</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4 text-center">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredParticipants.map((p, idx) => (
                        <tr key={p.userId || p._id || idx} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-3 px-4 text-zinc-400 font-bold">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-zinc-900">{p.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                                {p.rollNumber}
                              </span>
                              <span className="text-[10px] text-zinc-400">{p.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-zinc-800">{p.branch}</div>
                            <div className="text-[10px] text-zinc-400">Semester {p.semester}</div>
                          </td>
                          <td className="py-3 px-4">
                            {p.contact ? (
                              <a
                                href={`tel:${p.contact}`}
                                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                <span>📞</span>
                                <span>{p.contact}</span>
                              </a>
                            ) : (
                              <span className="text-zinc-400 italic text-[11px]">Not provided</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleAttendance(p.userId || p._id)}
                              className={`py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                                p.attended
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm"
                                  : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              {p.attended ? "✓ Present" : "Mark Present"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Modal Footer Summary */}
              <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                <div>
                  Total Attendance:{" "}
                  <span className="font-bold text-emerald-700">
                    {rosterParticipants.filter((p) => p.attended).length} / {rosterParticipants.length}
                  </span>{" "}
                  Present
                </div>
                <button
                  onClick={() => setSelectedEventRoster(null)}
                  className="py-1.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Event Registration Form Modal */}
        {eventToRegister && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-100 gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    Event Registration
                  </span>
                  <h4 className="text-lg font-extrabold text-zinc-950 mt-1.5">
                    {eventToRegister.title}
                  </h4>
                  <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500 mt-1">
                    <span>📍 {eventToRegister.venue}</span>
                    <span>&bull;</span>
                    <span>📅 {new Date(eventToRegister.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEventToRegister(null);
                    setRegError("");
                    setRegSuccessMessage("");
                  }}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-sm transition-all cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Success Screen */}
              {regSuccessMessage ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner">
                    ✓
                  </div>
                  <h5 className="text-base font-extrabold text-zinc-950">Registration Confirmed!</h5>
                  <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                    {regSuccessMessage}
                  </p>
                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-[11px] text-zinc-600 max-w-xs mx-auto">
                    <span className="font-bold text-zinc-900">{regName}</span> &bull; {regRoll} &bull; {regBranch}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmRegistration} className="space-y-4">
                  {/* Info notice */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 text-emerald-800 rounded-2xl text-[11px] flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <span>Your academic credentials have been automatically loaded from your verified Trellis profile.</span>
                  </div>

                  {regError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Form fields */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                          Enrollment / Roll No. *
                        </label>
                        <input
                          type="text"
                          required
                          value={regRoll}
                          onChange={(e) => setRegRoll(e.target.value)}
                          placeholder="e.g. 21BCS101"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                          Branch / Department
                        </label>
                        <input
                          type="text"
                          value={regBranch}
                          onChange={(e) => setRegBranch(e.target.value)}
                          placeholder="e.g. Computer Science"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                          Current Semester
                        </label>
                        <select
                          value={regSemester}
                          onChange={(e) => setRegSemester(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>Semester {s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                        College Email ID
                      </label>
                      <input
                        type="email"
                        disabled
                        value={regEmail}
                        className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-zinc-700">
                          Mobile / WhatsApp Number *
                        </label>
                        <span className="text-[10px] text-emerald-700 font-bold">Required for event updates</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={regContact}
                        onChange={(e) => {
                          setRegContact(e.target.value);
                          if (regError) setRegError("");
                        }}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Faculty coordinators will use this number for urgent event reminders or room assignments.
                      </p>
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setEventToRegister(null)}
                      className="flex-1 py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={regSubmitting}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {regSubmitting ? (
                        <>
                          <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <span>Confirm & Register</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
