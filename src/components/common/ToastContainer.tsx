import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let bg = 'bg-slate-900 text-white';
        let Icon = Info;
        if (t.type === 'success') {
          bg = 'bg-emerald-600 text-white';
          Icon = CheckCircle2;
        } else if (t.type === 'error') {
          bg = 'bg-rose-600 text-white';
          Icon = AlertCircle;
        } else if (t.type === 'warning') {
          bg = 'bg-amber-600 text-white';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold animate-fadeIn transition-all ${bg}`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 hover:opacity-75 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
