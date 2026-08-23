"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function LostFoundPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // States
  const [lostFoundItems, setLostFoundItems] = useState<any[]>([]);
  const [lfTitle, setLfTitle] = useState("");
  const [lfType, setLfType] = useState("lost");
  const [lfDesc, setLfDesc] = useState("");
  const [lfLocation, setLfLocation] = useState("");
  const [lfContact, setLfContact] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("trellis_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchLostFoundItems();
    }
  }, [token]);

  const fetchLostFoundItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/lostfound`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setLostFoundItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportLostFound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lfTitle || !lfDesc) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/lostfound`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: lfTitle,
          description: lfDesc,
          type: lfType,
          location: lfLocation || "Campus",
          contactDetails: lfContact
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Bulletin reported successfully!");
        setLfTitle("");
        setLfDesc("");
        setLfLocation("");
        setLfContact("");
        fetchLostFoundItems();
      }
    } catch (err) {
      alert("Error reporting item.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimLostFound = async (itemId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/lostfound/${itemId}/claim`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert("Item claimed successfully!");
        fetchLostFoundItems();
      }
    } catch (err) {
      alert("Error claiming item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-zinc-950 font-sans">
        <div className="pb-2 border-b border-emerald-100">
          <h3 className="text-2xl font-black text-emerald-800">Lost & Found</h3>
          <p className="text-xs text-zinc-500 mt-1">Report lost belongings or claim found items on the campus board</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Report Form */}
          <div className="lg:col-span-5 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm self-start">
            <h4 className="text-base font-bold text-zinc-900 mb-4 font-sans">Report Item</h4>
            <form onSubmit={handleReportLostFound} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keys, Wallet, ID Card"
                  value={lfTitle}
                  onChange={(e) => setLfTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Item Details *</label>
                <textarea
                  required
                  placeholder="Describe details like color, brands, date..."
                  value={lfDesc}
                  onChange={(e) => setLfDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Location Details</label>
                <input
                  type="text"
                  placeholder="e.g. Classroom B-201, Canteen"
                  value={lfLocation}
                  onChange={(e) => setLfLocation(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Contact Email/Phone</label>
                <input
                  type="text"
                  value={lfContact}
                  onChange={(e) => setLfContact(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLfType("lost")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                    lfType === "lost" ? "bg-rose-100 border-rose-300 text-rose-800" : "bg-white border-zinc-200 text-zinc-500"
                  }`}
                >
                  I LOST IT
                </button>
                <button
                  type="button"
                  onClick={() => setLfType("found")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                    lfType === "found" ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-white border-zinc-200 text-zinc-500"
                  }`}
                >
                  I FOUND IT
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Log Report Drive
              </button>
            </form>
          </div>

          {/* Bulletin Board */}
          <div className="lg:col-span-7 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h4 className="text-base font-bold text-zinc-900">Active Campus Bulletins</h4>
            <div className="space-y-4">
              {lostFoundItems.map((item) => (
                <div key={item._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded ${
                        item.type === "lost" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {item.type}
                      </span>
                      <h5 className="font-extrabold text-zinc-900 text-sm">{item.title}</h5>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
                    <div className="flex gap-4 mt-3 text-[10px] text-zinc-400">
                      <span>📍 Area: {item.location}</span>
                      <span>📅 Date: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {item.status !== "claimed" ? (
                    <button
                      onClick={() => handleClaimLostFound(item._id)}
                      className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                    >
                      Claim
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-zinc-400">Claimed</span>
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
