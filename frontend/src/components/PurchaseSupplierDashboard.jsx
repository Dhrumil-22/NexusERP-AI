import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Truck, ShoppingCart } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

import { API_BASE } from "../config";

export function PurchaseSupplierDashboard() {
  const { token, themeColor } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const [activeTab, setActiveTab] = useState("suppliers");
  // Modals
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact_email: "",
    phone: "",
    payment_terms: "",
    notes: "",
  });

  const [showAddPO, setShowAddPO] = useState(false);
  const [newPO, setNewPO] = useState({ supplier: "", expected_delivery: "" });
  const [poLines, setPoLines] = useState([
    { product_id: "", quantity_ordered: 1, unit_price: 0 },
  ]);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [supRes, poRes] = await Promise.all([
        axios.get(`${API_BASE}/api/purchase/suppliers/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/purchase/purchase-orders/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSuppliers(supRes.data);
      setPurchaseOrders(poRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/purchase/suppliers/`, newSupplier, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddSupplier(false);
      setNewSupplier({
        name: "",
        contact_email: "",
        phone: "",
        payment_terms: "",
        notes: "",
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newPO,
        expected_delivery: newPO.expected_delivery || null,
      };
      const poRes = await axios.post(
        `${API_BASE}/api/purchase/purchase-orders/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const poId = poRes.data.id;
      for (const line of poLines) {
        if (line.product_id) {
          await axios.post(
            `${API_BASE}/api/purchase/purchase-order-lines/`,
            {
              ...line,
              purchase_order: poId,
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }
      }
      setShowAddPO(false);
      setNewPO({ supplier: "", expected_delivery: "" });
      setPoLines([{ product_id: "", quantity_ordered: 1, unit_price: 0 }]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const markReceived = async (poId) => {
    try {
      await axios.post(
        `${API_BASE}/api/purchase/purchase-orders/${poId}/mark_received/`,
        {},
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
            <Truck className="w-8 h-8" style={{ color: themeColor }} />
            Purchasing & Suppliers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage vendor relationships and restock inventory.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddSupplier(true)}
            className="px-4 py-2 rounded-xl font-bold bg-muted text-foreground transition-colors hover:bg-muted/80"
          >
            New Supplier
          </button>
          <button
            onClick={() => setShowAddPO(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold transition-transform hover:scale-[1.02] shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            <ShoppingCart className="w-4 h-4" /> Create PO
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border/50 pb-px">
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`pb-4 px-2 font-bold transition-colors ${activeTab === "suppliers" ? "text-foreground border-b-2" : "text-muted-foreground"}`}
          style={
            activeTab === "suppliers" ? { borderBottomColor: themeColor } : {}
          }
        >
          Supplier Directory
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-4 px-2 font-bold transition-colors ${activeTab === "orders" ? "text-foreground border-b-2" : "text-muted-foreground"}`}
          style={
            activeTab === "orders" ? { borderBottomColor: themeColor } : {}
          }
        >
          Purchase Orders
        </button>
      </div>

      {activeTab === "suppliers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="glass-panel rounded-2xl p-6 border border-border/50 flex flex-col relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: themeColor }}
              ></div>
              <h3 className="font-bold text-xl mb-2">{sup.name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground mb-4">
                <p>Email: {sup.contact_email || "N/A"}</p>
                <p>Phone: {sup.phone || "N/A"}</p>
                <p>Terms: {sup.payment_terms || "N/A"}</p>
              </div>
              <p className="text-sm italic">{sup.notes}</p>
            </div>
          ))}
          {suppliers.length === 0 && !isFetching && (
            <div className="col-span-full text-center p-12 text-muted-foreground border border-dashed border-border/50 rounded-2xl">
              No suppliers found.
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-4">
          {purchaseOrders.map((po) => (
            <div
              key={po.id}
              className="glass-panel rounded-2xl p-6 border border-border/50 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">
                    PO to {po.supplier_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(po.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      po.status === "received"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : po.status === "draft"
                          ? "bg-muted text-muted-foreground"
                          : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {po.status}
                  </span>
                  {po.status !== "received" && (
                    <button
                      onClick={() => markReceived(po.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      Mark Received
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-muted/20 rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                  Order Items
                </h4>
                <div className="space-y-2">
                  {po.lines?.map((line) => (
                    <div
                      key={line.id}
                      className="flex justify-between items-center text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0"
                    >
                      <span>
                        Product ID:{" "}
                        <span className="font-mono text-xs">
                          {line.product_id}
                        </span>
                      </span>
                      <span className="font-mono">
                        {line.quantity_ordered} ordered
                      </span>
                    </div>
                  ))}
                  {!po.lines?.length && (
                    <div className="text-sm text-muted-foreground italic">
                      No items listed.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {purchaseOrders.length === 0 && !isFetching && (
            <div className="text-center p-12 text-muted-foreground border border-dashed border-border/50 rounded-2xl">
              No purchase orders found.
            </div>
          )}
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div
              className="p-6 border-b border-border/50"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                New Supplier
              </h2>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Supplier Name
                </label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newSupplier.contact_email}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        contact_email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newSupplier.phone}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Payment Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. Net 30"
                  value={newSupplier.payment_terms}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      payment_terms: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: themeColor }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showAddPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden max-h-[90vh] flex flex-col">
            <div
              className="p-6 border-b border-border/50 shrink-0"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                Create Purchase Order
              </h2>
            </div>
            <form
              onSubmit={handleCreatePO}
              className="p-6 space-y-4 overflow-y-auto"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Supplier
                </label>
                <CustomSelect
                  required
                  value={newPO.supplier}
                  onChange={(e) =>
                    setNewPO({ ...newPO, supplier: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              <div className="border-t border-border/50 pt-4 space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground">
                  Order Items
                </h3>
                {poLines.map((line, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Product ID"
                      required
                      value={line.product_id}
                      onChange={(e) => {
                        const newLines = [...poLines];
                        newLines[idx].product_id = e.target.value;
                        setPoLines(newLines);
                      }}
                      className="flex-1 px-3 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      required
                      value={line.quantity_ordered}
                      onChange={(e) => {
                        const newLines = [...poLines];
                        newLines[idx].quantity_ordered = Number(e.target.value);
                        setPoLines(newLines);
                      }}
                      className="w-20 px-3 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setPoLines([
                      ...poLines,
                      { product_id: "", quantity_ordered: 1, unit_price: 0 },
                    ])
                  }
                  className="text-xs font-bold text-primary hover:underline"
                >
                  + Add another item
                </button>
              </div>

              <div className="pt-4 flex gap-3 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setShowAddPO(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: themeColor }}
                >
                  Create PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
