"use client";

import React, { useState } from "react";

export interface EducationItem {
  institution: string;
  degree: string;
  branch: string;
  startYear: string;
  endYear: string;
  cgpa: string;
}

interface EducationFormProps {
  education: EducationItem[];
  onChange: (updated: EducationItem[]) => void;
}

export default function EducationForm({ education, onChange }: EducationFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<EducationItem>({
    institution: "",
    degree: "",
    branch: "",
    startYear: "",
    endYear: "",
    cgpa: ""
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.institution.trim()) return;
    onChange([...education, newItem]);
    setNewItem({ institution: "", degree: "", branch: "", startYear: "", endYear: "", cgpa: "" });
    setIsAdding(false);
  };

  const handleUpdateItem = (index: number, updated: EducationItem) => {
    const list = [...education];
    list[index] = updated;
    onChange(list);
  };

  const handleDeleteItem = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Education</h4>
          <p className="text-[11px] text-zinc-500">Degree, college/school, timeline, and scores.</p>
        </div>
        <button
          type="button"
          onClick={() => { setIsAdding(true); setEditingIndex(null); }}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <span>+</span> Add Education
        </button>
      </div>

      {/* Existing entries */}
      <div className="space-y-3">
        {education.length === 0 && !isAdding && (
          <div className="p-6 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium">No education entries added yet.</p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-2 text-xs text-emerald-700 font-bold hover:underline"
            >
              + Click to add Graduation or High School
            </button>
          </div>
        )}

        {education.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-zinc-50 hover:bg-white border border-zinc-200/80 rounded-2xl transition-all space-y-3 shadow-xs"
          >
            {editingIndex === index ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Institution / University</label>
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) => handleUpdateItem(index, { ...item, institution: e.target.value })}
                      placeholder="e.g. IPS Academy Institute of Engineering"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Degree / Standard</label>
                    <input
                      type="text"
                      value={item.degree}
                      onChange={(e) => handleUpdateItem(index, { ...item, degree: e.target.value })}
                      placeholder="e.g. B.Tech / Senior Secondary"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Branch / Stream</label>
                    <input
                      type="text"
                      value={item.branch}
                      onChange={(e) => handleUpdateItem(index, { ...item, branch: e.target.value })}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Start Year</label>
                      <input
                        type="text"
                        value={item.startYear}
                        onChange={(e) => handleUpdateItem(index, { ...item, startYear: e.target.value })}
                        placeholder="2022"
                        className="w-full bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">End Year</label>
                      <input
                        type="text"
                        value={item.endYear}
                        onChange={(e) => handleUpdateItem(index, { ...item, endYear: e.target.value })}
                        placeholder="2026"
                        className="w-full bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">CGPA / %</label>
                      <input
                        type="text"
                        value={item.cgpa}
                        onChange={(e) => handleUpdateItem(index, { ...item, cgpa: e.target.value })}
                        placeholder="8.5 / 85%"
                        className="w-full bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
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
                <div>
                  <h5 className="text-xs font-bold text-zinc-900">
                    {item.degree ? `${item.degree} - ` : ""}{item.branch || item.institution}
                  </h5>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{item.institution}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {item.startYear || item.endYear ? `${item.startYear || ""} - ${item.endYear || "Present"}` : ""}
                    {item.cgpa ? `  •  Score: ${item.cgpa}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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

        {/* Add New Form */}
        {isAdding && (
          <form onSubmit={handleAddItem} className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-3">
            <h5 className="text-xs font-bold text-emerald-900">New Education Entry</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Institution / University *</label>
                <input
                  type="text"
                  required
                  value={newItem.institution}
                  onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })}
                  placeholder="e.g. IPS Academy Institute of Engineering"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Degree / Standard</label>
                <input
                  type="text"
                  value={newItem.degree}
                  onChange={(e) => setNewItem({ ...newItem, degree: e.target.value })}
                  placeholder="e.g. B.Tech / XII Grade"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Branch / Specialization</label>
                <input
                  type="text"
                  value={newItem.branch}
                  onChange={(e) => setNewItem({ ...newItem, branch: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Start Year</label>
                  <input
                    type="text"
                    value={newItem.startYear}
                    onChange={(e) => setNewItem({ ...newItem, startYear: e.target.value })}
                    placeholder="2022"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">End Year</label>
                  <input
                    type="text"
                    value={newItem.endYear}
                    onChange={(e) => setNewItem({ ...newItem, endYear: e.target.value })}
                    placeholder="2026"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">CGPA / %</label>
                  <input
                    type="text"
                    value={newItem.cgpa}
                    onChange={(e) => setNewItem({ ...newItem, cgpa: e.target.value })}
                    placeholder="8.5"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
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
                Save Entry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
