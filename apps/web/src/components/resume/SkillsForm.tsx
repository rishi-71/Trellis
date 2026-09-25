"use client";

import React, { useState } from "react";

export interface SkillsData {
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  otherSkills: string[];
}

interface SkillsFormProps {
  skills: SkillsData;
  onChange: (updated: SkillsData) => void;
}

export default function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const [inputs, setInputs] = useState<{ [key: string]: string }>({
    programmingLanguages: "",
    frameworks: "",
    databases: "",
    tools: "",
    otherSkills: ""
  });

  const categories: { key: keyof SkillsData; label: string; placeholder: string }[] = [
    { key: "programmingLanguages", label: "Programming Languages", placeholder: "e.g. JavaScript, Python, C++, Java, TypeScript" },
    { key: "frameworks", label: "Frameworks & Libraries", placeholder: "e.g. React.js, Next.js, Node.js, Express, TailwindCSS" },
    { key: "databases", label: "Databases", placeholder: "e.g. MongoDB, PostgreSQL, MySQL, Redis" },
    { key: "tools", label: "Tools & Platforms", placeholder: "e.g. Git, GitHub, Docker, Postman, VS Code, Linux" },
    { key: "otherSkills", label: "Other Skills & Core Concepts", placeholder: "e.g. Data Structures, REST APIs, System Design, Agile" }
  ];

  const handleAddTag = (key: keyof SkillsData) => {
    const raw = (inputs[key] || "").trim();
    if (!raw) return;
    const splitTags = raw.split(",").map(t => t.trim()).filter(Boolean);
    const existing = skills[key] || [];
    const merged = Array.from(new Set([...existing, ...splitTags]));
    onChange({
      ...skills,
      [key]: merged
    });
    setInputs({ ...inputs, [key]: "" });
  };

  const handleRemoveTag = (key: keyof SkillsData, tagToRemove: string) => {
    const existing = skills[key] || [];
    onChange({
      ...skills,
      [key]: existing.filter(t => t !== tagToRemove)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: keyof SkillsData) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(key);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Skills & Competencies</h4>
          <p className="text-[11px] text-zinc-500">Group your skills by category for higher ATS scoring.</p>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map(({ key, label, placeholder }) => {
          const currentList = skills[key] || [];
          return (
            <div key={key} className="bg-zinc-50/70 p-3.5 border border-zinc-200/80 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-zinc-800">{label}</label>
              
              {/* Tags Container */}
              <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                {currentList.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 text-zinc-800 text-[11px] font-semibold rounded-lg shadow-xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(key, tag)}
                      className="text-zinc-400 hover:text-red-600 text-xs font-bold leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {currentList.length === 0 && (
                  <span className="text-[11px] text-zinc-400 italic">No {label.toLowerCase()} added yet.</span>
                )}
              </div>

              {/* Input row */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={inputs[key] || ""}
                  onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, key)}
                  placeholder={placeholder}
                  className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(key)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
