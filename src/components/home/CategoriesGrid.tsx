import React from 'react';
import { Smartphone, Tablet, Laptop, Headphones, Watch, Camera } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const CategoriesGrid: React.FC = () => {
  const { setCurrentPage } = useStore();

  const categories = [
    { title: 'گوشی موبایل', count: 'بیش از ۱۵۰ مدل', icon: Smartphone, bg: 'bg-blue-50 text-blue-600' },
    { title: 'تبلت و کتابخوان', count: 'انواع سایزها', icon: Tablet, bg: 'bg-emerald-50 text-emerald-600' },
    { title: 'لپ‌تاپ و تجهیزات', count: 'دانشجویی و گیمینگ', icon: Laptop, bg: 'bg-purple-50 text-purple-600' },
    { title: 'هدفون و ایرپاد', count: 'بهترین برندها', icon: Headphones, bg: 'bg-amber-50 text-amber-600' },
    { title: 'ساعت هوشمند', count: 'سلامت و مکالمه', icon: Watch, bg: 'bg-rose-50 text-rose-600' },
    { title: 'لوازم جانبی و شارژر', count: 'گارانتی معتبر', icon: Camera, bg: 'bg-cyan-50 text-cyan-600' },
  ];

  return (
    <div className="space-y-4 select-none">
      <h3 className="font-black text-slate-900 text-base sm:text-lg">دسته‌بندی‌های برگزیده</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={() => setCurrentPage('products')}
              className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <div className={`w-14 h-14 rounded-2xl ${c.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-0.5">{c.title}</h4>
              <span className="text-[10px] text-slate-400">{c.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
