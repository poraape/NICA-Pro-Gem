import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-white/90 border-neutral-200 text-neutral-800',
  };

  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-primary-500" />,
  };

  return (
    <div className={`fixed bottom-24 right-4 left-4 sm:left-auto sm:w-96 z-[60] backdrop-blur-md border rounded-2xl shadow-lg p-4 flex items-center gap-3 animate-slide-up ${styles[type]}`}>
      <div className="shrink-0">
        {icons[type]}
      </div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
        <X size={16} className="opacity-60" />
      </button>
    </div>
  );
};