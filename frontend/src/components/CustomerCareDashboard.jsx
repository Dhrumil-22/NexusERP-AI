import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  MessageSquarePlus, 
  History, 
  Clock,
  ArrowRight,
  Bot
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

export function CustomerCareDashboard() {
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { themeColor } = useAuth();

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
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative z-10 p-4 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" style={{ color: themeColor }} />
            AI Growth Consultant
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Describe your business challenges, and our AI will recommend the perfect ERP modules to scale your operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Create Request */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-6 relative overflow-hidden group border border-border/50 hover:border-primary/30 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: themeColor }} />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary" style={{ color: themeColor, backgroundColor: `${themeColor}20` }}>
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">New Request</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. I am opening two new cafe branches and need a better way to track daily attendance and multi-location inventory..."
                  className="w-full p-4 pb-12 border border-border/50 bg-background/50 text-foreground rounded-xl focus:ring-2 focus:border-transparent outline-none resize-none min-h-[160px] placeholder:text-muted-foreground/50 transition-all shadow-inner custom-scrollbar text-sm"
                  style={{ '--tw-ring-color': themeColor }}
                />
                
                <div className="absolute bottom-3 right-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="p-2.5 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>

          <div className="glass-panel rounded-2xl p-6 border border-border/50 bg-primary/5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" style={{ color: themeColor }} />
              Tips for better AI advice
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Mention your specific industry</li>
              <li>Describe the bottleneck you're facing</li>
              <li>Include your current scale (e.g. staff count, branches)</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Past Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">Consultation History</h2>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {tickets.length === 0 && !isSubmitting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel rounded-2xl p-12 text-center border border-dashed border-border/50"
                >
                  <Bot className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-bold text-foreground">No consultations yet</h3>
                  <p className="text-muted-foreground mt-1">Submit your first request on the left to get AI-driven growth strategies.</p>
                </motion.div>
              )}

              {tickets.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel rounded-2xl border border-border/50 overflow-hidden hover:border-primary/20 transition-all duration-300"
                >
                  {/* User Request Bubble */}
                  <div className="p-5 bg-background/30 border-b border-border/30">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          You
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground text-sm leading-relaxed">{ticket.message}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(ticket.created_at).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Response Bubble */}
                  {ticket.ai_response && (
                    <div className="p-5 bg-primary/5 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: themeColor }} />
                      <div className="flex items-start gap-4 pl-2">
                        <div className="shrink-0 mt-1">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: themeColor }}>
                            <Bot className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold flex items-center gap-2 mb-2" style={{ color: themeColor }}>
                            Nexus AI Analyst
                          </h4>
                          <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                            {ticket.ai_response}
                          </p>
                          
                          <div className="mt-5 flex justify-end">
                            <button 
                              className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-white shadow-sm"
                              style={{ backgroundColor: themeColor }}
                            >
                              Browse Recommended Modules
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pending State */}
                  {!ticket.ai_response && (
                    <div className="p-5 bg-muted/20 flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                      <p className="text-sm text-muted-foreground italic">AI is analyzing your request...</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
