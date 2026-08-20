'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useFoundBack, Toast as ToastType } from '@/components/FoundBackProvider';

export const ToastList: React.FC = () => {
  const { toasts, removeToast } = useFoundBack();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-indigo-50 border-indigo-200 text-indigo-900';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${getStyles()}`}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-grow text-sm font-medium pr-2">{toast.message}</div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-0.5 hover:bg-black/5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
