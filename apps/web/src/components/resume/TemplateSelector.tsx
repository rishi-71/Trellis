"use client";

import React from "react";

export type ResumeTemplateType = "modern" | "classic" | "ats";

interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplateType;
  onSelect: (template: ResumeTemplateType) => void;
}

export default function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  const templates: {
    id: ResumeTemplateType;
    name: string;
    badge: string;
    description: string;
    accentColor: string;
  }[] = [
    {
      id: "modern",
      name: "Modern",
      badge: "Popular",
      description: "Clean contemporary layout with emerald accents, modern typography, and structured chips.",
      accentColor: "border-emerald-600 bg-emerald-50/50 text-emerald-900"
    },
    {
      id: "classic",
      name: "Classic",
      badge: "Formal",
      description: "Traditional corporate elegance with centered header, serif fonts, and subtle divider rules.",
      accentColor: "border-zinc-800 bg-zinc-50 text-zinc-900"
    },
    {
      id: "ats",
      name: "ATS Friendly",
      badge: "Recruiter Ready",
      description: "Single-column format, standard headings, and clean text layout optimized for ATS scanning.",
      accentColor: "border-blue-600 bg-blue-50/50 text-blue-900"
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Choose Template</label>
        <span className="text-[11px] text-zinc-500 font-medium">3 Layouts Available</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((tpl) => {
          const isSelected = selectedTemplate === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl.id)}
              className={`text-left p-3.5 rounded-2xl border-2 transition-all relative ${
                isSelected
                  ? `${tpl.accentColor} shadow-sm ring-2 ring-emerald-500/20`
                  : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold">{tpl.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? "bg-white/80 shadow-xs" : "bg-zinc-100 text-zinc-600"
                }`}>
                  {tpl.badge}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-500 line-clamp-2">
                {tpl.description}
              </p>
              {isSelected && (
                <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <span>✓</span> Active Template
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
