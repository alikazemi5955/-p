import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingCart,
  Check,
  Heart,
  Share2,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { ProductVariantOption } from '../../types.ts';

export const ProductDetailPage: React.FC = () => {
  const { selectedProduct, addToCart, setCurrentPage, addToast } = useStore();

  const product = selectedProduct;
  const variants = product?.variants?.[0]?.options || [];

  // Default selected variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantOption | undefined>(() => {
    if (variants.length > 0) {
      const inStockOption = variants.find((v) => v.inStock && (v.stock ?? 0) > 0);
      return inStockOption || variants[0];
    }
    return undefined;
  });

  // Keep selected variant in sync when active product changes
  useEffect(() => {
    if (variants.length > 0) {
      const inStockOption = variants.find((v) => v.inStock && (v.stock ?? 0) > 0);
      setSelectedVariant(inStockOption || variants[0]);
    } else {
      setSelectedVariant(undefined);
    }
  }, [product?.id]);

  // Robustly resolve active variant for current product
  const currentVariant = useMemo(() => {
    if (
      selectedVariant &&
      variants.some(
        (v) =>
          (v.sourceVariantId && v.sourceVariantId === selectedVariant.sourceVariantId) ||
          v.name === selectedVariant.name
      )
    ) {
      return selectedVariant;
    }
    if (variants.length > 0) {
      return variants.find((v) => v.inStock && (v.stock ?? 0) > 0) || variants[0];
    }
    return undefined;
  }, [selectedVariant, variants]);

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-bold">محصولی انتخاب نشده است</p>
        <button
          onClick={() => setCurrentPage('products')}
          className="mt-4 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
        >
          بازگشت به لیست محصولات
        </button>
      </div>
    );
  }

  const currentPrice = currentVariant?.price ?? product.price;
  const isAvailable = currentVariant
    ? (currentVariant.inStock && (currentVariant.stock ?? 0) > 0)
    : product.inStock;
  const currentStock = currentVariant ? (currentVariant.stock ?? 0) : product.stock;

  return (
    <div className="space-y-6 select-none animate-fadeIn pt-16">
      {/* Fixed Top Bar with Close (ضربدر) Button - Non-scrolling & Always on Top */}
      <div className="fixed top-0 inset-x-0 z-[999999] bg-slate-900 text-white border-b border-slate-700 shadow-2xl py-3 px-4 sm:px-6 flex items-center justify-between font-sans select-none" dir="rtl">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-100">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
          <span>پیش‌نمایش زنده صفحه کالا (مدیریت فروشگاه)</span>
        </div>

        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.setItem('puzzlekala_admin_active_tab', 'products');
              localStorage.setItem('puzzlekala_admin_active_tab', 'products');
              window.location.hash = '#admin-products';
            } catch (e) {}
            setCurrentPage('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg shadow-rose-600/40 border border-rose-500"
          title="بستن و بازگشت به صفحه محصولات در پنل مدیریت"
        >
          <X className="w-4 h-4" />
          <span>بستن و بازگشت به مدیریت محصولات</span>
        </button>
      </div>

      {/* Main product box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Product Images */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full aspect-square bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-100">
            <img
              src={product.images?.[0] || '/logo.png'}
              alt={product.persianName}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex items-center gap-4 mt-4 text-slate-400">
            <button
              onClick={() => addToast('به لیست علاقه‌مندی‌ها افزوده شد', 'info')}
              className="flex items-center gap-1 text-xs hover:text-rose-500 cursor-pointer"
            >
              <Heart className="w-4 h-4" />
              <span>علاقه‌مندی</span>
            </button>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  addToast('لینک محصول کپی شد', 'success');
                }
              }}
              className="flex items-center gap-1 text-xs hover:text-slate-700 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>اشتراک‌گذاری</span>
            </button>
          </div>
        </div>

        {/* Center & Right: Title, Variants, Guarantee & Purchase Box */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {product.brandPersian || product.brand}
              </span>
              {product.categoryName && (
                <span className="text-xs text-slate-400 font-medium">| {product.categoryName}</span>
              )}
            </div>

            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
              {product.persianName}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1" dir="ltr">
              {product.name}
            </p>

            {/* Variants selection */}
            {variants.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <span className="block text-xs font-bold text-slate-700">
                  انتخاب رنگ و مدل:{' '}
                  {currentVariant && (
                    <span className="text-emerald-700 font-black">{currentVariant.name}</span>
                  )}
                </span>

                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => {
                    const isSelected =
                      currentVariant?.name === v.name ||
                      (currentVariant?.sourceVariantId && currentVariant.sourceVariantId === v.sourceVariantId);
                    const optionInStock = v.inStock && (v.stock ?? 0) > 0;

                    return (
                      <button
                        key={v.sourceVariantId || v.id || i}
                        onClick={() => setSelectedVariant(v)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                            : optionInStock
                            ? 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                            : 'border-slate-200 bg-slate-100/70 text-slate-400 line-through opacity-70'
                        }`}
                      >
                        {v.colorCode && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0 shadow-2xs"
                            style={{ backgroundColor: v.colorCode }}
                          />
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{v.name}</span>
                        {!optionInStock && <span className="text-[10px] text-rose-500 font-normal">(ناموجود)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key Features & Guarantee */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  گارانتی:{' '}
                  <strong className="text-slate-800">
                    {selectedVariant?.guarantee || '۱۸ ماه گارانتی رسمی شرکتی و کد فعال‌سازی همتا'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>ارسال سریع توسط پست پیشتاز و تیپاکس با بسته‌بندی ضدضربه</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>۷ روز ضمانت بازگشت و مهلت تست سلامت فیزیکی پازل کالا</span>
              </div>
            </div>
          </div>

          {/* Pricing & Add to cart Box */}
          <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">قیمت مصرف‌کننده:</span>
              {isAvailable ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentPrice.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-xs font-normal text-slate-500">تومان</span>
                </div>
              ) : (
                <span className="text-base font-black text-rose-600">ناموجود در انبار</span>
              )}

              {isAvailable && currentStock > 0 && currentStock <= 5 && (
                <span className="text-[10px] text-amber-600 font-bold block mt-1">
                  تنها {currentStock} عدد در انبار باقی مانده است
                </span>
              )}
            </div>

            <button
              onClick={() => {
                if (isAvailable) {
                  addToCart(product, currentVariant);
                }
              }}
              disabled={!isAvailable}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                isAvailable
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isAvailable ? 'افزودن به سبد خرید' : 'اطلاع از موجودی'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
