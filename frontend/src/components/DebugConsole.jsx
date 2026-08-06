import React, { useState, useEffect } from 'react';
import { Bug, X, Trash2, ChevronDown } from 'lucide-react';

export const DebugConsole = () => {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    // Intercept console.error
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      const msg = args.map(a => {
        if (a && a.response) {
            return `AxiosError: ${a.message} | URL: ${a.config?.url} | Status: ${a.response?.status} | Data: ${JSON.stringify(a.response?.data)}`;
        }
        return (typeof a === 'object' ? JSON.stringify(a, Object.getOwnPropertyNames(a)) : String(a));
      }).join(' ');
      addLog('ERROR', msg);
    };

    // Intercept window.onerror
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (originalOnError) originalOnError(message, source, lineno, colno, error);
      addLog('EXCEPTION', `${message} at ${source}:${lineno}:${colno}\n${error?.stack || ''}`);
    };

    // Intercept unhandled promise rejections
    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      if (originalOnUnhandledRejection) originalOnUnhandledRejection(event);
      addLog('PROMISE', event.reason ? (event.reason.stack || String(event.reason)) : 'Unhandled Promise Rejection');
    };

    return () => {
      console.error = originalConsoleError;
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
    };
  }, []);

  const addLog = (type, message) => {
    setLogs(prev => [{ id: Date.now() + Math.random(), type, message, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
    setIsOpen(true);
    setIsMinimized(false);
  };

  if (!isOpen && logs.length === 0) return null;

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 left-4 z-[9999] bg-red-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-red-700 flex items-center space-x-2 animate-bounce"
      >
        <Bug size={24} />
        {logs.length > 0 && <span className="font-bold">{logs.length} Errors</span>}
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 w-full h-1/2 z-[9999] bg-gray-900 text-green-400 font-mono text-xs sm:text-sm flex flex-col shadow-2xl border-t border-gray-700">
      <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700 text-white">
        <div className="flex items-center space-x-2">
          <Bug size={18} className="text-red-500" />
          <span className="font-bold">Live Debugger (Capturing All Errors)</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setLogs([])} className="hover:text-red-400 flex items-center" title="Clear Logs">
            <Trash2 size={16} />
          </button>
          <button onClick={() => setIsMinimized(true)} className="hover:text-gray-400" title="Minimize">
            <ChevronDown size={20} />
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:text-red-400" title="Close">
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">No errors captured yet.</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="p-2 border-b border-gray-800 break-words whitespace-pre-wrap">
              <span className="text-gray-500">[{log.time}]</span>{' '}
              <span className="font-bold text-red-500">[{log.type}]</span>{' '}
              <span className="text-gray-300">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
