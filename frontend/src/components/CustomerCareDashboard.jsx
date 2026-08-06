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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Customer Care & Growth Consultant
      </h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Request New Features or Modules</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Is your business growing? Describe what you need, and our AI Consultant will
          suggest the best modules for your ERP!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. I am opening two new branches of my cafe and need to manage more staff..."
            className="w-full p-4 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none min-h-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
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

      <h2 className="text-xl font-semibold mb-4 dark:text-white">Your Past Consultations</h2>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Request:</p>
              <p className="text-gray-800 dark:text-gray-200 font-medium">{ticket.message}</p>
            </div>
            
            {ticket.ai_response && (
              <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 border border-green-100 dark:border-green-800/50">
                <p className="text-sm text-green-800 dark:text-green-400 font-bold mb-2 flex items-center gap-2">
                  <span className="text-xl">✨</span> AI Suggestion
                </p>
                <p className="text-green-900 dark:text-green-300">{ticket.ai_response}</p>
                <button className="mt-4 px-4 py-2 bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 rounded-lg text-sm font-medium hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
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
