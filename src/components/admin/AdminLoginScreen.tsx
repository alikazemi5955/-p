import React, { useState } from 'react';
import { ShieldCheck, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

interface AdminLoginScreenProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLoginSuccess, onCancel }) => {
  const { addToast } = useStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast('نام کاربری و رمز عبور را وارد کنید', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('puzzlekala_admin_authenticated', 'true');
        sessionStorage.setItem('puzzlekala_admin_authenticated', 'true');
        addToast('ورود به پنل مدیریت با موفقیت انجام شد', 'success');
        onLoginSuccess();
      } else {
        addToast(data.message || 'نام کاربری یا رمز عبور اشتباه است', 'error');
      }
    } catch {
      // Offline / fallback check for admin123
      if (username.trim() === 'admin' && password.trim() === 'admin123') {
        localStorage.setItem('puzzlekala_admin_authenticated', 'true');
        sessionStorage.setItem('puzzlekala_admin_authenticated', 'true');
        onLoginSuccess();
      } else {
        addToast('خطا در احراز هویت مدیریت', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white select-none">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative">
        <button
          onClick={onCancel}
          className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
        >
          <span>بازگشت به فروشگاه</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black">پنل مدیریت پازل کالا</h2>
          <p className="text-xs text-slate-400 mt-1">سامانه جامع مدیریت فروشگاه، کاتالوگ و کسری پلاس</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">نام کاربری مدیر</label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 pr-10 pl-4 text-white focus:border-emerald-500 focus:outline-hidden font-mono"
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">رمز عبور</label>
            <div className="relative">
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 pr-10 pl-4 text-white focus:border-emerald-500 focus:outline-hidden font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50 mt-4 text-sm"
          >
            {loading ? 'در حال ورود...' : 'ورود امن به پنل'}
          </button>
        </form>

        <div className="mt-8 text-center text-[11px] text-slate-500 border-t border-slate-800 pt-4">
          <p>رمز پیش‌فرض مدیر: <span className="font-mono text-slate-400">admin123</span></p>
        </div>
      </div>
    </div>
  );
};
