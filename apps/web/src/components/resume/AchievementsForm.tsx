"use client";

import React, { useState } from "react";

export interface AchievementItem {
  title: string;
  description: string;
  date: string;
}

interface AchievementsFormProps {
  achievements: AchievementItem[];
  onChange: (updated: AchievementItem[]) => void;
}

export default function AchievementsForm({ achievements, onChange }: AchievementsFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<AchievementItem>({
    title: "",
    description: "",
    date: ""
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    onChange([...achievements, newItem]);
    setNewItem({ title: "", description: "", date: "" });
    setIsAdding(false);
  };

  const handleUpdateItem = (index: number, updated: AchievementItem) => {
    const list = [...achievements];
    list[index] = updated;
    onChange(list);
  };

  const handleDeleteItem = (index: number) => {
    onChange(achievements.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Key Achievements & Honors</h4>
          <p className="text-[11px] text-zinc-500">Hackathon wins, competitive programming ranks, academic awards, and leadership roles.</p>
        </div>
        <button
          type="button"
          onClick={() => { setIsAdding(true); setEditingIndex(null); }}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <span>+</span> Add Achievement
        </button>
      </div>

      <div className="space-y-3">
        {achievements.length === 0 && !isAdding && (
          <div className="p-6 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium">No achievements added yet.</p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-2 text-xs text-emerald-700 font-bold hover:underline"
            >
              + Click to add your achievements
            </button>
          </div>
        )}

        {achievements.map((ach, index) => (
          <div
            key={index}
            className="p-4 bg-zinc-50 hover:bg-white border border-zinc-200/80 rounded-2xl transition-all space-y-3 shadow-xs"
          >
            {editingIndex === index ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Achievement Title *</label>
                    <input
                      type="text"
                      value={ach.title}
                      onChange={(e) => handleUpdateItem(index, { ...ach, title: e.target.value })}
                      placeholder="e.g. 1st Place - Smart India Hackathon 2024"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Date / Year</label>
                    <input
                      type="text"
                      value={ach.date}
                      onChange={(e) => handleUpdateItem(index, { ...ach, date: e.target.value })}
                      placeholder="e.g. Oct 2024"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Description / Details</label>
                    <textarea
                      rows={2}
                      value={ach.description}
                      onChange={(e) => handleUpdateItem(index, { ...ach, description: e.target.value })}
                      placeholder="Recognized out of 500+ teams nationwide for developing an automated IoT security system..."
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
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-zinc-900">
                    {ach.title} {ach.date && <span className="text-[10px] text-zinc-400 font-normal">({ach.date})</span>}
                  </h5>
                  {ach.description && (
                    <p className="text-[11px] text-zinc-600 leading-relaxed">{ach.description}</p>
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
            <h5 className="text-xs font-bold text-emerald-900">New Achievement</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Achievement Title *</label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g. 1st Place - Smart India Hackathon 2024"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Date / Year</label>
                <input
                  type="text"
                  value={newItem.date}
                  onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                  placeholder="e.g. Oct 2024"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Recognized out of 500+ teams nationwide for developing an automated IoT security system..."
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
                Save Achievement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
