import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  PackageSearch,
  AlertTriangle,
  PlusCircle,
  Tag,
  Save,
  Archive,
} from "lucide-react";
import { CustomSelect } from "./CustomSelect";

const API_BASE = "https://nexuserp-ai.onrender.com";

export function InventoryDashboard() {
  const { token, themeColor } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API_BASE}/api/inventory/products/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/inventory/categories/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const lowStockCount = products.filter(
    (p) => p.stock_quantity <= p.reorder_threshold,
  ).length;
  const totalStock = products.reduce(
    (acc, p) => acc + parseFloat(p.stock_quantity),
    0,
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track products, manage stock levels, and organize categories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedProduct(null);
              setIsProductModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <PlusCircle className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={<PackageSearch />}
          themeColor={themeColor}
        />
        <StatCard
          title="Total Stock Units"
          value={totalStock.toFixed(2)}
          icon={<Archive />}
          themeColor={themeColor}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          icon={<AlertTriangle />}
          themeColor={themeColor}
          alert={lowStockCount > 0}
        />
      </div>

      {/* Main Grid */}
      <div className="glass-panel p-6 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-2.5 rounded-xl shadow-sm"
            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
          >
            <Tag className="w-5 h-5" />
          </div>
          <h3 className="font-bold tracking-tight text-xl">Product Catalog</h3>
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
                    SKU / Name
                  </th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Threshold
                  </th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No products found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isLow = p.stock_quantity <= p.reorder_threshold;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors group"
                      >
                        <td className="px-4 py-4">
                          <div className="font-bold text-foreground">
                            {p.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {p.sku || "No SKU"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium">
                            {p.category_name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-foreground">
                          ${p.price}
                        </td>
                        <td
                          className={`px-4 py-4 text-right font-bold ${isLow ? "text-destructive" : "text-emerald-500"}`}
                        >
                          {p.stock_quantity}{" "}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            {p.unit_of_measure}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-muted-foreground">
                          {p.reorder_threshold}
                        </td>
                        <td className="px-4 py-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsAdjustModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" /> Refill
                          </button>
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

      {isProductModalOpen && (
        <ProductModal
          categories={categories}
          onClose={() => setIsProductModalOpen(false)}
          onSuccess={() => {
            setIsProductModalOpen(false);
            fetchData();
          }}
        />
      )}

      {isAdjustModalOpen && selectedProduct && (
        <AdjustStockModal
          product={selectedProduct}
          onClose={() => setIsAdjustModalOpen(false)}
          onSuccess={() => {
            setIsAdjustModalOpen(false);
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

function ProductModal({ categories, onClose, onSuccess }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unit_of_measure: "unit",
    stock_quantity: 0,
    reorder_threshold: 0,
    price: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, category: formData.category || null };
      await axios.post(`${API_BASE}/api/inventory/products/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-slide-up">
        <h2 className="text-xl font-bold mb-6">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Category</label>
              <CustomSelect
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2 bg-transparent"
              >
                <option value="">-- None --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </CustomSelect>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Unit of Measure</label>
              <input
                required
                type="text"
                value={formData.unit_of_measure}
                onChange={(e) =>
                  setFormData({ ...formData, unit_of_measure: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Price</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Initial Stock</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: parseFloat(e.target.value),
                  })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Reorder Threshold</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.reorder_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorder_threshold: parseFloat(e.target.value),
                  })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
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
              <Save className="w-4 h-4" /> Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdjustStockModal({ product, onClose, onSuccess }) {
  const { token } = useAuth();
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Manual adjustment");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/inventory/products/${product.id}/adjust_stock/`,
        { quantity_adjusted: quantity, reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to adjust stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-slide-up">
        <h2 className="text-xl font-bold mb-2">Refill Stock</h2>
        <p className="text-sm text-muted-foreground mb-6">
          For: <strong>{product.name}</strong> (Current:{" "}
          {product.stock_quantity})
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Quantity to Add</label>
            <input
              required
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 10"
              className="w-full glass-input rounded-xl px-4 py-2"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Reason</label>
            <input
              required
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
              className="px-6 py-2 rounded-xl text-sm font-bold btn-primary text-white shadow-md"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
