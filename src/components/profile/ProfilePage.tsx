import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Wallet,
  Settings,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Shield,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const ProfilePage: React.FC = () => {
  const { user, orders, logout, setCurrentPage, setIsAuthModalOpen, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'addresses' | 'wallet' | 'account'>(
    'dashboard'
  );

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: 'منزل',
    recipientName: user?.name || '',
    phone: user?.phone || '',
    province: 'تهران',
    city: 'تهران',
    fullAddress: '',
    postalCode: '',
  });

  useEffect(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('orders')) setActiveTab('orders');
      else if (hash.includes('addresses')) setActiveTab('addresses');
      else if (hash.includes('wallet')) setActiveTab('wallet');
      else if (hash.includes('account')) setActiveTab('account');
    } catch {}
  }, []);

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto border border-slate-100 shadow-sm space-y-4 select-none">
        <UserIcon className="w-16 h-16 text-slate-300 mx-auto" />
        <h3 className="text-base font-black text-slate-800">برای مشاهده پروفایل ابتدا وارد شوید</h3>
        <p className="text-xs text-slate-500">مشاهده وضعیت سفارش‌ها، پیگیری پستی و کیف پول نیازمند حساب کاربری است.</p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
        >
          ورود به حساب کاربری
        </button>
      </div>
    );
  }

  const userOrders = orders.filter((o) => !o.userId || o.userId === user.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none" id="puzzlekala-user-profile-page">
      {/* Top Banner / User Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl">
            {(user.name || user.username).charAt(0)}
          </div>
          <div className="space-y-1 text-right">
            <h2 className="text-base font-black text-slate-900">{user.name || user.username}</h2>
            <p className="text-xs text-slate-400 font-mono" dir="ltr">
              {user.phone || user.username}
            </p>
            {user.role === 'admin' && (
              <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-md">
                مدیر سیستم
              </span>
            )}
          </div>
        </div>

        {/* Wallet snippet & admin button */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-2.5 text-right">
            <span className="text-[10px] text-slate-400 font-bold block">موجودی کیف پول:</span>
            <span className="text-sm font-black text-emerald-600">
              {Number(user.walletBalance || 0).toLocaleString('fa-IR')}{' '}
              <span className="text-[10px] font-normal text-slate-500">تومان</span>
            </span>
          </div>

          {user.role === 'admin' && (
            <button
              onClick={() => {
                window.location.hash = '#admin';
                setCurrentPage('admin');
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-colors cursor-pointer"
            >
              پنل مدیریت
            </button>
          )}

          <button
            onClick={logout}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors cursor-pointer"
            title="خروج از حساب"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Layout: Sidebar Navigation + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 account-desk-grid">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-1 bg-white rounded-3xl p-3 border border-slate-100 shadow-xs h-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-800 font-black'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>خلاصه وضعیت کاربری</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>سفارش‌های من</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              {userOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-emerald-50 text-emerald-800 font-black'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>آدرس‌های تحویل</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'wallet' ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Wallet className="w-4 h-4 text-purple-600" />
            <span>کیف پول و تراکنش‌ها</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'account' ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>تنظیمات حساب کاربری</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs min-h-[400px]">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
                خلاصه وضعیت کاربری
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold">کل سفارشات</span>
                  <p className="text-xl font-black text-slate-800">{userOrders.length}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold">سفارشات در حال پردازش</span>
                  <p className="text-xl font-black text-emerald-600">
                    {userOrders.filter((o) => o.status === 'processing').length}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold">موجودی کیف پول</span>
                  <p className="text-xl font-black text-purple-600">
                    {Number(user.walletBalance || 0).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold text-slate-700">آخرین سفارش‌ها</h4>
                {userOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">شما تاکنون هیچ سفارشی ثبت نکرده‌اید.</p>
                ) : (
                  userOrders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800">سفارش #{o.orderNumber}</span>
                        <p className="text-[10px] text-slate-400">
                          {o.itemsCount} کالا | {o.totalAmount.toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[10px]">
                        {o.status === 'processing' ? 'در حال پردازش' : o.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
                تاریخچه سفارش‌های من ({userOrders.length})
              </h3>

              {userOrders.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">هنوز سفارشی ثبت نکرده‌اید.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((o) => (
                    <div key={o.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">سفارش شماره {o.orderNumber}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(o.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2.5 py-1 rounded-lg">
                          {o.status === 'processing'
                            ? 'در حال پردازش'
                            : o.status === 'delivered'
                            ? 'تحویل داده شده'
                            : o.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <p>
                          گیرنده: <strong className="text-slate-800">{o.customerName}</strong>
                        </p>
                        <p>
                          تلفن همراه: <span className="font-mono text-slate-800">{o.customerPhone}</span>
                        </p>
                        <p className="sm:col-span-2">
                          آدرس تحویل: <span className="text-slate-700">{o.customerAddress}</span>
                        </p>
                      </div>

                      <div className="border-t border-slate-200/60 pt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500">مبلغ کل پرداختی:</span>
                        <span className="font-black text-slate-900">
                          {o.totalAmount.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">آدرس‌های ثبت‌شده</h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl hover:bg-emerald-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت آدرس جدید</span>
                </button>
              </div>

              {showAddressModal && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800">مشخصات آدرس جدید</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">نام گیرنده</label>
                      <input
                        type="text"
                        value={newAddress.recipientName}
                        onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">شماره تماس</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">نشانی پستی دقیق</label>
                      <input
                        type="text"
                        value={newAddress.fullAddress}
                        onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                        placeholder="خیابان، کوچه، پلاک، واحد..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddressModal(false)}
                      className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-200/60 cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={() => {
                        if (!newAddress.fullAddress.trim()) {
                          addToast('لطفاً نشانی کامل را وارد کنید', 'error');
                          return;
                        }
                        addToast('آدرس جدید با موفقیت ذخیره شد', 'success');
                        setShowAddressModal(false);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                    >
                      ذخیره آدرس
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800">آدرس پیش‌فرض تحویل کالا</span>
                  <p className="text-slate-600 text-[11px]">تهران، خیابان ولیعصر، پلاک ۱۲، واحد ۴</p>
                  <p className="text-slate-400 text-[10px]">گیرنده: {user.name || user.username}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  پیش‌فرض
                </span>
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
                کیف پول و موجودی حساب
              </h3>

              <div className="bg-gradient-to-l from-purple-700 to-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-purple-200 block mb-1">موجودی قابل استفاده:</span>
                  <div className="text-2xl font-black">
                    {Number(user.walletBalance || 0).toLocaleString('fa-IR')}{' '}
                    <span className="text-xs font-normal">تومان</span>
                  </div>
                </div>
                <button
                  onClick={() => addToast('درگاه شارژ آنلاین در دسترس است', 'info')}
                  className="bg-white text-purple-900 font-black text-xs px-4 py-2.5 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  افزایش اعتبار
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">تاریخچه تراکنش‌های کیف پول</h4>
                <p className="text-xs text-slate-400 py-6 text-center">تراکنشی یافت نشد.</p>
              </div>
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
                اطلاعات فردی و کلمه عبور
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">نام کاربری</label>
                  <input
                    type="text"
                    disabled
                    value={user.username}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">تلفن همراه</label>
                  <input
                    type="text"
                    disabled
                    value={user.phone || '-'}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => addToast('تغییر کلمه عبور با موفقیت ثبت شد', 'success')}
                  className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
