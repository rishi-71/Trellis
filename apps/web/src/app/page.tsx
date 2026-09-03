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

  const [registerRole, setRegisterRole] = useState<"student" | "faculty">("student");
  const [fullName, setFullName] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [post, setPost] = useState("");
  const [year, setYear] = useState("1");
  const [semester, setSemester] = useState("1");
  const [facultyDept, setFacultyDept] = useState("");

  const [studentBranch, setStudentBranch] = useState("");
  const [studentYear, setStudentYear] = useState(1);
  const [studentSemester, setStudentSemester] = useState(1);
  const [facultyDepartment, setFacultyDepartment] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStudentBranch(localStorage.getItem("trellis_student_branch") || "");
      setStudentYear(parseInt(localStorage.getItem("trellis_student_year") || "1"));
      setStudentSemester(parseInt(localStorage.getItem("trellis_student_semester") || "1"));
      setFacultyDepartment(localStorage.getItem("trellis_faculty_dept") || "");
    }
  }, [token]);

  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    { name: "📍 Campus Finder", path: "/finder", desc: "Shortest route Dijkstra pathfinder maps", bg: "bg-emerald-600" },
    { name: "💼 Placements Board", path: "/placements", desc: "Placements drive matching & eligibility audits", bg: "bg-teal-700" },
    { name: "👥 Career Hub Feed", path: "/career", desc: "Digital resume portfolios, feed, & leaderboard", bg: "bg-emerald-700" },
    { name: "🔬 Sensor Renting", path: "/sensors", desc: "IoT sensor inventories checkout approvals", bg: "bg-emerald-800" },
    { name: "📢 Notice Board", path: "/events", desc: "Official notices & events registration", bg: "bg-teal-600" },
    { name: "🔧 Service Complaints", path: "/complaints", desc: "Classroom maintenance support tickets", bg: "bg-emerald-700" },
    { name: "📦 Lost & Found Claims", path: "/lostfound", desc: "Campus bulletin board for lost claims", bg: "bg-emerald-600" },
    { name: "🚨 SOS Emergency Panic", path: "/sos", desc: "Immediate guard dispatch alarm trigger", bg: "bg-rose-600" }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginView) {
      handleLogin(e);
    } else {
      handleRegister(e, registerRole);
    }
  };

  const syncUserProfile = async (tk: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tk}` }
      });
      const data = await response.json();
      if (data.success) {
        if (data.user.role === "student" && data.profile) {
          localStorage.setItem("trellis_student_branch", data.profile.branch || "");
          localStorage.setItem("trellis_student_year", (data.profile.year || 1).toString());
          localStorage.setItem("trellis_student_semester", (data.profile.semester || 1).toString());
          localStorage.removeItem("trellis_faculty_dept");
        } else if (data.user.role === "faculty" && data.profile) {
          localStorage.setItem("trellis_faculty_dept", data.profile.department || "");
          localStorage.removeItem("trellis_student_branch");
          localStorage.removeItem("trellis_student_year");
          localStorage.removeItem("trellis_student_semester");
        } else {
          localStorage.removeItem("trellis_student_branch");
          localStorage.removeItem("trellis_student_year");
          localStorage.removeItem("trellis_student_semester");
          localStorage.removeItem("trellis_faculty_dept");
        }
      }
    } catch (err) {
      console.error("Failed to sync user profile:", err);
    }
  };

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
        await syncUserProfile(data.token);
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

    const payload: any = {
      email,
      password,
      role: selectedRole,
      name: fullName
    };

    if (selectedRole === "student") {
      payload.enrollmentNumber = enrollmentNumber;
      payload.branch = branch;
      payload.year = year;
      payload.semester = semester;
    } else if (selectedRole === "faculty") {
      payload.collegeId = collegeId;
      payload.post = post;
      payload.department = facultyDept;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUserRole(data.user.role);
        setUserEmail(data.user.email);
        localStorage.setItem("trellis_token", data.token);
        localStorage.setItem("trellis_role", data.user.role);
        localStorage.setItem("trellis_email", data.user.email);
        await syncUserProfile(data.token);
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
            <nav className="fixed top-0 left-0 w-full z-45 bg-white/90 backdrop-blur-md border-b border-emerald-100/50 px-6 py-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <h1 className="text-base font-black text-emerald-800 tracking-tight leading-none">Trellis</h1>
                  <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-bold">Campus OS</p>
                </div>
              </div>
              
              <div className="hidden md:flex gap-8 text-xs font-bold text-zinc-600">
                <a href="#hero" className="hover:text-emerald-800 transition-colors">Home</a>
                <a href="#features" className="hover:text-emerald-800 transition-colors">Features</a>
                <a href="#events" className="hover:text-emerald-800 transition-colors">Events</a>
                <a href="#metrics" className="hover:text-emerald-800 transition-colors">Metrics</a>
              </div>

              <button
                onClick={() => {
                  setIsLoginView(true);
                  setIsAuthModalOpen(true);
                }}
                className="py-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-emerald-600/20"
              >
                Sign In
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feat, idx) => (
                      <div key={idx} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200/50 shadow-sm flex flex-col space-y-3 hover:shadow-md transition-shadow">
                        <span className="text-3xl">{feat.icon}</span>
                        <h4 className="text-base font-extrabold text-zinc-950">{feat.title}</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Academic Events Section */}
              <section id="events" className="scroll-mt-24">
                <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-8 md:p-12 lg:p-16 border border-emerald-100/20 shadow-xl space-y-8">
                  <div className="flex justify-between items-end border-b border-zinc-100 pb-6">
                    <div>
                      <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Notices timeline</span>
                      <h3 className="text-3xl font-extrabold text-zinc-950 mt-2">Upcoming Campus Events</h3>
                    </div>
                    <button
                      onClick={() => {
                        setIsLoginView(true);
                        setIsAuthModalOpen(true);
                      }}
                      className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer text-xs"
                    >
                      Post Event <span>&rarr;</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sampleEvents.map((evt) => (
                      <div key={evt._id} className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200/50 flex flex-col justify-between hover:shadow-sm transition-all">
                        <div>
                          <h4 className="font-extrabold text-zinc-900 text-sm leading-tight">{evt.title}</h4>
                          <p className="text-xs text-zinc-500 mt-2 line-clamp-3 leading-relaxed">{evt.description}</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-zinc-200/40 space-y-3">
                          <div className="text-[10px] text-zinc-400 space-y-1">
                            <div>📍 Venue: {evt.venue}</div>
                            <div>📅 Date: {evt.date}</div>
                          </div>
                          <button
                            onClick={() => {
                              setIsLoginView(true);
                              setIsAuthModalOpen(true);
                            }}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                          >
                            Register Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Placements & Metrics Section */}
              <section id="metrics" className="scroll-mt-24">
                <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-8 md:p-12 lg:p-16 border border-emerald-100/20 shadow-xl space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Drive Success</span>
                      <h3 className="text-3xl font-extrabold text-zinc-950 mt-2 mb-4">Placement Milestones</h3>
                      <p className="text-zinc-600 leading-relaxed mb-6 text-xs">
                        Trellis automates the placement drive workflow from registering applicant marks records, tracking pending backlog states, checking eligibility bounds, and triggering PDF statistics logs.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 text-center shadow-sm">
                          <div className="text-3xl font-black text-emerald-600">45 LPA</div>
                          <div className="text-[10px] text-zinc-400 uppercase font-bold mt-1">Highest Package</div>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 text-center shadow-sm">
                          <div className="text-3xl font-black text-emerald-600">100%</div>
                          <div className="text-[10px] text-zinc-400 uppercase font-bold mt-1">Recruitment Aid</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200/50 shadow-sm flex flex-col space-y-4">
                      <h4 className="text-sm font-extrabold text-zinc-950">Seeded Companies Partner List</h4>
                      <p className="text-xs text-zinc-500">We auto-match eligible students with active jobs posted by leading recruitment firms.</p>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-white py-3 rounded-lg text-center text-xs font-bold text-zinc-700 border border-zinc-200">Capgemini</div>
                        <div className="bg-white py-3 rounded-lg text-center text-xs font-bold text-zinc-700 border border-zinc-200">TCS Digital</div>
                        <div className="bg-white py-3 rounded-lg text-center text-xs font-bold text-zinc-700 border border-zinc-200">Microsoft</div>
                        <div className="bg-white py-3 rounded-lg text-center text-xs font-bold text-zinc-700 border border-zinc-200">Infosys</div>
                      </div>
                    </div>
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

            {/* Interesting Summary Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-emerald-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
                <span className="text-xl">🏆</span>
                <div className="mt-4">
                  <h5 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Co-Curricular Points</h5>
                  <p className="text-xl font-black text-emerald-800 mt-1">150 pts</p>
                </div>
              </div>
              <div className="bg-white border border-emerald-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
                <span className="text-xl">🎓</span>
                <div className="mt-4">
                  <h5 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Cumulative GPA</h5>
                  <p className="text-xl font-black text-emerald-800 mt-1">8.54 CGPA</p>
                </div>
              </div>
              <div className="bg-white border border-emerald-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
                <span className="text-xl">🔬</span>
                <div className="mt-4">
                  <h5 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Active IoT Leases</h5>
                  <p className="text-xl font-black text-emerald-800 mt-1">1 Leased</p>
                </div>
              </div>
              <div className="bg-white border border-emerald-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
                <span className="text-xl">🔧</span>
                <div className="mt-4">
                  <h5 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Support Tickets</h5>
                  <p className="text-xl font-black text-emerald-800 mt-1">0 Open Cases</p>
                </div>
              </div>
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
                  {desktopApps
                    .filter((app) => {
                      if (userRole === "student") {
                        if (app.path === "/placements") {
                          const isAllowed = studentYear >= 4 || studentSemester >= 7;
                          if (!isAllowed) return false;
                        }
                      } else if (userRole === "faculty") {
                        if (app.path === "/placements" || app.path === "/complaints") {
                          return false;
                        }
                        if (app.path === "/sensors") {
                          const deptName = (facultyDepartment || "").toLowerCase();
                          const isAllowed =
                            deptName.includes("iot") ||
                            deptName.includes("electronics") ||
                            deptName.includes("electrical") ||
                            deptName.includes("ece") ||
                            deptName.includes("eee");
                          if (!isAllowed) return false;
                        }
                      }
                      return true;
                    })
                    .slice(0, 6)
                    .map((app) => (
                      <Link
                      key={app.name}
                      href={app.path}
                      className="p-4 bg-zinc-50 border border-zinc-200/50 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50/10 transition-all flex items-center gap-4 group"
                    >
                      <div className={`w-10 h-10 rounded-xl ${app.bg} flex items-center justify-center text-lg text-white shadow-sm`}>
                        {app.name.split(" ")[0]}
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-emerald-800 group-hover:underline">
                          {app.name.split(" ").slice(1).join(" ")}
                        </h5>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{app.desc}</p>
                      </div>
                    </Link>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginView && (
                <div className="flex bg-zinc-100 rounded-xl p-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setRegisterRole("student")}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition ${
                      registerRole === "student" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterRole("faculty")}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition ${
                      registerRole === "faculty" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Faculty
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Campus Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
                  placeholder="user@ips.edu"
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

              {!isLoginView && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  {registerRole === "student" ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Enrollment Number</label>
                        <input
                          type="text"
                          required
                          value={enrollmentNumber}
                          onChange={(e) => setEnrollmentNumber(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
                          placeholder="0108CS211000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Branch</label>
                        <input
                          type="text"
                          required
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
                          placeholder="Computer Science"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Year</label>
                          <select
                            required
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none text-zinc-800"
                          >
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Semester</label>
                          <select
                            required
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none text-zinc-800"
                          >
                            <option value="1">1st Sem</option>
                            <option value="2">2nd Sem</option>
                            <option value="3">3rd Sem</option>
                            <option value="4">4th Sem</option>
                            <option value="5">5th Sem</option>
                            <option value="6">6th Sem</option>
                            <option value="7">7th Sem</option>
                            <option value="8">8th Sem</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">College ID</label>
                        <input
                          type="text"
                          required
                          value={collegeId}
                          onChange={(e) => setCollegeId(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
                          placeholder="FAC1001"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Post</label>
                        <input
                          type="text"
                          required
                          value={post}
                          onChange={(e) => setPost(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
                          placeholder="Assistant Professor"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Department</label>
                        <input
                          type="text"
                          required
                          value={facultyDept}
                          onChange={(e) => setFacultyDept(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
                          placeholder="IoT Dept"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
              >
                {isLoginView
                  ? "Authorize Workspace"
                  : registerRole === "student"
                  ? "Register Student Account"
                  : "Register Faculty Account"}
              </button>
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
    </div>
  );
}
