import React from 'react';
import { Flame, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const SpecialDealsSection: React.FC = () => {
  const { products, addToCart, setSelectedProduct, setCurrentPage } = useStore();

  const dealProducts = products
    .filter((p) => p.inStock)
    .slice(0, 6);

  if (dealProducts.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 rounded-3xl p-4 sm:p-6 text-white shadow-xl select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 border-b border-rose-400/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 backdrop-blur-xs rounded-xl">
            <Flame className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-lg sm:text-xl">پیشنهاد شگفت‌انگیز پازل کالا</h3>
            <p className="text-xs text-rose-100 font-medium">فرصت محدود خرید کالاهای دیجیتال با بهترین قیمت</p>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('products')}
          className="flex items-center gap-1.5 text-xs font-bold bg-white text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
        >
          <span>مشاهده همه</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Products Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {dealProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl p-3 text-slate-800 flex flex-col justify-between hover:shadow-lg transition-all group"
          >
            <div
              className="cursor-pointer"
              onClick={() => {
                setSelectedProduct(p);
                setCurrentPage('product-detail');
              }}
            >
              <div className="aspect-square bg-slate-50 rounded-xl p-2 mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src={p.images?.[0] || '/logo.png'}
                  alt={p.persianName}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                {p.persianName}
              </h4>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-rose-600">
                  {p.price.toLocaleString('fa-IR')}
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">تومان</span>
              </div>

              <button
                onClick={() => addToCart(p)}
                className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                title="افزودن به سبد خرید"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
