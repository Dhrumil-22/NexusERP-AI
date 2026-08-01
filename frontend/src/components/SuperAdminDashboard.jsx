import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Building2,
  Server,
  Layers,
  Image as ImageIcon,
  X,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = "http://127.0.0.1:8000";

export function SuperAdminDashboard() {
  const { token, themeColor } = useAuth();
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const {
    data: businesses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["superAdminBusinesses"],
    queryFn: async () => {
      const res = await axios.get(
        `${API_BASE}/api/auth/super_admin/businesses/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    enabled: !!token,
  });

  if (isLoading)
    return (
      <div className="p-8 text-muted-foreground">
        Loading platform statistics...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-destructive">
        Failed to load data. Ensure you have Super Admin privileges.
      </div>
    );
  if (!businesses) return null;

  const totalUsers = businesses.reduce((acc, b) => acc + b.employee_count, 0);
  const totalBusinesses = businesses.length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 shadow-2xl p-10 md:p-14"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 border border-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            Nexus AI Administration
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-foreground drop-shadow-sm"
          >
            Platform{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Home
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-lg text-muted-foreground font-medium mb-8 max-w-2xl"
          >
            Welcome to the central command center. Overview all generated
            systems, monitor platform-wide metrics, and manage registered
            businesses from a single unified view.
          </motion.p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-primary/20 shadow-sm">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Businesses
            </h3>
            <div
              className="text-4xl font-extrabold mt-2"
              style={{ color: themeColor }}
            >
              {totalBusinesses}
            </div>
          </div>
          <div className="p-4 rounded-full bg-primary/10">
            <Building2 className="w-8 h-8" style={{ color: themeColor }} />
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-primary/20 shadow-sm">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Users (Platform-wide)
            </h3>
            <div
              className="text-4xl font-extrabold mt-2"
              style={{ color: themeColor }}
            >
              {totalUsers}
            </div>
          </div>
          <div className="p-4 rounded-full bg-primary/10">
            <Users className="w-8 h-8" style={{ color: themeColor }} />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold tracking-tight mt-8 mb-4">
        Registered Websites
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((b) => (
          <div
            key={b.business_id}
            onClick={() => setSelectedBusiness(b)}
            className="glass-panel p-6 rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/30 flex flex-col group relative overflow-hidden"
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-110"
              style={{ backgroundColor: b.theme_color }}
            />
            <h3 className="text-xl font-bold mb-2 truncate z-10">{b.name}</h3>
            <div className="flex items-center gap-2 text-muted-foreground z-10">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {b.employee_count} Employees
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-sm font-semibold flex justify-between items-center z-10">
              <span style={{ color: b.theme_color }}>View Details</span>
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: b.theme_color }}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden relative flex flex-col">
            <button
              onClick={() => setSelectedBusiness(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 flex flex-col gap-8">
              <div className="flex items-start gap-6 border-b border-border/50 pb-6">
                {selectedBusiness.logo ? (
                  <img
                    src={selectedBusiness.logo}
                    alt="Logo"
                    className="w-24 h-24 object-contain rounded-lg border bg-white p-2 shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg flex items-center justify-center bg-secondary shrink-0">
                    <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                    {selectedBusiness.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-secondary/50 border border-border/50">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: selectedBusiness.theme_color,
                        }}
                      />
                      Color: {selectedBusiness.theme_color}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Enabled Sub-ERP Modules
                    </h4>
                    <p className="text-2xl font-bold">
                      {selectedBusiness.enabled_modules_count}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                      <Server className="w-4 h-4" /> AI Prompt / Industry
                    </h4>
                    <p className="text-sm text-foreground bg-secondary/30 p-3 rounded-lg border border-border/30 italic">
                      "
                      {selectedBusiness.ai_prompt ||
                        selectedBusiness.industry_tag ||
                        "N/A"}
                      "
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Total Employees
                    </h4>
                    <p className="text-2xl font-bold">
                      {selectedBusiness.employee_count}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      Usernames
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-secondary/20 rounded-lg border border-border/30">
                      {selectedBusiness.usernames.length > 0 ? (
                        selectedBusiness.usernames.map((u) => (
                          <span
                            key={u}
                            className="text-xs font-mono bg-background px-2 py-1 rounded border shadow-sm"
                          >
                            {u}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic px-1">
                          No employees found
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
