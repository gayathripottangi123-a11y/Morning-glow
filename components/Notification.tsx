import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, X, Sparkles } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'loading';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  onRetry?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose, onRetry }) => {
  useEffect(() => {
    if (type === 'success') {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-green-400" size={18} />,
    error: <AlertCircle className="text-rose-400" size={18} />,
    loading: <Sparkles className="text-blue-300 animate-pulse" size={18} />,
  };

  const bgColors = {
    success: 'border-green-500/20 bg-green-500/5',
    error: 'border-rose-500/20 bg-rose-500/5',
    loading: 'border-white/10 bg-white/5',
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[100] flex items-center gap-3 px-5 py-3 glass rounded-full border ${bgColors[type]} shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-[280px]`}>
      <div className="shrink-0">{icons[type]}</div>
      <div className="flex-1 flex items-center justify-between gap-4">
        <p className="text-[13px] font-medium text-white/90 whitespace-now4ap">{message}</p>
        {type === 'error' && onRetry && (
          <button 
            onClick={onRetry}
            className="text-[11px] font-bold text-rose-300 hover:text-rose-100 transition-colors uppercase tracking-widest"
          >
            Retry
          </button>
        )}
      </div>
      <button 
        onClick={onClose}
        className="text-white/20 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};