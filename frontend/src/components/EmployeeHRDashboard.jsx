import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  UserSquare,
  Plus,
  UserCog,
  Clock,
  CalendarDays,
  Pencil,
  Trash2,
} from "lucide-react";
import { CustomSelect } from "./CustomSelect";

const API_BASE = "https://nexuserp-ai.onrender.com";

export function EmployeeHRDashboard() {
  const { token, themeColor } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("staff");
  const [isFetching, setIsFetching] = useState(true);
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    shift_start_time: "",
    shift_end_time: "",
    username: "",
    password: "",
    assigned_modules: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Modules for SubERP
  const [availableModules, setAvailableModules] = useState([]);

  // Role creation state
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [empRes, roleRes, shiftRes, attRes, modRes] = await Promise.all([
        axios.get(`${API_BASE}/api/hr/employees/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/hr/roles/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/hr/shifts/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/hr/attendance/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/registry/manifests/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setEmployees(empRes.data);
      setRoles(roleRes.data);
      setShifts(shiftRes.data);
      setAttendance(attRes.data);
      setAvailableModules(
        modRes.data.filter(
          (m) =>
            ![
              "business_setup",
              "auth",
              "module_registry",
              "permissions",
              "attendance",
            ].includes(m.module_id),
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = { ...newEmployee };
      if (!payload.shift_start_time) payload.shift_start_time = null;
      if (!payload.shift_end_time) payload.shift_end_time = null;
      if (!payload.password) delete payload.password;
      // Attendance is compulsory for all sub-erp users
      if (
        payload.username &&
        !payload.assigned_modules.includes("attendance")
      ) {
        payload.assigned_modules.push("attendance");
      }
      if (isEditing) {
        await axios.patch(
          `${API_BASE}/api/hr/employees/${payload.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(`${API_BASE}/api/hr/employees/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowAddModal(false);
      setIsEditing(false);
      setNewEmployee({
        id: "",
        first_name: "",
        last_name: "",
        email: "",
        role: "",
        shift_start_time: "",
        shift_end_time: "",
        username: "",
        password: "",
        assigned_modules: [],
      });
      fetchData();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.username
        ? `Error: ${err.response.data.username}`
        : `Failed to ${isEditing ? "update" : "add"} employee`;
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (emp) => {
    setNewEmployee({
      id: emp.id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email || "",
      role: emp.role || "",
      shift_start_time: emp.shift_start_time || "",
      shift_end_time: emp.shift_end_time || "",
      username: emp.username || "",
      password: "",
      assigned_modules: emp.assigned_modules || [],
    });
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    try {
      await axios.delete(`${API_BASE}/api/hr/employees/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee");
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    try {
      const res = await axios.post(
        `${API_BASE}/api/hr/roles/`,
        { name: newRoleName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRoles([...roles, res.data]);
      setNewEmployee({ ...newEmployee, role: res.data.id });
      setIsAddingRole(false);
      setNewRoleName("");
    } catch (err) {
      console.error(err);
      alert("Failed to create role");
    }
  };

  const handleClockIn = async (employeeId) => {
    try {
      await axios.post(
        `${API_BASE}/api/hr/attendance/clock_in/`,
        { employee: employeeId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockOut = async (employeeId) => {
    try {
      await axios.post(
        `${API_BASE}/api/hr/attendance/clock_out/`,
        { employee: employeeId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <UserSquare className="w-8 h-8" style={{ color: themeColor }} />
            Employee & HR
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff roster, roles, and attendance.
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setNewEmployee({
              id: "",
              first_name: "",
              last_name: "",
              email: "",
              role: "",
              shift_start_time: "",
              shift_end_time: "",
              username: "",
              password: "",
              assigned_modules: [],
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-transform hover:scale-[1.02] shadow-lg"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-5 h-5" /> Add Staff
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border/50 pb-px">
        <button
          onClick={() => setActiveTab("staff")}
          className={`pb-4 px-2 font-bold transition-colors ${activeTab === "staff" ? "text-foreground border-b-2" : "text-muted-foreground"}`}
          style={activeTab === "staff" ? { borderBottomColor: themeColor } : {}}
        >
          Staff Roster
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-4 px-2 font-bold transition-colors ${activeTab === "attendance" ? "text-foreground border-b-2" : "text-muted-foreground"}`}
          style={
            activeTab === "attendance" ? { borderBottomColor: themeColor } : {}
          }
        >
          Attendance & Shifts
        </button>
      </div>

      {activeTab === "staff" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isFetching ? (
            <div className="col-span-full flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="col-span-full text-center p-12 bg-muted/20 rounded-xl border border-dashed border-border/50">
              <UserCog className="w-12 h-12 mx-auto opacity-20 mb-4" />
              <p className="text-muted-foreground font-medium">
                No employees found. Add some staff to get started.
              </p>
            </div>
          ) : (
            employees.map((emp) => (
              <div
                key={emp.id}
                className="glass-panel rounded-2xl p-6 border border-border/50 flex flex-col relative overflow-hidden group"
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: themeColor }}
                ></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl">
                      {emp.first_name} {emp.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {emp.email || "No email provided"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${emp.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}
                    >
                      {emp.status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(emp)}
                        title="Edit Employee"
                        className="p-1.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors border border-border/50 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        title="Delete Employee"
                        className="p-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1 font-semibold">
                    <UserCog className="w-4 h-4 opacity-50" />
                    {emp.role_name || "No Role"}
                  </div>
                  <span className="text-muted-foreground">
                    Hired: {new Date(emp.hire_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="flex gap-6 h-full min-h-[500px]">
          {/* Quick Clock In/Out */}
          <div className="w-80 shrink-0 glass-panel rounded-2xl p-6 border border-border/50 flex flex-col space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5" /> Quick Action
            </h2>
            <div className="space-y-2 flex-1 overflow-y-auto pr-2">
              {employees.map((emp) => {
                // Find today's attendance record for this employee
                const todayRecord = attendance.find(
                  (a) =>
                    a.employee === emp.id &&
                    a.date === new Date().toISOString().split("T")[0],
                );
                const isClockedIn =
                  todayRecord && todayRecord.clock_in && !todayRecord.clock_out;
                return (
                  <div
                    key={emp.id}
                    className="p-3 bg-muted/20 border border-border/50 rounded-xl flex justify-between items-center"
                  >
                    <span
                      className="font-semibold truncate max-w-[120px]"
                      title={`${emp.first_name} ${emp.last_name}`}
                    >
                      {emp.first_name} {emp.last_name}
                    </span>
                    {isClockedIn ? (
                      <button
                        onClick={() => handleClockOut(emp.id)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        Clock Out
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClockIn(emp.id)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                      >
                        Clock In
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance Log */}
          <div className="flex-1 glass-panel rounded-2xl p-6 border border-border/50 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" /> Attendance Log
            </h2>
            <div className="space-y-3">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="p-4 border border-border/50 rounded-xl flex justify-between items-center bg-background/50"
                >
                  <div>
                    <div className="font-bold text-lg">
                      {record.employee_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {record.date} • {record.status}
                    </div>
                  </div>
                  <div className="text-right font-mono text-sm space-y-1">
                    <div>
                      <span className="text-emerald-500 font-bold">IN:</span>{" "}
                      {record.clock_in
                        ? new Date(record.clock_in).toLocaleTimeString()
                        : "--:--"}
                    </div>
                    <div>
                      <span className="text-red-500 font-bold">OUT:</span>{" "}
                      {record.clock_out
                        ? new Date(record.clock_out).toLocaleTimeString()
                        : "--:--"}
                    </div>
                  </div>
                </div>
              ))}
              {attendance.length === 0 && !isFetching && (
                <div className="text-center p-8 text-muted-foreground">
                  No attendance records found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 flex flex-col max-h-[90vh]">
            <div
              className="p-6 border-b border-border/50 flex justify-between items-center shrink-0"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" style={{ color: themeColor }} />{" "}
                {isEditing ? "Edit Employee" : "Add Employee"}
              </h2>
            </div>

            <form
              onSubmit={handleAddEmployee}
              className="p-6 space-y-4 overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.first_name}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        first_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.last_name}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        last_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Role
                  </label>
                  {!isAddingRole && (
                    <button
                      type="button"
                      onClick={() => setIsAddingRole(true)}
                      className="text-xs font-bold"
                      style={{ color: themeColor }}
                    >
                      + Add New Role
                    </button>
                  )}
                </div>

                {isAddingRole ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Manager, Chef"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      autoFocus
                    />

                    <button
                      type="button"
                      onClick={handleAddRole}
                      className="px-3 py-2 rounded-lg text-white font-bold text-sm"
                      style={{ backgroundColor: themeColor }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingRole(false)}
                      className="px-3 py-2 rounded-lg border border-border/50 text-muted-foreground text-sm font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <CustomSelect
                    value={newEmployee.role}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select a role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </CustomSelect>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Shift Start Time
                  </label>
                  <input
                    type="time"
                    value={newEmployee.shift_start_time}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        shift_start_time: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Shift End Time
                  </label>
                  <input
                    type="time"
                    value={newEmployee.shift_end_time}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        shift_end_time: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h3 className="text-sm font-bold mb-3">
                  Sub-ERP Access (Optional)
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">
                      Username
                    </label>
                    <input
                      type="text"
                      value={newEmployee.username}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          username: e.target.value,
                        })
                      }
                      placeholder="No access"
                      className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">
                      {isEditing ? "New Password" : "Password"}
                    </label>
                    <input
                      type="password"
                      value={newEmployee.password}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          password: e.target.value,
                        })
                      }
                      placeholder={isEditing ? "Leave blank" : ""}
                      className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Assigned Modules
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pt-1">
                    <div
                      className="px-3 py-1.5 text-sm font-semibold rounded-full border opacity-70 cursor-not-allowed text-white shadow-sm"
                      style={{
                        backgroundColor: themeColor,
                        borderColor: themeColor,
                      }}
                    >
                      Attendance (Compulsory)
                    </div>
                    {availableModules.map((mod) => {
                      const isSelected = newEmployee.assigned_modules.includes(
                        mod.module_id,
                      );
                      return (
                        <button
                          key={mod.module_id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewEmployee({
                                ...newEmployee,
                                assigned_modules:
                                  newEmployee.assigned_modules.filter(
                                    (m) => m !== mod.module_id,
                                  ),
                              });
                            } else {
                              setNewEmployee({
                                ...newEmployee,
                                assigned_modules: [
                                  ...newEmployee.assigned_modules,
                                  mod.module_id,
                                ],
                              });
                            }
                          }}
                          className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition-all ${isSelected ? "text-white shadow-sm scale-105" : "text-foreground hover:bg-muted/50 bg-background/50"}`}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: themeColor,
                                  borderColor: themeColor,
                                }
                              : { borderColor: "var(--border)" }
                          }
                        >
                          {mod.name ||
                            mod.module_id
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: themeColor }}
                >
                  {isSubmitting
                    ? "Processing..."
                    : isEditing
                      ? "Save Changes"
                      : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
