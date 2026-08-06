import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { User, Building, Mail, Shield, Camera, Key, Pencil, Check, X } from "lucide-react";

import { API_BASE } from "../config";

export function SecurityDashboard() {
  const { token, themeColor, businessName, logoUrl , showStatus } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const fileInputRef = useRef(null);

  const fetchMe = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to load user profile", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token]);

  const handleAvatarChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await axios.patch(`${API_BASE}/api/auth/me/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchMe(); // refresh user data to get new avatar URL
    } catch (err) {
      console.error("Failed to upload avatar", err);
      showStatus("Error", "Failed to upload avatar.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!emailInput || !emailInput.trim()) return;
    setSavingEmail(true);
    try {
      await axios.patch(
        `${API_BASE}/api/auth/me/`,
        { email: emailInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchMe();
      setIsEditingEmail(false);
      if (showStatus) showStatus("Success", "Email ID updated successfully!", "success");
    } catch (err) {
      console.error("Failed to update email", err);
      if (showStatus) showStatus("Error", "Failed to update email.", "error");
    } finally {
      setSavingEmail(false);
    }
  };

  const avatarUrl = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${API_BASE}${user.avatar}`
    : logoUrl;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-4 sm:p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-2 mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Profile & Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your identity, employees, and security settings.
        </p>
      </div>

      <div
        className={
          user?.role === "Admin"
            ? "grid grid-cols-1 xl:grid-cols-3 gap-8"
            : "flex flex-col gap-8 max-w-4xl mx-auto"
        }
      >
        {/* Profile Identity Card */}
        <div
          className={`${user?.role === "Admin" ? "xl:col-span-1 flex-col items-center" : "flex-col sm:flex-row items-center sm:items-start"} glass-panel p-8 rounded-3xl flex gap-8 shadow-xl border border-transparent hover:border-primary/20 transition-all duration-300 relative overflow-hidden h-fit`}
        >
          <div
            className="absolute top-[-50%] left-[-10%] w-[120%] h-[100%] rounded-[100%] opacity-10 pointer-events-none"
            style={{ backgroundColor: themeColor, filter: "blur(80px)" }}
          />

          <div className="flex flex-col items-center gap-4 relative z-10">
            <div
              className={`w-36 h-36 rounded-full border-4 shadow-2xl flex items-center justify-center overflow-hidden bg-white relative ${uploading ? "opacity-50" : ""}`}
              style={{ borderColor: themeColor }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <User className="w-16 h-16 text-muted-foreground opacity-50" />
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-[4.5rem] right-1 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
              title="Change Avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />

            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold text-foreground">
                {user?.username || "Loading..."}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                {user?.role && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      color: themeColor,
                      border: `1px solid ${themeColor}40`,
                    }}
                  >
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full flex-1 space-y-3 z-10 sm:mt-2">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 flex-1 mr-2">
                <div className="p-2.5 rounded-xl bg-background shadow-sm text-muted-foreground shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Registered Email ID
                  </div>
                  {isEditingEmail ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="flex-1 bg-background border border-primary/40 rounded-xl px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="yourname@gmail.com"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEmail}
                        disabled={savingEmail}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0"
                        title="Save Email"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsEditingEmail(false)}
                        className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-foreground font-semibold text-sm truncate">
                      {user?.email || "No email provided"}
                    </div>
                  )}
                </div>
              </div>
              {!isEditingEmail && (
                <button
                  onClick={() => {
                    setEmailInput(user?.email || "");
                    setIsEditingEmail(true);
                  }}
                  className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                  title="Edit Email"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 shadow-sm">
              <div className="p-2.5 rounded-xl bg-background shadow-sm text-muted-foreground">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Organization
                </div>
                <div className="text-foreground font-medium text-sm">
                  {user?.business_name || businessName || "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 shadow-sm">
              <div className="p-2.5 rounded-xl bg-background shadow-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Assigned Modules
                </div>
                <div className="text-foreground font-medium mt-1 flex flex-wrap gap-1.5">
                  {user?.assigned_modules?.length ? (
                    user.assigned_modules.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-background shadow-sm border border-border capitalize"
                      >
                        {m.replace(/_/g, " ")}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground italic text-xs">
                      No modules assigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Area */}
        <div
          className={
            user?.role === "Admin" ? "xl:col-span-2 space-y-4" : "space-y-4"
          }
        >
          <PasswordManagement themeColor={themeColor || "#3b82f6"} />
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, icon, themeColor, children }) {
  return (
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 flex flex-col">
      <div
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out z-0 pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div
          className="p-2.5 rounded-xl shadow-sm"
          style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
        >
          {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
        <h3 className="font-bold tracking-tight text-lg">{title}</h3>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function PasswordManagement({ themeColor }) {
  const { token } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/auth/password_reset/`,
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showStatus("Success", "Password updated successfully!", "success");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      showStatus("Error", err.response?.data?.error || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsCard
      title="Change Password"
      icon={<Key />}
      themeColor={themeColor}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground/80">
            New Password
          </label>
          <input
            required
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full glass-input rounded-xl px-4 py-2 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-xl text-sm font-bold btn-primary text-white shadow-md"
        >
          Update Password
        </button>
      </form>
    </SettingsCard>
  );
}
