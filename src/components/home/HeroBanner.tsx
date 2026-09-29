import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const HeroBanner: React.FC = () => {
  const { settings, setCurrentPage } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);

  const defaultBanners = [
    {
      id: 'b1',
      title: 'جدیدترین گوشی‌های هوشمند بازار',
      subtitle: 'با ضمانت اصالت ۱۸ ماهه شرکتی و ارسال رایگان',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80',
      tag: 'پیشنهاد ویژه پازل کالا',
    },
    {
      id: 'b2',
      title: 'ساعت‌های هوشمند و مچ‌بندهای ورزشی',
      subtitle: 'تنوع بی‌نظیر انواع بند، قاب و محافظ صفحه',
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80',
      tag: 'تخفیف شگفت‌انگیز',
    },
    {
      id: 'b3',
      title: 'تجهیزات گیمینگ و هندزفری‌های بلوتوثی',
      subtitle: 'صدای شفاف با گارانتی تعویض و تست ۷ روزه',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
      tag: 'پرفروش‌ترین‌های هفته',
    },
  ];

  const banners = settings.banners && settings.banners.length > 0 ? settings.banners : defaultBanners;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-sm bg-slate-900 aspect-[21/9] sm:aspect-[24/8] select-none">
      {banners.map((b, i) => (
        <div
          key={b.id || i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img src={b.image} alt={b.title} className="w-full h-full object-cover brightness-[0.7]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-6 sm:px-12 text-white space-y-2 sm:space-y-4">
            {'tag' in b && (
              <span className="inline-block bg-emerald-500/90 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full w-fit">
                {b.tag}
              </span>
            )}
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black max-w-xl leading-tight">{b.title}</h2>
            {'subtitle' in b && <p className="text-xs sm:text-sm text-slate-200 max-w-md line-clamp-2">{b.subtitle}</p>}
            <button
              onClick={() => setCurrentPage('products')}
              className="bg-white hover:bg-emerald-400 hover:text-slate-950 text-slate-900 text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl w-fit transition-all shadow-lg cursor-pointer"
            >
              مشاهده محصولات
            </button>
          </div>
        </div>
      ))}

      {/* Slider controls */}
      <button
        onClick={() => setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-xs text-white flex items-center justify-center transition-all cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setActiveSlide((prev) => (prev + 1) % banners.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-xs text-white flex items-center justify-center transition-all cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === activeSlide ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
