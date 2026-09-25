"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import ResumeBuilder from "../../../components/resume/ResumeBuilder";
import Link from "next/link";

export default function ResumeBuilderPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/career" className="hover:text-emerald-700 font-semibold transition-colors">
            Career Hub
          </Link>
          <span>/</span>
          <span className="font-bold text-zinc-800">Resume Builder</span>
        </div>

        {/* Main Resume Builder Suite */}
        <ResumeBuilder />
      </div>
    </DashboardLayout>
  );
}
