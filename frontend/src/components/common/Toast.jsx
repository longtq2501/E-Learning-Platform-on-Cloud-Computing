import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckIcon, AlertIcon, CloseIcon } from './Icons';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const showError = useCallback((msg) => addToast(msg, 'error', 5000), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/30 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/30 text-rose-300'
                : 'bg-slate-900/95 border-indigo-500/30 text-indigo-300'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === 'success' ? (
                <CheckIcon className="w-5 h-5 text-emerald-400" />
              ) : toast.type === 'error' ? (
                <AlertIcon className="w-5 h-5 text-rose-400" />
              ) : (
                <AlertIcon className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed text-slate-100">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
