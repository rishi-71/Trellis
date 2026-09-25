"use client";

import React, { useState } from "react";

export interface CertificationItem {
  name: string;
  organization: string;
  date: string;
  credentialUrl: string;
}

interface CertificationsFormProps {
  certifications: CertificationItem[];
  onChange: (updated: CertificationItem[]) => void;
}

export default function CertificationsForm({ certifications, onChange }: CertificationsFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<CertificationItem>({
    name: "",
    organization: "",
    date: "",
    credentialUrl: ""
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    onChange([...certifications, newItem]);
    setNewItem({ name: "", organization: "", date: "", credentialUrl: "" });
    setIsAdding(false);
  };

  const handleUpdateItem = (index: number, updated: CertificationItem) => {
    const list = [...certifications];
    list[index] = updated;
    onChange(list);
  };

  const handleDeleteItem = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Certifications</h4>
          <p className="text-[11px] text-zinc-500">Industry-recognized professional courses and certificates.</p>
        </div>
        <button
          type="button"
          onClick={() => { setIsAdding(true); setEditingIndex(null); }}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <span>+</span> Add Certificate
        </button>
      </div>

      <div className="space-y-3">
        {certifications.length === 0 && !isAdding && (
          <div className="p-6 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium">No certifications added yet.</p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-2 text-xs text-emerald-700 font-bold hover:underline"
            >
              + Click to add your certificate
            </button>
          </div>
        )}

        {certifications.map((cert, index) => (
          <div
            key={index}
            className="p-4 bg-zinc-50 hover:bg-white border border-zinc-200/80 rounded-2xl transition-all space-y-3 shadow-xs"
          >
            {editingIndex === index ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Certificate Name *</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleUpdateItem(index, { ...cert, name: e.target.value })}
                      placeholder="e.g. AWS Certified Cloud Practitioner"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Issuing Organization</label>
                    <input
                      type="text"
                      value={cert.organization}
                      onChange={(e) => handleUpdateItem(index, { ...cert, organization: e.target.value })}
                      placeholder="e.g. Amazon Web Services / Coursera"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Issue Date</label>
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => handleUpdateItem(index, { ...cert, date: e.target.value })}
                      placeholder="e.g. March 2024"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Credential URL</label>
                    <input
                      type="text"
                      value={cert.credentialUrl}
                      onChange={(e) => handleUpdateItem(index, { ...cert, credentialUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-zinc-900">{cert.name}</h5>
                  <p className="text-[11px] text-zinc-600">
                    {cert.organization}{cert.date ? `  •  ${cert.date}` : ""}
                  </p>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-emerald-700 hover:underline block pt-0.5"
                    >
                      View Credential ↗
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(index)}
                    className="text-xs text-zinc-600 hover:text-emerald-700 font-semibold p-1"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(index)}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold p-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <form onSubmit={handleAddItem} className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-3">
            <h5 className="text-xs font-bold text-emerald-900">New Certification</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Certificate Name *</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Meta Frontend Developer Professional"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Issuing Organization</label>
                <input
                  type="text"
                  value={newItem.organization}
                  onChange={(e) => setNewItem({ ...newItem, organization: e.target.value })}
                  placeholder="e.g. Coursera / Meta"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Date</label>
                <input
                  type="text"
                  value={newItem.date}
                  onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                  placeholder="e.g. Jan 2024"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Credential URL</label>
                <input
                  type="text"
                  value={newItem.credentialUrl}
                  onChange={(e) => setNewItem({ ...newItem, credentialUrl: e.target.value })}
                  placeholder="https://coursera.org/verify/..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Certificate
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
