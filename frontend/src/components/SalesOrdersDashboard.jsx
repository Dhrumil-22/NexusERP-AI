import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Package } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

import { API_BASE } from "../config";

export function SalesOrdersDashboard() {
  const { token, themeColor , showStatus } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  // Modals
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({ customer_id: "" });
  // Selected Order
  const [selectedOrder, setSelectedOrder] = useState(null);
  // Add item to order
  const [newItem, setNewItem] = useState({ product_id: "", quantity: 1 });

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [orderRes, prodRes, custRes] = await Promise.all([
        axios.get(`${API_BASE}/api/sales_orders/orders/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios
          .get(`${API_BASE}/api/inventory/products/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] })),
        axios
          .get(`${API_BASE}/api/customers/customers/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] })),
      ]);
      setOrders(orderRes.data);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/sales_orders/orders/`, newOrder, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddOrder(false);
      setNewOrder({ customer_id: "" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const product = products.find(
        (p) => String(p.id) === String(newItem.product_id),
      );
      const price = product ? product.price : 0;
      await axios.post(
        `${API_BASE}/api/sales_orders/items/`,
        {
          order: selectedOrder.id,
          product_id: newItem.product_id,
          quantity: newItem.quantity,
          unit_price: price,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewItem({ product_id: "", quantity: 1 });
      // Refresh
      const updatedOrders = await axios.get(
        `${API_BASE}/api/sales_orders/orders/`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders(updatedOrders.data);
      setSelectedOrder(
        updatedOrders.data.find((o) => o.id === selectedOrder.id),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const [confirmingId, setConfirmingId] = useState(null);

  const handleConfirmOrder = async (orderId) => {
    if (confirmingId) return;
    setConfirmingId(orderId);
    try {
      await axios.post(
        `${API_BASE}/api/sales_orders/orders/${orderId}/confirm/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      navigate("/module/invoicing_finance");
    } catch (err) {
      showStatus("Error", err.response?.data?.error || "Failed to confirm order", "error");
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" style={{ color: themeColor }} />
            Sales Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage sales, add line items, and generate invoices seamlessly.
          </p>
        </div>
        <button
          onClick={() => setShowAddOrder(true)}
          className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold transition-transform hover:scale-[1.02] shadow-lg"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Order ID
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Customer
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">
                    Total
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {orders.map((order) => {
                  const custName =
                    customers.find(
                      (c) => String(c.id) === String(order.customer_id),
                    )?.name || "Unknown";
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedOrder?.id === order.id ? "bg-muted/50" : ""}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-4 font-mono text-xs">
                        #{String(order.id).slice(0, 8)}
                      </td>
                      <td className="px-4 py-4 font-medium">{custName}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            order.status === "draft"
                              ? "bg-yellow-500/20 text-yellow-600"
                              : "bg-green-500/20 text-green-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold">
                        ₹{parseFloat(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {order.status === "draft" && (
                          <button
                            disabled={confirmingId === order.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmOrder(order.id);
                            }}
                            className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: themeColor,
                              color: "white",
                            }}
                          >
                            {confirmingId === order.id
                              ? "Confirming..."
                              : "Confirm"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && !isFetching && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="glass-panel rounded-2xl p-6 border border-border/50 space-y-6 sticky top-6">
              <div>
                <h3 className="font-bold text-lg border-b border-border/50 pb-2 mb-4">
                  Order Details
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => {
                    const prodName =
                      products.find(
                        (p) => String(p.id) === String(item.product_id),
                      )?.name || "Unknown";
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-muted/20 p-3 rounded-xl border border-border/30"
                      >
                        <div>
                          <div className="font-semibold text-sm">
                            {prodName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.quantity} x ₹
                            {parseFloat(item.unit_price).toFixed(2)}
                          </div>
                        </div>
                        <div className="font-bold font-mono text-sm">
                          ₹
                          {(
                            parseFloat(item.quantity) *
                            parseFloat(item.unit_price)
                          ).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                  {(!selectedOrder.items ||
                    selectedOrder.items.length === 0) && (
                    <div className="text-sm text-muted-foreground italic text-center p-4">
                      No items added yet.
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span
                    className="text-xl font-black font-mono"
                    style={{ color: themeColor }}
                  >
                    ₹{parseFloat(selectedOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedOrder.status === "draft" && (
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Add Item
                  </h4>
                  <form onSubmit={handleAddItem} className="space-y-3">
                    <CustomSelect
                      required
                      value={newItem.product_id}
                      onChange={(e) =>
                        setNewItem({ ...newItem, product_id: e.target.value })
                      }
                      className="w-full text-sm px-3 py-2 bg-background border border-border/50 rounded-lg"
                    >
                      <option value="">Select product...</option>
                      {products
                        .filter((p) => parseFloat(p.stock_quantity) > 0)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.price})
                          </option>
                        ))}
                    </CustomSelect>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        required
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            quantity: parseInt(e.target.value),
                          })
                        }
                        className="w-20 text-sm px-3 py-2 bg-background border border-border/50 rounded-lg"
                        placeholder="Qty"
                      />
                      <button
                        type="submit"
                        className="flex-1 text-sm font-bold text-white rounded-lg transition-transform hover:scale-[1.02]"
                        style={{ backgroundColor: themeColor }}
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-border/50 text-center flex flex-col items-center justify-center h-full text-muted-foreground min-h-[300px]">
              <Package className="w-12 h-12 mb-4 opacity-20" />
              <p>Select an order to view details and add items.</p>
            </div>
          )}
        </div>
      </div>

      {showAddOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div
              className="p-6 border-b border-border/50"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold">New Sales Order</h2>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Customer
                </label>
                <CustomSelect
                  required
                  value={newOrder.customer_id}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, customer_id: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                >
                  <option value="">Select a customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddOrder(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50"
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
    </div>
  );
}
