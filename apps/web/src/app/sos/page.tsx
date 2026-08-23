"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function SOSPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // States
  const [sosLocation, setSosLocation] = useState("Campus Main Block");
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);

  useEffect(() => {
    const savedToken = localStorage.getItem("trellis_token");
    const savedRole = localStorage.getItem("trellis_role");
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
    }
  }, []);

  useEffect(() => {
    if (token && (userRole === "admin" || userRole === "faculty")) {
      fetchActiveSOS();
    }
  }, [token, userRole]);

  const fetchActiveSOS = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/sos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSosAlerts(data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSOS = async () => {
    setLoading(true);
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
        alert("🚨 SOS SENT: Campus security has been alerted!");
      }
    } catch (err) {
      alert("Error triggering emergency SOS.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSOS = async (sosId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/sos/${sosId}/resolve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert("SOS Alert marked resolved successfully!");
        fetchActiveSOS();
      }
    } catch (err) {
      alert("Error resolving SOS alert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-zinc-950 font-sans">
        <div className="pb-2 border-b border-emerald-100">
          <h3 className="text-2xl font-black text-emerald-800">Campus Security & SOS</h3>
          <p className="text-xs text-zinc-500 mt-1">Submit immediate assistance alarms or manage active emergency cases</p>
        </div>

        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl flex flex-col items-center text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 border-4 border-rose-200 flex items-center justify-center text-2xl animate-[pulse_1s_infinite]">
            🚨
          </div>
          <h4 className="text-lg font-black text-rose-800 uppercase tracking-wider">Trigger Emergency SOS Assistance</h4>
          <p className="text-xs text-rose-700 leading-relaxed px-6">
            Pressing this button will dispatch campus guards to your location immediately. Do not trigger unless there is an active security threat or medical emergency.
          </p>

          <input
            type="text"
            value={sosLocation}
            onChange={(e) => setSosLocation(e.target.value)}
            className="w-full bg-white border border-rose-200 rounded-xl px-4 py-2.5 text-xs text-center font-bold text-rose-800"
          />

          <button
            onClick={handleTriggerSOS}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow"
          >
            SEND EMERGENCY ALARM
          </button>
        </div>

        {(userRole === "admin" || userRole === "faculty") && (
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm mt-8 space-y-6">
            <h4 className="text-base font-bold text-zinc-900">Active Security Dispatches</h4>
            <div className="space-y-4">
              {sosAlerts.map((alertItem) => (
                <div key={alertItem._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 flex justify-between items-center">
                  <div>
                    <h5 className="font-extrabold text-zinc-900 text-sm">🚨 Location: {alertItem.location}</h5>
                    <p className="text-xs text-zinc-500 mt-1">Student Email: {alertItem.studentId?.email}</p>
                  </div>
                  <button
                    onClick={() => handleResolveSOS(alertItem._id)}
                    className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
