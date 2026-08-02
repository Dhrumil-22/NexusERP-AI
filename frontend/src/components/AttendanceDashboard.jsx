import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  AlertCircle,
  CalendarClock,
} from "lucide-react";
import { CustomSelect } from "./CustomSelect";
import { useCurrentUser } from "../hooks/useCurrentUser";

import { API_BASE } from "../config";

export function AttendanceDashboard() {
  const { token, themeColor, role } = useAuth();
  const { data: currentUser } = useCurrentUser(token);
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState("in");

  const fetchRecords = async () => {
    setIsFetching(true);
    try {
      const [recordsRes, empRes] = await Promise.all([
        axios.get(`${API_BASE}/api/attendance/records/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios
          .get(`${API_BASE}/api/hr/employees/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] })),
      ]);
      setRecords(recordsRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchRecords();
  }, [token]);

  const isStaff = role === "Staff";
  const staffEmployee =
    isStaff && currentUser
      ? employees.find(
          (e) =>
            (e.email && currentUser.email && e.email === currentUser.email) ||
            (e.first_name === currentUser.first_name &&
              e.last_name === currentUser.last_name),
        )
      : null;
  const visibleRecords =
    isStaff && staffEmployee
      ? records.filter((r) => r.employee_id === staffEmployee.id)
      : records;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecords = visibleRecords.filter((r) => r.date === todayStr);
  const presentCount = todayRecords.filter(
    (r) => r.status === "Present",
  ).length;
  const lateCount = todayRecords.filter((r) => r.status === "Late").length;

  const staffTodayRecord =
    isStaff && staffEmployee
      ? todayRecords.find((r) => r.employee_id === staffEmployee.id)
      : null;
  const isClockedIn = !!staffTodayRecord?.clock_in;
  const isClockedOut = !!staffTodayRecord?.clock_out;

  const handleQuickAction = async (type) => {
    if (!staffEmployee)
      return alert("Employee record not found. Please contact admin.");
    try {
      const endpoint = type === "in" ? "clock_in" : "clock_out";
      const payload =
        type === "in"
          ? {
              employee_id: staffEmployee.id,
              employee_name: `${staffEmployee.first_name} ${staffEmployee.last_name}`,
            }
          : { employee_id: staffEmployee.id };
      await axios.post(
        `${API_BASE}/api/attendance/records/${endpoint}/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || `Failed to clock ${type}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Attendance & Time Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor staff presence, late arrivals, and shifts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={isStaff && (isClockedIn || isClockedOut)}
            onClick={() => {
              if (isStaff) handleQuickAction("in");
              else {
                setActionType("in");
                setIsActionModalOpen(true);
              }
            }}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold shadow-md transition-all ${
              isStaff && (isClockedIn || isClockedOut)
                ? "bg-green-500/50 cursor-not-allowed opacity-70"
                : "bg-green-500 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            }`}
          >
            <LogIn className="w-4 h-4" /> Clock In
          </button>
          <button
            disabled={isStaff && (!isClockedIn || isClockedOut)}
            onClick={() => {
              if (isStaff) handleQuickAction("out");
              else {
                setActionType("out");
                setIsActionModalOpen(true);
              }
            }}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold shadow-md transition-all ${
              isStaff && (!isClockedIn || isClockedOut)
                ? "bg-red-500/50 cursor-not-allowed opacity-70"
                : "bg-red-500 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            }`}
          >
            <LogOut className="w-4 h-4" /> Clock Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Present Today"
          value={presentCount}
          icon={<CheckCircle />}
          themeColor="#10b981"
        />
        <StatCard
          title="Late Today"
          value={lateCount}
          icon={<AlertCircle />}
          themeColor="#f59e0b"
        />
        <StatCard
          title="Total Records"
          value={records.length}
          icon={<CalendarClock />}
          themeColor={themeColor}
        />
      </div>

      {/* Main Grid */}
      <div className="glass-panel p-6 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-2.5 rounded-xl shadow-sm"
            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
          >
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold tracking-tight text-xl">Attendance Logs</h3>
        </div>

        {isFetching ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs bg-muted/50 text-muted-foreground border-b border-border/50 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Date</th>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Clock In</th>
                  <th className="px-4 py-3 font-medium">Clock Out</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No attendance records yet.
                    </td>
                  </tr>
                ) : (
                  visibleRecords
                    .slice()
                    .reverse()
                    .map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {record.date}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {record.employee_name}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400">
                          {record.clock_in
                            ? new Date(record.clock_in).toLocaleTimeString()
                            : "--:--"}
                        </td>
                        <td className="px-4 py-3 font-mono text-red-600 dark:text-red-400">
                          {record.clock_out
                            ? new Date(record.clock_out).toLocaleTimeString()
                            : "--:--"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                              record.status === "Present"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : record.status === "Late"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {record.notes || "-"}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isActionModalOpen && (
        <ActionModal
          type={actionType}
          employees={employees}
          todayRecords={todayRecords}
          onClose={() => setIsActionModalOpen(false)}
          onSuccess={() => {
            setIsActionModalOpen(false);
            fetchRecords();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, themeColor }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/20">
      <div
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out z-0 pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
        <div
          className="p-2.5 rounded-xl shadow-sm"
          style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
        >
          {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
      </div>
      <div className="text-4xl font-extrabold tracking-tight relative z-10 text-foreground">
        {value}
      </div>
    </div>
  );
}

function ActionModal({ type, employees, todayRecords, onClose, onSuccess }) {
  const { token } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredEmployees = employees?.filter((emp) => {
    const todayRecord = todayRecords?.find((r) => r.employee_id === emp.id);
    const isClockedIn = !!todayRecord?.clock_in;
    const isClockedOut = !!todayRecord?.clock_out;
    const currentlyClockedIn = isClockedIn && !isClockedOut;
    if (type === "in") return !currentlyClockedIn;
    if (type === "out") return currentlyClockedIn;
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) return alert("Please select an employee.");
    setLoading(true);
    try {
      const endpoint = type === "in" ? "clock_in" : "clock_out";
      const payload =
        type === "in"
          ? { employee_id: employeeId, employee_name: employeeName }
          : { employee_id: employeeId };
      await axios.post(
        `${API_BASE}/api/attendance/records/${endpoint}/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || `Failed to clock ${type}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div
        className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-slide-up border-t-4"
        style={{ borderColor: type === "in" ? "#10b981" : "#ef4444" }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">
              Clock {type === "in" ? "In" : "Out"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Record your time for today.
            </p>
          </div>
          <div
            className={`p-2 rounded-full ${type === "in" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
          >
            {type === "in" ? (
              <LogIn className="w-5 h-5" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Employee *</label>
            <CustomSelect
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                const emp = filteredEmployees?.find(
                  (emp) => emp.id === e.target.value,
                );
                if (emp) setEmployeeName(`${emp.first_name} ${emp.last_name}`);
              }}
              className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select an employee...</option>
              {filteredEmployees?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </CustomSelect>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-sm font-bold text-white shadow-md ${type === "in" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
