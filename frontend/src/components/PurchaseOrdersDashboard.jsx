import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FileText, PlusCircle, PackageCheck, Clock } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

import { API_BASE } from "../config";

export function PurchaseOrdersDashboard() {
  const { token, themeColor , showStatus } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [receiveModalPO, setReceiveModalPO] = useState(null);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [poRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE}/api/purchase_orders/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios
          .get(`${API_BASE}/api/inventory/products/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] })),
      ]);
      setPurchaseOrders(poRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error("Failed to fetch purchase orders", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const draftCount = purchaseOrders.filter(
    (po) => po.status === "draft",
  ).length;
  const pendingCount = purchaseOrders.filter(
    (po) => po.status === "sent" || po.status === "confirmed",
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Purchase Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage vendor orders, track pending deliveries, and receive stock.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <PlusCircle className="w-4 h-4" /> Draft PO
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total POs"
          value={purchaseOrders.length}
          icon={<FileText />}
          themeColor={themeColor}
        />
        <StatCard
          title="Drafts"
          value={draftCount}
          icon={<Clock />}
          themeColor={themeColor}
        />
        <StatCard
          title="Pending Delivery"
          value={pendingCount}
          icon={<PackageCheck />}
          themeColor={themeColor}
          alert={pendingCount > 0}
        />
      </div>

      {/* Main Grid */}
      <div className="glass-panel p-6 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-2.5 rounded-xl shadow-sm"
            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
          >
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold tracking-tight text-xl">Order Ledger</h3>
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
                  <th className="px-4 py-3 font-medium rounded-tl-lg">PO ID</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Items</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 sm:p-8 text-center text-muted-foreground"
                    >
                      No purchase orders found. Draft one to get started.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => {
                    const statusColors = {
                      draft:
                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                      sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                      confirmed:
                        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                      received:
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                    };
                    return (
                      <tr
                        key={po.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors group"
                      >
                        <td className="px-4 py-4">
                          <div className="font-bold text-foreground font-mono text-xs">
                            {po.id.split("-")[0]}...
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(po.created_at).toLocaleDateString('en-GB').replace(/\//g, '-')}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {po.supplier_id || "Unknown"}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusColors[po.status] || statusColors["draft"]}`}
                          >
                            {po.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="font-medium">
                            {po.lines?.length || 0} line(s)
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right space-x-2">
                          {(po.status === "sent" ||
                            po.status === "confirmed" ||
                            po.status === "draft") && (
                            <button
                              onClick={() => setReceiveModalPO(po)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                            >
                              <PackageCheck className="w-3.5 h-3.5" /> Receive
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreatePOModal
          products={products}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchData();
          }}
        />
      )}

      {receiveModalPO && (
        <ReceivePOModal
          po={receiveModalPO}
          products={products}
          onClose={() => setReceiveModalPO(null)}
          onSuccess={() => {
            setReceiveModalPO(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, themeColor, alert = false }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/20">
      <div
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out z-0 pointer-events-none"
        style={{ backgroundColor: alert ? "#ef4444" : themeColor }}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
        <div
          className="p-2.5 rounded-xl shadow-sm"
          style={{
            backgroundColor: alert
              ? "rgba(239, 68, 68, 0.1)"
              : `${themeColor}15`,
            color: alert ? "#ef4444" : themeColor,
          }}
        >
          {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
      </div>
      <div
        className={`text-4xl font-extrabold tracking-tight relative z-10 ${alert ? "text-destructive" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}

function CreatePOModal({ products, onClose, onSuccess }) {
  const { token, themeColor , showStatus } = useAuth();
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState("draft");
  const [lines, setLines] = useState([
    { product_id: "", quantity_ordered: 1, unit_price: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddLine = () =>
    setLines([
      ...lines,
      { product_id: "", quantity_ordered: 1, unit_price: 0 },
    ]);
  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const handleRemoveLine = (index) => {
    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        supplier_id: supplierId,
        status,
        lines: lines.filter((l) => l.product_id),
      };
      await axios.post(`${API_BASE}/api/purchase_orders/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      showStatus("Error", "Failed to draft Purchase Order", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative animate-slide-up max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Draft Purchase Order</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">
                Supplier Name / ID *
              </label>
              <input
                required
                type="text"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Initial Status</label>
              <CustomSelect
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2 bg-transparent"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="confirmed">Confirmed</option>
              </CustomSelect>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Order Lines</label>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs font-semibold text-primary hover:underline"
              >
                + Add Line
              </button>
            </div>

            {lines.map((line, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-start bg-muted/20 p-3 rounded-xl border border-border/50"
              >
                <div className="flex-1 space-y-1">
                  <CustomSelect
                    required
                    value={line.product_id}
                    onChange={(e) =>
                      handleLineChange(idx, "product_id", e.target.value)
                    }
                    className="w-full glass-input rounded-lg px-3 py-1.5 text-sm bg-transparent"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
                <div className="w-24 space-y-1">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="Qty"
                    value={line.quantity_ordered}
                    onChange={(e) =>
                      handleLineChange(
                        idx,
                        "quantity_ordered",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full glass-input rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
                <div className="w-32 space-y-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="Unit Price"
                    value={line.unit_price}
                    onChange={(e) =>
                      handleLineChange(
                        idx,
                        "unit_price",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full glass-input rounded-lg px-3 py-1.5 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLine(idx)}
                  className="mt-1 text-muted-foreground hover:text-destructive"
                >
                  &times;
                </button>
              </div>
            ))}
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
              className="px-6 py-2 rounded-xl text-sm font-bold text-white shadow-md flex items-center gap-2"
              style={{ backgroundColor: themeColor }}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
              )}
              Save Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReceivePOModal({ po, products, onClose, onSuccess }) {
  const { token, themeColor , showStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  // Track quantities we are receiving now
  const [receiveData, setReceiveData] = useState(
    (po.lines || []).map((l) => ({
      product_id: l.product_id,
      quantity_received: Math.max(
        0,
        parseFloat(l.quantity_ordered) - parseFloat(l.quantity_received),
      ), // Default to receiving remaining qty
    })),
  );

  const handleQtyChange = (idx, val) => {
    const newData = [...receiveData];
    newData[idx].quantity_received = val;
    setReceiveData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        items: receiveData.filter((d) => d.quantity_received > 0),
      };
      await axios.post(
        `${API_BASE}/api/purchase_orders/${po.id}/receive/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      showStatus("Error", "Failed to receive stock", "error");
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (id) => {
    const p = products.find((x) => x.id === id);
    return p ? p.name : id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-slide-up">
        <h2 className="text-xl font-bold mb-2">Receive Stock</h2>
        <p className="text-sm text-muted-foreground mb-6">
          PO: {po.id.split("-")[0]} • Supplier: {po.supplier_id}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {po.lines?.map((line, idx) => {
            const remaining = Math.max(
              0,
              parseFloat(line.quantity_ordered) -
                parseFloat(line.quantity_received),
            );
            return (
              <div
                key={idx}
                className="flex items-center justify-between bg-muted/20 p-3 rounded-xl border border-border/50"
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {getProductName(line.product_id)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ordered: {line.quantity_ordered} • Received:{" "}
                    {line.quantity_received}
                  </div>
                </div>
                <div className="w-24 text-right">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max={remaining}
                    value={receiveData[idx].quantity_received}
                    onChange={(e) =>
                      handleQtyChange(idx, parseFloat(e.target.value))
                    }
                    className="w-full glass-input rounded-lg px-2 py-1 text-sm text-right"
                  />
                </div>
              </div>
            );
          })}

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
              className="px-6 py-2 rounded-xl text-sm font-bold text-white shadow-md flex items-center gap-2"
              style={{ backgroundColor: themeColor }}
            >
              <PackageCheck className="w-4 h-4" /> Confirm Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
