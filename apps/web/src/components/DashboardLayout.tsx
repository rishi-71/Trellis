"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem("trellis_token");
    const savedRole = localStorage.getItem("trellis_role");
    const savedEmail = localStorage.getItem("trellis_email");

    if (!savedToken) {
      if (pathname !== "/finder") {
        router.push("/");
      }
    } else {
      setToken(savedToken);
      setUserRole(savedRole);
      setUserEmail(savedEmail);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("trellis_token");
    localStorage.removeItem("trellis_role");
    localStorage.removeItem("trellis_email");
    router.push("/");
  };

  if (!mounted || (!token && pathname !== "/finder")) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const menuItems = [
    { name: "🏠 OS Desktop", path: "/#desktop" },
    { name: "📍 Campus Finder", path: "/finder" },
    { name: "💼 Placements Board", path: "/placements" },
    { name: "👥 Career Hub", path: "/career" },
    { name: "🔬 Sensor Renting", path: "/sensors" },
    { name: "📢 Notices Board", path: "/events" },
    { name: "🔧 Service Complaints", path: "/complaints" },
    { name: "📦 Lost & Found", path: "/lostfound" },
    { name: "🚨 SOS Security", path: "/sos" },
  ];

  return (
    <div className="min-h-screen bg-[#F4FBF7] flex flex-col md:flex-row font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-emerald-100 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-emerald-100 flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <span className="text-lg font-black text-emerald-800 tracking-tight">Trellis</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isGated = item.path !== "/#desktop" && item.path !== "/finder";
            const isActive = pathname === item.path || (item.path === "/#desktop" && pathname === "/");
            return (
              <Link
                key={item.name}
                href={isGated && !token ? "/" : item.path}
                onClick={(e) => {
                  if (isGated && !token) {
                    e.preventDefault();
                    alert("Please login first to access this feature");
                    router.push("/");
                  }
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600"
                    : "text-zinc-600 hover:bg-emerald-50/50 hover:text-emerald-800"
                }`}
              >
                <span>{item.name}</span>
                {isGated && !token && <span className="text-xs">🔒</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-emerald-100 bg-emerald-50/20">
          {token ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 uppercase">
                  {userEmail ? userEmail[0] : "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-emerald-800 truncate">{userEmail}</p>
                  <p className="text-[9px] uppercase font-bold text-emerald-600">{userRole}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-100"
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/")}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all text-center"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-grow p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
