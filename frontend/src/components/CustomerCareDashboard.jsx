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
  Bot,
  Headset
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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-4 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Headset className="w-8 h-8" style={{ color: themeColor }} />
            Customer Care
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Describe your business challenges, and our AI will recommend the perfect ERP modules to scale your operations.
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-8">
        
        {/* Top Section: Create Request */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-6 relative overflow-hidden group border border-border/50 hover:border-primary/30 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: themeColor }} />
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary" style={{ color: themeColor, backgroundColor: `${themeColor}20` }}>
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">What do you need?</h2>
                  <p className="text-muted-foreground mt-0.5 text-sm">Describe your bottleneck or scale, and AI will suggest the best ERP modules.</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border/50">
                <Sparkles className="w-3.5 h-3.5 text-primary" style={{ color: themeColor }} />
                <span>Tip: Mention your industry & current staff count</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. I am opening two new cafe branches and need a better way to track daily attendance and multi-location inventory..."
                  className="w-full p-4 pb-16 border border-border/50 bg-background/50 text-foreground rounded-2xl focus:ring-2 focus:border-transparent outline-none resize-none min-h-[120px] placeholder:text-muted-foreground/50 transition-all shadow-inner custom-scrollbar text-sm leading-relaxed"
                  style={{ '--tw-ring-color': themeColor }}
                />
                
                <div className="absolute bottom-3 right-3 flex items-center gap-3">
                  <span className={`text-xs font-medium ${message.length > 0 ? 'text-primary' : 'text-muted-foreground/50'}`} style={{ color: message.length > 0 ? themeColor : undefined }}>
                    {message.length > 0 ? "Ready to analyze" : "Start typing..."}
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="px-5 py-2.5 rounded-lg text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg gap-2"
                    style={{ backgroundColor: themeColor }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                        Consulting AI...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Bottom Section: Past Requests */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">Consultation History</h2>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {tickets.length === 0 && !isSubmitting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel rounded-2xl p-10 text-center border border-dashed border-border/50"
                >
                  <Bot className="w-10 h-10 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-base font-bold text-foreground">No consultations yet</h3>
                  <p className="text-muted-foreground mt-1 text-sm">Submit your first request on the left to get AI-driven growth strategies.</p>
                </motion.div>
              )}

              {tickets.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel rounded-2xl border border-border/50 overflow-hidden hover:border-primary/20 transition-all duration-300 shadow-sm"
                >
                  {/* User Request Bubble */}
                  <div className="p-4 md:p-5 bg-background/30 border-b border-border/30">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-0.5">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          You
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground text-sm leading-relaxed">{ticket.message}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
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
                    <div className="p-4 md:p-5 bg-primary/5 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: themeColor }} />
                      <div className="flex items-start gap-4 pl-1">
                        <div className="shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: themeColor }}>
                            <Bot className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold flex items-center gap-1.5 mb-2" style={{ color: themeColor }}>
                            Nexus AI Analyst
                          </h4>
                          <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                            {ticket.ai_response}
                          </p>
                          
                          <div className="mt-4 flex justify-end">
                            <button 
                              className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 text-white shadow-sm"
                              style={{ backgroundColor: themeColor }}
                            >
                              Browse Recommended Modules
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pending State */}
                  {!ticket.ai_response && (
                    <div className="p-4 md:p-5 bg-muted/20 flex items-center gap-3">
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
