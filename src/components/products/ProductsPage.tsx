import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingCart, Check, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { Product } from '../../types.ts';

export const ProductsPage: React.FC = () => {
  const { products, searchQuery, setSearchQuery, addToCart, setSelectedProduct, setCurrentPage } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Extract unique categories & brands
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
      else if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brandPersian) set.add(p.brandPersian);
      else if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (onlyInStock && !p.inStock) return false;
        if (selectedCategory !== 'all') {
          const matchCat = p.categoryName === selectedCategory || p.category === selectedCategory;
          if (!matchCat) return false;
        }
        if (selectedBrand !== 'all') {
          const matchBrand = p.brandPersian === selectedBrand || p.brand === selectedBrand;
          if (!matchBrand) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.persianName?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q) || p.brandPersian?.toLowerCase().includes(q);
          if (!matchName && !matchBrand) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [products, onlyInStock, selectedCategory, selectedBrand, searchQuery, sortBy]);

  return (
    <div className="space-y-6 select-none">
      {/* Top filters bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-emerald-600" />
          <h2 className="font-black text-slate-900 text-sm sm:text-base">
            کاتالوگ محصولات ({filteredProducts.length} کالا)
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Only in stock */}
          <button
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
              onlyInStock
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {onlyInStock && <Check className="w-3.5 h-3.5" />}
            <span>فقط کالاهای موجود</span>
          </button>

          {/* Categories */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">همه دسته‌بندی‌ها</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Brands */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">همه برندها</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="newest">جدیدترین</option>
            <option value="price-asc">ارزان‌ترین</option>
            <option value="price-desc">گران‌ترین</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center space-y-3 border border-slate-100">
          <Search className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-600 text-sm">هیچ کالایی با فیلترهای انتخابی یافت نشد</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedBrand('all');
              setOnlyInStock(false);
              setSearchQuery('');
            }}
            className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
          >
            حذف فیلترها و نمایش همه
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map((p) => (
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
                <div className="aspect-square bg-slate-50 rounded-xl p-3 mb-2 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={p.images?.[0] || '/logo.png'}
                    alt={p.persianName}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {!p.inStock && (
                    <span className="absolute top-2 right-2 bg-slate-800/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                      ناموجود
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">
                    {p.brandPersian || p.brand}
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {p.persianName}
                  </h3>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {p.inStock ? (
                    <>
                      <span className="text-xs font-black text-slate-900">
                        {p.price.toLocaleString('fa-IR')}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal">تومان</span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-rose-500">ناموجود</span>
                  )}
                </div>

                {p.inStock && (
                  <button
                    onClick={() => addToCart(p)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl transition-colors cursor-pointer"
                    title="افزودن به سبد خرید"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
