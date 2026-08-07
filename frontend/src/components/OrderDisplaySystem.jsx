import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

// Mock Data generation
const generateMockOrders = () => {
  const base = [
    { id: '1048', customerName: 'Rahul', status: 'ready', counter: 'Counter 2', time: Date.now() - 300000 },
    { id: '1050', customerName: 'Amit', status: 'ready', counter: 'Counter 1', time: Date.now() - 150000 },
    { id: '1052', customerName: 'Priya', status: 'preparing', time: Date.now() - 314000 },
    { id: '1053', customerName: 'Neha', status: 'preparing', time: Date.now() - 162000 },
    { id: '1054', customerName: 'Vikram', status: 'preparing', time: Date.now() - 45000 },
  ];
  return base;
};

const Header = ({ stats, themeColor, businessName }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-background/50 backdrop-blur-md relative z-20">
      <div className="flex items-center space-x-4">
        <div className="text-3xl font-bold" style={{ color: themeColor || '#4CAF50' }}>{businessName || 'NexOrder'}</div>
        <div className="h-8 w-px bg-border" />
        <h1 className="text-2xl font-semibold text-foreground tracking-wide">Order Status</h1>
      </div>

      <div className="flex space-x-6">
        <div className="flex flex-col items-center justify-center glass-panel rounded-2xl px-6 py-2">
           <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Preparing</span>
           <span className="text-2xl font-bold text-[#FF9800]">{stats.preparing}</span>
        </div>
        <div className="flex flex-col items-center justify-center glass-panel rounded-2xl px-6 py-2">
           <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ready</span>
           <span className="text-2xl font-bold text-[#00E676]">{stats.ready}</span>
        </div>
        <div className="flex flex-col items-center justify-center glass-panel rounded-2xl px-6 py-2 min-w-[120px]">
           <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Completed</span>
           <span className="text-2xl font-bold text-foreground">{stats.completed}</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex flex-col items-end">
          <div className="text-3xl font-bold text-foreground tracking-wider font-mono">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span className="text-lg text-muted-foreground ml-1">{time.toLocaleTimeString([], { second: '2-digit' })}</span>
          </div>
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-1">
            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-card/50 px-4 py-2 rounded-full border border-border shadow-sm">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00E676]"></span>
          </div>
          <span className="text-sm font-bold text-[#00E676]">Online</span>
        </div>
      </div>
    </div>
  );
};

const PreparingCard = ({ order }) => {
  const [elapsed, setElapsed] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const diff = Math.floor((Date.now() - order.time) / 1000);
      const mins = Math.floor(diff / 60).toString().padStart(2, '0');
      const secs = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${mins}:${secs}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [order.time]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="glass-panel rounded-xl p-4 flex justify-between items-center overflow-hidden relative group"
    >
      <div className="absolute top-0 left-0 h-full w-1.5 bg-[#FF9800]" />
      <div className="pl-2">
        <motion.div 
          animate={{ scale: [1, 1.02, 1] }} 
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-4xl font-bold text-foreground tracking-tighter mb-1"
        >
          #{order.id}
        </motion.div>
        {order.customerName && (
          <div className="text-lg font-semibold text-muted-foreground">{order.customerName}</div>
        )}
      </div>
      <div className="flex flex-col items-end justify-center">
        <div className="text-[#FF9800] text-2xl font-mono font-bold tracking-tight">{elapsed}</div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Elapsed</div>
        <div className="w-24 h-1.5 bg-border rounded-full mt-2 overflow-hidden relative">
          <motion.div 
            className="h-full bg-[#FF9800] absolute top-0 left-0" 
            initial={{ width: "0%" }}
            animate={{ width: "60%" }} 
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const ReadyCard = ({ order, themeColor }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50, scale: 0.95 }}
      animate={{ 
        opacity: 1, x: 0, scale: 1,
        boxShadow: ["0px 0px 0px rgba(0, 230, 118, 0)", "0px 0px 15px rgba(0, 230, 118, 0.2)", "0px 0px 0px rgba(0, 230, 118, 0)"]
      }}
      transition={{ 
        boxShadow: { duration: 2, repeat: Infinity }
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="bg-card/90 backdrop-blur-xl border-2 border-[#00E676]/40 rounded-xl p-5 flex justify-between items-center relative overflow-hidden shadow-lg"
    >
      <div className="absolute top-0 left-0 h-full w-2 bg-[#00E676]" />
      <div className="pl-2">
        <div className="text-5xl font-bold text-foreground tracking-tighter mb-1 drop-shadow-sm">#{order.id}</div>
        {order.customerName && (
          <div className="text-lg font-bold text-muted-foreground">{order.customerName}</div>
        )}
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="flex items-center space-x-1.5 text-[#00E676] bg-[#00E676]/10 px-3 py-1.5 rounded-lg border border-[#00E676]/20">
          <CheckCircle className="w-5 h-5" />
          <span className="text-lg font-bold uppercase tracking-widest">Ready</span>
        </div>
        {order.counter && (
          <div className="text-sm font-bold text-primary-foreground uppercase tracking-wide px-3 py-1.5 rounded-lg" style={{ backgroundColor: themeColor || 'hsl(var(--primary))' }}>
            {order.counter}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const FooterTicker = () => {
  const messages = [
    "Thank you for choosing us.",
    "Please collect your order from the pickup counter.",
    "Freshly prepared for you.",
    "Estimated average wait time: 8 Minutes."
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-16 border-t border-border bg-background/80 backdrop-blur-xl flex items-center justify-center overflow-hidden relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold text-muted-foreground tracking-wide"
        >
          {messages[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const OrderDisplaySystem = () => {
  const { themeColor, themeMode, businessName } = useAuth();
  const [orders, setOrders] = useState(generateMockOrders());
  const [completedCount, setCompletedCount] = useState(142);

  // Simulation: Move orders from preparing to ready, and remove ready after time
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => {
        let newOrders = [...prev];
        
        // Randomly add a new order
        if (Math.random() > 0.7 && newOrders.length < 10) {
          const newId = Math.floor(Math.random() * 1000) + 1000;
          newOrders.push({
            id: newId.toString(),
            customerName: `Guest ${newId}`,
            status: 'preparing',
            time: Date.now()
          });
        }

        // Randomly transition one from preparing to ready
        const preparing = newOrders.filter(o => o.status === 'preparing');
        if (preparing.length > 0 && Math.random() > 0.6) {
          const toReady = preparing[0];
          newOrders = newOrders.map(o => {
            if (o.id === toReady.id) {
              return { ...o, status: 'ready', counter: `Counter ${Math.floor(Math.random() * 3) + 1}` };
            }
            return o;
          });
        }

        // Randomly remove a ready order (completed)
        const ready = newOrders.filter(o => o.status === 'ready');
        if (ready.length > 3 && Math.random() > 0.5) {
          const toRemove = ready[0];
          newOrders = newOrders.filter(o => o.id !== toRemove.id);
          setCompletedCount(c => c + 1);
        }

        return newOrders;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const preparingOrders = orders.filter(o => o.status === 'preparing').sort((a,b) => a.time - b.time);
  const readyOrders = orders.filter(o => o.status === 'ready').sort((a,b) => b.time - a.time);

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans relative overflow-hidden",
      "bg-background text-foreground transition-colors duration-300"
    )}>
      {/* Dynamic Theme Background Elements matching App layout */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={cn("absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px]", themeMode === "light" ? "opacity-15" : "opacity-20")}
          style={{ backgroundColor: themeColor || 'hsl(var(--primary))' }}
        />
        <div
          className={cn("absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px]", themeMode === "light" ? "opacity-15" : "opacity-20")}
          style={{
            backgroundColor: themeColor || 'hsl(var(--primary))',
            filter: "hue-rotate(45deg) blur(150px)",
          }}
        />
      </div>

      <Header stats={{ preparing: preparingOrders.length, ready: readyOrders.length, completed: completedCount }} themeColor={themeColor} businessName={businessName} />
      
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Column - Preparing */}
        <div className="w-1/2 border-r border-border flex flex-col relative overflow-hidden bg-card/30">
          <div className="px-6 py-4 bg-gradient-to-b from-background/90 to-transparent sticky top-0 z-10 backdrop-blur-sm border-b border-border/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center tracking-tight">
              <span className="w-4 h-4 rounded-full bg-[#FF9800] mr-4 shadow-[0_0_15px_#FF9800]" />
              Preparing
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-hide">
            <AnimatePresence>
              {preparingOrders.map(order => (
                <PreparingCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
            {preparingOrders.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-2xl font-semibold opacity-50">
                No orders preparing
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Ready */}
        <div className="w-1/2 flex flex-col relative overflow-hidden bg-card/20">
          <div className="px-6 py-4 bg-gradient-to-b from-background/90 to-transparent sticky top-0 z-10 backdrop-blur-sm border-b border-border/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center tracking-tight">
              <span className="w-4 h-4 rounded-full bg-[#00E676] mr-4 shadow-[0_0_15px_#00E676]" />
              Ready for Pickup
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
            <AnimatePresence>
              {readyOrders.map(order => (
                <ReadyCard key={order.id} order={order} themeColor={themeColor} />
              ))}
            </AnimatePresence>
            {readyOrders.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-2xl font-semibold opacity-50">
                No orders ready
              </div>
            )}
          </div>
        </div>
      </div>

      <FooterTicker />
    </div>
  );
};
