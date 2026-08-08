import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Coffee, Plus, ChevronRight, User, Trash2, Send } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

import { API_BASE } from "../config";

export function TableOrderDashboard() {
  const { token, themeColor, showStatus, activeCustomers, deselectCustomer } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTable, setActiveTable] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTable, setNewTable] = useState({ table_number: "", capacity: 4 });

  const [showOpenTableModal, setShowOpenTableModal] = useState(false);
  const [newOrderCustomerId, setNewOrderCustomerId] = useState("");

  const [showAddItem, setShowAddItem] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [newItem, setNewItem] = useState({ product_id: "", quantity: 1 });
  const [isFetching, setIsFetching] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [tRes, oRes, pRes, cRes] = await Promise.all([
        axios
          .get(`${API_BASE}/api/tables/tables/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] })),
        axios
          .get(`${API_BASE}/api/tables/orders/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] })),
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
      setTables(tRes.data);
      setOrders(oRes.data);
      setProducts(pRes.data);
      setCustomers(cRes.data);
      setActiveTable((prev) => {
        if (!prev) return null;
        return tRes.data.find((t) => t.id === prev.id) || null;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleOpenTableSubmit = async (e) => {
    e.preventDefault();
    if (!activeTable || !newOrderCustomerId) return;
    try {
      await axios.post(
        `${API_BASE}/api/tables/orders/`,
        {
          table: activeTable.id,
          status: "open",
          customer_id: newOrderCustomerId,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowOpenTableModal(false);
      setNewOrderCustomerId("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayOrder = async (orderId) => {
    if (isPaying) return;
    setIsPaying(true);
    try {
      // Find the order to get customer_id before paying
      const orderToPay = orders.find(o => String(o.id) === String(orderId));
      await axios.post(
        `${API_BASE}/api/tables/orders/${orderId}/pay/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Remove customer from active queue after payment
      if (orderToPay?.customer_id) {
        deselectCustomer(orderToPay.customer_id);
      }
      setActiveTable(null);
      navigate("/module/invoicing_finance?tab=bill");
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.error || err.message || "Failed to collect payment or order already paid.";
      showStatus("Error", backendError, "error");
    } finally {
      setIsPaying(false);
    }
  };

  const handleOpenAddItem = (orderId) => {
    setActiveOrderId(orderId);
    setNewItem({ product_id: "", quantity: 1 });
    setShowAddItem(true);
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (!activeOrderId) return;
    try {
      await axios.post(
        `${API_BASE}/api/tables/orders/${activeOrderId}/add_item/`,
        {
          product_id: newItem.product_id,
          quantity: newItem.quantity,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowAddItem(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showStatus("Error", "Failed to add item", "error");
    }
  };

  const handleDeleteItem = async (orderId, itemId) => {
    try {
      await axios.delete(
        `${API_BASE}/api/tables/orders/${orderId}/remove_item/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { item_id: itemId },
        },
      );
      fetchData();
    } catch (err) {
      console.error(err);
      showStatus("Error", "Failed to delete item", "error");
    }
  };

  const handleSendToKitchen = async (orderId) => {
    try {
      await axios.post(
        `${API_BASE}/api/tables/orders/${orderId}/send_to_kitchen/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err) {
      console.error(err);
      showStatus("Error", "Failed to send to kitchen", "error");
    }
  };

  const handleCloseEmptyTable = async (orderId) => {
    try {
      await axios.post(
        `${API_BASE}/api/tables/orders/${orderId}/close_empty/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setActiveTable(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showStatus("Error", "Failed to close table.", "error");
    }
  };

  const handleChangeCustomer = async (orderId, customerId) => {
    if (!customerId) return;
    try {
      await axios.post(
        `${API_BASE}/api/tables/orders/${orderId}/change_customer/`,
        { customer_id: customerId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err) {
      console.error(err);
      showStatus("Error", "Failed to change customer.", "error");
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/tables/tables/`, newTable, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddTable(false);
      setNewTable({ table_number: "", capacity: 4 });
      fetchData();
    } catch (err) {
      console.error(err);
      showStatus("Error", "Failed to add table", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-4 sm:p-8 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Coffee className="w-8 h-8" style={{ color: themeColor }} />
            Table Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage cafe seating, front-of-house orders, and bill payments.
          </p>
        </div>
        <button
          onClick={() => setShowAddTable(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-transform hover:scale-[1.02] shadow-lg"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-5 h-5" /> Add Table
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 h-full min-h-[500px]">
        {/* Floor Plan */}
        <div className="flex-1 glass-panel rounded-2xl p-6 border border-border/50">
          <h2 className="text-xl font-bold mb-6">Floor Plan</h2>

          {isFetching ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center p-12 bg-muted/20 rounded-xl">
              <p className="text-muted-foreground">No tables configured.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setActiveTable(table)}
                  className={`relative p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center aspect-square
                    ${activeTable?.id === table.id ? "border-primary shadow-lg scale-105" : "border-border/50 hover:border-primary/50"}
                    ${table.is_occupied ? "bg-primary/5" : "bg-muted/10"}
                  `}
                  style={
                    activeTable?.id === table.id
                      ? { borderColor: themeColor }
                      : {}
                  }
                >
                  <span className="text-3xl font-black">
                    {table.table_number}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase font-bold mt-2 flex items-center gap-1">
                    <User className="w-3 h-3" /> {table.capacity}
                  </span>

                  {table.is_occupied && (
                    <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Panel */}
        <div className="w-full lg:w-96 shrink-0 glass-panel rounded-2xl p-6 border border-border/50 flex flex-col">
          {activeTable ? (
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-black mb-1">
                Table {activeTable.table_number}
              </h2>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                {activeTable.is_occupied ? (
                  <span className="text-red-500">Occupied</span>
                ) : (
                  <span className="text-emerald-500">Available</span>
                )}
              </div>

              {!activeTable.is_occupied ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  {products.length === 0 ? (
                    <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-sm">
                      <p className="text-red-500 font-bold mb-2">
                        No Products in Inventory
                      </p>
                      <p className="text-sm text-red-500/80">
                        You must add items to your inventory before you can open
                        a table and take orders.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowOpenTableModal(true)}
                      className="flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold transition-transform hover:scale-105 shadow-xl"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Plus className="w-5 h-5" /> Open New Table
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Find active order */}
                  {(() => {
                    const activeOrder = orders.find(
                      (o) => o.table === activeTable.id && o.status !== "paid",
                    );
                    if (!activeOrder)
                      return (
                        <div className="text-center italic">
                          Loading order...
                        </div>
                      );
                    return (
                      <>
                        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                          {activeOrder.items.length === 0 ? (
                            <div className="flex flex-col gap-4 p-6 border border-dashed border-border/50 rounded-xl text-sm">
                              <p className="text-center text-muted-foreground mb-2">
                                Order is empty
                              </p>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">
                                  Change Customer
                                </label>
                                <CustomSelect
                                  value={activeOrder.customer_id || ""}
                                  onChange={(e) =>
                                    handleChangeCustomer(
                                      activeOrder.id,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full text-sm px-3 py-2 bg-background border border-border/50 rounded-lg"
                                >
                                  <option value="">Select customer...</option>
                                  {activeCustomers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name || `${c.first_name} ${c.last_name}`}
                                    </option>
                                  ))}
                                </CustomSelect>
                              </div>

                              <button
                                onClick={() =>
                                  handleCloseEmptyTable(activeOrder.id)
                                }
                                className="w-full py-2 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-colors mt-2"
                              >
                                Close Empty Table
                              </button>
                            </div>
                          ) : (
                            activeOrder.items.map((item) => (
                              <div
                                key={item.id}
                                className="p-3 bg-muted/20 border border-border/50 rounded-lg flex justify-between items-center group"
                              >
                                <div>
                                  <div className="font-bold">
                                    {products.find(p => String(p.id) === String(item.product_id))?.name || item.product_id}
                                  </div>
                                  <div className="text-xs text-muted-foreground uppercase">
                                    {item.status}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="font-bold font-mono">
                                    x{item.quantity}
                                  </div>
                                  {item.status === "pending" && (
                                    <button
                                      onClick={() =>
                                        handleDeleteItem(
                                          activeOrder.id,
                                          item.id,
                                        )
                                      }
                                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="space-y-3 shrink-0">
                          {activeOrder.items.some(
                            (i) => i.status === "pending",
                          ) && (
                            <button
                              onClick={() =>
                                handleSendToKitchen(activeOrder.id)
                              }
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-500 text-white font-bold transition-transform hover:scale-[1.02] shadow-lg"
                            >
                              <Send className="w-4 h-4" /> Send to Kitchen
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenAddItem(activeOrder.id)}
                            disabled={products.length === 0}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-bold transition-colors ${
                              products.length === 0
                                ? "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
                                : "border-dashed hover:bg-muted/50 text-foreground"
                            }`}
                          >
                            <Plus className="w-4 h-4" /> Add Item
                          </button>

                          <button
                            onClick={() => handlePayOrder(activeOrder.id)}
                            disabled={
                              isPaying ||
                              activeOrder.items.length === 0 ||
                              activeOrder.items.some((i) =>
                                ["pending", "preparing"].includes(i.status),
                              )
                            }
                            className={`w-full flex items-center justify-between gap-2 px-6 py-4 rounded-xl font-bold transition-transform shadow-lg ${
                              isPaying ||
                              activeOrder.items.length === 0 ||
                              activeOrder.items.some((i) =>
                                ["pending", "preparing"].includes(i.status),
                              )
                                ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                : "text-white hover:scale-[1.02]"
                            }`}
                            style={
                              isPaying ||
                              activeOrder.items.length === 0 ||
                              activeOrder.items.some((i) =>
                                ["pending", "preparing"].includes(i.status),
                              )
                                ? {}
                                : { backgroundColor: themeColor }
                            }
                          >
                            <span>
                              {isPaying ? "Processing..." : "Collect Payment"}
                            </span>
                            {!isPaying && <ChevronRight className="w-5 h-5" />}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center">
              <Coffee className="w-12 h-12 opacity-20 mb-4" />
              <p className="font-medium text-lg">No Table Selected</p>
              <p className="text-sm">
                Click a table on the floor plan to view or start its order.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50">
            <div
              className="p-6 border-b border-border/50 flex justify-between items-center rounded-t-2xl"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" style={{ color: themeColor }} /> Add
                Table
              </h2>
            </div>

            <form onSubmit={handleAddTable} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Table Number / Name
                </label>
                <input
                  type="text"
                  required
                  value={newTable.table_number}
                  onChange={(e) =>
                    setNewTable({ ...newTable, table_number: e.target.value })
                  }
                  placeholder="e.g. 1, 2, VIP, Patio-A"
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newTable.capacity}
                  onChange={(e) =>
                    setNewTable({
                      ...newTable,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTable(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: themeColor }}
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50">
            <div
              className="p-6 border-b border-border/50 flex justify-between items-center rounded-t-2xl"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" style={{ color: themeColor }} /> Add
                Item to Order
              </h2>
            </div>

            <form onSubmit={handleAddItemSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Select Product
                </label>
                <CustomSelect
                  required
                  value={newItem.product_id}
                  onChange={(e) =>
                    setNewItem({ ...newItem, product_id: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a product...</option>
                  {products
                    .filter((p) => parseFloat(p.stock_quantity) > 0)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{Number(p.price).toFixed(2)}) - Stock: {p.stock_quantity}
                      </option>
                    ))}
                </CustomSelect>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Quantity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={products.find((p) => String(p.id) === String(newItem.product_id))?.stock_quantity || ""}
                  value={newItem.quantity}
                  onChange={(e) => {
                    const maxStock = products.find((p) => String(p.id) === String(newItem.product_id))?.stock_quantity;
                    let val = parseInt(e.target.value);
                    if (maxStock !== undefined && val > maxStock) val = maxStock;
                    setNewItem({
                      ...newItem,
                      quantity: val || "",
                    });
                  }}
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !newItem.product_id ||
                    newItem.quantity >
                      parseFloat(
                        products.find((p) => String(p.id) === String(newItem.product_id))
                          ?.stock_quantity || 0,
                      )
                  }
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: themeColor }}
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Open Table Modal */}
      {showOpenTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border/50">
            <div
              className="p-6 border-b border-border/50 flex justify-between items-center rounded-t-2xl"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" style={{ color: themeColor }} /> Open
                Table
              </h2>
            </div>

            <form onSubmit={handleOpenTableSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Select Customer
                </label>
                {activeCustomers.length === 0 ? (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-center">
                    <p className="text-sm font-bold text-orange-600">No customers selected</p>
                    <p className="text-xs text-orange-500/80 mt-1">Go to Customer Module first, select or add a customer, then come back here.</p>
                  </div>
                ) : (
                  <CustomSelect
                    required
                    value={newOrderCustomerId}
                    onChange={(e) => setNewOrderCustomerId(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-muted/30 border border-border/50 rounded-lg"
                  >
                    <option value="">Select customer...</option>
                    {activeCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || `${c.first_name} ${c.last_name}`}
                      </option>
                    ))}
                  </CustomSelect>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOpenTableModal(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newOrderCustomerId}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ backgroundColor: themeColor }}
                >
                  Start Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

