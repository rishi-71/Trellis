"use client";

import React from "react";

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (updated: PersonalInfo) => void;
}

export default function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Personal Information</h4>
          <p className="text-[11px] text-zinc-500">Contact and identity details shown at the top of your resume.</p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">Header</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={data.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="e.g. Ramesh Sharma"
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs transition-colors outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address *</label>
          <input
            type="email"
            value={data.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="e.g. ramesh@ipsacademy.org"
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs transition-colors outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={data.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs transition-colors outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">City / Location</label>
          <input
            type="text"
            value={data.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="e.g. Indore, MP, India"
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs transition-colors outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">LinkedIn URL</label>
          <input
            type="text"
            value={data.linkedin || ""}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            placeholder="e.g. linkedin.com/in/username"
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs transition-colors outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">GitHub URL</label>
          <input
            type="text"
            value={data.github || ""}
            onChange={(e) => handleChange("github", e.target.value)}
            placeholder="e.g. github.com/username"
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs transition-colors outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-zinc-700 mb-1">Portfolio / Personal Website</label>
          <input
            type="text"
            value={data.portfolio || ""}
            onChange={(e) => handleChange("portfolio", e.target.value)}
            placeholder="e.g. https://myportfolio.dev"
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs transition-colors outline-none"
          />
        </div>
      </div>
    </div>
  );
}
