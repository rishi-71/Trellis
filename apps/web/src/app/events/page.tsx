"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function EventsPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // States
  const [events, setEvents] = useState<any[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventDate, setEventDate] = useState("2026-09-10");
  const [eventDeadline, setEventDeadline] = useState("2026-09-08");
  const [eventMaxPart, setEventMaxPart] = useState("100");

  useEffect(() => {
    const savedToken = localStorage.getItem("trellis_token");
    const savedRole = localStorage.getItem("trellis_role");
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
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
    if (!eventTitle || !eventVenue || !eventDate) {
      alert("Please fill in required fields");
      return;
    }
    setLoading(true);
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
          registrationDeadline: new Date(eventDeadline),
          maxParticipants: parseInt(eventMaxPart) || 100
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Event created successfully!");
        setEventTitle("");
        setEventDesc("");
        setEventVenue("");
        fetchEvents();
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

  return (
    <DashboardLayout>
      <div className="space-y-6 text-zinc-950 font-sans">
        <div className="pb-2 border-b border-emerald-100">
          <h3 className="text-2xl font-black text-emerald-800">Active Campus Events</h3>
          <p className="text-xs text-zinc-500 mt-1">Browse and register for campus activities or publish new events</p>
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
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Description</label>
                  <textarea
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    rows={2}
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
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
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
              {events.map((event) => (
                <div key={event._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h5 className="font-extrabold text-zinc-900 text-base">{event.title}</h5>
                    <p className="text-xs text-zinc-600 mt-1">{event.description}</p>
                    <div className="flex gap-4 mt-3 text-[10px] text-zinc-400">
                      <span>📍 Venue: {event.venue}</span>
                      <span>📅 Date: {new Date(event.date).toLocaleDateString()}</span>
                      <span>👥 Capacity: {event.registeredParticipants?.length || 0} / {event.maxParticipants || 100}</span>
                    </div>
                  </div>
                  {userRole === "student" && (
                    <button
                      onClick={() => handleRegisterEvent(event._id)}
                      className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow"
                    >
                      Register
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
