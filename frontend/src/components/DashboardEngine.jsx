import { useState, useEffect } from "react";
import axios from "axios";
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
import { useAuth } from "../context/AuthContext";

const API_BASE = "https://nexuserp-ai.onrender.com";

export function DashboardEngine({ manifest }) {
  const { themeColor } = useAuth();
  if (!manifest.dashboard_widgets || manifest.dashboard_widgets.length === 0) {
    return (
      <div className="text-muted-foreground p-4">
        No dashboard widgets available for this module.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      {manifest.dashboard_widgets.map((widget) => (
        <WidgetRenderer
          key={widget.widget_id}
          moduleId={manifest.module_id}
          widget={widget}
          themeColor={themeColor}
        />
      ))}
    </div>
  );
}

function WidgetRenderer({ moduleId, widget, themeColor }) {
  const title = widget.widget_id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWidgetData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/${moduleId}/${widget.widget_id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchWidgetData();
  }, [moduleId, widget.widget_id, token]);

  const renderContent = () => {
    if (loading)
      return (
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      );
    // Fallback empty state
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return (
        <div className="text-muted-foreground text-sm italic">
          No data available.
        </div>
      );
    }
    const safeArrayData = Array.isArray(data) ? data : [];

    switch (widget.type) {
      case "bar_chart":
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeArrayData}>
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
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Bar dataKey="value" fill={themeColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "line_chart":
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={safeArrayData}>
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
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={themeColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "stat_card":
        return (
          <div className="flex flex-col items-start justify-center h-full space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              {title}
            </div>
            <div className="text-4xl font-bold tracking-tight">
              {data?.total_revenue
                ? `₹${parseFloat(data.total_revenue).toFixed(2)}`
                : data?.value || 0}
            </div>
          </div>
        );
      case "list":
        return (
          <ul className="space-y-4 h-64 overflow-y-auto pr-2">
            {(Array.isArray(data) ? data : []).map((item, i) => (
              <li
                key={i}
                className="flex justify-between items-center pb-2 border-b last:border-0 last:pb-0"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {item.item_name || item.key || `Item ${i}`}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {item.current_stock !== undefined
                    ? item.current_stock
                    : item.value || ""}
                </span>
              </li>
            ))}
          </ul>
        );
      case "table":
        return (
          <div className="overflow-x-auto h-64">
            <table className="w-full text-sm text-left">
              <thead className="text-xs bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(data) ? data : []).map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium capitalize">
                      {item.status || item.key}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {item.count || item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return (
          <div className="text-destructive">
            Unsupported widget type: {widget.type}
          </div>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl text-card-foreground flex flex-col col-span-1">
      {widget.type !== "stat_card" && (
        <div className="flex flex-col space-y-1.5 p-6 border-b border-border/50">
          <h3 className="font-bold text-lg leading-none tracking-tight">
            {title}
          </h3>
        </div>
      )}
      <div
        className={`p-6 ${widget.type !== "stat_card" ? "pt-6" : ""} flex-1 flex flex-col justify-center`}
      >
        {renderContent()}
      </div>
    </div>
  );
}
