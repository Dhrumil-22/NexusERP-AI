import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Box, Plus, Scissors, Layers, Users } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

import { API_BASE } from "../config";

export function ServicePackagesDashboard() {
  const { token, themeColor } = useAuth();
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [skills, setSkills] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const [activeTab, setActiveTab] = useState("services");

  // Modals
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: 60,
    category: "",
  });

  const [showAddPackage, setShowAddPackage] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    package_price: "",
    service_ids: [],
  });

  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({
    employee_id: "",
    service: "",
    proficiency_level: "intermediate",
  });

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [svcRes, pkgRes, skillRes, empRes] = await Promise.all([
        axios.get(`${API_BASE}/api/service_packages/services/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/service_packages/packages/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/service_packages/skills/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios
          .get(`${API_BASE}/api/hr/employees/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] })),
      ]);
      setServices(svcRes.data);
      setPackages(pkgRes.data);
      setSkills(skillRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE}/api/service_packages/services/`,
        newService,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowAddService(false);
      setNewService({
        name: "",
        description: "",
        price: "",
        duration_minutes: 60,
        category: "",
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    try {
      // Need to map service_ids to services for the backend depending on how the serializer is set up
      // The ModelViewSet with many-to-many often accepts primary key arrays.
      await axios.post(
        `${API_BASE}/api/service_packages/packages/`,
        {
          ...newPackage,
          services: newPackage.service_ids,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowAddPackage(false);
      setNewPackage({
        name: "",
        description: "",
        package_price: "",
        service_ids: [],
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/service_packages/skills/`, newSkill, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddSkill(false);
      setNewSkill({
        employee_id: "",
        service: "",
        proficiency_level: "intermediate",
      });
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
            <Box className="w-8 h-8" style={{ color: themeColor }} />
            Service Packages
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage salon/clinic offerings, bundle packages, and track staff
            skills.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddService(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold transition-transform hover:scale-[1.02] shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            <Plus className="w-4 h-4" /> New Service
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border/50 pb-px">
        <button
          onClick={() => setActiveTab("services")}
          className={`pb-4 px-2 font-bold transition-colors flex items-center gap-2 ${activeTab === "services" ? "text-foreground border-b-2" : "text-muted-foreground"}`}
          style={
            activeTab === "services" ? { borderBottomColor: themeColor } : {}
          }
        >
          <Scissors className="w-4 h-4" /> Services
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`pb-4 px-2 font-bold transition-colors flex items-center gap-2 ${activeTab === "packages" ? "text-foreground border-b-2" : "text-muted-foreground"}`}
          style={
            activeTab === "packages" ? { borderBottomColor: themeColor } : {}
          }
        >
          <Layers className="w-4 h-4" /> Packages
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`pb-4 px-2 font-bold transition-colors flex items-center gap-2 ${activeTab === "skills" ? "text-foreground border-b-2" : "text-muted-foreground"}`}
          style={
            activeTab === "skills" ? { borderBottomColor: themeColor } : {}
          }
        >
          <Users className="w-4 h-4" /> Staff Skills
        </button>
      </div>

      {activeTab === "services" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="glass-panel rounded-2xl p-6 border border-border/50 flex flex-col relative overflow-hidden group"
            >
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: themeColor }}
              ></div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl">{svc.name}</h3>
                <span className="font-mono font-bold px-2 py-1 bg-muted/50 rounded-lg">
                  ₹{parseFloat(svc.price).toFixed(2)}
                </span>
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {svc.category || "General"} • {svc.duration_minutes} min
              </span>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                {svc.description || "No description provided."}
              </p>

              <div className="pt-4 border-t border-border/50 text-xs font-semibold text-muted-foreground">
                {
                  skills.filter((sk) => String(sk.service) === String(svc.id))
                    .length
                }{" "}
                Staff Member(s) Qualified
              </div>
            </div>
          ))}
          {services.length === 0 && !isFetching && (
            <div className="col-span-full text-center p-12 text-muted-foreground">
              No services configured.
            </div>
          )}
        </div>
      )}

      {activeTab === "packages" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddPackage(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-muted text-foreground transition-colors hover:bg-muted/80 text-sm border border-border/50"
            >
              <Plus className="w-4 h-4" /> Create Package
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg) => {
              // Calculate original price of services included
              let origPrice = 0;
              pkg.services?.forEach((s_id) => {
                const s = services.find((x) => String(x.id) === String(s_id));
                if (s) origPrice += parseFloat(s.price);
              });
              const discount =
                origPrice > 0
                  ? (
                      ((origPrice - parseFloat(pkg.package_price)) /
                        origPrice) *
                      100
                    ).toFixed(0)
                  : 0;
              return (
                <div
                  key={pkg.id}
                  className="glass-panel rounded-2xl p-6 border border-border/50 relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-xl flex items-center gap-2">
                        {pkg.name}
                        {!pkg.is_active && (
                          <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pkg.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-mono font-bold text-xl"
                        style={{ color: themeColor }}
                      >
                        ₹{parseFloat(pkg.package_price).toFixed(2)}
                      </div>
                      {origPrice > parseFloat(pkg.package_price) && (
                        <div className="text-xs text-muted-foreground line-through">
                          ₹{origPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {origPrice > parseFloat(pkg.package_price) && (
                    <div className="inline-block px-2 py-1 bg-green-500/10 text-green-600 text-xs font-bold rounded mb-4">
                      Save {discount}%
                    </div>
                  )}

                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Included Services
                  </h4>
                  <ul className="space-y-2">
                    {pkg.services?.map((s_id) => {
                      const svc = services.find(
                        (x) => String(x.id) === String(s_id),
                      );
                      return (
                        <li
                          key={s_id}
                          className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded text-sm"
                        >
                          <span>{svc?.name || `Unknown Service ${s_id}`}</span>
                          <span className="text-xs text-muted-foreground">
                            {svc?.duration_minutes} min
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "skills" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddSkill(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-muted text-foreground transition-colors hover:bg-muted/80 text-sm border border-border/50"
            >
              <Plus className="w-4 h-4" /> Map Staff to Service
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Staff Member
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Service
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Proficiency
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {skills.map((sk) => {
                  const emp = employees.find(
                    (e) => String(e.id) === String(sk.employee_id),
                  );
                  const svc = services.find(
                    (s) => String(s.id) === String(sk.service),
                  );
                  return (
                    <tr
                      key={sk.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-4 font-medium">
                        {emp
                          ? `${emp.first_name} ${emp.last_name}`
                          : "Unknown Staff"}
                      </td>
                      <td className="px-4 py-4">
                        {svc?.name || "Unknown Service"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            sk.proficiency_level === "expert"
                              ? "bg-purple-500/20 text-purple-600"
                              : sk.proficiency_level === "intermediate"
                                ? "bg-blue-500/20 text-blue-600"
                                : "bg-gray-500/20 text-gray-600"
                          }`}
                        >
                          {sk.proficiency_level}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div
              className="p-6 border-b border-border/50"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                New Service
              </h2>
            </div>
            <form onSubmit={handleCreateService} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({ ...newService, price: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    required
                    value={newService.duration_minutes}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        duration_minutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Category
                </label>
                <input
                  type="text"
                  value={newService.category}
                  onChange={(e) =>
                    setNewService({ ...newService, category: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                  placeholder="e.g. Haircut, Spa"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddService(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: themeColor }}
                >
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Package Modal */}
      {showAddPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div
              className="p-6 border-b border-border/50"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                New Package
              </h2>
            </div>
            <form onSubmit={handleCreatePackage} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Package Name
                </label>
                <input
                  type="text"
                  required
                  value={newPackage.name}
                  onChange={(e) =>
                    setNewPackage({ ...newPackage, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Package Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPackage.package_price}
                  onChange={(e) =>
                    setNewPackage({
                      ...newPackage,
                      package_price: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                  <span>Included Services</span>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded">
                    Hold Ctrl/Cmd to select multiple
                  </span>
                </label>
                <CustomSelect
                  multiple
                  required
                  value={newPackage.service_ids}
                  onChange={(e) => {
                    const options = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value,
                    );
                    setNewPackage({ ...newPackage, service_ids: options });
                  }}
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none h-32"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (₹{s.price})
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newPackage.description}
                  onChange={(e) =>
                    setNewPackage({
                      ...newPackage,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPackage(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: themeColor }}
                >
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div
              className="p-6 border-b border-border/50"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                Map Staff Skill
              </h2>
            </div>
            <form onSubmit={handleCreateSkill} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Staff Member
                </label>
                <CustomSelect
                  required
                  value={newSkill.employee_id}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, employee_id: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                >
                  <option value="">Select staff...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Service
                </label>
                <CustomSelect
                  required
                  value={newSkill.service}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, service: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                >
                  <option value="">Select service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Proficiency Level
                </label>
                <CustomSelect
                  required
                  value={newSkill.proficiency_level}
                  onChange={(e) =>
                    setNewSkill({
                      ...newSkill,
                      proficiency_level: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </CustomSelect>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: themeColor }}
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
