import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Receipt,
  PlusCircle,
  CreditCard,
  DollarSign,
  X,
  CheckCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { CustomSelect } from "./CustomSelect";

import { API_BASE } from "../config";

export function BillingDashboard() {
  const { token, themeColor , showStatus } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(`${API_BASE}/api/billing/invoices/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(res.data);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchInvoices();
  }, [token]);

  const unpaidCount = invoices.filter((i) => i.status === "Unpaid").length;
  const totalRevenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((acc, i) => acc + parseFloat(i.total), 0);
  const pendingRevenue = invoices
    .filter((i) => i.status === "Unpaid")
    .reduce((acc, i) => acc + parseFloat(i.total), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Billing & Invoicing
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate invoices, collect payments, and manage cash flow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <PlusCircle className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Unpaid Invoices"
          value={unpaidCount}
          icon={<AlertCircle />}
          themeColor="#f59e0b"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toFixed(2)}`}
          icon={<DollarSign />}
          themeColor="#10b981"
        />
        <StatCard
          title="Pending Receivables"
          value={`₹${pendingRevenue.toFixed(2)}`}
          icon={<Receipt />}
          themeColor="#3b82f6"
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
          <h3 className="font-bold tracking-tight text-xl">Recent Invoices</h3>
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
                    Invoice #
                  </th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No invoices generated yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-4 py-4 font-bold text-foreground">
                        {inv.invoice_number || inv.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-4">
                        {inv.customer_details
                          ? `${inv.customer_details.first_name} ${inv.customer_details.last_name}`
                          : "Walk-in Customer"}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString('en-GB').replace(/\//g, '-')}
                      </td>
                      <td className="px-4 py-4 text-right font-bold">
                        ₹{parseFloat(inv.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            inv.status === "Paid"
                              ? "bg-green-500/10 text-green-600"
                              : inv.status === "Unpaid"
                                ? "bg-yellow-500/10 text-yellow-600"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                        {inv.status === "Unpaid" && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsPaymentModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay
                          </button>
                        )}
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors">
                          View
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

      {isInvoiceModalOpen && (
        <InvoiceModal
          onClose={() => setIsInvoiceModalOpen(false)}
          onSuccess={() => {
            setIsInvoiceModalOpen(false);
            fetchInvoices();
          }}
        />
      )}

      {isPaymentModalOpen && selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            fetchInvoices();
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

function InvoiceModal({ onClose, onSuccess }) {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer: "",
    invoice_number: `INV-${Math.floor(Math.random() * 10000)}`,
    tax_rate: 0,
    discount: 0,
    lines: [{ product: "", description: "", quantity: 1, unit_price: 0 }],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          axios
            .get(`${API_BASE}/api/crm/customers/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: [] })),
          axios
            .get(`${API_BASE}/api/inventory/products/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: [] })),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {}
    };
    if (token) fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        customer: formData.customer || null,
        lines: formData.lines.map((l) => ({
          ...l,
          product: l.product || null,
        })),
      };
      await axios.post(`${API_BASE}/api/billing/invoices/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      showStatus("Error", "Failed to create invoice", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    if (field === "product") {
      const prod = products.find((p) => String(p.id) === String(value));
      if (prod) {
        newLines[index].description = prod.name;
        newLines[index].unit_price = prod.price;
      }
    }
    setFormData({ ...formData, lines: newLines });
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        { product: "", description: "", quantity: 1, unit_price: 0 },
      ],
    });
  };

  // Calculations
  const subtotal = formData.lines.reduce(
    (acc, l) => acc + Number(l.quantity) * Number(l.unit_price),
    0,
  );
  const tax =
    (subtotal - Number(formData.discount)) * (Number(formData.tax_rate) / 100);
  const total = subtotal - Number(formData.discount) + tax;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="glass-panel w-full max-w-3xl rounded-2xl flex flex-col shadow-2xl relative animate-slide-up max-h-[90vh]">
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-background/50 backdrop-blur-md rounded-t-2xl">
          <h2 className="text-xl font-bold">Generate Invoice</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Customer</label>
              <CustomSelect
                value={formData.customer}
                onChange={(e) =>
                  setFormData({ ...formData, customer: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2 bg-transparent"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </CustomSelect>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Invoice Number</label>
              <input
                type="text"
                value={formData.invoice_number}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_number: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-lg">Line Items</h3>
            {formData.lines.map((line, i) => (
              <div
                key={i}
                className="flex gap-3 items-start bg-muted/20 p-3 rounded-xl border border-border/50"
              >
                <div className="flex-1 space-y-1.5">
                  <CustomSelect
                    value={line.product}
                    onChange={(e) =>
                      handleLineChange(i, "product", e.target.value)
                    }
                    className="w-full glass-input rounded-xl px-3 py-2 bg-transparent text-sm"
                  >
                    <option value="">Select Product...</option>
                    {products
                      .filter((p) => parseFloat(p.stock_quantity) > 0)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </CustomSelect>
                  <input
                    type="text"
                    placeholder="Description"
                    value={line.description}
                    onChange={(e) =>
                      handleLineChange(i, "description", e.target.value)
                    }
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div className="w-24 space-y-1.5">
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) =>
                      handleLineChange(i, "quantity", e.target.value)
                    }
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                    placeholder="Qty"
                  />
                </div>
                <div className="w-32 space-y-1.5">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unit_price}
                    onChange={(e) =>
                      handleLineChange(i, "unit_price", e.target.value)
                    }
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                    placeholder="Price"
                  />
                </div>
                <div className="w-24 pt-2 text-right font-bold text-sm">
                  ₹
                  {(Number(line.quantity) * Number(line.unit_price)).toFixed(2)}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addLine}
              className="text-xs font-bold text-primary hover:underline"
            >
              + Add Line Item
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount: Number(e.target.value),
                    })
                  }
                  className="w-full glass-input rounded-xl px-4 py-2"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tax_rate: Number(e.target.value),
                    })
                  }
                  className="w-full glass-input rounded-xl px-4 py-2"
                />
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-2xl flex flex-col justify-end space-y-2 text-right">
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Discount:</span>{" "}
                <span>-₹{Number(formData.discount).toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Tax:</span> <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-border/50 pt-2 text-xl font-bold flex justify-between mt-2">
                <span>Total:</span>{" "}
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border/50 bg-background/50 backdrop-blur-md rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-xl text-sm font-bold btn-primary text-white shadow-md"
          >
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ invoice, onClose, onSuccess }) {
  const { token } = useAuth();
  const [amount, setAmount] = useState(invoice.total);
  const [mode, setMode] = useState("Card");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/billing/invoices/${invoice.id}/record_payment/`,
        { amount, mode },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      showStatus("Error", "Failed to record payment", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-slide-up">
        <h2 className="text-xl font-bold mb-2">Record Payment</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Invoice:{" "}
          <strong>
            {invoice.invoice_number || invoice.id.substring(0, 8)}
          </strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Payment Mode</label>
            <CustomSelect
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2 bg-transparent"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </CustomSelect>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Amount Received</label>
            <input
              required
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2 text-xl font-bold text-primary"
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
              className="px-6 py-2 rounded-xl text-sm font-bold bg-green-500 hover:bg-green-600 text-white shadow-md flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
