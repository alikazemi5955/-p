import React from 'react';
import { Zap, ShieldCheck, Flame, Percent, Smartphone, Watch, Headphones, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const QuickShortcutsBar: React.FC = () => {
  const { setCurrentPage } = useStore();

  const shortcuts = [
    { title: 'خرید سریع', icon: Zap, color: 'bg-amber-500 text-white', page: 'easy-buy' },
    { title: 'شگفت‌انگیزها', icon: Flame, color: 'bg-rose-500 text-white', page: 'products' },
    { title: 'گوشی موبایل', icon: Smartphone, color: 'bg-indigo-500 text-white', page: 'products' },
    { title: 'ساعت هوشمند', icon: Watch, color: 'bg-purple-500 text-white', page: 'products' },
    { title: 'هدفون و ایرپاد', icon: Headphones, color: 'bg-blue-500 text-white', page: 'products' },
    { title: 'تخفیف ویژه', icon: Percent, color: 'bg-emerald-500 text-white', page: 'products' },
    { title: 'کالای شرکتی', icon: ShieldCheck, color: 'bg-cyan-500 text-white', page: 'products' },
    { title: 'جدیدترین‌ها', icon: Sparkles, color: 'bg-fuchsia-500 text-white', page: 'products' },
  ];

  return (
    <div className="w-full py-2 select-none overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-between gap-4 min-w-max px-2">
        {shortcuts.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={i}
              onClick={() => setCurrentPage(s.page as any)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${s.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">
                {s.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
