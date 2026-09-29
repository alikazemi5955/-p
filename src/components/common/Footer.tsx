import React from 'react';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Lock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const Footer: React.FC = () => {
  const { settings, setCurrentPage } = useStore();

  const trustBadges = [
    { title: 'تحویل اکسپرس', desc: 'ارسال سریع به سراسر کشور', icon: Truck },
    { title: '۷ روز ضمانت بازگشت', desc: 'طبق ضوابط مرجوعی کالا', icon: RotateCcw },
    { title: 'ضمانت اصل بودن', desc: 'کالای ۱۰۰٪ اورجینال شرکتی', icon: ShieldCheck },
    { title: 'پشتیبانی ۲۴ ساعته', desc: 'پاسخگویی سریع تیکت و تماس', icon: Headphones },
    { title: 'پرداخت امن و آسان', desc: 'درگاه معتبر و کیف پول', icon: CreditCard },
  ];

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-12 pb-20 lg:pb-10 mt-16 border-t border-slate-800 select-none">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pb-10 border-b border-slate-800">
          {trustBadges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center p-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-emerald-400 mb-2.5">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{b.title}</h4>
                <p className="text-[11px] text-slate-400">{b.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Links and Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-xs">
          {/* About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png?v=3" alt="پازل کالا" className="h-8 w-auto object-contain brightness-0 invert" />
              <span className="font-black text-lg text-white">پازل کالا</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-justify">
              {settings.storeSlogan ||
                'فروشگاه تخصصی لوازم دیجیتال، ساعت هوشمند، هدفون، گجت و قطعات همراه با گارانتی اصالت کالا و ارسال سریع به سراسر ایران.'}
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">دسترسی سریع</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => setCurrentPage('home')} className="hover:text-emerald-400 cursor-pointer">
                  صفحه اصلی
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('products')} className="hover:text-emerald-400 cursor-pointer">
                  همه محصولات
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('easy-buy')} className="hover:text-emerald-400 cursor-pointer">
                  سفارش و خرید سریع
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.location.hash = '#profile';
                    setCurrentPage('profile');
                  }}
                  className="hover:text-emerald-400 cursor-pointer"
                >
                  حساب کاربری و پیگیری سفارشات
                </button>
              </li>
            </ul>
          </div>

          {/* Customer services */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">خدمات مشتریان</h4>
            <ul className="space-y-2 text-slate-400">
              <li>پاسخ به پرسش‌های متداول</li>
              <li>شرایط و رویه‌های بازگرداندن کالا</li>
              <li>حریم خصوصی و قوانین خرید آنلاین</li>
              <li>گزارش مشکل و پشتیبانی آنلاین</li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">اطلاعات تماس</h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono">{settings.storePhone || '۰۲۱-۹۱۰۰۰۰۰۰'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.storeEmail || 'info@puzzlekala.com'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.storeAddress || 'تهران، خیابان ولیعصر، مجتمع دیجیتال پازل کالا'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and admin access */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© ۱۴۰۳ پازل کالا (Puzzle Kala) - کلیه حقوق مادی و معنوی محفوظ است.</p>

          <button
            onClick={() => {
              window.location.hash = '#admin';
              setCurrentPage('admin');
            }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title="ورود به پنل مدیریت"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>مدیریت سیستم (Ctrl+Shift+A)</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
