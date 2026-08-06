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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-4 md:p-8 xl:p-12">
      
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

      <div className="flex flex-col space-y-12">
        
        {/* Top Section: Create Request */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden group border border-border/50 hover:border-primary/30 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: themeColor }} />
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-primary/10 text-primary" style={{ color: themeColor, backgroundColor: `${themeColor}20` }}>
                  <MessageSquarePlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">What do you need?</h2>
                  <p className="text-muted-foreground mt-1">Describe your bottleneck or scale, and AI will suggest the best ERP modules.</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-4 py-2.5 rounded-full border border-border/50">
                <Sparkles className="w-4 h-4 text-primary" style={{ color: themeColor }} />
                <span>Tip: Mention your industry & current staff count</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. I am opening two new cafe branches and need a better way to track daily attendance and multi-location inventory..."
                  className="w-full p-6 pb-20 border border-border/50 bg-background/50 text-foreground rounded-3xl focus:ring-2 focus:border-transparent outline-none resize-none min-h-[180px] placeholder:text-muted-foreground/50 transition-all shadow-inner custom-scrollbar text-lg leading-relaxed"
                  style={{ '--tw-ring-color': themeColor }}
                />
                
                <div className="absolute bottom-5 right-5 flex items-center gap-4">
                  <span className={`text-sm font-medium ${message.length > 0 ? 'text-primary' : 'text-muted-foreground/50'}`} style={{ color: message.length > 0 ? themeColor : undefined }}>
                    {message.length > 0 ? "Ready to analyze" : "Start typing..."}
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="px-8 py-3.5 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center shadow-xl gap-2"
                    style={{ backgroundColor: themeColor }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        Consulting AI...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
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
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6 px-2">
            <History className="w-7 h-7 text-muted-foreground" />
            <h2 className="text-3xl font-bold text-foreground">Consultation History</h2>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {tickets.length === 0 && !isSubmitting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel rounded-3xl p-16 text-center border border-dashed border-border/50"
                >
                  <Bot className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
                  <h3 className="text-xl font-bold text-foreground">No consultations yet</h3>
                  <p className="text-muted-foreground mt-2 text-lg">Submit your first request on the left to get AI-driven growth strategies.</p>
                </motion.div>
              )}

              {tickets.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel rounded-3xl border border-border/50 overflow-hidden hover:border-primary/20 transition-all duration-300 shadow-sm"
                >
                  {/* User Request Bubble */}
                  <div className="p-6 md:p-8 bg-background/30 border-b border-border/30">
                    <div className="flex items-start gap-5">
                      <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                          You
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground text-base leading-relaxed">{ticket.message}</p>
                        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {new Date(ticket.created_at).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Response Bubble */}
                  {ticket.ai_response && (
                    <div className="p-6 md:p-8 bg-primary/5 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: themeColor }} />
                      <div className="flex items-start gap-5 pl-2">
                        <div className="shrink-0 mt-1">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: themeColor }}>
                            <Bot className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold flex items-center gap-2 mb-3" style={{ color: themeColor }}>
                            Nexus AI Analyst
                          </h4>
                          <p className="text-foreground/90 text-base leading-relaxed whitespace-pre-wrap">
                            {ticket.ai_response}
                          </p>
                          
                          <div className="mt-6 flex justify-end">
                            <button 
                              className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-white shadow-sm"
                              style={{ backgroundColor: themeColor }}
                            >
                              Browse Recommended Modules
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pending State */}
                  {!ticket.ai_response && (
                    <div className="p-6 md:p-8 bg-muted/20 flex items-center gap-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                      <p className="text-base text-muted-foreground italic">AI is analyzing your request...</p>
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
