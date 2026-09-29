import React, { useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Building,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { Order } from '../../types.ts';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartTotalAmount,
    cartItemsCount,
    settings,
    user,
    createOrder,
    setCurrentPage,
    addToast,
  } = useStore();

  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('تهران، خیابان ولیعصر، مجتمع دیجیتال پازل کالا');
  const [postalCode, setPostalCode] = useState('1998765432');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod' | 'wallet'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const freeShippingThreshold = settings.freeShippingThreshold || 2000000;
  const baseShippingFee = settings.shippingFee || 49000;
  const shippingFee = cartTotalAmount >= freeShippingThreshold ? 0 : baseShippingFee;
  const totalAmount = cartTotalAmount + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      addToast('لطفاً نام گیرنده را وارد کنید', 'error');
      return;
    }
    if (!recipientPhone.trim()) {
      addToast('لطفاً شماره تماس را وارد کنید', 'error');
      return;
    }
    if (!address.trim()) {
      addToast('لطفاً آدرس تحویل سفارش را وارد کنید', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        customerName: recipientName.trim(),
        customerPhone: recipientPhone.trim(),
        customerAddress: address.trim(),
        postalCode: postalCode.trim(),
        shippingFee,
        paymentMethod,
        paymentStatus: 'paid',
      });

      if (order) {
        setCreatedOrder(order);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      addToast('خطا در ثبت نهایی سفارش', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Success View
  if (createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center select-none animate-fadeIn" id="order-success-view">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">سفارش شما با موفقیت ثبت شد!</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              پیامک تایید سفارش و کد رهگیری پستی به شماره{' '}
              <span className="font-mono font-bold text-slate-800" dir="ltr">
                {createdOrder.customerPhone}
              </span>{' '}
              ارسال گردید.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-right">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">کد رهگیری سفارش:</span>
              <span className="font-mono font-black text-emerald-600 text-sm">
                #{createdOrder.orderNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">مبلغ پرداخت شده:</span>
              <span className="font-mono font-bold text-slate-900">
                {createdOrder.totalAmount.toLocaleString('fa-IR')} تومان
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">روش پرداخت:</span>
              <span className="font-bold text-slate-800">
                {createdOrder.paymentMethod === 'online' ? 'درگاه بانکی شاپرک' : 'کیف پول'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">تحویل‌گیرنده:</span>
              <span className="font-bold text-slate-800">{createdOrder.customerName}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                window.location.hash = '#profile-orders';
                setCurrentPage('profile');
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              مشاهده در پنل کاربری
            </button>
            <button
              onClick={() => {
                window.location.hash = '';
                setCurrentPage('home');
              }}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-700 text-base">سبد خرید شما خالی است</h3>
        <button
          onClick={() => setCurrentPage('products')}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
        >
          مشاهده کاتالوگ محصولات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 select-none animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <button
          onClick={() => setCurrentPage('cart')}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900">تسویه حساب و تکمیل سفارش</h1>
          <span className="text-xs text-slate-400">آدرس تحویل کالا و انتخاب درگاه پرداخت</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Address and Shipping details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Address Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-sm text-slate-900">مشخصات گیرنده و نشانی پستی</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">نام و نام خانوادگی گیرنده</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="مثال: محمد احمدی"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">شماره تماس همراه</label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="09xxxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1.5">نشانی پستی دقیق</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="استان، شهر، خیابان، پلاک، واحد..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">کد پستی ۱۰ رقمی</label>
                <input
                  type="text"
                  dir="ltr"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="1xxxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-sm text-slate-900">انتخاب روش پرداخت</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="accent-emerald-600"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">درگاه پرداخت امن شاپرک</span>
                  <span className="text-[11px] text-slate-500">کارت‌های عضو شتاب با رمز دوم پویا</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'wallet'}
                  onChange={() => setPaymentMethod('wallet')}
                  className="accent-emerald-600"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">پرداخت از کیف پول</span>
                  <span className="text-[11px] text-slate-500">
                    موجودی: {Number(user?.walletBalance || 0).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4 text-xs">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3">
              خلاصه نهایی سفارش
            </h3>

            {/* Items count */}
            <div className="flex items-center justify-between text-slate-600">
              <span>تعداد اقلام:</span>
              <span className="font-bold text-slate-900">{cartItemsCount} کالا</span>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-slate-600">
              <span>مبلغ کالاها:</span>
              <span className="font-mono font-bold text-slate-900">
                {cartTotalAmount.toLocaleString('fa-IR')} تومان
              </span>
            </div>

            {/* Shipping fee */}
            <div className="flex items-center justify-between text-slate-600">
              <span>هزینه ارسال:</span>
              <span className="font-mono font-bold">
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">رایگان</span>
                ) : (
                  `${shippingFee.toLocaleString('fa-IR')} تومان`
                )}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">مبلغ کل قابل پرداخت:</span>
              <span className="text-base font-black text-emerald-600 font-mono">
                {totalAmount.toLocaleString('fa-IR')}{' '}
                <span className="text-xs font-normal text-slate-500">تومان</span>
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <span>در حال ثبت سفارش...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تکمیل و پرداخت نهایی</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>خرید امن با ضمانت اصالت پازل کالا</span>
            </div>
            <p>کلیه سفارشات دارای بیمه مرسوله پستی و مهلت تست سلامت فیزیکی ۷ روزه هستند.</p>
          </div>
        </div>
      </form>
    </div>
  );
};
