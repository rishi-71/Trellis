"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function LostFoundPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // States
  const [lostFoundItems, setLostFoundItems] = useState<any[]>([]);
  const [lfTitle, setLfTitle] = useState("");
  const [lfType, setLfType] = useState("lost");
  const [lfDesc, setLfDesc] = useState("");
  const [lfLocation, setLfLocation] = useState("");
  const [lfContact, setLfContact] = useState("");
  
  // Files
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);

  // Filter
  const [selectedTagFilter, setSelectedTagFilter] = useState<"all" | "lost" | "found">("all");

  const proofInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const response = await fetch(`${BACKEND_URL}/api/upload-file`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              fileData: base64Data,
              fileType: file.type.includes("pdf") ? "pdf" : "image"
            })
          });
          const data = await response.json();
          if (data.success) {
            resolve(data.url);
          } else {
            reject(new Error(data.message || "Upload failed"));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleReportLostFound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lfTitle || !lfDesc) {
      alert("Please fill in the title and description.");
      return;
    }

    if (lfType === "lost" && !proofFile) {
      alert("Ownership proof (bill or receipt) is required when reporting a lost item.");
      return;
    }

    setUploading(true);
    setLoading(true);

    try {
      let proofUrl = "";
      let imageUrl = "";

      if (proofFile) {
        proofUrl = await uploadFile(proofFile);
      }
      if (itemImageFile) {
        imageUrl = await uploadFile(itemImageFile);
      }

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
          contactDetails: lfContact,
          proofUrl,
          imageUrl
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Bulletin reported successfully!");
        setLfTitle("");
        setLfDesc("");
        setLfLocation("");
        setLfContact("");
        setProofFile(null);
        setItemImageFile(null);
        if (proofInputRef.current) proofInputRef.current.value = "";
        if (imageInputRef.current) imageInputRef.current.value = "";
        fetchLostFoundItems();
      } else {
        alert(data.message || "Error reporting item.");
      }
    } catch (err: any) {
      alert("Error reporting item: " + err.message);
    } finally {
      setUploading(false);
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
        alert("Item status updated successfully!");
        fetchLostFoundItems();
      }
    } catch (err) {
      alert("Error updating item status.");
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = lostFoundItems.filter((item) => {
    if (selectedTagFilter === "all") return true;
    return item.type === selectedTagFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 text-zinc-950 font-sans">
        <div className="pb-2 border-b border-emerald-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-emerald-800">Campus Lost & Found Hub</h3>
            <p className="text-xs text-zinc-500 mt-1">Report lost belongings with proof, upload found items, and track claimed status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Report Form */}
          <div className="lg:col-span-5 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm self-start">
            <h4 className="text-base font-bold text-zinc-900 mb-4 font-sans">Report Item</h4>
            
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setLfType("lost");
                  setProofFile(null);
                  if (proofInputRef.current) proofInputRef.current.value = "";
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  lfType === "lost" ? "bg-rose-100 border-rose-300 text-rose-800" : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                I LOST AN ITEM
              </button>
              <button
                type="button"
                onClick={() => {
                  setLfType("found");
                  setProofFile(null);
                  if (proofInputRef.current) proofInputRef.current.value = "";
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  lfType === "found" ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                I FOUND AN ITEM
              </button>
            </div>

            <form onSubmit={handleReportLostFound} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Item Title / Product Type *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keys, iPhone 14, Leather Wallet"
                  value={lfTitle}
                  onChange={(e) => setLfTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Item Description / Details *</label>
                <textarea
                  required
                  placeholder="e.g. Black leather with cards, keys with a red keychain. Mention distinct marks..."
                  value={lfDesc}
                  onChange={(e) => setLfDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-300"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Location Details *</label>
                  <input
                    type="text"
                    required
                    placeholder="Classroom B-201 / Canteen"
                    value={lfLocation}
                    onChange={(e) => setLfLocation(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Contact Email/Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91-XXXXX or email"
                    value={lfContact}
                    onChange={(e) => setLfContact(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-300"
                  />
                </div>
              </div>

              {/* Bill/Receipt File Uploader (LOST ONLY) */}
              {lfType === "lost" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Ownership Proof (Receipt, Bill, Card ID) *</label>
                  <input
                    type="file"
                    ref={proofInputRef}
                    required
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setProofFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Please upload proof to confirm you are the owner of this lost item.</p>
                </div>
              )}

              {/* Optional Item Image (BOTH) */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Item Photo (Optional)</label>
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setItemImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all disabled:opacity-50"
              >
                {uploading ? "Uploading media..." : "Publish Report"}
              </button>
            </form>
          </div>

          {/* Bulletin Board */}
          <div className="lg:col-span-7 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col space-y-4">
            
            {/* Sidebar Tags Filtering Heading inside panel */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-2">
              <h4 className="text-base font-bold text-zinc-900">Active Campus Bulletins</h4>
              <div className="flex bg-zinc-100 rounded-xl p-1 text-[11px] font-bold">
                <button
                  onClick={() => setSelectedTagFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedTagFilter === "all" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  📋 All Items
                </button>
                <button
                  onClick={() => setSelectedTagFilter("lost")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedTagFilter === "lost" ? "bg-white text-rose-800 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  🔴 Lost
                </button>
                <button
                  onClick={() => setSelectedTagFilter("found")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedTagFilter === "found" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  🟢 Found
                </button>
              </div>
            </div>

            {loading && filteredItems.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs italic">
                No items matching the selection.
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                {filteredItems.map((item) => (
                  <div key={item._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 hover:bg-zinc-100/50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded ${
                          item.type === "lost" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {item.type}
                        </span>
                        <h5 className="font-extrabold text-zinc-900 text-sm">{item.title}</h5>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          item.status === "claimed" ? "bg-zinc-200 text-zinc-600" : "bg-blue-100 text-blue-800"
                        }`}>
                          {item.status === "claimed" ? "claimed" : "open"}
                        </span>
                      </div>
                      
                      <p className="text-xs text-zinc-600 leading-relaxed font-medium">{item.description}</p>
                      
                      {item.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="max-h-24 object-cover rounded-lg border border-zinc-200"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-zinc-400 font-semibold">
                        <span>📍 Location: {item.location}</span>
                        <span>📞 Contact: {item.contact}</span>
                        <span>📅 Reported: {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>

                      {item.proofUrl && (
                        <div className="mt-2">
                          <a
                            href={item.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-rose-600 hover:underline font-bold flex items-center gap-1"
                          >
                            📄 View Bill / Receipt Proof
                          </a>
                        </div>
                      )}
                    </div>

                    {item.status !== "claimed" ? (
                      <button
                        onClick={() => handleClaimLostFound(item._id)}
                        className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm whitespace-nowrap"
                      >
                        Claim / Resolve
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-zinc-400 border border-zinc-300/50 rounded px-2.5 py-1 whitespace-nowrap bg-zinc-200/20">
                        Resolved
                      </span>
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
