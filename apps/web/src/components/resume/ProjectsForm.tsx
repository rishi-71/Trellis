"use client";

import React, { useState } from "react";

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string;
  githubUrl: string;
  liveDemoUrl: string;
}

interface ProjectsFormProps {
  projects: ProjectItem[];
  onChange: (updated: ProjectItem[]) => void;
}

export default function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<ProjectItem>({
    name: "",
    description: "",
    technologies: "",
    githubUrl: "",
    liveDemoUrl: ""
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    onChange([...projects, newItem]);
    setNewItem({ name: "", description: "", technologies: "", githubUrl: "", liveDemoUrl: "" });
    setIsAdding(false);
  };

  const handleUpdateItem = (index: number, updated: ProjectItem) => {
    const list = [...projects];
    list[index] = updated;
    onChange(list);
  };

  const handleDeleteItem = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Projects</h4>
          <p className="text-[11px] text-zinc-500">Key technical and academic projects demonstrating your skillset.</p>
        </div>
        <button
          type="button"
          onClick={() => { setIsAdding(true); setEditingIndex(null); }}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <span>+</span> Add Project
        </button>
      </div>

      <div className="space-y-3">
        {projects.length === 0 && !isAdding && (
          <div className="p-6 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium">No projects added yet.</p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-2 text-xs text-emerald-700 font-bold hover:underline"
            >
              + Click to add your first project
            </button>
          </div>
        )}

        {projects.map((proj, index) => (
          <div
            key={index}
            className="p-4 bg-zinc-50 hover:bg-white border border-zinc-200/80 rounded-2xl transition-all space-y-3 shadow-xs"
          >
            {editingIndex === index ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Project Name *</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => handleUpdateItem(index, { ...proj, name: e.target.value })}
                      placeholder="e.g. AI-Powered Smart Campus Navigation"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Technologies Used</label>
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={(e) => handleUpdateItem(index, { ...proj, technologies: e.target.value })}
                      placeholder="e.g. React, Node.js, MongoDB, Socket.io"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">GitHub Repository URL</label>
                    <input
                      type="text"
                      value={proj.githubUrl}
                      onChange={(e) => handleUpdateItem(index, { ...proj, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Live Demo URL</label>
                    <input
                      type="text"
                      value={proj.liveDemoUrl}
                      onChange={(e) => handleUpdateItem(index, { ...proj, liveDemoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Description & Key Contributions</label>
                    <textarea
                      rows={3}
                      value={proj.description}
                      onChange={(e) => handleUpdateItem(index, { ...proj, description: e.target.value })}
                      placeholder="Describe the problem solved, architecture used, and quantifiable results..."
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
                  <h5 className="text-xs font-bold text-zinc-900">{proj.name}</h5>
                  {proj.technologies && (
                    <p className="text-[11px] text-emerald-800 font-semibold">{proj.technologies}</p>
                  )}
                  {proj.description && (
                    <p className="text-[11px] text-zinc-600 line-clamp-2">{proj.description}</p>
                  )}
                  <div className="flex gap-3 text-[10px] text-zinc-400 pt-1">
                    {proj.githubUrl && <span>GitHub: {proj.githubUrl}</span>}
                    {proj.liveDemoUrl && <span>Demo: {proj.liveDemoUrl}</span>}
                  </div>
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
            <h5 className="text-xs font-bold text-emerald-900">New Project Entry</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. AI-Powered Smart Campus Navigation"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Technologies Used</label>
                <input
                  type="text"
                  value={newItem.technologies}
                  onChange={(e) => setNewItem({ ...newItem, technologies: e.target.value })}
                  placeholder="e.g. React, Node.js, MongoDB"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={newItem.githubUrl}
                  onChange={(e) => setNewItem({ ...newItem, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Live Demo URL</label>
                <input
                  type="text"
                  value={newItem.liveDemoUrl}
                  onChange={(e) => setNewItem({ ...newItem, liveDemoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Summary of functionalities, achievements, and impact..."
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
                Save Project
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
