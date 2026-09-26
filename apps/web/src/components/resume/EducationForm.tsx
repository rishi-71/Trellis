"use client";

import React, { useState } from "react";

export interface EducationItem {
  level?: "graduation" | "12th" | "10th" | "other" | string;
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
  onAutoFillFromProfile?: () => void;
}

export const detectLevel = (item: EducationItem): "graduation" | "12th" | "10th" | "other" => {
  if (item.level === "graduation" || item.level === "12th" || item.level === "10th" || item.level === "other") {
    return item.level;
  }
  const text = `${item.degree || ""} ${item.branch || ""}`.toLowerCase();
  if (text.includes("12") || text.includes("twelfth") || text.includes("higher secondary") || text.includes("senior secondary") || text.includes("inter") || text.includes("xii")) {
    return "12th";
  }
  if (text.includes("10") || text.includes("tenth") || text.includes("secondary school") || text.includes("matric") || text.includes("high school") || text.includes("x grade")) {
    return "10th";
  }
  return "graduation";
};

const LEVEL_CONFIG = {
  graduation: {
    label: "Graduation / Degree",
    shortLabel: "Graduation",
    icon: "🎓",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    color: "emerald",
    defaultDegree: "Bachelor of Technology (B.Tech)",
    defaultBranch: "Computer Science & Engineering",
    institutionPlaceholder: "e.g. IPS Academy Institute of Engineering",
    degreePlaceholder: "e.g. B.Tech, B.E., BCA, B.Sc",
    branchPlaceholder: "e.g. Computer Science & Engineering, IT",
    scorePlaceholder: "e.g. 8.5 CGPA / 85%"
  },
  "12th": {
    label: "Class 12th (Higher Secondary)",
    shortLabel: "Class 12th",
    icon: "🏫",
    badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
    color: "blue",
    defaultDegree: "Class XII (Senior Secondary)",
    defaultBranch: "Science (PCM)",
    institutionPlaceholder: "e.g. Delhi Public School / St. Paul's",
    degreePlaceholder: "e.g. Class XII / Higher Secondary",
    branchPlaceholder: "e.g. Science (PCM), Commerce, State Board",
    scorePlaceholder: "e.g. 88.4%"
  },
  "10th": {
    label: "Class 10th (Secondary School)",
    shortLabel: "Class 10th",
    icon: "🎒",
    badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
    color: "purple",
    defaultDegree: "Class X (Secondary School)",
    defaultBranch: "CBSE / State Board",
    institutionPlaceholder: "e.g. St. Joseph Convent School",
    degreePlaceholder: "e.g. Class X / Secondary School",
    branchPlaceholder: "e.g. CBSE, ICSE, MP Board",
    scorePlaceholder: "e.g. 91.2% / 9.4 CGPA"
  },
  other: {
    label: "Other Qualification / Diploma",
    shortLabel: "Other",
    icon: "📚",
    badgeBg: "bg-zinc-100 text-zinc-800 border-zinc-200",
    color: "zinc",
    defaultDegree: "Diploma",
    defaultBranch: "",
    institutionPlaceholder: "e.g. Technical Institute / Polytechnic",
    degreePlaceholder: "e.g. Diploma in Engineering, Masters",
    branchPlaceholder: "e.g. Mechanical, Data Science",
    scorePlaceholder: "e.g. 8.0 CGPA"
  }
};

export default function EducationForm({ education, onChange, onAutoFillFromProfile }: EducationFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<"graduation" | "12th" | "10th" | "other">("graduation");

  const [formItem, setFormItem] = useState<EducationItem>({
    level: "graduation",
    institution: "",
    degree: "",
    branch: "",
    startYear: "",
    endYear: "",
    cgpa: ""
  });

  // Check which standard milestones already exist
  const hasGraduation = education.some((item) => detectLevel(item) === "graduation");
  const has12th = education.some((item) => detectLevel(item) === "12th");
  const has10th = education.some((item) => detectLevel(item) === "10th");

  const startAdding = (level: "graduation" | "12th" | "10th" | "other") => {
    setSelectedLevel(level);
    const config = LEVEL_CONFIG[level];
    setFormItem({
      level,
      institution: "",
      degree: config.defaultDegree,
      branch: config.defaultBranch,
      startYear: level === "10th" ? "" : level === "12th" ? "2020" : "2022",
      endYear: level === "10th" ? "2020" : level === "12th" ? "2022" : "2026",
      cgpa: ""
    });
    setEditingIndex(null);
    setIsAdding(true);
  };

  const startEditing = (index: number) => {
    const item = education[index];
    const lvl = detectLevel(item);
    setSelectedLevel(lvl);
    setFormItem({ ...item, level: lvl });
    setEditingIndex(index);
    setIsAdding(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItem.institution.trim()) return;

    const finalizedItem: EducationItem = {
      ...formItem,
      level: selectedLevel
    };

    if (editingIndex !== null) {
      const list = [...education];
      list[editingIndex] = finalizedItem;
      onChange(list);
      setEditingIndex(null);
    } else {
      onChange([...education, finalizedItem]);
      setIsAdding(false);
    }
  };

  const handleDeleteItem = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const currentConfig = LEVEL_CONFIG[selectedLevel] || LEVEL_CONFIG.graduation;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-3 gap-2">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
            <span>🎓</span> Academic Education
          </h4>
          <p className="text-[11px] text-zinc-500">
            Add your Graduation (Degree), 12th (Higher Secondary), and 10th (Secondary School) qualifications.
          </p>
        </div>
        {onAutoFillFromProfile && (
          <button
            type="button"
            onClick={onAutoFillFromProfile}
            className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>🔄</span> Auto-fill from Campus Profile
          </button>
        )}
      </div>

      {/* Quick Add Milestone Shortcuts Banner */}
      {(!hasGraduation || !has12th || !has10th) && !isAdding && editingIndex === null && (
        <div className="bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-blue-50/50 border border-emerald-200/70 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
              <span>⚡</span> Standard Academic Milestones
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Quick 1-Click Setup</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Graduation Button */}
            <button
              type="button"
              onClick={() => startAdding("graduation")}
              className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                hasGraduation
                  ? "bg-white/80 border-emerald-300 text-emerald-800 opacity-80 cursor-default"
                  : "bg-white hover:bg-emerald-50/50 border-emerald-300 shadow-xs hover:border-emerald-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🎓</span>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Graduation</p>
                  <p className="text-[10px] text-zinc-500">Degree / College</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hasGraduation ? "bg-emerald-100 text-emerald-800" : "bg-emerald-600 text-white"
              }`}>
                {hasGraduation ? "✓ Added" : "+ Add"}
              </span>
            </button>

            {/* 12th Grade Button */}
            <button
              type="button"
              onClick={() => startAdding("12th")}
              className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                has12th
                  ? "bg-white/80 border-blue-300 text-blue-800 opacity-80 cursor-default"
                  : "bg-white hover:bg-blue-50/50 border-blue-300 shadow-xs hover:border-blue-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🏫</span>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Class 12th</p>
                  <p className="text-[10px] text-zinc-500">Higher Secondary</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                has12th ? "bg-blue-100 text-blue-800" : "bg-blue-600 text-white"
              }`}>
                {has12th ? "✓ Added" : "+ Add"}
              </span>
            </button>

            {/* 10th Grade Button */}
            <button
              type="button"
              onClick={() => startAdding("10th")}
              className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                has10th
                  ? "bg-white/80 border-purple-300 text-purple-800 opacity-80 cursor-default"
                  : "bg-white hover:bg-purple-50/50 border-purple-300 shadow-xs hover:border-purple-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🎒</span>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Class 10th</p>
                  <p className="text-[10px] text-zinc-500">Secondary School</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                has10th ? "bg-purple-100 text-purple-800" : "bg-purple-600 text-white"
              }`}>
                {has10th ? "✓ Added" : "+ Add"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Education Entries List */}
      <div className="space-y-3">
        {education.length === 0 && !isAdding && (
          <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 space-y-3">
            <span className="text-3xl">📚</span>
            <div>
              <p className="text-xs text-zinc-700 font-bold">No education entries added yet.</p>
              <p className="text-[11px] text-zinc-500">Recruiters expect Graduation, 12th, and 10th details.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => startAdding("graduation")}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1"
              >
                <span>🎓</span> Add Graduation
              </button>
              <button
                type="button"
                onClick={() => startAdding("12th")}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1"
              >
                <span>🏫</span> Add Class 12th
              </button>
              <button
                type="button"
                onClick={() => startAdding("10th")}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1"
              >
                <span>🎒</span> Add Class 10th
              </button>
            </div>
          </div>
        )}

        {/* Existing education cards */}
        {education.map((item, index) => {
          const lvl = detectLevel(item);
          const config = LEVEL_CONFIG[lvl] || LEVEL_CONFIG.other;

          return (
            <div
              key={index}
              className="p-4 bg-zinc-50 hover:bg-white border border-zinc-200/90 rounded-2xl transition-all space-y-3 shadow-xs"
            >
              {editingIndex === index ? (
                /* Editing Form for this item */
                <form onSubmit={handleSaveForm} className="space-y-3 bg-white p-2 rounded-xl">
                  {/* Level Selector Tabs */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1.5">Education Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(["graduation", "12th", "10th", "other"] as const).map((lvlKey) => {
                        const opt = LEVEL_CONFIG[lvlKey];
                        const isSel = selectedLevel === lvlKey;
                        return (
                          <button
                            key={lvlKey}
                            type="button"
                            onClick={() => {
                              setSelectedLevel(lvlKey);
                              setFormItem({
                                ...formItem,
                                level: lvlKey,
                                degree: formItem.degree || opt.defaultDegree,
                                branch: formItem.branch || opt.defaultBranch
                              });
                            }}
                            className={`py-1.5 px-2 rounded-xl text-xs font-bold border text-center transition-all flex items-center justify-center gap-1 ${
                              isSel
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                            }`}
                          >
                            <span>{opt.icon}</span>
                            <span>{opt.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        {selectedLevel === "10th" || selectedLevel === "12th" ? "School / College Name *" : "Institution / University *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formItem.institution}
                        onChange={(e) => setFormItem({ ...formItem, institution: e.target.value })}
                        placeholder={currentConfig.institutionPlaceholder}
                        className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        {selectedLevel === "10th" || selectedLevel === "12th" ? "Degree / Qualification Name" : "Degree Program"}
                      </label>
                      <input
                        type="text"
                        value={formItem.degree}
                        onChange={(e) => setFormItem({ ...formItem, degree: e.target.value })}
                        placeholder={currentConfig.degreePlaceholder}
                        className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        {selectedLevel === "10th" ? "Board (e.g. CBSE, ICSE, State)" : selectedLevel === "12th" ? "Board / Stream (e.g. CBSE PCM)" : "Branch / Major Specialization"}
                      </label>
                      <input
                        type="text"
                        value={formItem.branch}
                        onChange={(e) => setFormItem({ ...formItem, branch: e.target.value })}
                        placeholder={currentConfig.branchPlaceholder}
                        className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Start Year</label>
                        <input
                          type="text"
                          value={formItem.startYear}
                          onChange={(e) => setFormItem({ ...formItem, startYear: e.target.value })}
                          placeholder={selectedLevel === "10th" ? "-" : "2022"}
                          className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Passing Year</label>
                        <input
                          type="text"
                          value={formItem.endYear}
                          onChange={(e) => setFormItem({ ...formItem, endYear: e.target.value })}
                          placeholder="2026"
                          className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Score / CGPA</label>
                        <input
                          type="text"
                          value={formItem.cgpa}
                          onChange={(e) => setFormItem({ ...formItem, cgpa: e.target.value })}
                          placeholder={currentConfig.scorePlaceholder}
                          className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      Update Entry
                    </button>
                  </div>
                </form>
              ) : (
                /* Card Display Mode */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${config.badgeBg} flex items-center gap-1`}>
                        <span>{config.icon}</span>
                        <span>{config.shortLabel}</span>
                      </span>
                      <h5 className="text-xs font-bold text-zinc-900">
                        {item.degree ? `${item.degree} ` : ""}{item.branch ? `(${item.branch})` : ""}
                      </h5>
                    </div>
                    <p className="text-[11px] text-zinc-600 font-medium">{item.institution}</p>
                    <p className="text-[10px] text-zinc-400">
                      {item.startYear && item.endYear
                        ? `${item.startYear} - ${item.endYear}`
                        : item.endYear
                        ? `Passing Year: ${item.endYear}`
                        : item.startYear
                        ? `Started: ${item.startYear}`
                        : ""}
                      {item.cgpa ? `  •  Score / CGPA: ${item.cgpa}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditing(index)}
                      className="text-xs px-2.5 py-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg font-semibold transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(index)}
                      className="text-xs px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold transition-colors"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Entry Form Overlay */}
        {isAdding && (
          <form onSubmit={handleSaveForm} className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>➕</span> Add Education: <span className="text-emerald-700">{currentConfig.label}</span>
              </h5>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Level selection tabs */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1.5">Select Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(["graduation", "12th", "10th", "other"] as const).map((lvlKey) => {
                  const opt = LEVEL_CONFIG[lvlKey];
                  const isSel = selectedLevel === lvlKey;
                  return (
                    <button
                      key={lvlKey}
                      type="button"
                      onClick={() => {
                        setSelectedLevel(lvlKey);
                        setFormItem({
                          ...formItem,
                          level: lvlKey,
                          degree: opt.defaultDegree,
                          branch: opt.defaultBranch,
                          startYear: lvlKey === "10th" ? "" : lvlKey === "12th" ? "2020" : "2022",
                          endYear: lvlKey === "10th" ? "2020" : lvlKey === "12th" ? "2022" : "2026"
                        });
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border text-center transition-all flex items-center justify-center gap-1 ${
                        isSel
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white hover:bg-emerald-50/50 text-zinc-700 border-zinc-200"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  {selectedLevel === "10th" || selectedLevel === "12th" ? "School / College Name *" : "Institution / University *"}
                </label>
                <input
                  type="text"
                  required
                  value={formItem.institution}
                  onChange={(e) => setFormItem({ ...formItem, institution: e.target.value })}
                  placeholder={currentConfig.institutionPlaceholder}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  {selectedLevel === "10th" || selectedLevel === "12th" ? "Degree / Certificate" : "Degree Program"}
                </label>
                <input
                  type="text"
                  value={formItem.degree}
                  onChange={(e) => setFormItem({ ...formItem, degree: e.target.value })}
                  placeholder={currentConfig.degreePlaceholder}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  {selectedLevel === "10th" ? "Board (e.g. CBSE, ICSE, State)" : selectedLevel === "12th" ? "Board / Stream (e.g. CBSE PCM)" : "Branch / Specialization"}
                </label>
                <input
                  type="text"
                  value={formItem.branch}
                  onChange={(e) => setFormItem({ ...formItem, branch: e.target.value })}
                  placeholder={currentConfig.branchPlaceholder}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Start Year</label>
                  <input
                    type="text"
                    value={formItem.startYear}
                    onChange={(e) => setFormItem({ ...formItem, startYear: e.target.value })}
                    placeholder={selectedLevel === "10th" ? "-" : "2022"}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">End Year</label>
                  <input
                    type="text"
                    value={formItem.endYear}
                    onChange={(e) => setFormItem({ ...formItem, endYear: e.target.value })}
                    placeholder="2026"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Score / CGPA</label>
                  <input
                    type="text"
                    value={formItem.cgpa}
                    onChange={(e) => setFormItem({ ...formItem, cgpa: e.target.value })}
                    placeholder={currentConfig.scorePlaceholder}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-emerald-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Save {currentConfig.shortLabel}
              </button>
            </div>
          </form>
        )}

        {/* Bottom Add Buttons */}
        {!isAdding && editingIndex === null && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => startAdding("graduation")}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>+</span> 🎓 Add Graduation
            </button>
            <button
              type="button"
              onClick={() => startAdding("12th")}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>+</span> 🏫 Add Class 12th
            </button>
            <button
              type="button"
              onClick={() => startAdding("10th")}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>+</span> 🎒 Add Class 10th
            </button>
            <button
              type="button"
              onClick={() => startAdding("other")}
              className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ml-auto"
            >
              <span>+</span> Other Qualification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
