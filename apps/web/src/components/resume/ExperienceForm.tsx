"use client";

import React, { useState } from "react";

export interface ExperienceItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ExperienceFormProps {
  experience: ExperienceItem[];
  onChange: (updated: ExperienceItem[]) => void;
}

export default function ExperienceForm({ experience, onChange }: ExperienceFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<ExperienceItem>({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    description: ""
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.company.trim() && !newItem.role.trim()) return;
    onChange([...experience, newItem]);
    setNewItem({ company: "", role: "", startDate: "", endDate: "", description: "" });
    setIsAdding(false);
  };

  const handleUpdateItem = (index: number, updated: ExperienceItem) => {
    const list = [...experience];
    list[index] = updated;
    onChange(list);
  };

  const handleDeleteItem = (index: number) => {
    onChange(experience.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Experience / Internships</h4>
          <p className="text-[11px] text-zinc-500">Work history, corporate internships, and research apprenticeships.</p>
        </div>
        <button
          type="button"
          onClick={() => { setIsAdding(true); setEditingIndex(null); }}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <span>+</span> Add Experience
        </button>
      </div>

      <div className="space-y-3">
        {experience.length === 0 && !isAdding && (
          <div className="p-6 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium">No experience entries added yet.</p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-2 text-xs text-emerald-700 font-bold hover:underline"
            >
              + Click to add your internship or job experience
            </button>
          </div>
        )}

        {experience.map((exp, index) => (
          <div
            key={index}
            className="p-4 bg-zinc-50 hover:bg-white border border-zinc-200/80 rounded-2xl transition-all space-y-3 shadow-xs"
          >
            {editingIndex === index ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateItem(index, { ...exp, company: e.target.value })}
                      placeholder="e.g. Infosys / Google Summer of Code"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Role / Job Title *</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleUpdateItem(index, { ...exp, role: e.target.value })}
                      placeholder="e.g. Software Engineer Intern"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleUpdateItem(index, { ...exp, startDate: e.target.value })}
                      placeholder="e.g. May 2024"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">End Date</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => handleUpdateItem(index, { ...exp, endDate: e.target.value })}
                      placeholder="e.g. Aug 2024 or Present"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Key Responsibilities & Impact</label>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => handleUpdateItem(index, { ...exp, description: e.target.value })}
                      placeholder="Built microservices reducing API latency by 30%, collaborated with cross-functional teams..."
                      className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-500"
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
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-zinc-900">
                    {exp.role} <span className="font-medium text-emerald-800">@ {exp.company}</span>
                  </h5>
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-[10px] text-zinc-400 font-medium">
                      {exp.startDate || ""} - {exp.endDate || "Present"}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-[11px] text-zinc-600 line-clamp-2">{exp.description}</p>
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
            <h5 className="text-xs font-bold text-emerald-900">New Experience Entry</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={newItem.company}
                  onChange={(e) => setNewItem({ ...newItem, company: e.target.value })}
                  placeholder="e.g. TCS / Tech Startup"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Role / Job Title *</label>
                <input
                  type="text"
                  required
                  value={newItem.role}
                  onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
                  placeholder="e.g. Frontend Engineer Intern"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Start Date</label>
                <input
                  type="text"
                  value={newItem.startDate}
                  onChange={(e) => setNewItem({ ...newItem, startDate: e.target.value })}
                  placeholder="e.g. Jun 2024"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">End Date</label>
                <input
                  type="text"
                  value={newItem.endDate}
                  onChange={(e) => setNewItem({ ...newItem, endDate: e.target.value })}
                  placeholder="e.g. Aug 2024"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Summarize key tasks, tools utilized, and metrics improved..."
                  className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-500"
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
                Save Experience
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
