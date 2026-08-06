import React, { useState, useEffect } from "react";
import axios from "axios";

import { API_BASE } from "../config";

export function CustomerCareDashboard() {
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/growth_consultation/requests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/growth_consultation/requests/`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("");
      fetchTickets();
    } catch (err) {
      console.error("Error creating ticket", err);
      if (err.response && err.response.data && err.response.data.error) {
          alert("Backend Error: " + err.response.data.error);
      } else {
          alert("Failed to submit ticket. " + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-6">
        Customer Care & Growth Consultant
      </h1>

      <div className="glass-panel rounded-2xl overflow-hidden border border-transparent p-6 mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Request New Features or Modules</h2>
        <p className="text-muted-foreground mb-4">
          Is your business growing? Describe what you need, and our AI Consultant will
          suggest the best modules for your ERP!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. I am opening two new branches of my cafe and need to manage more staff..."
            className="w-full p-4 border border-border/50 bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none min-h-[120px] placeholder:text-muted-foreground/50 transition-colors"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Consulting AI..." : "Submit Ticket"}
          </button>
        </form>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-4">Your Past Consultations</h2>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="glass-panel p-6 rounded-2xl border border-border/50 transition-all hover:border-primary/20">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Your Request:</p>
              <p className="text-foreground font-medium">{ticket.message}</p>
            </div>
            
            {ticket.ai_response && (
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 mt-4">
                <p className="text-sm text-primary font-bold mb-2 flex items-center gap-2">
                  <span className="text-xl">✨</span> AI Suggestion
                </p>
                <p className="text-foreground/90">{ticket.ai_response}</p>
                <button className="mt-4 px-4 py-2 bg-background text-primary border border-primary/20 rounded-lg text-sm font-bold hover:bg-primary/10 transition-colors">
                  Upgrade My ERP
                </button>
              </div>
            )}
          </div>
        ))}
        {tickets.length === 0 && (
          <p className="text-gray-500 italic">No tickets raised yet.</p>
        )}
      </div>
    </div>
  );
}
