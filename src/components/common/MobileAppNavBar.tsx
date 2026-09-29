import React from 'react';
import { Home, Grid, ShoppingBag, User as UserIcon, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const MobileAppNavBar: React.FC = () => {
  const { currentPage, setCurrentPage, cartItemsCount, setIsCartDrawerOpen, setIsAuthModalOpen, user } = useStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
      <button
        onClick={() => setCurrentPage('home')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
          currentPage === 'home' ? 'text-emerald-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">خانه</span>
      </button>

      <button
        onClick={() => setCurrentPage('categories')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
          currentPage === 'categories' ? 'text-emerald-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px]">دسته‌ها</span>
      </button>

      <button
        onClick={() => setCurrentPage('easy-buy')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
          currentPage === 'easy-buy' ? 'text-amber-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Zap className="w-5 h-5" />
        <span className="text-[10px]">خرید سریع</span>
      </button>

      <button
        onClick={() => setIsCartDrawerOpen(true)}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 relative transition-colors cursor-pointer"
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px]">سبد خرید</span>
        {cartItemsCount > 0 && (
          <span className="absolute top-0 right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {cartItemsCount}
          </span>
        )}
      </button>

      <button
        onClick={() => {
          if (user) {
            window.location.hash = '#profile';
            setCurrentPage('profile');
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
          currentPage === 'profile' ? 'text-emerald-600 font-bold' : 'text-slate-500'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[10px]">{user ? 'پروفایل' : 'ورود'}</span>
      </button>
    </div>
  );
};
