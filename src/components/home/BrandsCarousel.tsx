import React from 'react';

export const BrandsCarousel: React.FC = () => {
  const brands = [
    { name: 'سامسونگ', en: 'Samsung' },
    { name: 'شیائومی', en: 'Xiaomi' },
    { name: 'اپل', en: 'Apple' },
    { name: 'انکر', en: 'Anker' },
    { name: 'هوآوی', en: 'Huawei' },
    { name: 'نوکیا', en: 'Nokia' },
    { name: 'تکنو', en: 'Tecno' },
    { name: 'ریلمی', en: 'Realme' },
  ];

  return (
    <div className="space-y-4 select-none">
      <h3 className="font-black text-slate-900 text-base sm:text-lg">محبوب‌ترین برندها در پازل کالا</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {brands.map((b, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center shadow-xs hover:border-emerald-200 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-black text-slate-700 text-sm group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors mb-2">
              {b.en.charAt(0)}
            </div>
            <span className="text-xs font-bold text-slate-800">{b.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">{b.en}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
