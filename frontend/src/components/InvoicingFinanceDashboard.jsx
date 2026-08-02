import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Banknote,
  FileText,
  Plus,
  DollarSign,
  Download,
  CheckCircle,
} from "lucide-react";
import { CustomSelect } from "./CustomSelect";

import { API_BASE } from "../config";

export function InvoicingFinanceDashboard() {
  const {
    token,
    themeColor,
    businessName,
    businessOwnerName,
    businessAddress,
  } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get("tab") === "bill" ? "bill" : "invoice";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Selected Invoice
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  // Payment
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    payment_method: "Credit Card",
  });
  // Email Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [fromEmailInput, setFromEmailInput] = useState("");
  const [isNewEmail, setIsNewEmail] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [invRes, custRes] = await Promise.all([
        axios.get(`${API_BASE}/api/billing/invoices/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios
          .get(`${API_BASE}/api/customers/customers/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] })),
      ]);
      setInvoices(invRes.data);
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

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await axios.post(
        `${API_BASE}/api/billing/payments/`,
        {
          invoice: selectedInvoice.id,
          amount: parseFloat(newPayment.amount),
          payment_method: newPayment.payment_method,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewPayment({ amount: "", payment_method: "Credit Card" });
      setShowAddPayment(false);
      // Refresh
      const updatedInvs = await axios.get(`${API_BASE}/api/billing/invoices/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(updatedInvs.data);
      setSelectedInvoice(
        updatedInvs.data.find((i) => i.id === selectedInvoice.id),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const calculateBalance = (invoice) => {
    const total = parseFloat(invoice.total || 0);
    const paid =
      invoice.payments?.reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
    return Math.max(0, total - paid);
  };
  const handleSendEmail = async () => {
    if (!selectedInvoice) return;
    try {
      await axios.post(
        `${API_BASE}/api/billing/invoices/${selectedInvoice.id}/send_email/`,
        { email: emailInput, from_email: fromEmailInput },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setShowEmailModal(false);
      setStatusMessage({ title: "Success", message: "Email sent successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setStatusMessage({ title: "Error", message: "Failed to send email. Check if customer has an email address.", type: "error" });
    }
  };

  const generatePDF = () => {
    if (!selectedInvoice) return;
    const custName =
      customers.find(
        (c) => String(c.id) === String(selectedInvoice.customer_id),
      )?.name || "Unknown";
    const printIframe = document.createElement("iframe");
    printIframe.style.position = "absolute";
    printIframe.style.top = "-9999px";
    printIframe.style.left = "-9999px";
    printIframe.style.width = "0";
    printIframe.style.height = "0";
    document.body.appendChild(printIframe);
    const linesHtml = (selectedInvoice.lines || [])
      .map(
        (l) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${l.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${parseFloat(l.quantity)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${parseFloat(l.unit_price).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(parseFloat(l.quantity) * parseFloat(l.unit_price)).toFixed(2)}</td>
      </tr>
    `,
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>${selectedInvoice.document_type === "bill" ? "Bill" : "Invoice"} - ${String(selectedInvoice.id).slice(0, 8)}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #333; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: ${themeColor}; margin-bottom: 5px; font-size: 2.5rem; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #eee; padding-bottom: 30px; margin-bottom: 40px; }
            .meta-item { margin-bottom: 8px; font-size: 0.95rem; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; background-color: #f9fafb; padding: 12px; font-weight: 600; color: #555; border-bottom: 2px solid #eee; }
            .totals { width: 300px; margin-left: auto; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1.05rem; }
            .grand-total { font-size: 1.4rem; font-weight: bold; color: ${themeColor}; border-top: 2px solid #eee; padding-top: 15px; margin-top: 10px; }
            .footer { margin-top: 60px; text-align: center; color: #888; font-size: 0.9rem; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div style="margin-bottom: 20px;">
                ${businessName ? `<h2 style="margin: 0; color: #333;">${businessName}</h2>` : ""}
                ${businessOwnerName ? `<div style="color: #666; font-size: 0.95rem;">${businessOwnerName}</div>` : ""}
                ${businessAddress ? `<div style="color: #666; font-size: 0.9rem; max-width: 250px; margin-top: 4px;">${businessAddress.replace(/\n/g, "<br/>")}</div>` : ""}
              </div>
              <h1>${selectedInvoice.document_type === "bill" ? "BILL" : "INVOICE"}</h1>
              <div class="meta-item"><strong>${selectedInvoice.document_type === "bill" ? "Bill" : "Invoice"} #:</strong> ${String(selectedInvoice.id).slice(0, 8).toUpperCase()}</div>
              <div class="meta-item"><strong>Date:</strong> ${new Date(selectedInvoice.created_at).toLocaleDateString('en-GB').replace(/\//g, '-')}</div>
              <div class="meta-item"><strong>Status:</strong> ${selectedInvoice.status.toUpperCase()}</div>
            </div>
            <div style="text-align: right; margin-top: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #666; font-size: 0.9rem; text-transform: uppercase;">Bill To</h3>
              <div style="font-size: 1.4rem; font-weight: bold;">${custName}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${linesHtml || '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#888;">No items</td></tr>'}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-row">
              <span style="color: #666;">Subtotal:</span>
              <span>₹${parseFloat(selectedInvoice.total).toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span style="color: #666;">Amount Paid:</span>
              <span style="color: #16a34a;">-₹${(parseFloat(selectedInvoice.total) - calculateBalance(selectedInvoice)).toFixed(2)}</span>
            </div>
            <div class="totals-row grand-total">
              <span>Balance Due:</span>
              <span>₹${calculateBalance(selectedInvoice).toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            Thank you for your business!
          </div>
          
          <script>
            setTimeout(function(){ window.focus(); window.print(); }, 500);
          </script>
        </body>
      </html>
    `;
    printIframe.contentWindow.document.open();
    printIframe.contentWindow.document.write(html);
    printIframe.contentWindow.document.close();
    
    // Clean up the iframe after printing is done (or cancelled)
    setTimeout(() => {
      document.body.removeChild(printIframe);
    }, 10000); // 10 seconds is usually enough for the print dialog to open and close
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Banknote className="w-8 h-8" style={{ color: themeColor }} />
            Invoices & Finance
          </h1>
          <p className="text-muted-foreground mt-1">
            Track billing, log payments, and manage cash flow.
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border/50 pb-4">
        <button
          onClick={() => {
            setActiveTab("invoice");
            setSelectedInvoice(null);
          }}
          className={`font-bold pb-2 border-b-2 transition-colors ${activeTab === "invoice" ? "text-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}
          style={{
            borderColor: activeTab === "invoice" ? themeColor : "transparent",
          }}
        >
          Invoices
        </button>
        <button
          onClick={() => {
            setActiveTab("bill");
            setSelectedInvoice(null);
          }}
          className={`font-bold pb-2 border-b-2 transition-colors ${activeTab === "bill" ? "text-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}
          style={{
            borderColor: activeTab === "bill" ? themeColor : "transparent",
          }}
        >
          Bills
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    {activeTab === "bill" ? "Bill ID" : "Invoice ID"}
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
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {invoices
                  .filter((i) => (i.document_type || "invoice") === activeTab)
                  .map((invoice) => {
                    const custName =
                      customers.find(
                        (c) => String(c.id) === String(invoice.customer_id),
                      )?.name || "Unknown";
                    const balance = calculateBalance(invoice);
                    return (
                      <tr
                        key={invoice.id}
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedInvoice?.id === invoice.id ? "bg-muted/50" : ""}`}
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <td className="px-4 py-4 font-mono text-xs flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          #{String(invoice.id).slice(0, 8)}
                        </td>
                        <td className="px-4 py-4 font-medium">{custName}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                              invoice.status === "paid"
                                ? "bg-green-500/20 text-green-600"
                                : invoice.status === "overdue"
                                  ? "bg-red-500/20 text-red-600"
                                  : "bg-blue-500/20 text-blue-600"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold">
                          ₹{parseFloat(invoice.total).toFixed(2)}
                        </td>
                        <td
                          className="px-4 py-4 text-right font-mono font-bold"
                          style={{ color: balance > 0 ? "#ef4444" : "#22c55e" }}
                        >
                          ₹{balance.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                {invoices.filter(
                  (i) => (i.document_type || "invoice") === activeTab,
                ).length === 0 &&
                  !isFetching && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No {activeTab}s generated yet.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedInvoice ? (
            <div className="glass-panel rounded-2xl p-6 border border-border/50 space-y-6 sticky top-6">
              <div className="flex justify-between items-start border-b border-border/50 pb-4">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    {selectedInvoice.document_type === "bill"
                      ? "Bill"
                      : "Invoice"}{" "}
                    <span className="font-mono text-muted-foreground text-sm">
                      #{String(selectedInvoice.id).slice(0, 8)}
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {customers.find(
                      (c) =>
                        String(c.id) === String(selectedInvoice.customer_id),
                    )?.name || "Unknown Customer"}
                  </p>
                </div>
                {selectedInvoice.status === "paid" && (
                  <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Line Items
                </h4>
                {selectedInvoice.lines?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm py-1 border-b border-border/20 last:border-0"
                  >
                    <div>
                      <span className="font-medium">{item.description}</span>
                      <span className="text-muted-foreground ml-2">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="font-mono">
                      ₹
                      {(
                        parseFloat(item.quantity) * parseFloat(item.unit_price)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-muted/20 p-4 rounded-xl border border-border/50 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">
                    ₹{parseFloat(selectedInvoice.total).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-mono text-green-600">
                    -₹
                    {(
                      parseFloat(selectedInvoice.total) -
                      calculateBalance(selectedInvoice)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-border/50 flex justify-between items-center font-bold">
                  <span>Amount Due</span>
                  <span
                    className="font-mono text-lg"
                    style={{
                      color:
                        calculateBalance(selectedInvoice) > 0
                          ? "#ef4444"
                          : themeColor,
                    }}
                  >
                    ₹{calculateBalance(selectedInvoice).toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedInvoice.payments &&
                selectedInvoice.payments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Payment History
                    </h4>
                    {selectedInvoice.payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground text-xs">
                            {new Date(p.created_at).toLocaleDateString('en-GB').replace(/\//g, '-')}
                          </span>
                          <span className="font-medium">
                            {p.payment_method}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-green-600">
                          +₹{parseFloat(p.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              {calculateBalance(selectedInvoice) > 0 && (
                <button
                  onClick={() => setShowAddPayment(true)}
                  className="w-full py-3 rounded-xl text-white font-bold transition-transform hover:scale-[1.02] shadow flex items-center justify-center gap-2"
                  style={{ backgroundColor: themeColor }}
                >
                  <Plus className="w-4 h-4" /> Add Payment
                </button>
              )}

              <button
                onClick={generatePDF}
                className="w-full py-3 rounded-xl font-bold transition-transform hover:scale-[1.02] border-2 flex items-center justify-center gap-2"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                <Download className="w-4 h-4" /> Generate PDF
              </button>
              
              <button
                onClick={() => {
                  const cust = customers.find((c) => String(c.id) === String(selectedInvoice.customer_id));
                  setEmailInput(cust?.email || "");
                  setIsNewEmail(!cust?.email);
                  setFromEmailInput("");
                  setShowEmailModal(true);
                }}
                className="w-full py-3 mt-3 rounded-xl border border-border/50 bg-muted/20 font-bold transition-colors hover:bg-muted/40 flex items-center justify-center gap-2"
              >
                Send Email Receipt
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-border/50 text-center flex flex-col items-center justify-center h-full text-muted-foreground min-h-[400px]">
              <Banknote className="w-12 h-12 mb-4 opacity-20" />
              <p>
                Select a {activeTab === "bill" ? "bill" : "invoice"} to view
                line items and record payments.
              </p>
            </div>
          )}
        </div>
      </div>

      {showAddPayment && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div
              className="p-6 border-b border-border/50"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Record Payment
              </h2>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={calculateBalance(selectedInvoice)}
                  required
                  value={newPayment.amount}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                  placeholder={`Max: ₹${calculateBalance(selectedInvoice).toFixed(2)}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Payment Method
                </label>
                <CustomSelect
                  required
                  value={newPayment.payment_method}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      payment_method: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                </CustomSelect>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: "#22c55e" }}
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div
              className="p-6 border-b border-border/50"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5" /> Enter Email
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  From Email (Sender)
                </label>
                <input
                  type="email"
                  value={fromEmailInput}
                  onChange={(e) => setFromEmailInput(e.target.value)}
                  placeholder="Optional: Enter sender email"
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  To Email (Recipient)
                </label>
                <div className="flex gap-2 items-center">
                  {isNewEmail ? (
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter new email"
                      className="flex-1 px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                    />
                  ) : (
                    <CustomSelect
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none"
                    >
                      <option value="">Select an email...</option>
                      {Array.from(new Set(customers.map(c => c.email).filter(Boolean))).map(email => (
                        <option key={email} value={email}>{email}</option>
                      ))}
                    </CustomSelect>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewEmail(!isNewEmail);
                      setEmailInput("");
                    }}
                    className="p-2 border border-border/50 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                    title={isNewEmail ? "Select existing email" : "Enter new email"}
                  >
                    <Plus className={`w-5 h-5 ${isNewEmail ? 'rotate-45 transition-transform' : ''}`} />
                  </button>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: themeColor }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden text-center p-8">
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#22c55e" }} />
            ) : (
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-4 border-red-500 text-red-500">
                <span className="font-bold text-2xl">!</span>
              </div>
            )}
            <h2 className="text-xl font-bold mb-2">{statusMessage.title}</h2>
            <p className="text-muted-foreground mb-6">{statusMessage.message}</p>
            <button
              onClick={() => setStatusMessage(null)}
              className="w-full py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: statusMessage.type === "success" ? "#22c55e" : "#ef4444" }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
