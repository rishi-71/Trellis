"use client";

import React, { useState } from "react";
import { PersonalInfo } from "./PersonalInfoForm";
import { EducationItem } from "./EducationForm";
import { SkillsData } from "./SkillsForm";
import { ProjectItem } from "./ProjectsForm";
import { ExperienceItem } from "./ExperienceForm";
import { CertificationItem } from "./CertificationsForm";
import { AchievementItem } from "./AchievementsForm";
import { ResumeTemplateType } from "./TemplateSelector";

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  education: EducationItem[];
  skills: SkillsData;
  projects: ProjectItem[];
  experience: ExperienceItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
}

interface ResumePreviewProps {
  data: ResumeData;
  template: ResumeTemplateType;
  onDownloadPdf?: () => void;
  isDownloading?: boolean;
}

export default function ResumePreview({ data, template, onDownloadPdf, isDownloading = false }: ResumePreviewProps) {
  const [scale, setScale] = useState<number>(1);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Preview Controls Bar */}
      <div className="flex items-center justify-between bg-zinc-900 text-white px-4 py-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Live Preview</span>
          <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full capitalize font-medium">
            {template}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-zinc-800 rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setScale(Math.max(0.7, scale - 0.1))}
              className="px-2 py-1 text-zinc-300 hover:text-white font-bold"
              title="Zoom out"
            >
              -
            </button>
            <span className="px-2 py-1 text-[11px] font-mono text-zinc-300">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={() => setScale(Math.min(1.2, scale + 0.1))}
              className="px-2 py-1 text-zinc-300 hover:text-white font-bold"
              title="Zoom in"
            >
              +
            </button>
          </div>

          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isDownloading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <span>{isDownloading ? "⏳" : "📥"}</span>
              <span>{isDownloading ? "Generating PDF..." : "Download PDF"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Paper Sheet Container */}
      <div className="flex-1 overflow-auto bg-zinc-100/80 p-4 sm:p-6 rounded-2xl border border-zinc-200/80 flex justify-center items-start min-h-[650px]">
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
          className="w-full max-w-[760px] bg-white rounded-xl shadow-md border border-zinc-200/80 p-8 sm:p-10 transition-transform duration-150 text-zinc-900 min-h-[900px]"
        >
          {template === "classic" && <ClassicResumeView data={data} />}
          {template === "ats" && <AtsResumeView data={data} />}
          {template === "modern" && <ModernResumeView data={data} />}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. MODERN TEMPLATE VIEW
// -------------------------------------------------------------
function ModernResumeView({ data }: { data: ResumeData }) {
  const pInfo = data.personalInfo || {};
  const skills = data.skills || {};

  const contactItems = [];
  if (pInfo.email) contactItems.push(pInfo.email);
  if (pInfo.phone) contactItems.push(pInfo.phone);
  if (pInfo.location) contactItems.push(pInfo.location);

  const linkItems = [];
  if (pInfo.linkedin) linkItems.push({ label: "LinkedIn", url: pInfo.linkedin });
  if (pInfo.github) linkItems.push({ label: "GitHub", url: pInfo.github });
  if (pInfo.portfolio) linkItems.push({ label: "Portfolio", url: pInfo.portfolio });

  return (
    <div className="space-y-5 text-[12px] font-sans">
      {/* Header */}
      <div className="border-b-2 border-teal-700 pb-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-800 tracking-tight">
          {pInfo.fullName || "Your Full Name"}
        </h1>
        {contactItems.length > 0 && (
          <p className="text-zinc-600 text-[11px] font-medium mt-1">
            {contactItems.join("  •  ")}
          </p>
        )}
        {linkItems.length > 0 && (
          <div className="flex flex-wrap gap-3 text-[11px] text-teal-700 font-semibold mt-1">
            {linkItems.map((item, idx) => (
              <span key={idx}>
                {item.label}: <span className="text-zinc-600 font-normal">{item.url}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && data.summary.trim() && (
        <div className="space-y-1">
          <h2 className="text-[12px] font-bold text-teal-800 uppercase tracking-wider border-b border-zinc-200 pb-0.5">
            Professional Summary
          </h2>
          <p className="text-zinc-700 leading-relaxed text-[11.5px] pt-1 text-justify">
            {data.summary}
          </p>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold text-teal-800 uppercase tracking-wider border-b border-zinc-200 pb-0.5">
            Education
          </h2>
          <div className="space-y-2 pt-1">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-zinc-900 text-[12px]">
                    {edu.degree ? `${edu.degree} in ` : ""}{edu.branch || edu.institution}
                  </h3>
                  <p className="text-zinc-600 text-[11px]">{edu.institution}</p>
                </div>
                <div className="text-right text-[11px] text-zinc-500 shrink-0">
                  <p className="font-medium">{edu.startYear || edu.endYear ? `${edu.startYear || ""} - ${edu.endYear || "Present"}` : ""}</p>
                  {edu.cgpa && <p className="font-semibold text-teal-800">CGPA: {edu.cgpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold text-teal-800 uppercase tracking-wider border-b border-zinc-200 pb-0.5">
            Technical Skills
          </h2>
          <div className="space-y-1.5 text-[11.5px] pt-1">
            {skills.programmingLanguages?.length > 0 && (
              <p>
                <span className="font-bold text-zinc-900">Languages: </span>
                <span className="text-zinc-700">{skills.programmingLanguages.join(", ")}</span>
              </p>
            )}
            {skills.frameworks?.length > 0 && (
              <p>
                <span className="font-bold text-zinc-900">Frameworks: </span>
                <span className="text-zinc-700">{skills.frameworks.join(", ")}</span>
              </p>
            )}
            {skills.databases?.length > 0 && (
              <p>
                <span className="font-bold text-zinc-900">Databases: </span>
                <span className="text-zinc-700">{skills.databases.join(", ")}</span>
              </p>
            )}
            {skills.tools?.length > 0 && (
              <p>
                <span className="font-bold text-zinc-900">Tools: </span>
                <span className="text-zinc-700">{skills.tools.join(", ")}</span>
              </p>
            )}
            {skills.otherSkills?.length > 0 && (
              <p>
                <span className="font-bold text-zinc-900">Other: </span>
                <span className="text-zinc-700">{skills.otherSkills.join(", ")}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold text-teal-800 uppercase tracking-wider border-b border-zinc-200 pb-0.5">
            Experience / Internships
          </h2>
          <div className="space-y-3 pt-1">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-zinc-900 text-[12px]">
                    {exp.role} <span className="font-semibold text-teal-800">@ {exp.company}</span>
                  </h3>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {exp.startDate || exp.endDate ? `${exp.startDate || ""} - ${exp.endDate || "Present"}` : ""}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-zinc-700 text-[11px] leading-relaxed pl-1">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold text-teal-800 uppercase tracking-wider border-b border-zinc-200 pb-0.5">
            Projects
          </h2>
          <div className="space-y-3 pt-1">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-zinc-900 text-[12px]">{proj.name}</h3>
                  <div className="flex gap-2 text-[10px] text-teal-700 font-semibold">
                    {proj.githubUrl && <span>[GitHub]</span>}
                    {proj.liveDemoUrl && <span>[Live Demo]</span>}
                  </div>
                </div>
                {proj.technologies && (
                  <p className="text-[11px] text-teal-900 font-medium italic">
                    Tech: {proj.technologies}
                  </p>
                )}
                {proj.description && (
                  <p className="text-zinc-700 text-[11px] leading-relaxed pl-1">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold text-teal-800 uppercase tracking-wider border-b border-zinc-200 pb-0.5">
            Certifications
          </h2>
          <ul className="list-disc list-inside space-y-1 text-[11.5px] text-zinc-700 pt-1">
            {data.certifications.map((cert, idx) => (
              <li key={idx}>
                <span className="font-semibold text-zinc-900">{cert.name}</span>
                {cert.organization && <span> - {cert.organization}</span>}
                {cert.date && <span className="text-zinc-500"> ({cert.date})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold text-teal-800 uppercase tracking-wider border-b border-zinc-200 pb-0.5">
            Key Achievements
          </h2>
          <ul className="list-disc list-inside space-y-1 text-[11.5px] text-zinc-700 pt-1">
            {data.achievements.map((ach, idx) => (
              <li key={idx}>
                <span className="font-semibold text-zinc-900">{ach.title}</span>
                {ach.date && <span className="text-zinc-500"> ({ach.date})</span>}
                {ach.description && <span className="text-zinc-600 block pl-4 text-[11px]">{ach.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 2. CLASSIC TEMPLATE VIEW
// -------------------------------------------------------------
function ClassicResumeView({ data }: { data: ResumeData }) {
  const pInfo = data.personalInfo || {};
  const skills = data.skills || {};

  const contactList = [];
  if (pInfo.location) contactList.push(pInfo.location);
  if (pInfo.phone) contactList.push(pInfo.phone);
  if (pInfo.email) contactList.push(pInfo.email);
  if (pInfo.linkedin) contactList.push(pInfo.linkedin);
  if (pInfo.github) contactList.push(pInfo.github);
  if (pInfo.portfolio) contactList.push(pInfo.portfolio);

  return (
    <div className="space-y-5 text-[12px] font-serif">
      {/* Centered Classic Header */}
      <div className="text-center border-b border-zinc-400 pb-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-zinc-900">
          {pInfo.fullName || "YOUR FULL NAME"}
        </h1>
        {contactList.length > 0 && (
          <p className="text-zinc-700 text-[11px] mt-1.5">
            {contactList.join("  •  ")}
          </p>
        )}
      </div>

      {/* Summary */}
      {data.summary && data.summary.trim() && (
        <div className="space-y-1">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5">
            Professional Summary
          </h2>
          <p className="text-zinc-800 leading-relaxed text-[11.5px] pt-1 text-justify">
            {data.summary}
          </p>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5">
            Education
          </h2>
          <div className="space-y-2 pt-1">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-zinc-900 text-[12px]">{edu.institution}</h3>
                  <p className="text-zinc-700 italic text-[11px]">
                    {edu.degree ? `${edu.degree}, ` : ""}{edu.branch}
                  </p>
                </div>
                <div className="text-right text-[11px] text-zinc-600">
                  <p className="italic">{edu.startYear || edu.endYear ? `${edu.startYear || ""} - ${edu.endYear || "Present"}` : ""}</p>
                  {edu.cgpa && <p className="font-semibold">CGPA: {edu.cgpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5">
            Professional Experience
          </h2>
          <div className="space-y-3 pt-1">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-zinc-900 text-[12px]">{exp.company}</h3>
                  <span className="text-[11px] text-zinc-600 italic">
                    {exp.startDate || exp.endDate ? `${exp.startDate || ""} - ${exp.endDate || "Present"}` : ""}
                  </span>
                </div>
                <p className="text-zinc-700 italic text-[11px]">{exp.role}</p>
                {exp.description && (
                  <p className="text-zinc-800 text-[11px] leading-relaxed pt-0.5">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5">
            Key Projects
          </h2>
          <div className="space-y-3 pt-1">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-zinc-900 text-[12px]">
                    {proj.name} {proj.technologies && <span className="font-normal italic text-zinc-600">| {proj.technologies}</span>}
                  </h3>
                </div>
                {proj.description && (
                  <p className="text-zinc-800 text-[11px] leading-relaxed">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5">
            Skills & Competencies
          </h2>
          <div className="space-y-1 text-[11.5px] pt-1 text-zinc-800">
            {skills.programmingLanguages?.length > 0 && (
              <p><span className="font-bold">Languages:</span> {skills.programmingLanguages.join(", ")}</p>
            )}
            {skills.frameworks?.length > 0 && (
              <p><span className="font-bold">Frameworks:</span> {skills.frameworks.join(", ")}</p>
            )}
            {skills.databases?.length > 0 && (
              <p><span className="font-bold">Databases:</span> {skills.databases.join(", ")}</p>
            )}
            {skills.tools?.length > 0 && (
              <p><span className="font-bold">Tools:</span> {skills.tools.join(", ")}</p>
            )}
            {skills.otherSkills?.length > 0 && (
              <p><span className="font-bold">Other:</span> {skills.otherSkills.join(", ")}</p>
            )}
          </div>
        </div>
      )}

      {/* Certifications & Achievements */}
      {((data.certifications && data.certifications.length > 0) || (data.achievements && data.achievements.length > 0)) && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5">
            Certifications & Honors
          </h2>
          <ul className="list-disc list-inside space-y-1 text-[11.5px] text-zinc-800 pt-1">
            {(data.certifications || []).map((cert, idx) => (
              <li key={`cert-${idx}`}>
                <span className="font-semibold">{cert.name}</span>
                {cert.organization && <span> - {cert.organization}</span>}
                {cert.date && <span className="text-zinc-500"> ({cert.date})</span>}
              </li>
            ))}
            {(data.achievements || []).map((ach, idx) => (
              <li key={`ach-${idx}`}>
                <span className="font-semibold">{ach.title}</span>
                {ach.date && <span className="text-zinc-500"> ({ach.date})</span>}
                {ach.description && <span>: {ach.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 3. ATS FRIENDLY TEMPLATE VIEW
// -------------------------------------------------------------
function AtsResumeView({ data }: { data: ResumeData }) {
  const pInfo = data.personalInfo || {};
  const skills = data.skills || {};

  const atsContactList = [];
  if (pInfo.email) atsContactList.push(pInfo.email);
  if (pInfo.phone) atsContactList.push(pInfo.phone);
  if (pInfo.location) atsContactList.push(pInfo.location);
  if (pInfo.linkedin) atsContactList.push(pInfo.linkedin);
  if (pInfo.github) atsContactList.push(pInfo.github);
  if (pInfo.portfolio) atsContactList.push(pInfo.portfolio);

  return (
    <div className="space-y-4 text-[12px] font-sans text-black leading-normal">
      {/* ATS Header */}
      <div className="border-b border-black pb-2">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
          {pInfo.fullName || "FULL NAME"}
        </h1>
        {atsContactList.length > 0 && (
          <p className="text-[11px] text-black font-medium mt-1">
            {atsContactList.join(" | ")}
          </p>
        )}
      </div>

      {/* Summary */}
      {data.summary && data.summary.trim() && (
        <div className="space-y-1">
          <h2 className="text-[12px] font-bold uppercase text-black border-b border-black pb-0.5">
            Professional Summary
          </h2>
          <p className="text-[11.5px] text-black pt-1 leading-relaxed">
            {data.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {skills && (
        <div className="space-y-1">
          <h2 className="text-[12px] font-bold uppercase text-black border-b border-black pb-0.5">
            Technical Skills
          </h2>
          <div className="space-y-1 text-[11.5px] text-black pt-1">
            {skills.programmingLanguages?.length > 0 && (
              <p><span className="font-bold">Programming Languages:</span> {skills.programmingLanguages.join(", ")}</p>
            )}
            {skills.frameworks?.length > 0 && (
              <p><span className="font-bold">Frameworks & Libraries:</span> {skills.frameworks.join(", ")}</p>
            )}
            {skills.databases?.length > 0 && (
              <p><span className="font-bold">Databases:</span> {skills.databases.join(", ")}</p>
            )}
            {skills.tools?.length > 0 && (
              <p><span className="font-bold">Tools & Technologies:</span> {skills.tools.join(", ")}</p>
            )}
            {skills.otherSkills?.length > 0 && (
              <p><span className="font-bold">Other Skills:</span> {skills.otherSkills.join(", ")}</p>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold uppercase text-black border-b border-black pb-0.5">
            Work Experience
          </h2>
          <div className="space-y-2.5 pt-1">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-[12px]">
                  <span>{exp.role} | {exp.company}</span>
                  <span className="font-normal">{exp.startDate || exp.endDate ? `${exp.startDate || ""} - ${exp.endDate || "Present"}` : ""}</span>
                </div>
                {exp.description && (
                  <p className="text-[11.5px] pl-3">
                    • {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold uppercase text-black border-b border-black pb-0.5">
            Projects
          </h2>
          <div className="space-y-2.5 pt-1">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-[12px]">
                  <span>{proj.name}</span>
                  {proj.technologies && <span className="font-normal"> ({proj.technologies})</span>}
                  {(proj.githubUrl || proj.liveDemoUrl) && (
                    <span className="font-normal text-[10.5px]"> | {[proj.githubUrl && `GitHub: ${proj.githubUrl}`, proj.liveDemoUrl && `Demo: ${proj.liveDemoUrl}`].filter(Boolean).join(" | ")}</span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-[11.5px] pl-3">
                    • {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold uppercase text-black border-b border-black pb-0.5">
            Education
          </h2>
          <div className="space-y-2 pt-1">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-[11.5px]">
                <div>
                  <span className="font-bold">{edu.institution}</span>
                  <span className="block">{edu.degree ? `${edu.degree} - ` : ""}{edu.branch}{edu.cgpa ? ` (CGPA: ${edu.cgpa})` : ""}</span>
                </div>
                <span className="shrink-0">{edu.startYear || edu.endYear ? `${edu.startYear || ""} - ${edu.endYear || "Present"}` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="space-y-1">
          <h2 className="text-[12px] font-bold uppercase text-black border-b border-black pb-0.5">
            Certifications
          </h2>
          <ul className="list-disc list-inside space-y-0.5 text-[11.5px] pt-1">
            {data.certifications.map((cert, idx) => (
              <li key={idx}>
                <span className="font-semibold">{cert.name}</span>
                {cert.organization && <span> - {cert.organization}</span>}
                {cert.date && <span> ({cert.date})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <div className="space-y-1">
          <h2 className="text-[12px] font-bold uppercase text-black border-b border-black pb-0.5">
            Achievements
          </h2>
          <ul className="list-disc list-inside space-y-0.5 text-[11.5px] pt-1">
            {data.achievements.map((ach, idx) => (
              <li key={idx}>
                <span className="font-semibold">{ach.title}</span>
                {ach.date && <span> ({ach.date})</span>}
                {ach.description && <span>: {ach.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
