import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const OfflineBanner: React.FC = () => {
  const { isServerConnected, reloadProducts } = useStore();

  if (isServerConnected) return null;

  return (
    <div className="w-full bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs select-none">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>ارتباط با سرور محلی موقتاً قطع است. داده‌ها از حافظه کش مرورگر بارگذاری شدند.</span>
      </div>
      <button
        onClick={reloadProducts}
        className="flex items-center gap-1 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[11px] hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3 h-3" />
        <span>تلاش مجدد</span>
      </button>
    </div>
  );
};
