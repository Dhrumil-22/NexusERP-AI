import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Key,
  Shield,
  UserCog,
  Check,
  X,
  ShieldAlert,
  Plus,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

export function PermissionsDashboard() {
  const { token, themeColor } = useAuth();
  const [activeTab, setActiveTab] = useState("roles");
  const [roles, setRoles] = useState([]);
  const [globalPermissions, setGlobalPermissions] = useState([]);
  const [roleMappings, setRoleMappings] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [rolesRes, permsRes, mappingsRes, overridesRes] = await Promise.all(
        [
          axios.get(`${API_BASE}/api/permissions/roles/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/permissions/global/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/permissions/role-mappings/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/permissions/overrides/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ],
      );
      setRoles(rolesRes.data);
      setGlobalPermissions(permsRes.data);
      setRoleMappings(mappingsRes.data);
      setOverrides(overridesRes.data);
    } catch (err) {
      console.error("Failed to fetch permissions data", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Access & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage security roles and individual employee overrides.
          </p>
        </div>
      </div>

      <div className="flex space-x-1 glass-panel p-1 rounded-xl w-max">
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "roles" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"}`}
          style={activeTab === "roles" ? { backgroundColor: themeColor } : {}}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Role Templates
          </div>
        </button>
        <button
          onClick={() => setActiveTab("overrides")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "overrides" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"}`}
          style={
            activeTab === "overrides" ? { backgroundColor: themeColor } : {}
          }
        >
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4" /> Employee Overrides
          </div>
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-transparent hover:border-primary/20 transition-all duration-300">
        {isFetching ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "roles" && (
              <RolesTab
                roles={roles}
                roleMappings={roleMappings}
                globalPermissions={globalPermissions}
              />
            )}
            {activeTab === "overrides" && (
              <OverridesTab
                overrides={overrides}
                globalPermissions={globalPermissions}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RolesTab({ roles, roleMappings, globalPermissions }) {
  const { themeColor } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold tracking-tight text-xl flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" style={{ color: themeColor }} />{" "}
          Assigned Roles
        </h3>
      </div>

      {roles.length === 0 ? (
        <p className="text-muted-foreground">No roles configured yet.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((r) => {
            const myMappings = roleMappings.filter((m) => m.role === r.id);
            return (
              <div
                key={r.id}
                className="p-4 bg-muted/20 rounded-xl border border-border/50 space-y-4"
              >
                <div>
                  <h4 className="font-bold text-lg">{r.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {r.description || "No description"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Permissions
                  </div>
                  {myMappings.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic">
                      No specific permissions attached.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {myMappings.map((m) => (
                        <span
                          key={m.id}
                          className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${m.is_allowed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}
                        >
                          {m.is_allowed ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          {m.permission.codename}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OverridesTab({ overrides, globalPermissions }) {
  const { themeColor } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold tracking-tight text-xl flex items-center gap-2">
          <Key className="w-5 h-5" style={{ color: themeColor }} /> Active
          Overrides
        </h3>
        <button
          className="text-sm font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
          style={{ color: themeColor }}
        >
          <Plus className="w-4 h-4" /> Add Override
        </button>
      </div>

      {overrides.length === 0 ? (
        <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
          <UserCog className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground font-medium">
            No individual employee overrides found.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Everyone is currently relying entirely on their default Role
            template.
          </p>
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-xs bg-muted/50 text-muted-foreground border-b border-border/50 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">Employee ID</th>
              <th className="px-4 py-3 font-medium">Permission</th>
              <th className="px-4 py-3 font-medium">Override Rule</th>
            </tr>
          </thead>
          <tbody>
            {overrides.map((o) => (
              <tr
                key={o.id}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-4 font-bold">{o.employee_id}</td>
                <td className="px-4 py-4">{o.permission.codename}</td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold flex items-center w-max gap-1 ${o.is_allowed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}
                  >
                    {o.is_allowed ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {o.is_allowed ? "Force ALLOW" : "Force DENY"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
