import React from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    cartTotalAmount,
    cartItemsCount,
    updateCartQuantity,
    removeFromCart,
    setCurrentPage,
  } = useStore();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-sm text-slate-900">سبد خرید شما ({cartItemsCount} کالا)</h3>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto" />
                <p className="text-sm font-bold text-slate-500">سبد خرید شما خالی است</p>
                <p className="text-xs text-slate-400">می‌توانید از صفحه اصلی کالاهای موردنظر را انتخاب کنید</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 relative group"
                >
                  <img
                    src={item.product.images?.[0] || '/logo.png'}
                    alt={item.product.persianName}
                    className="w-16 h-16 object-contain bg-white rounded-xl p-1 border border-slate-200/60 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.persianName}</h4>
                      {item.selectedVariant && (
                        <span className="text-[10px] text-slate-500 font-medium inline-block mt-0.5">
                          رنگ / تنوع: {item.selectedVariant.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-black text-slate-900">
                        {item.totalPrice.toLocaleString('fa-IR')}{' '}
                        <span className="text-[10px] font-normal text-slate-500">تومان</span>
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-1.5 py-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="text-slate-600 hover:text-emerald-600 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold font-mono px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="text-slate-600 hover:text-rose-600 cursor-pointer"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer checkout button */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">مجموع سفارش:</span>
                <span className="text-sm font-black text-slate-900">
                  {cartTotalAmount.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
                </span>
              </div>

              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setCurrentPage('checkout');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-xs"
              >
                <span>ادامه فرآیند خرید</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
