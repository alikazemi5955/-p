import React from 'react';
import { Award, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const BestsellersShowcase: React.FC = () => {
  const { products, addToCart, setSelectedProduct, setCurrentPage } = useStore();

  const items = products.filter((p) => p.inStock).slice(6, 12);

  if (items.length === 0) return null;

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-black text-slate-900 text-base sm:text-lg">پرفروش‌ترین‌های پازل کالا</h3>
        </div>
        <button
          onClick={() => setCurrentPage('products')}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
        >
          مشاهده کاتالوگ کامل
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl p-3 border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
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
                <span className="text-xs font-black text-slate-900">
                  {p.price.toLocaleString('fa-IR')}
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">تومان</span>
              </div>

              <button
                onClick={() => addToCart(p)}
                className="p-2 bg-slate-100 hover:bg-emerald-600 text-slate-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                title="افزودن به سبد"
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
