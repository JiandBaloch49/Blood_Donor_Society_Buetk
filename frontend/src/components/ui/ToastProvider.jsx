import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 min-w-[300px] max-w-sm rounded-lg p-4 shadow-lg animate-in slide-in-from-right-8 fade-in duration-300 ${
              t.type === 'error' ? 'bg-white border-l-4 border-red-500 text-gray-800' :
              t.type === 'success' ? 'bg-white border-l-4 border-green-500 text-gray-800' :
              'bg-white border-l-4 border-blue-500 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
              {t.type === 'error' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
              {t.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />}
              <p className="text-sm font-medium leading-tight">{t.message}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
