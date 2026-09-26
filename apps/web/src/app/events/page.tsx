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

  const handleRegisterEvent = async (eventId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert("Successfully registered for event!");
        fetchEvents();
      } else {
        alert(data.message || "Failed to register.");
      }
    } catch (err) {
      alert("Connection error.");
    } finally {
      setLoading(false);
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
                                onClick={() => handleRegisterEvent(event._id)}
                                className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow whitespace-nowrap cursor-pointer transition-all"
                              >
                                Register
                              </button>
                            )}
                          </div>
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
      </div>
    </DashboardLayout>
  );
}
