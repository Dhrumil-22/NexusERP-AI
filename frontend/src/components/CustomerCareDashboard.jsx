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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Customer Care & Growth Consultant
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold mb-4">Request New Features or Modules</h2>
        <p className="text-gray-600 mb-4">
          Is your business growing? Describe what you need, and our AI Consultant will
          suggest the best modules for your ERP!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. I am opening two new branches of my cafe and need to manage more staff..."
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none min-h-[120px]"
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

      <h2 className="text-xl font-semibold mb-4">Your Past Consultations</h2>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Your Request:</p>
              <p className="text-gray-800 font-medium">{ticket.message}</p>
            </div>
            
            {ticket.ai_response && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-sm text-green-800 font-bold mb-2 flex items-center gap-2">
                  <span className="text-xl">✨</span> AI Suggestion
                </p>
                <p className="text-green-900">{ticket.ai_response}</p>
                <button className="mt-4 px-4 py-2 bg-white text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
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
