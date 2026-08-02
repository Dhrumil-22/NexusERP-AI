import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { UtensilsCrossed, ChefHat, CheckCircle2, Clock } from "lucide-react";

import { API_BASE } from "../config";

export function KitchenKOTDashboard() {
  const { token, themeColor } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(`${API_BASE}/api/kot/tickets/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
    const interval = setInterval(() => {
      if (token) fetchData();
    }, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [token]);

  const handleBump = async (ticketId) => {
    try {
      await axios.post(
        `${API_BASE}/api/kot/tickets/${ticketId}/bump_status/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    if (status === "pending")
      return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    if (status === "preparing")
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  };

  const activeTickets = tickets.filter((t) => t.status !== "ready");

  return (
    <div className="max-w-full mx-auto space-y-8 animate-fade-in relative z-10 p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <ChefHat className="w-8 h-8" style={{ color: themeColor }} />
            Kitchen Display
          </h1>
          <p className="text-muted-foreground mt-1">
            Live incoming Kitchen Order Tickets (KOT).
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-h-[500px]">
          {activeTickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground glass-panel rounded-2xl border border-dashed border-border/50">
              <UtensilsCrossed className="w-16 h-16 opacity-20 mb-4" />
              <h3 className="text-2xl font-bold">Kitchen is clear!</h3>
              <p>Waiting for new orders...</p>
            </div>
          ) : (
            activeTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="w-80 shrink-0 flex flex-col glass-panel rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Ticket Header */}
                <div
                  className={`p-4 border-b ${getStatusColor(ticket.status)}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold uppercase tracking-wider text-xs">
                      Table {ticket.table_number}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-black">
                    KOT {ticket.id.split("-")[0].toUpperCase()}
                  </h3>
                </div>

                {/* Ticket Items */}
                <div className="flex-1 p-4 overflow-y-auto bg-background/50">
                  <ul className="space-y-4">
                    {ticket.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between items-start gap-2 border-b border-border/50 pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <span className="font-bold text-lg">
                            {item.product_id}
                          </span>
                          {item.notes && (
                            <div className="text-sm text-red-500 font-medium italic">
                              ** {item.notes} **
                            </div>
                          )}
                        </div>
                        <span className="font-black text-xl font-mono shrink-0 px-2 bg-muted rounded">
                          x{item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ticket Actions */}
                <div className="p-4 bg-muted/20 border-t border-border/50 shrink-0">
                  <button
                    onClick={() => handleBump(ticket.id)}
                    className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider text-white transition-transform hover:scale-[1.02] active:scale-95 shadow-md flex justify-center items-center gap-2"
                    style={{
                      backgroundColor:
                        ticket.status === "pending" ? "#3b82f6" : "#10b981",
                    }}
                  >
                    {ticket.status === "pending" ? (
                      "Start Preparing"
                    ) : (
                      <>
                        Bump to Ready <CheckCircle2 className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
