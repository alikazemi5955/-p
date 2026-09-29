import React from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Watch,
  Grid,
  Percent,
  Sparkles,
  Award,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

interface NavbarProps {
  isVisible?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isVisible = true }) => {
  const { setCurrentPage } = useStore();

  const categories = [
    { id: 'cat-mobile', label: 'گوشی موبایل', icon: Smartphone },
    { id: 'cat-tablet', label: 'تبلت', icon: Tablet },
    { id: 'cat-laptop', label: 'لپ‌تاپ و کامپیوتر', icon: Laptop },
    { id: 'cat-audio', label: 'هدفون و هندزفری', icon: Headphones },
    { id: 'cat-watch', label: 'ساعت هوشمند', icon: Watch },
    { id: 'cat-special', label: 'شگفت‌انگیزها', icon: Percent, isHot: true },
    { id: 'cat-new', label: 'جدیدترین‌ها', icon: Sparkles },
    { id: 'cat-bestseller', label: 'پرفروش‌ترین‌ها', icon: Award },
  ];

  if (!isVisible) return null;

  return (
    <nav className="w-full bg-white/90 backdrop-blur-xs border-b border-slate-100 select-none overflow-x-auto no-scrollbar transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 sm:gap-2 py-2 min-w-max">
        <button
          onClick={() => setCurrentPage('categories')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Grid className="w-3.5 h-3.5 text-slate-600" />
          <span>دسته‌بندی کالاها</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setCurrentPage('products')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                c.isHot
                  ? 'text-rose-600 hover:bg-rose-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${c.isHot ? 'text-rose-600' : 'text-slate-500'}`} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
