"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function FinderPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // States
  const [locations, setLocations] = useState<any[]>([]);
  const [finderTab, setFinderTab] = useState<"map" | "faculty">("map");
  const [selectedStartNode, setSelectedStartNode] = useState<string>("node-home");
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [facultySearchQuery, setFacultySearchQuery] = useState("");
  const [facultyCabins, setFacultyCabins] = useState<any[]>([]);
  const [activeFloor, setActiveFloor] = useState<number>(0);
  const [routePath, setRoutePath] = useState<any[]>([]);
  const [routeDirections, setRouteDirections] = useState<string[]>([]);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("trellis_token");
    const savedRole = localStorage.getItem("trellis_role");
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchLocations(categoryFilter);
      fetchFacultyCabins(facultySearchQuery);
    }
  }, [token, categoryFilter]);

  const fetchLocations = async (category: string | null = null) => {
    try {
      const url = category ? `${BACKEND_URL}/api/locations?category=${category}` : `${BACKEND_URL}/api/locations`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setLocations(data.locations);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFacultyCabins = async (nameQuery = "") => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/faculty?name=${nameQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setFacultyCabins(data.cabins);
    } catch (err) {
      console.error(err);
    }
  };

  const updateFacultyCabinStatus = async (cabinId: string, status: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/faculty/${cabinId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Status updated successfully!`);
        fetchFacultyCabins(facultySearchQuery);
      }
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const calculateRoute = async (destLocationId: string) => {
    if (!destLocationId) return;
    setLoadingRoute(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/route?from=${selectedStartNode}&to=${destLocationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRoutePath(data.path);
        setRouteDirections(data.directions);
        setRouteDistance(data.totalDistance);
      } else {
        alert(data.message || "Route calculation failed.");
      }
    } catch (err) {
      alert("Could not contact pathfinding server.");
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-zinc-950 font-sans">
        <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
          <h3 className="text-2xl font-black text-emerald-800">Smart Campus Finder</h3>
          <div className="flex bg-emerald-50 rounded-lg p-1">
            <button
              onClick={() => setFinderTab("map")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                finderTab === "map" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Interactive Map
            </button>
            <button
              onClick={() => setFinderTab("faculty")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                finderTab === "faculty" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Faculty Cabins
            </button>
          </div>
        </div>

        {finderTab === "map" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-base font-bold text-zinc-900">Virtual Map Navigator</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Floor plans & pathfinding visualizer</p>
                </div>
                <div className="flex gap-1.5 bg-zinc-100 rounded-full p-1 border border-zinc-200">
                  {[0, 1, 2, 3].map((fl) => (
                    <button
                      key={fl}
                      onClick={() => setActiveFloor(fl)}
                      className={`w-8 h-8 rounded-full text-xs font-black transition-all ${
                        activeFloor === fl ? "bg-emerald-600 text-white" : "text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      F{fl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map grid representation */}
              <div className="relative w-full h-[450px] bg-emerald-50/20 border border-emerald-100/50 rounded-2xl overflow-hidden flex items-center justify-center">
                {/* Simulated Nodes/Rooms */}
                <div className="absolute inset-0 p-8 grid grid-cols-5 grid-rows-5 gap-4">
                  {locations
                    .filter((loc) => loc.floor === activeFloor)
                    .map((loc, i) => {
                      const isSelected = selectedDestination?._id === loc._id;
                      const inRoute = routePath.includes(loc.name);
                      return (
                        <div
                          key={loc._id || i}
                          onClick={() => {
                            setSelectedDestination(loc);
                            calculateRoute(loc._id);
                          }}
                          className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-md scale-105"
                              : inRoute
                              ? "bg-emerald-100 border-emerald-400 text-emerald-800 shadow-sm"
                              : "bg-white border-zinc-200 text-zinc-800 hover:border-emerald-300"
                          }`}
                        >
                          <span className="text-[10px] uppercase font-black tracking-wider opacity-60">
                            {loc.category}
                          </span>
                          <span className="text-xs font-extrabold truncate">{loc.name}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {/* Route Finder details panel */}
              <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
                <h4 className="text-base font-bold text-zinc-900 mb-4">Route Search</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
                      Starting Location Node
                    </label>
                    <select
                      value={selectedStartNode}
                      onChange={(e) => setSelectedStartNode(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold"
                    >
                      <option value="node-home">Main College Gate (Gate 1)</option>
                      <option value="node-a-g">Block A Ground Lobby</option>
                      <option value="node-b-g">Block B Main Entrance</option>
                      <option value="node-c-g">Block C Quadrangle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
                      Destination
                    </label>
                    <div className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-zinc-700">
                      {selectedDestination ? selectedDestination.name : "Select a location on map"}
                    </div>
                  </div>
                </div>

                {loadingRoute && (
                  <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-emerald-600"></div>
                    Finding shortest route...
                  </div>
                )}

                {routePath.length > 0 && !loadingRoute && (
                  <div className="mt-6 border-t border-zinc-100 pt-6 space-y-4">
                    <div className="flex justify-between items-center bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100">
                      <span className="text-xs font-black text-emerald-800">Total Distance</span>
                      <span className="text-sm font-black text-emerald-800">{routeDistance} meters</span>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-zinc-500 uppercase mb-3">Turn-by-Turn Directions</h5>
                      <div className="space-y-2.5">
                        {routeDirections.map((dir, idx) => (
                          <div key={idx} className="flex gap-3 text-xs text-zinc-700">
                            <span className="text-emerald-600 font-bold">➜</span>
                            <p>{dir}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick filters */}
              <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Filter by Category</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "All Locations", val: null },
                    { label: "Lab", val: "lab" },
                    { label: "Classroom", val: "classroom" },
                    { label: "Office", val: "office" },
                    { label: "Seminar Hall", val: "seminar_hall" }
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => setCategoryFilter(cat.val)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        categoryFilter === cat.val
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-emerald-300"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Faculty Directory tab */
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search faculty name, department, designation..."
                  value={facultySearchQuery}
                  onChange={(e) => {
                    setFacultySearchQuery(e.target.value);
                    fetchFacultyCabins(e.target.value);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="absolute left-4 top-3 text-zinc-400">🔍</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facultyCabins.map((cab) => (
                <div key={cab._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-zinc-900 text-base">{cab.facultyName}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{cab.designation} | {cab.department}</p>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full ${
                          cab.status === "in-cabin"
                            ? "bg-emerald-100 text-emerald-800"
                            : cab.status === "meeting"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {cab.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-zinc-200/50 pt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Cabin Number</span>
                        <span className="font-bold text-zinc-700">{cab.cabinName}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Location Block</span>
                        <span className="font-bold text-zinc-700">{cab.locationId?.name || "Campus Block A"}</span>
                      </div>
                    </div>
                  </div>

                  {userRole === "faculty" && (
                    <div className="mt-5 pt-3 border-t border-zinc-200/30 flex gap-2">
                      {["in-cabin", "meeting", "not-in-cabin"].map((st) => (
                        <button
                          key={st}
                          onClick={() => updateFacultyCabinStatus(cab._id, st)}
                          className={`flex-1 py-1 text-[10px] font-black uppercase rounded-lg border ${
                            cab.status === st
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-100"
                          }`}
                        >
                          {st === "not-in-cabin" ? "Away" : st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
