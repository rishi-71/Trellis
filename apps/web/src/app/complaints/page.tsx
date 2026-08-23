"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function ComplaintsPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // States
  const [complaints, setComplaints] = useState<any[]>([]);
  const [category, setCategory] = useState("wifi");
  const [description, setDescription] = useState("");

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
      fetchComplaints();
    }
  }, [token, userRole]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const url = (userRole === "admin" || userRole === "faculty") 
        ? `${BACKEND_URL}/api/complaints` 
        : `${BACKEND_URL}/api/complaints/my`;
        
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ category, description })
      });
      const data = await response.json();
      if (data.success) {
        alert("Complaint ticket submitted successfully!");
        setDescription("");
        fetchComplaints();
      }
    } catch (err) {
      alert("Error submitting complaint.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId: string, newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/complaints/${complaintId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Status updated to ${newStatus}`);
        fetchComplaints();
      }
    } catch (err) {
      alert("Error updating status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-zinc-950 font-sans">
        <div className="pb-2 border-b border-emerald-100">
          <h3 className="text-2xl font-black text-emerald-800">Campus Support & Complaints</h3>
          <p className="text-xs text-zinc-500 mt-1">Submit maintenance tickets or review active support cases in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* File Complaint Form (Student only) */}
          {userRole === "student" && (
            <div className="lg:col-span-5 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm self-start">
              <h4 className="text-base font-bold text-zinc-900 mb-4">File Support Request</h4>
              <form onSubmit={handleFileComplaint} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Issue Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none"
                  >
                    <option value="wifi">WiFi / Connectivity</option>
                    <option value="washroom">Washroom Sanitation</option>
                    <option value="projector">Projector / Lab hardware</option>
                    <option value="fan">Fan / Electrical issue</option>
                    <option value="light">Lighting maintenance</option>
                    <option value="cleaning">Classroom Cleaning</option>
                    <option value="other">Other Campus Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Description *</label>
                  <textarea
                    required
                    placeholder="Describe room number, equipment ID, or other specifics..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  File Complaint Ticket
                </button>
              </form>
            </div>
          )}

          {/* Tickets List */}
          <div className={`${userRole === "student" ? "lg:col-span-7" : "lg:col-span-12"} bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6`}>
            <h4 className="text-base font-bold text-zinc-900">
              {userRole === "student" ? "My Support Tickets" : "College Administration Case List"}
            </h4>
            
            {complaints.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-6">No support tickets found.</p>
            ) : (
              <div className="space-y-4">
                {complaints.map((c) => (
                  <div key={c._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-100">
                          {c.category}
                        </span>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                          c.status === "resolved" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : c.status === "in_progress" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-700 font-medium leading-relaxed">{c.description}</p>
                      <p className="text-[10px] text-zinc-400 mt-2">
                        Filed on: {new Date(c.createdAt).toLocaleDateString()} 
                        {c.student?.email && ` | Student: ${c.student.email}`}
                      </p>
                    </div>

                    {(userRole === "admin" || userRole === "faculty") && c.status !== "resolved" && (
                      <div className="flex gap-2">
                        {c.status === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(c._id, "in_progress")}
                            className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-lg"
                          >
                            Mark In-Progress
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(c._id, "resolved")}
                          className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
