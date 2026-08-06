import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";
import {
  Sun,
  Moon,
  LayoutDashboard,
  User,
  Menu,
  Bell,
  CheckCircle,
  PlusCircle,
  LogOut,
  CalendarClock,
} from "lucide-react";
import { cn } from "../lib/utils";

import { API_BASE } from "../config";

export function TopNavbar({
  toggleSidebar,
  manifests = [],
  showSidebar = true,
}) {
  const {
    logoUrl,
    businessName,
    themeColor,
    themeMode,
    toggleThemeMode,
    token,
    role,
    logout,
  } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${API_BASE}/api/notifications/${id}/mark_read/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="h-16 glass-panel border-b border-border/40 shadow-sm flex items-center justify-between px-6 shrink-0 relative z-50">
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {logoUrl || businessName === "Nexus AI Admin" ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center shrink-0">
              <img
                src={businessName === "Nexus AI Admin" ? "/logo.png" : logoUrl}
                alt="Business Logo"
                className="h-full w-full object-cover rounded-full border border-border/50 shadow-sm"
                style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
              />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight hidden sm:block text-foreground opacity-90 capitalize">
              {businessName}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: themeColor }}
            >
              {businessName ? businessName.charAt(0).toUpperCase() : "B"}
            </div>
            {businessName && (
              <h1 className="text-xl font-bold tracking-tight text-foreground capitalize">
                {businessName}
              </h1>
            )}
          </div>
        )}
      </div>

      {/* Center Navigation */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center gap-1">
        {role === "Admin" && (
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"}`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
        )}
        {role === "Admin" && (
          <button
            onClick={() => {
              localStorage.setItem("openRegister", "true");
              logout();
            }}
            className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
          >
            <PlusCircle className="w-4 h-4" />
            Build New OS
          </button>
        )}

        {/* Render modules in TopNavbar if sidebar is hidden */}
        {!showSidebar &&
          manifests
            .filter((m) => m.module_id !== "attendance")
            .map((m) => (
              <NavLink
                key={m.module_id}
                to={`/module/${m.module_id}`}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"}`
                }
              >
                {m.module_id
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </NavLink>
            ))}

        {/* Always show Attendance in top navbar */}
        <NavLink
          to="/module/attendance"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"}`
          }
        >
          <CalendarClock className="w-4 h-4" />
          Attendance
        </NavLink>

        <NavLink
          to="/module/auth"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"}`
          }
        >
          <User className="w-4 h-4" />
          Profile
        </NavLink>
      </nav>

      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-full glass-panel hover:bg-white/10 transition-all flex items-center justify-center relative"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="px-4 py-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                <span className="font-bold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 sm:p-8 text-center text-muted-foreground text-sm italic">
                    <Bell className="w-8 h-8 opacity-20 mx-auto mb-2" />
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "p-4 hover:bg-muted/30 transition-colors cursor-pointer group",
                          !notif.is_read ? "bg-primary/5" : "opacity-70",
                        )}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div
                              className="text-xs font-bold uppercase tracking-wider mb-1"
                              style={{ color: themeColor }}
                            >
                              {notif.notification_type.replace("_", " ")}
                            </div>
                            <div
                              className={cn(
                                "text-sm font-medium",
                                !notif.is_read
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {notif.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </div>
                            <div className="text-[10px] text-muted-foreground/70 mt-2 font-mono">
                              {new Date(notif.created_at).toLocaleString('en-GB').replace(/\//g, '-')}
                            </div>
                          </div>
                          {!notif.is_read && (
                            <button
                              onClick={(e) => handleMarkAsRead(e, notif.id)}
                              className="p-1.5 rounded-full bg-background border border-border/50 text-muted-foreground hover:text-green-500 hover:border-green-500 transition-all opacity-0 group-hover:opacity-100"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleThemeMode}
          className="p-2 rounded-full glass-panel hover:bg-white/10 transition-all flex items-center justify-center"
          title="Toggle Theme"
        >
          {themeMode === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>

        {!showSidebar && (
          <button
            onClick={logout}
            className="p-2 rounded-full glass-panel hover:bg-destructive/10 text-destructive transition-all flex items-center justify-center"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
