import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';

export const PromoBanners: React.FC = () => {
  const { setCurrentPage } = useStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
      <div
        onClick={() => setCurrentPage('products')}
        className="rounded-3xl overflow-hidden relative aspect-[21/9] bg-slate-900 shadow-md cursor-pointer group"
      >
        <img
          src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
          alt="گوشی‌های اقتصادی"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
          <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full w-fit mb-1">
            ارزش خرید بالا
          </span>
          <h4 className="text-base sm:text-lg font-black">گوشی‌های هوشمند اقتصادی و پرفروش</h4>
          <p className="text-xs text-slate-200 mt-1">همراه با ۱۸ ماه گارانتی شرکتی و کد رجیستری</p>
        </div>
      </div>

      <div
        onClick={() => setCurrentPage('products')}
        className="rounded-3xl overflow-hidden relative aspect-[21/9] bg-slate-900 shadow-md cursor-pointer group"
      >
        <img
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
          alt="تجهیزات صوتی"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
          <span className="text-[10px] bg-emerald-500 text-white font-black px-2.5 py-0.5 rounded-full w-fit mb-1">
            صدا با کیفیت عالی
          </span>
          <h4 className="text-base sm:text-lg font-black">انواع ایرپاد، هدفون و اسپیکر بلوتوثی</h4>
          <p className="text-xs text-slate-200 mt-1">تست اصالت و مهلت تست سلامت فیزیکی ۷ روزه</p>
        </div>
      </div>
    </div>
  );
};
