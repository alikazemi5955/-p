import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const CartPage: React.FC = () => {
  const {
    cart,
    cartTotalAmount,
    cartItemsCount,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    settings,
    setCurrentPage,
    setSelectedProduct,
    addToast,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const freeShippingThreshold = settings.freeShippingThreshold || 2000000;
  const baseShippingFee = settings.shippingFee || 49000;
  const shippingFee = cartTotalAmount >= freeShippingThreshold ? 0 : baseShippingFee;
  const finalTotal = Math.max(0, cartTotalAmount + shippingFee - couponDiscount);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotalAmount);
  const freeShippingProgress = Math.min(100, Math.round((cartTotalAmount / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'PUZZLE15') {
      const discount = Math.round(cartTotalAmount * 0.15);
      setCouponDiscount(discount);
      addToast('کد تخفیف ۱۵٪ پازل کالا با موفقیت اعمال شد', 'success');
    } else if (code === 'WELCOME' || code === 'NEW') {
      const discount = 500000;
      setCouponDiscount(discount);
      addToast('کد تخفیف ۵۰۰ هزار تومانی خوش‌آمدگویی اعمال شد', 'success');
    } else {
      addToast('کد تخفیف وارد شده معتبر نیست یا منقضی شده است', 'error');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center select-none" id="empty-cart-view">
        <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">سبد خرید شما در حال حاضر خالی است!</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8">
          می‌توانید برای مشاهده محصولات و کالاهای دیجیتال با گارانتی معتبر به صفحه فروشگاه بازگردید.
        </p>
        <button
          onClick={() => setCurrentPage('products')}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <span>مشاهده و خرید کالاها</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 select-none animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900">
              سبد خرید شما ({cartItemsCount} کالا)
            </h1>
            <span className="text-xs text-slate-400">بررسی اقلام انتخابی و پیش‌فاکتور</span>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>حذف کل سبد</span>
        </button>
      </div>

      {/* Free shipping progress bar */}
      <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>
              {shippingFee === 0
                ? 'ارسال رایگان پازل کالا برای این سفارش فعال شد!'
                : `با افزودن ${remainingForFreeShipping.toLocaleString('fa-IR')} تومان دیگر، ارسال شما رایگان می‌شود.`}
            </span>
          </div>
          <span className="font-mono text-emerald-700 font-black">{freeShippingProgress}٪</span>
        </div>
        <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Items list + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Items list */}
        <div className="lg:col-span-8 space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center gap-4 group"
            >
              <div
                className="w-24 h-24 aspect-square bg-slate-50 rounded-2xl p-2 flex items-center justify-center shrink-0 cursor-pointer"
                onClick={() => {
                  setSelectedProduct(item.product);
                  setCurrentPage('product-detail');
                }}
              >
                <img
                  src={item.product.images?.[0] || '/logo.png'}
                  alt={item.product.persianName}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1 text-right">
                <span className="text-[10px] text-slate-400 font-bold">
                  {item.product.brandPersian || item.product.brand}
                </span>
                <h3
                  className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => {
                    setSelectedProduct(item.product);
                    setCurrentPage('product-detail');
                  }}
                >
                  {item.product.persianName}
                </h3>
                {item.selectedVariant && (
                  <p className="text-[11px] text-slate-500 font-medium">
                    رنگ / مدل:{' '}
                    <span className="text-slate-800 font-bold">{item.selectedVariant.name}</span>
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {item.selectedVariant?.guarantee || '۱۸ ماه گارانتی شرکتی و اصالت کالا'}
                  </span>
                </div>
              </div>

              {/* Price & Quantity Controls */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 block">
                    {item.totalPrice.toLocaleString('fa-IR')}{' '}
                    <span className="text-[10px] font-normal text-slate-500">تومان</span>
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-[10px] text-slate-400 block font-mono">
                      هر عدد: {item.unitPrice.toLocaleString('fa-IR')} تومان
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200/80 p-1">
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-slate-600 hover:text-emerald-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold font-mono px-2">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4 text-xs">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3">
              خلاصه فاکتور سفارش
            </h3>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-slate-600">
              <span>قیمت کالاها ({cartItemsCount}):</span>
              <span className="font-mono font-bold text-slate-900">
                {cartTotalAmount.toLocaleString('fa-IR')} تومان
              </span>
            </div>

            {/* Shipping fee */}
            <div className="flex items-center justify-between text-slate-600">
              <span>هزینه بسته‌بندی و ارسال:</span>
              <span className="font-mono font-bold">
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">رایگان</span>
                ) : (
                  `${shippingFee.toLocaleString('fa-IR')} تومان`
                )}
              </span>
            </div>

            {/* Discount if applied */}
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between text-rose-600">
                <span>تخفیف کوپن:</span>
                <span className="font-mono font-bold">
                  -{couponDiscount.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">مبلغ قابل پرداخت:</span>
              <span className="text-base font-black text-emerald-600 font-mono">
                {finalTotal.toLocaleString('fa-IR')}{' '}
                <span className="text-xs font-normal text-slate-500">تومان</span>
              </span>
            </div>

            {/* Proceed to checkout button */}
            <button
              onClick={() => {
                setCurrentPage('checkout');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <span>ادامه فرآیند خرید</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Coupon Code Input Box */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2">
            <span className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>کد تخفیف یا کارت هدیه</span>
            </span>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="کد تخفیف (مثال: WELCOME)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-hidden focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                ثبت کد
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
