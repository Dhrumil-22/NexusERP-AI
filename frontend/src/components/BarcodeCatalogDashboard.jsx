import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  ScanBarcode,
  Layers,
  MapPin,
  Search,
  Package,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

export function BarcodeCatalogDashboard() {
  const { token, themeColor } = useAuth();
  const [variants, setVariants] = useState([]);
  const [stores, setStores] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [varRes, storeRes] = await Promise.all([
        axios.get(`${API_BASE}/api/barcode/variants/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/barcode/stores/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setVariants(varRes.data);
      setStores(storeRes.data);
    } catch (err) {
      console.error("Failed to fetch catalog data", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    setScanResult(null);
    setScanError(null);
    try {
      const res = await axios.post(
        `${API_BASE}/api/barcode/variants/scan/`,
        { barcode: scanInput },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setScanResult(res.data);
      setScanInput(""); // clear after success
    } catch (err) {
      setScanError(err.response?.data?.error || "Barcode not found");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Retail Catalog
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage store locations, multi-variant products, and scan barcodes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Quick Scan Widget */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 space-y-6 md:col-span-1">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl shadow-sm"
              style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
            >
              <ScanBarcode className="w-5 h-5" />
            </div>
            <h3 className="font-bold tracking-tight text-xl">Quick Scan</h3>
          </div>

          <form onSubmit={handleScan} className="flex gap-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan or type barcode..."
              className="w-full glass-input rounded-xl pl-10 pr-4 py-3 font-mono text-sm tracking-widest shadow-inner focus:ring-2"
              autoFocus
            />
          </form>

          {scanResult && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-slide-up">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold text-sm">Product Found!</span>
              </div>
              <div className="font-bold text-lg">{scanResult.product_name}</div>
              <div className="text-sm text-muted-foreground mt-1 flex justify-between">
                <span>
                  {scanResult.size} / {scanResult.color}
                </span>
                <span className="font-bold text-foreground">
                  Stock: {scanResult.stock_quantity}
                </span>
              </div>
              <div className="mt-3 text-xs bg-background/50 px-2 py-1 rounded inline-block text-muted-foreground border border-border/50">
                <MapPin className="w-3 h-3 inline mr-1" />{" "}
                {scanResult.store_name}
              </div>
            </div>
          )}

          {scanError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-semibold animate-slide-up text-center">
              {scanError}
            </div>
          )}
        </div>

        {/* Variants Matrix */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl shadow-sm"
                style={{
                  backgroundColor: `${themeColor}15`,
                  color: themeColor,
                }}
              >
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold tracking-tight text-xl">
                Variant Stock Matrix
              </h3>
            </div>
            <button
              onClick={() =>
                alert("Variants are created via the central Inventory module.")
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Add Variant
            </button>
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
                      Product
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Variant (Size/Color)
                    </th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium text-right rounded-tr-lg">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variants.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl mt-4 block"
                      >
                        No variants in catalog yet.
                      </td>
                    </tr>
                  ) : (
                    variants.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          {v.product_name ||
                            `ID: ${v.product_id.substring(0, 8)}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-muted rounded-md text-xs font-semibold mr-1">
                            {v.size || "N/A"}
                          </span>
                          <span className="px-2 py-1 bg-muted rounded-md text-xs font-semibold">
                            {v.color || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <MapPin className="w-3 h-3 inline mr-1" />{" "}
                          {v.store_name}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">
                          {v.stock_quantity}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
