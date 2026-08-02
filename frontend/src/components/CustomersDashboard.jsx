import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  PlusCircle,
  Award,
  NotebookText,
  Save,
  X,
  Activity,
} from "lucide-react";

import { API_BASE } from "../config";

export function CustomersDashboard() {
  const { token, themeColor } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(`${API_BASE}/api/customers/customers/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchCustomers();
  }, [token]);

  const totalPoints = customers.reduce(
    (acc, c) => acc + (c.loyalty_points || 0),
    0,
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Customer Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage profiles, track loyalty points, and log interactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedCustomer(null);
              setIsCustomerModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <PlusCircle className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          value={customers.length}
          icon={<Users />}
          themeColor={themeColor}
        />
        <StatCard
          title="Active Loyalty Points"
          value={totalPoints}
          icon={<Award />}
          themeColor={themeColor}
        />
        <StatCard
          title="Recent Activity"
          value="Active"
          icon={<Activity />}
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
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold tracking-tight text-xl">
            Customer Profiles
          </h3>
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
                  <th className="px-4 py-3 font-medium rounded-tl-lg">
                    Name / Company
                  </th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Loyalty Points
                  </th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No customers found. Add your first customer!
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <div className="font-bold text-foreground">
                          {c.first_name} {c.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.company || "Individual"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">{c.email || "No email"}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.phone || "No phone"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-primary">
                        {c.loyalty_points}{" "}
                        <Award className="w-3.5 h-3.5 inline-block text-yellow-500 mb-0.5 ml-1" />
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsPointsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-colors"
                        >
                          Points
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsNoteModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <NotebookText className="w-3.5 h-3.5" /> Notes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCustomerModalOpen && (
        <CustomerModal
          onClose={() => setIsCustomerModalOpen(false)}
          onSuccess={() => {
            setIsCustomerModalOpen(false);
            fetchCustomers();
          }}
        />
      )}

      {isNoteModalOpen && selectedCustomer && (
        <NotesModal
          customer={selectedCustomer}
          onClose={() => setIsNoteModalOpen(false)}
          onSuccess={() => {
            fetchCustomers();
          }}
        />
      )}

      {isPointsModalOpen && selectedCustomer && (
        <PointsModal
          customer={selectedCustomer}
          onClose={() => setIsPointsModalOpen(false)}
          onSuccess={() => {
            setIsPointsModalOpen(false);
            fetchCustomers();
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

function CustomerModal({ onClose, onSuccess }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    loyalty_points: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/customers/customers/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-slide-up">
        <h2 className="text-xl font-bold mb-6">Add New Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">First Name *</label>
              <input
                required
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="w-full glass-input rounded-xl px-4 py-2"
            />
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
              className="px-6 py-2 rounded-xl text-sm font-bold btn-primary text-white shadow-md flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
              )}
              <Save className="w-4 h-4" /> Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotesModal({ customer, onClose, onSuccess }) {
  const { token } = useAuth();
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/customers/notes/`,
        { customer: customer.id, note: noteText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNoteText("");
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div
        className="glass-panel w-full max-w-lg rounded-2xl flex flex-col shadow-2xl relative animate-slide-up"
        style={{ maxHeight: "80vh" }}
      >
        <div className="p-6 border-b border-border/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Customer Notes</h2>
            <p className="text-sm text-muted-foreground">
              Log for {customer.first_name} {customer.last_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {customer.notes && customer.notes.length > 0 ? (
            customer.notes.map((n) => (
              <div
                key={n.id}
                className="bg-muted/30 p-4 rounded-xl border border-border/50"
              >
                <p className="text-sm whitespace-pre-wrap">{n.note}</p>
                <div className="text-xs text-muted-foreground mt-2 text-right">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No notes logged yet.
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/50 bg-background/50">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type a new note..."
              className="flex-1 glass-input rounded-xl px-4 py-3 min-h-[44px] max-h-[120px]"
            />

            <button
              type="submit"
              disabled={loading || !noteText.trim()}
              className="px-6 rounded-xl text-sm font-bold btn-primary text-white shadow-md h-[44px]"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PointsModal({ customer, onClose, onSuccess }) {
  const { token } = useAuth();
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/customers/customers/${customer.id}/add_points/`,
        { points },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to adjust points");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-slide-up">
        <h2 className="text-xl font-bold mb-2">Adjust Loyalty Points</h2>
        <p className="text-sm text-muted-foreground mb-6">
          For:{" "}
          <strong>
            {customer.first_name} {customer.last_name}
          </strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">
              Points to Add (can be negative)
            </label>
            <input
              required
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="e.g. 100 or -50"
              className="w-full glass-input rounded-xl px-4 py-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              className="px-6 py-2 rounded-xl text-sm font-bold bg-yellow-500 hover:bg-yellow-600 text-white shadow-md"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
