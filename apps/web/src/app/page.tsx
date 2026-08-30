"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

export default function Home() {
  const BACKEND_URL = "http://localhost:5000";
  const router = useRouter();

  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState(false);

  const carouselSlides = [
    {
      title: "Smart Campus OS Pathfinder",
      desc: "Instant floor plans, indoor location searches, and Dijkstra shortest path routing.",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600"
    },
    {
      title: "Placement Drives & Matching",
      desc: "Rule-based automated matchmaking, student CV qualification logs, and drive reports.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600"
    },
    {
      title: "Student of the Year Scoring",
      desc: "Earn points for verified co-curricular achievements and track the live student leaderboard.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600"
    }
  ];

  const features = [
    { title: "📍 Smart Finder (M1)", desc: "Navigate your way with live floor plans, cabin directories, and path routing.", icon: "🗺️" },
    { title: "💼 Placement Board (M3)", desc: "Match eligibility criteria automatically and register for placement drives.", icon: "📈" },
    { title: "👥 Student Career Hub (M4)", desc: "Publish social updates, endorse skills, and compile your academic resume PDF.", icon: "🎓" },
    { title: "🔬 IoT Sensor Rentals (M7)", desc: "Check out hardware sensors, manage return deadlines, and calculate fines.", icon: "🔌" },
    { title: "🔧 Support complaints (M5)", desc: "Report campus maintenance issues (WiFi, washrooms, electrical) and track status.", icon: "🛠️" },
    { title: "🚨 SOS Emergency (M6)", desc: "Quick dispatch alarm to notify campus guards of your location instantly.", icon: "🚨" }
  ];

  const sampleEvents = [
    { _id: "e1", title: "Smart India Hackathon 2026", description: "Internal hackathon rounds to select the team representing the institute.", venue: "Block A Auditorium", date: "2026-09-10" },
    { _id: "e2", title: "Capgemini Placement Talk", description: "Pre-placement presentation and eligibility criteria explanation seminar.", venue: "Main Seminar Hall", date: "2026-08-28" },
    { _id: "e3", title: "IoT Device Workshop", description: "Hands-on session using microcontrollers and sensor renting workflows.", venue: "IoT Lab Block C", date: "2026-09-02" }
  ];

  const desktopApps = [
    { name: "Campus Finder", path: "/finder", desc: "Interactive maps, buildings, rooms, facilities and indoor navigation to help you find anything across the campus.", bg: "bg-emerald-600", icon: "📍", illus: "/images/illus_finder.jpg", badge: "SMART CAMPUS SOLUTION" },
    { name: "Events", path: "/events", desc: "Explore upcoming events, register for workshops, seminars and stay updated with all the happenings around campus.", bg: "bg-teal-600", icon: "📢", illus: "/images/illus_events.jpg" },
    { name: "Career Profile", path: "/career", desc: "Build your professional identity by showcasing your skills, projects, certifications and achievements.", bg: "bg-emerald-700", icon: "👥", illus: "/images/illus_career.jpg" },
    { name: "Sensor IoT", path: "/sensors", desc: "Real-time monitoring of campus environment sensors like temperature, humidity, air quality and get instant alerts for any anomalies.", bg: "bg-emerald-800", icon: "🔬", illus: "/images/illus_sensors.jpg" },
    { name: "Placement", path: "/placements", desc: "Register for placements, upload documents and get automatically matched with eligible job opportunities posted by companies.", bg: "bg-teal-700", icon: "💼", illus: "/images/illus_placement.jpg" },
    { name: "Service Complaint", path: "/complaints", desc: "Raise complaints regarding any campus service issues and track their status until resolution.", bg: "bg-emerald-700", icon: "🔧", illus: "/images/illus_complaints.jpg" },
    { name: "Lost & Found", path: "/lostfound", desc: "Report lost items or browse found items across the campus. Get notified when your lost item is found.", bg: "bg-emerald-600", icon: "📦", illus: "/images/illus_lostfound.jpg" },
    { name: "Security", path: "/sos", desc: "Stay safe with real-time security alerts and emergency notifications to ensure a secure campus environment.", bg: "bg-rose-600", icon: "🚨", illus: "/images/illus_security.jpg" }
  ];

  // Sync token from localStorage on load
  useEffect(() => {
    const savedToken = localStorage.getItem("trellis_token");
    const savedRole = localStorage.getItem("trellis_role");
    const savedEmail = localStorage.getItem("trellis_email");
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
      setUserEmail(savedEmail);
    }
  }, []);

  // Automatic slide rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUserRole(data.user.role);
        setUserEmail(data.user.email);
        localStorage.setItem("trellis_token", data.token);
        localStorage.setItem("trellis_role", data.user.role);
        localStorage.setItem("trellis_email", data.user.email);
        setAuthMessage("Logged in successfully!");
        setIsAuthModalOpen(false);
      } else {
        setAuthError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setAuthError(`Could not connect to backend server.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent, selectedRole: string) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUserRole(data.user.role);
        setUserEmail(data.user.email);
        localStorage.setItem("trellis_token", data.token);
        localStorage.setItem("trellis_role", data.user.role);
        localStorage.setItem("trellis_email", data.user.email);
        setAuthMessage("Registered successfully!");
        setIsAuthModalOpen(false);
      } else {
        setAuthError(data.message || "Something went wrong");
      }
    } catch (err) {
      setAuthError("Could not connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureCardClick = (app: any, e: React.MouseEvent) => {
    const isPublic = app.path === "/finder";
    if (isPublic) {
      router.push(app.path);
    } else {
      if (token) {
        router.push(app.path);
      } else {
        e.preventDefault();
        setIsAuthRequiredModalOpen(true);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans text-zinc-900 bg-[#F4FBF7]">
      {!token ? (
        /* Marketing Landing Page */
        <>
          <div className="fixed-bg-container">
            <img src="/images/ips-bg.png" className="fixed-bg-image opacity-70" alt="Campus Backdrop" />
            <div className="fixed-bg-overlay opacity-60"></div>
          </div>
          
          <div className="relative w-full flex flex-col min-h-screen">
            
            {/* Top Navbar */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-zinc-150 px-6 py-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <span className="text-lg font-black text-emerald-800 tracking-tight leading-none">Trellis</span>
              </div>
              
              <div className="hidden md:flex gap-8 text-xs font-bold text-zinc-700">
                <a href="#hero" className="hover:text-emerald-800 transition-colors border-b-2 border-emerald-600 pb-1">Home</a>
                <a href="#features" className="hover:text-emerald-800 transition-colors pb-1">Features</a>
              </div>

              <button
                onClick={() => {
                  setIsLoginView(true);
                  setIsAuthModalOpen(true);
                }}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-2"
              >
                <span>👤</span> Login / Signup
              </button>
            </nav>

            {/* Main scrolling wrapper */}
            <div className="pt-24 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
              
              {/* Hero Section */}
              <section id="hero" className="min-h-[calc(100vh-140px)] flex items-center justify-center">
                <div className="w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-emerald-100/30 shadow-2xl p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Hero Left */}
                  <div className="lg:col-span-7 flex flex-col space-y-6">
                    <div>
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-emerald-150 shadow-sm">
                        Smart Campus Solution
                      </span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-950 tracking-tight leading-[1.1]">
                      Everything your <span className="text-emerald-600 underline decoration-wavy decoration-emerald-300 decoration-3 underline-offset-8">campus</span> needs, in one OS
                    </h2>
                    <p className="text-zinc-600 text-base leading-relaxed max-w-xl">
                      Discover interactive layouts, automate placement checkouts, request lab IoT sensors, report support complaints, and trigger emergency alarms seamlessly from one unified workspace.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <button
                        onClick={() => {
                          setIsLoginView(true);
                          setIsAuthModalOpen(true);
                        }}
                        className="py-3 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30"
                      >
                        Access Workspace
                      </button>
                      <a
                        href="#features"
                        className="py-3 px-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-all shadow"
                      >
                        Explore Features
                      </a>
                    </div>
                  </div>

                  {/* Hero Right Slideshow */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="relative aspect-[4/3] w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white shadow-zinc-950/20">
                      <div className="absolute inset-0">
                        <img
                          src={carouselSlides[currentSlide].image}
                          className="w-full h-full object-cover opacity-90"
                          alt="Carousel Slide"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white z-20 space-y-1">
                        <h4 className="font-extrabold text-sm">{carouselSlides[currentSlide].title}</h4>
                        <p className="text-[10px] text-zinc-200">{carouselSlides[currentSlide].desc}</p>
                      </div>

                      <div className="absolute bottom-5 left-0 w-full flex justify-center space-x-2 z-20">
                        {carouselSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all border border-white/50 ${
                              idx === currentSlide ? "bg-emerald-500 scale-125" : "bg-white/60 hover:bg-white"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              {/* Features Module Section */}
              <section id="features" className="scroll-mt-24">
                <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-8 md:p-12 lg:p-16 border border-emerald-100/20 shadow-xl">
                  <div className="max-w-3xl mb-12">
                    <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Modules Overview</span>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-zinc-950 mt-2 mb-4">Integrated Campus Ecosystem</h3>
                    <p className="text-zinc-600 leading-relaxed">
                      Trellis Campus OS unifies fragmented college databases into a dynamic client interface. Each app represents a complete workspace sync'd directly with the MongoDB backend.
                    </p>
                  </div>

                  <div className="flex flex-col space-y-6 w-full max-w-5xl mx-auto">
                    {desktopApps.map((app) => {
                      return (
                        <button
                          key={app.name}
                          onClick={(e) => handleFeatureCardClick(app, e)}
                          className="w-full bg-white border border-zinc-200/80 rounded-[1.8rem] hover:border-emerald-300 hover:shadow-lg transition-all p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-left group gap-6 shadow-sm"
                        >
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 flex-grow">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-center text-3xl shrink-0 shadow-sm">
                              {app.icon}
                            </div>
                            <div className="space-y-1 flex-1">
                              {app.badge && (
                                <div className="mb-2">
                                  <span className="bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-emerald-100/50 shadow-sm">
                                    {app.badge}
                                  </span>
                                </div>
                              )}
                              <h4 className="text-xl font-extrabold text-zinc-950 group-hover:text-emerald-850 group-hover:underline decoration-emerald-500 transition-colors">
                                {app.name}
                              </h4>
                              <p className="text-xs text-zinc-500 leading-relaxed max-w-lg pt-1">
                                {app.desc}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 shrink-0 self-end md:self-center">
                            {app.illus && (
                              <img src={app.illus} className="h-20 md:h-24 lg:h-28 object-contain select-none pointer-events-none hidden sm:block" alt="" />
                            )}
                            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shrink-0">
                              <span className="text-sm font-bold">&rarr;</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Dark Footer */}
              <footer className="bg-zinc-950 text-zinc-400 py-12 rounded-[2rem] px-8 md:px-12 mt-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-800 text-xs">
                  <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Features</h4>
                    <ul className="space-y-2">
                      <li><Link href="/finder" className="hover:text-emerald-500">Campus Maps Finder</Link></li>
                      <li><Link href="/placements" className="hover:text-emerald-500">Placement Drive Portal</Link></li>
                      <li><Link href="/career" className="hover:text-emerald-500">Student Profile Hub</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Utilities</h4>
                    <ul className="space-y-2">
                      <li><Link href="/sensors" className="hover:text-emerald-500">IoT Sensor Rental Catalog</Link></li>
                      <li><Link href="/complaints" className="hover:text-emerald-500">Classroom Support Tickets</Link></li>
                      <li><Link href="/lostfound" className="hover:text-emerald-500">Lost & Found claims</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Emergency</h4>
                    <ul className="space-y-2">
                      <li><Link href="/sos" className="hover:text-emerald-500 text-rose-400 font-bold">🚨 Panic SOS Trigger</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Trellis Campus OS</h4>
                    <p className="text-[10px] leading-relaxed text-zinc-500">
                      A modern, unified digital workspace application enabling campus pathfinding, placement workflows, and real-time support tickets resolution.
                    </p>
                  </div>
                </div>
                <p className="text-center text-[10px] text-zinc-500 pt-8">
                  Trellis Smart Campus Operating System © 2026. All rights reserved.
                </p>
              </footer>

            </div>
          </div>
        </>
      ) : (
        /* Dynamic OS Dashboard View wrapped inside DashboardLayout */
        <DashboardLayout>
          <div className="space-y-8 text-zinc-950 font-sans">
            {/* Top Personalized Greeting Bar */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="text-emerald-100 text-xs font-black uppercase tracking-widest bg-emerald-700/40 px-3 py-1 rounded-full">
                  Status: Active
                </span>
                <h3 className="text-2xl md:text-3xl font-black">Hello, {userEmail}! 👋</h3>
                <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
                  Welcome to your Trellis Campus Workspace. Use the sidebar to launch and manage individual campus modules.
                </p>
              </div>
              <span className="absolute -right-8 -bottom-8 text-9xl opacity-15">🌱</span>
            </div>

            {/* Quick Launch Grid & SOS Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Quick Launch Cards */}
              <div className="lg:col-span-8 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">Campus Activity Shortcuts</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Quick access to individual services</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {desktopApps.map((app) => (
                    <button
                      key={app.name}
                      onClick={(e) => handleFeatureCardClick(app, e)}
                      className="p-4 bg-zinc-50 border border-zinc-200/50 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50/10 transition-all flex items-center gap-4 group text-left w-full"
                    >
                      <div className={`w-10 h-10 rounded-xl ${app.bg} flex items-center justify-center text-lg text-white shadow-sm shrink-0`}>
                        {app.icon}
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-emerald-800 group-hover:underline">
                          {app.name}
                        </h5>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{app.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security dispatch alarm widget */}
              <div className="lg:col-span-4 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-950 mb-1">Security Dispatch</h4>
                  <p className="text-xs text-zinc-400">Emergency panic trigger tools</p>
                </div>
                
                <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl text-center space-y-4 my-4">
                  <span className="text-3xl block animate-bounce">🚨</span>
                  <h5 className="text-xs font-black text-rose-800 uppercase tracking-wider">Quick SOS Alarm</h5>
                  <p className="text-[10px] text-rose-700 leading-relaxed">
                    Triggering this alarm page will transmit your location coordinates to campus safety guards instantly.
                  </p>
                  <Link
                    href="/sos"
                    className="block w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow"
                  >
                    Go to Alarm Panel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      )}

      {/* Auth Modal popup */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-3xl max-w-md w-full border border-emerald-100 shadow-2xl p-8 relative animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 text-lg"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-emerald-800 text-center mb-6">
              {isLoginView ? "Sign In to Campus OS" : "Register Workspace"}
            </h3>

            {authError && (
              <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-bold">
                {authError}
              </div>
            )}
            {authMessage && (
              <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-bold">
                {authMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Campus Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
                  placeholder="student@ips.edu"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {isLoginView ? (
                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Authorize Workspace
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleRegister(e, "student")}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Student Reg
                  </button>
                  <button
                    onClick={(e) => handleRegister(e, "faculty")}
                    className="flex-1 py-3.5 bg-zinc-150 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold"
                  >
                    Faculty Reg
                  </button>
                </div>
              )}
            </form>

            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="mt-6 w-full text-xs text-zinc-500 hover:text-zinc-800 underline text-center"
            >
              {isLoginView ? "Need an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      )}

      {/* Gated Feature Login Prompt Modal */}
      {isAuthRequiredModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-emerald-100 shadow-2xl p-6 relative text-center space-y-4">
            <span className="text-4xl block">🔒</span>
            <h3 className="text-base font-extrabold text-zinc-950">Access Restricted</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">Please login first to access this feature.</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsAuthRequiredModalOpen(false)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsAuthRequiredModalOpen(false);
                  setIsLoginView(true);
                  setIsAuthModalOpen(true);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
