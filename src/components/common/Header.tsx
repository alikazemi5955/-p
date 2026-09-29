import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Phone,
  Zap,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const Header: React.FC = () => {
  const {
    settings,
    user,
    cartItemsCount,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    setIsCartDrawerOpen,
    setIsAuthModalOpen,
    logout,
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage('products');
    }
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs select-none">
      {/* Top micro bar for slogan and notice */}
      {settings.noticeBarActive && settings.noticeBarText && (
        <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium">
          {settings.noticeBarText}
        </div>
      )}

      <header className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Right side: Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
          <div className="h-10 w-auto flex items-center justify-center">
            <img src="/logo.png?v=3" alt="پازل کالا" className="h-9 w-auto object-contain" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-black text-xl text-slate-900 tracking-tight">پازل کالا</span>
            <span className="text-[10px] text-slate-500 font-medium">مرکز تخصصی لوازم دیجیتال</span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-2xl mx-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در بین صدها کالای دیجیتال، گوشی، ساعت..."
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 text-xs sm:text-sm rounded-2xl py-2.5 pr-11 pl-4 border border-transparent focus:border-emerald-500 focus:outline-hidden transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>

        {/* Left side: Quick Buy, User Auth, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Easy buy button */}
          <button
            onClick={() => setCurrentPage('easy-buy')}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>خرید سریع</span>
          </button>

          {/* User Account / Login */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-slate-600" />
                  <span className="hidden lg:inline">{user.name || user.username}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-right animate-fadeIn"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-black text-slate-800">{user.name || user.username}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{user.phone || '-'}</p>
                    </div>

                    <button
                      onClick={() => {
                        window.location.hash = '#profile';
                        setCurrentPage('profile');
                      }}
                      className="w-full text-right px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                      <span>پنل کاربری و سفارشات</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          window.location.hash = '#admin';
                          setCurrentPage('admin');
                        }}
                        className="w-full text-right px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                        <span>پنل مدیریت فروشگاه</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={logout}
                      className="w-full text-right px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">ورود / ثبت‌نام</span>
              </button>
            )}
          </div>

          {/* Cart Icon & Counter */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer"
            title="سبد خرید"
          >
            <ShoppingCart className="w-4 h-4 text-slate-700" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>
    </div>
  );
};
