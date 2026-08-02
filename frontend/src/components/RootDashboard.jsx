import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Download,
  TrendingUp,
  Users,
  AlertTriangle,
  Package,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomSelect } from "./CustomSelect";

import { API_BASE } from "../config";

export function RootDashboard() {
  const { token, businessId, themeColor, businessName, role } = useAuth();
  const [reportPeriod, setReportPeriod] = useState("daily");

  const headers = { Authorization: `Bearer ${token}` };

  const { data: revenue } = useQuery({
    queryKey: ["revenue", businessId],
    queryFn: async () =>
      (
        await axios.get(`${API_BASE}/api/reports_analytics/revenue/`, {
          headers,
        })
      ).data,
    enabled: !!token,
  });

  const { data: topItems } = useQuery({
    queryKey: ["topItems", businessId],
    queryFn: async () =>
      (
        await axios.get(`${API_BASE}/api/reports_analytics/top_items/`, {
          headers,
        })
      ).data,
    enabled: !!token,
  });

  const { data: lowStock } = useQuery({
    queryKey: ["lowStock", businessId],
    queryFn: async () =>
      (
        await axios.get(`${API_BASE}/api/reports_analytics/low_stock/`, {
          headers,
        })
      ).data,
    enabled: !!token,
  });

  const { data: attendance } = useQuery({
    queryKey: ["attendance", businessId],
    queryFn: async () =>
      (
        await axios.get(
          `${API_BASE}/api/reports_analytics/attendance_summary/`,
          { headers },
        )
      ).data,
    enabled: !!token,
  });

  const { data: salesTrend } = useQuery({
    queryKey: ["salesTrend", businessId],
    queryFn: async () =>
      (
        await axios.get(`${API_BASE}/api/reports_analytics/sales_trend/`, {
          headers,
        })
      ).data,
    enabled: !!token,
  });

  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/reports_analytics/export_report/?period=${reportPeriod}`,
        {
          headers,
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${reportPeriod}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report", error);
      alert("Failed to download report. Please ensure you have permission.");
    }
  };

  const completedShifts =
    attendance?.find((a) => a.key === "Completed Shifts")?.value || 0;
  const totalScheduled =
    attendance?.find((a) => a.key === "Total Scheduled")?.value || 0;

  if (role !== "Admin") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in mt-32">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          Welcome to {businessName || "Nexus ERP"}
        </h1>
        <p className="text-muted-foreground text-xl max-w-lg">
          Please select a module from the sidebar to begin your work.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Here is what's happening at {businessName || "your business"} today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CustomSelect
            value={reportPeriod}
            onChange={setReportPeriod}
            options={[
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
            ]}
          />

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all hover:opacity-90 active:scale-95 whitespace-nowrap shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`₹${revenue?.total_revenue?.toFixed(2) || "0.00"}`}
          icon={<TrendingUp className="w-5 h-5" />}
          themeColor={themeColor}
        />

        <StatCard
          title="Top Items Sold"
          value={topItems?.length || 0}
          icon={<Package className="w-5 h-5" />}
          themeColor={themeColor}
        />

        <StatCard
          title="Low Stock Alerts"
          value={lowStock?.length || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          themeColor={themeColor}
          alert={lowStock && lowStock.length > 0}
        />

        <StatCard
          title="Completed Shifts"
          value={`${completedShifts} / ${totalScheduled}`}
          icon={<Users className="w-5 h-5" />}
          themeColor={themeColor}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="font-bold text-lg mb-6">Sales Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="key"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={themeColor}
                  strokeWidth={3}
                  dot={{ r: 4, fill: themeColor }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="font-bold text-lg mb-6">Top Selling Items</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems || []} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="key"
                  type="category"
                  width={100}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill={themeColor} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock List */}
      {lowStock && lowStock.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-bold text-lg mb-4 text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Action Required: Low Stock
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">
                    Item Name
                  </th>
                  <th className="px-4 py-3 font-medium">Current Stock</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg">
                    Threshold
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr
                    key={item.item_id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{item.item_name}</td>
                    <td className="px-4 py-3 text-destructive font-bold">
                      {item.current_stock}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.threshold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, themeColor, alert = false }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/20">
      <div
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out"
        style={{ backgroundColor: alert ? "#ef4444" : themeColor }}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor: alert
              ? "rgba(239, 68, 68, 0.1)"
              : `${themeColor}20`,
            color: alert ? "#ef4444" : themeColor,
          }}
        >
          {icon}
        </div>
      </div>
      <div
        className={`text-3xl font-extrabold tracking-tight relative z-10 ${alert ? "text-destructive" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}
