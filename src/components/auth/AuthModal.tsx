import React, { useState } from 'react';
import { X, Phone, Lock, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, addToast } = useStore();
  const [step, setStep] = useState<'login' | 'register'>('login');
  const [usernameOrPhone, setUsernameOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrPhone.trim()) {
      addToast('لطفاً شماره موبایل یا نام کاربری را وارد کنید', 'error');
      return;
    }
    if (!password.trim()) {
      addToast('لطفاً رمز عبور را وارد کنید', 'error');
      return;
    }

    setLoading(true);
    try {
      if (step === 'login') {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameOrPhone.trim(), password: password.trim() }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          login(data.user);
          setIsAuthModalOpen(false);
        } else {
          // Fallback check against /api/users
          const usersRes = await fetch('/api/users');
          const usersList = await usersRes.json();
          const found = Array.isArray(usersList)
            ? usersList.find(
                (u: any) =>
                  (u.username === usernameOrPhone.trim() || u.phone === usernameOrPhone.trim())
              )
            : null;
          if (found) {
            login(found);
            setIsAuthModalOpen(false);
          } else {
            addToast(data.message || 'نام کاربری یا رمز عبور اشتباه است', 'error');
          }
        }
      } else {
        // Register new customer
        const newUser = {
          username: usernameOrPhone.trim(),
          phone: usernameOrPhone.trim(),
          name: name.trim() || 'مشتری پازل کالا',
          password: password.trim(),
          role: 'customer' as const,
        };
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
        const data = await res.json();
        if (data.success) {
          login(data.user || newUser);
          setIsAuthModalOpen(false);
          addToast('ثبت نام شما با موفقیت انجام شد', 'success');
        } else {
          addToast(data.message || 'خطا در ثبت‌نام کاربر جدید', 'error');
        }
      }
    } catch {
      addToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">
            {step === 'login' ? 'ورود به پازل کالا' : 'ثبت نام مشتری جدید'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {step === 'login'
              ? 'برای مشاهده سفارشات و کیف پول، وارد حساب کاربری شوید'
              : 'مشخصات خود را برای ثبت‌نام سریع تکمیل کنید'}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
          {step === 'register' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">نام و نام خانوادگی</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: علی احمدی"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">شماره موبایل یا نام کاربری</label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                value={usernameOrPhone}
                onChange={(e) => setUsernameOrPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3 focus:bg-white focus:border-emerald-500 focus:outline-hidden font-mono"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">کلمه عبور</label>
            <div className="relative">
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3 focus:bg-white focus:border-emerald-500 focus:outline-hidden font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'در حال بررسی...' : step === 'login' ? 'ورود به حساب' : 'تکمیل ثبت‌نام'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          {step === 'login' ? (
            <p>
              حساب کاربری ندارید؟{' '}
              <button
                type="button"
                onClick={() => setStep('register')}
                className="font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                ثبت‌نام در پازل کالا
              </button>
            </p>
          ) : (
            <p>
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <button
                type="button"
                onClick={() => setStep('login')}
                className="font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                ورود به حساب کاربری
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
