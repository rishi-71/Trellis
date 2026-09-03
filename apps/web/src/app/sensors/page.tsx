"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function SensorsPage() {
  const BACKEND_URL = "http://localhost:5000";

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [studentBranch, setStudentBranch] = useState("");
  const [facultyDept, setFacultyDept] = useState("");
  const [loading, setLoading] = useState(false);

  // States
  const [sensorsList, setSensorsList] = useState<any[]>([]);
  const [sensorRequests, setSensorRequests] = useState<any[]>([]);
  const [pendingSensorRequests, setPendingSensorRequests] = useState<any[]>([]);
  const [studentFines, setStudentFines] = useState<any[]>([]);
  const [fineConfig, setFineConfig] = useState<any>({ ratePerHour: 10 });
  const [adminDmgCases, setAdminDmgCases] = useState<any[]>([]);
  const [adminDashboardStats, setAdminDashboardStats] = useState<any>({
    overdueList: [],
    totalPendingFines: 0,
    openDamageCases: [],
    populatedStats: []
  });

  const [sensorTab, setSensorTab] = useState<string>("catalog");

  // Form Fields
  const [newSensorName, setNewSensorName] = useState("");
  const [newSensorType, setNewSensorType] = useState("");
  const [newSensorDept, setNewSensorDept] = useState("");
  const [newSensorQty, setNewSensorQty] = useState(1);

  const [editingSensorId, setEditingSensorId] = useState<string | null>(null);
  const [editSensorQty, setEditSensorQty] = useState(0);
  const [editSensorCond, setEditSensorCond] = useState("working");
  const [editSensorNotes, setEditSensorNotes] = useState("");

  const [reqSensorId, setReqSensorId] = useState<string | null>(null);
  const [reqPurpose, setReqPurpose] = useState("");
  const [reqProject, setReqProject] = useState("");
  const [reqFrom, setReqFrom] = useState("");
  const [reqTo, setReqTo] = useState("");

  const [approvalNote, setApprovalNote] = useState("");
  const [lostReqId, setLostReqId] = useState<string | null>(null);
  const [lostPenalty, setLostPenalty] = useState(0);
  const [lostNotes, setLostNotes] = useState("");

  const [damagedReturnNotes, setDamagedReturnNotes] = useState("");
  const [resolvingCaseId, setResolvingCaseId] = useState<string | null>(null);
  const [resolvePenalty, setResolvePenalty] = useState(0);
  const [resolveNotes, setResolveNotes] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("trellis_token");
    const savedRole = localStorage.getItem("trellis_role");
    const savedEmail = localStorage.getItem("trellis_email");
    const savedBranch = localStorage.getItem("trellis_student_branch") || "";
    const savedFacultyDept = localStorage.getItem("trellis_faculty_dept") || "";
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
      setUserEmail(savedEmail);
      setStudentBranch(savedBranch);
      setFacultyDept(savedFacultyDept);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadAllSensorsModuleData();
    }
  }, [token, userRole]);

  const loadAllSensorsModuleData = async () => {
    setLoading(true);
    try {
      // Catalog
      const resSensors = await fetch(`${BACKEND_URL}/api/sensors-module/sensors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataSensors = await resSensors.json();
      if (dataSensors.success) setSensorsList(dataSensors.sensors);

      // Student Fines / Requests
      if (userRole === "student" && userEmail) {
        const resReq = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/${userEmail}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataReq = await resReq.json();
        if (dataReq.success) setSensorRequests(dataReq.requests);

        const resFines = await fetch(`${BACKEND_URL}/api/sensors-module/fines/${userEmail}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataFines = await resFines.json();
        if (dataFines.success) setStudentFines(dataFines.fines);
      }

      // Admin/Faculty dashboards
      if (userRole === "admin" || userRole === "faculty") {
        const resPending = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataPending = await resPending.json();
        if (dataPending.success) setPendingSensorRequests(dataPending.requests);

        const resStats = await fetch(`${BACKEND_URL}/api/sensors-module/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataStats = await resStats.json();
        if (dataStats.success) setAdminDashboardStats(dataStats.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newSensorName,
          type: newSensorType,
          department: newSensorDept,
          totalQuantity: newSensorQty
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Sensor catalog added successfully!");
        setNewSensorName("");
        setNewSensorType("");
        loadAllSensorsModuleData();
      }
    } catch (err) {
      alert("Error adding sensor.");
    }
  };

  const handleRequestSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSensorId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sensorId: reqSensorId,
          purpose: reqPurpose,
          projectName: reqProject,
          requestedFrom: new Date(reqFrom),
          requestedTo: new Date(reqTo)
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Sensor request submitted successfully! Pending faculty approval.");
        setReqSensorId(null);
        setReqPurpose("");
        loadAllSensorsModuleData();
      }
    } catch (err) {
      alert("Error requesting sensor.");
    }
  };

  const handleApproveRequest = async (requestId: string, decision: "approved" | "rejected") => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/${requestId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decision, approvalNote })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sensor request ${decision} successfully!`);
        setApprovalNote("");
        loadAllSensorsModuleData();
      }
    } catch (err) {
      alert("Error updating request.");
    }
  };

  const handleIssueRequest = async (requestId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/${requestId}/issue`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Sensor request marked as Issued successfully!");
        loadAllSensorsModuleData();
      } else {
        alert(data.message || "Failed to issue.");
      }
    } catch (err) {
      alert("Error issuing sensor.");
    }
  };

  const handleReturnRequest = async (requestId: string, condition: "ok" | "damaged") => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors-module/sensor-requests/${requestId}/return`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ condition, notes: damagedReturnNotes })
      });
      const data = await res.json();
      if (data.success) {
        alert("Sensor request successfully marked as Returned!");
        setDamagedReturnNotes("");
        loadAllSensorsModuleData();
      }
    } catch (err) {
      alert("Error returning sensor.");
    }
  };

  const deptLower = (facultyDept || "").toLowerCase();
  const isDeptAllowed =
    deptLower.includes("iot") ||
    deptLower.includes("electronics") ||
    deptLower.includes("electrical") ||
    deptLower.includes("ece") ||
    deptLower.includes("eee");

  const isRestricted = userRole === "faculty" && !isDeptAllowed;

  if (isRestricted) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-rose-100 rounded-3xl p-8 text-center max-w-lg mx-auto mt-12 shadow-sm space-y-4">
          <span className="text-4xl">🔬</span>
          <h2 className="text-lg font-black text-rose-800">Access Restricted</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            The IoT Sensor Renting feature is restricted to faculty members from <strong>IoT, ECE, and Electrical</strong> departments.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 text-zinc-950 font-sans">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
          <div>
            <h3 className="text-2xl font-black text-emerald-800 tracking-tight">Sensor Issuing & Rentals</h3>
            <p className="text-xs text-zinc-500 mt-1">Manage lab inventories, sensor checkouts, and overdue fines</p>
          </div>
          <div className="flex bg-emerald-50 rounded-lg p-1">
            <button
              onClick={() => setSensorTab("catalog")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                sensorTab === "catalog" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Sensor Catalog
            </button>
            {userRole === "student" ? (
              <>
                <button
                  onClick={() => setSensorTab("requests")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    sensorTab === "requests" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  My Requests
                </button>
                <button
                  onClick={() => setSensorTab("fines")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    sensorTab === "fines" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  My Fines
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSensorTab("approvals")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    sensorTab === "approvals" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Pending Approvals ({pendingSensorRequests.length})
                </button>
                <button
                  onClick={() => setSensorTab("admin-dash")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    sensorTab === "admin-dash" ? "bg-white text-emerald-800 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Overdue Audit
                </button>
              </>
            )}
          </div>
        </div>

        {sensorTab === "catalog" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-zinc-900 mb-6">IoT Sensor Inventory Catalog</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sensorsList.map((sensor) => (
                  <div key={sensor._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-zinc-900 text-sm">{sensor.name}</h5>
                      <p className="text-xs text-zinc-500 mt-1">Category: {sensor.type} | Dept: {sensor.department}</p>
                      <p className="text-xs font-black text-emerald-700 mt-4">
                        Available: {sensor.availableQuantity} / {sensor.totalQuantity} units
                      </p>
                    </div>
                    {userRole === "student" && (
                      <button
                        onClick={() => {
                          setReqSensorId(sensor._id);
                          setSensorTab("requests");
                        }}
                        disabled={sensor.availableQuantity <= 0}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all mt-6 cursor-pointer ${
                          sensor.availableQuantity <= 0
                            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                        }`}
                      >
                        Request Checkout
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Add Sensor Form */}
            {(userRole === "admin" || userRole === "faculty") && (
              <div className="lg:col-span-4 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm self-start">
                <h4 className="text-base font-bold text-zinc-900 mb-4">Add Sensor Catalog Item</h4>
                <form onSubmit={handleCreateSensor} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Sensor Name *</label>
                    <input
                      type="text"
                      required
                      value={newSensorName}
                      onChange={(e) => setNewSensorName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Category Type *</label>
                    <input
                      type="text"
                      required
                      value={newSensorType}
                      onChange={(e) => setNewSensorType(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Total Quantity *</label>
                    <input
                      type="number"
                      required
                      value={newSensorQty}
                      onChange={(e) => setNewSensorQty(parseInt(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Add to Catalog
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {sensorTab === "requests" && userRole === "student" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-zinc-900 mb-6">My Rental Requests</h4>
              <div className="space-y-4">
                {sensorRequests.map((req) => (
                  <div key={req._id} className="border border-zinc-150 rounded-2xl p-4 bg-zinc-50 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-zinc-800 text-sm">{req.sensorId?.name}</h5>
                      <p className="text-xs text-zinc-500 mt-1">Project: {req.projectName} | Purpose: {req.purpose}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {reqSensorId && (
              <div className="lg:col-span-4 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
                <h4 className="text-base font-bold text-zinc-900 mb-4">Request Form</h4>
                <form onSubmit={handleRequestSensor} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Project Name *</label>
                    <input
                      type="text"
                      required
                      value={reqProject}
                      onChange={(e) => setReqProject(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Rental Purpose *</label>
                    <input
                      type="text"
                      required
                      value={reqPurpose}
                      onChange={(e) => setReqPurpose(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">From *</label>
                    <input
                      type="date"
                      required
                      value={reqFrom}
                      onChange={(e) => setReqFrom(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">To *</label>
                    <input
                      type="date"
                      required
                      value={reqTo}
                      onChange={(e) => setReqTo(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                  >
                    Submit Checkout Request
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {sensorTab === "approvals" && (userRole === "admin" || userRole === "faculty") && (
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h4 className="text-base font-bold text-zinc-900">Faculty Review Dashboard</h4>
            <div className="space-y-4">
              {pendingSensorRequests.map((req) => (
                <div key={req._id} className="border border-zinc-150 rounded-2xl p-5 bg-zinc-50 flex justify-between items-center">
                  <div>
                    <h5 className="font-extrabold text-zinc-900 text-base">{req.sensorId?.name}</h5>
                    <p className="text-xs text-zinc-500 mt-1">Student: {req.studentId?.email}</p>
                    <p className="text-xs text-zinc-600 mt-2">Project: {req.projectName} | Purpose: {req.purpose}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRequest(req._id, "approved")}
                      className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproveRequest(req._id, "rejected")}
                      className="py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
