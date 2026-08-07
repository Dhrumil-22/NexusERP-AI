import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Clock, CheckCircle } from 'lucide-react';

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

const Header = ({ stats }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#252C36' }}>
      <div className="flex items-center space-x-4">
        <div className="text-3xl font-bold" style={{ color: '#4CAF50' }}>NexOrder</div>
        <div className="h-8 w-px bg-[#252C36]" />
        <h1 className="text-2xl font-semibold text-white tracking-wide">Order Status</h1>
      </div>

      <div className="flex space-x-6">
        <div className="flex flex-col items-center justify-center bg-[#151B23] border border-[#252C36] rounded-2xl px-4 py-2 shadow-lg backdrop-blur-md">
           <span className="text-xs text-[#B0BEC5] uppercase tracking-wider">Preparing</span>
           <span className="text-xl font-bold text-[#FF9800]">{stats.preparing}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#151B23] border border-[#252C36] rounded-2xl px-4 py-2 shadow-lg backdrop-blur-md">
           <span className="text-xs text-[#B0BEC5] uppercase tracking-wider">Ready</span>
           <span className="text-xl font-bold text-[#00E676]">{stats.ready}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#151B23] border border-[#252C36] rounded-2xl px-4 py-2 shadow-lg backdrop-blur-md min-w-[120px]">
           <span className="text-xs text-[#B0BEC5] uppercase tracking-wider">Completed</span>
           <span className="text-xl font-bold text-white">{stats.completed}</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex flex-col items-end">
          <div className="text-3xl font-bold text-white tracking-wider font-mono">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span className="text-lg text-[#B0BEC5] ml-1">{time.toLocaleTimeString([], { second: '2-digit' })}</span>
          </div>
          <div className="text-sm font-medium text-[#B0BEC5] uppercase tracking-widest mt-1">
            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-[#151B23]/50 px-4 py-2 rounded-full border border-[#252C36]">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00E676]"></span>
          </div>
          <span className="text-sm font-medium text-[#00E676]">Online</span>
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
      className="bg-[#151B23]/80 backdrop-blur-xl border border-[#252C36] rounded-[16px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex justify-between items-center overflow-hidden relative group"
    >
      <div className="absolute top-0 left-0 h-full w-1 bg-[#FF9800]" />
      <div>
        <motion.div 
          animate={{ scale: [1, 1.02, 1] }} 
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-6xl font-bold text-white tracking-tighter mb-2"
        >
          #{order.id}
        </motion.div>
        {order.customerName && (
          <div className="text-xl font-medium text-[#B0BEC5]">{order.customerName}</div>
        )}
      </div>
      <div className="flex flex-col items-end justify-center">
        <div className="text-[#FF9800] text-3xl font-mono font-semibold">{elapsed}</div>
        <div className="text-sm text-[#B0BEC5] uppercase tracking-wider mt-1">Elapsed</div>
        <div className="w-32 h-1.5 bg-[#252C36] rounded-full mt-4 overflow-hidden">
          <motion.div 
            className="h-full bg-[#FF9800]" 
            initial={{ width: "0%" }}
            animate={{ width: "60%" }} // Mock progress
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const ReadyCard = ({ order }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50, scale: 0.95 }}
      animate={{ 
        opacity: 1, x: 0, scale: 1,
        boxShadow: ["0px 0px 0px rgba(0, 230, 118, 0)", "0px 0px 20px rgba(0, 230, 118, 0.4)", "0px 0px 0px rgba(0, 230, 118, 0)"]
      }}
      transition={{ 
        boxShadow: { duration: 2, repeat: Infinity }
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="bg-[#151B23]/90 backdrop-blur-xl border-2 border-[#00E676]/30 rounded-[16px] p-8 shadow-[0_8px_30px_rgb(0,230,118,0.1)] flex justify-between items-center relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 h-full w-2 bg-[#00E676]" />
      <div>
        <div className="text-7xl font-bold text-white tracking-tighter mb-2">#{order.id}</div>
        {order.customerName && (
          <div className="text-2xl font-medium text-[#B0BEC5]">{order.customerName}</div>
        )}
      </div>
      <div className="flex flex-col items-end space-y-3">
        <div className="flex items-center space-x-2 text-[#00E676] bg-[#00E676]/10 px-4 py-2 rounded-xl">
          <CheckCircle className="w-8 h-8" />
          <span className="text-2xl font-bold uppercase tracking-widest">Ready</span>
        </div>
        {order.counter && (
          <div className="text-xl font-semibold text-white uppercase tracking-wide bg-[#252C36] px-4 py-2 rounded-lg">
            {order.counter}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const FooterTicker = () => {
  const messages = [
    "Thank you for choosing NexOrder.",
    "Please collect your order from the pickup counter.",
    "Fresh ingredients, served hot.",
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
    <div className="h-16 border-t border-[#252C36] bg-[#0B0F14]/90 backdrop-blur-md flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-medium text-[#B0BEC5] tracking-wide"
        >
          {messages[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const OrderDisplaySystem = () => {
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
    <div className="min-h-screen bg-[#0B0F14] flex flex-col font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header stats={{ preparing: preparingOrders.length, ready: readyOrders.length, completed: completedCount }} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Preparing */}
        <div className="w-1/2 border-r border-[#252C36] flex flex-col relative overflow-hidden">
          <div className="p-6 bg-gradient-to-b from-[#151B23]/50 to-transparent sticky top-0 z-10 backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white flex items-center">
              <span className="w-4 h-4 rounded-full bg-[#FF9800] mr-4 shadow-[0_0_15px_#FF9800]" />
              Preparing
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
            <AnimatePresence>
              {preparingOrders.map(order => (
                <PreparingCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
            {preparingOrders.length === 0 && (
              <div className="h-full flex items-center justify-center text-[#B0BEC5] text-xl opacity-50">
                No orders preparing
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Ready */}
        <div className="w-1/2 flex flex-col relative overflow-hidden">
          <div className="p-6 bg-gradient-to-b from-[#151B23]/50 to-transparent sticky top-0 z-10 backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white flex items-center">
              <span className="w-4 h-4 rounded-full bg-[#00E676] mr-4 shadow-[0_0_15px_#00E676]" />
              Ready for Pickup
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <AnimatePresence>
              {readyOrders.map(order => (
                <ReadyCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
            {readyOrders.length === 0 && (
              <div className="h-full flex items-center justify-center text-[#B0BEC5] text-xl opacity-50">
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
