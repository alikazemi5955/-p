import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { MobileAppNavBar } from './components/common/MobileAppNavBar.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';
import { OfflineBanner } from './components/common/OfflineBanner.tsx';
import { CartDrawer } from './components/cart/CartDrawer.tsx';
import { CartPage } from './components/cart/CartPage.tsx';
import { CheckoutPage } from './components/checkout/CheckoutPage.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { HomePage } from './components/pages/HomePage.tsx';
import { ProductsPage } from './components/products/ProductsPage.tsx';
import { ProductDetailPage } from './components/products/ProductDetailPage.tsx';
import { ProfilePage } from './components/profile/ProfilePage.tsx';
import { AdminPanel } from './components/admin/AdminPanel.tsx';
import { AdminLoginScreen } from './components/admin/AdminLoginScreen.tsx';

declare global {
  interface Window {
    openAdmin?: () => void;
    openHesabdari?: () => void;
    __triggerLoading?: (duration?: number) => void;
  }
}

const AppContent: React.FC = () => {
  const { currentPage, setCurrentPage } = useStore();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('puzzlekala_admin_authenticated') === 'true' ||
        sessionStorage.getItem('puzzlekala_admin_authenticated') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [isNavVisible, setIsNavVisible] = useState<boolean>(true);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  // Scroll listener for sticky header visibility
  useEffect(() => {
    let lastY = window.scrollY || 0;
    let accum = 0;
    let lastDir = 0;
    let currentVis = true;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
          if (currentY <= 260) {
            if (!currentVis) {
              currentVis = true;
              setIsNavVisible(true);
            }
            accum = 0;
            lastDir = 0;
          } else {
            const diff = currentY - lastY;
            if (diff > 0) {
              if (lastDir < 0) accum = 0;
              lastDir = 1;
              accum += diff;
              if (accum > 25 && currentVis) {
                currentVis = false;
                setIsNavVisible(false);
                accum = 0;
              }
            } else if (diff < 0) {
              if (lastDir > 0) accum = 0;
              lastDir = -1;
              accum += diff;
              if (accum < -18 && !currentVis) {
                currentVis = true;
                setIsNavVisible(true);
                accum = 0;
              }
            }
          }
          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hash & popstate synchronization
  useEffect(() => {
    const handleHash = () => {
      try {
        if (typeof window === 'undefined') return;
        const hash = (window.location.hash || '').toLowerCase();
        const pathname = (window.location.pathname || '').toLowerCase();
        const search = (window.location.search || '').toLowerCase();

        if (hash.includes('admin') || pathname.includes('/admin') || search.includes('admin')) {
          setCurrentPage('admin');
        } else if (hash.includes('hesabdari') || hash.includes('pazel-hesab') || search.includes('hesabdari')) {
          setCurrentPage('hesabdari');
        } else if (
          hash.includes('profile') ||
          hash.includes('orders') ||
          hash.includes('account') ||
          hash.includes('wallet') ||
          hash.includes('addresses') ||
          hash.includes('reviews') ||
          hash.includes('lists')
        ) {
          setCurrentPage('profile');
        } else if (hash.includes('products')) {
          setCurrentPage('products');
        } else if (hash.includes('cart')) {
          setCurrentPage('cart');
        } else if (hash.includes('checkout')) {
          setCurrentPage('checkout');
        } else if (hash.includes('easy-buy')) {
          setCurrentPage('easy-buy');
        } else if (!hash || hash === '#' || hash === '#home') {
          setCurrentPage('home');
        }
      } catch {}
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, [setCurrentPage]);

  // Keyboard shortcut Ctrl+Shift+A for Admin
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const modifier = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code ? e.code.toLowerCase() : '';
      if (modifier && shift && (key === 'a' || key === 'ش' || code === 'keya')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.hash = '#admin';
        setCurrentPage('admin');
      }
    };

    window.openAdmin = () => {
      window.location.hash = '#admin';
      setCurrentPage('admin');
    };

    window.openHesabdari = () => {
      window.location.hash = '#hesabdari';
      setCurrentPage('hesabdari');
    };

    window.addEventListener('keydown', onKey, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [setCurrentPage]);

  // Loading indicator on route changes
  useEffect(() => {
    setIsPageLoading(true);
    const tm = setTimeout(() => {
      setIsPageLoading(false);
    }, 250);
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => clearTimeout(tm);
  }, [currentPage]);

  // Admin View
  if (currentPage === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginScreen
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
          onCancel={() => {
            window.location.hash = '';
            setCurrentPage('home');
          }}
        />
      );
    }
    return (
      <AdminPanel
        onLogout={() => {
          localStorage.removeItem('puzzlekala_admin_authenticated');
          sessionStorage.removeItem('puzzlekala_admin_authenticated');
          setIsAdminAuthenticated(false);
        }}
      />
    );
  }

  // Hesabdari View
  if (currentPage === 'hesabdari') {
    return (
      <div className="min-h-screen bg-[#141c2b] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none" dir="rtl">
        <div className="max-w-md space-y-4 bg-slate-800/80 p-8 rounded-3xl border border-slate-700">
          <h2 className="text-xl font-black">سامانه حسابداری و مالی پازل کالا</h2>
          <p className="text-xs text-slate-300">
            برای ورود به بخش جامع حسابداری از پنل مدیریت استفاده کنید.
          </p>
          <button
            onClick={() => {
              window.location.hash = '';
              setCurrentPage('home');
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            بازگشت به فروشگاه
          </button>
        </div>
      </div>
    );
  }

  // Render Page Content
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'products':
      case 'categories':
      case 'easy-buy':
        return <ProductsPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'profile':
      case 'orders':
      case 'account':
      case 'wallet':
      case 'addresses':
      case 'reviews':
      case 'lists':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white w-full max-w-full relative" dir="rtl">
      {/* Loading Overlay */}
      {isPageLoading && (
        <div
          id="app-loading-screen"
          className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-[2px] flex items-center justify-center select-none animate-fadeIn transition-all duration-200"
        >
          <div
            id="app-loading-box"
            className="bg-transparent p-6 sm:p-8 flex flex-col items-center justify-center gap-3 w-[210px] sm:w-[240px]"
          >
            <div className="w-28 h-16 flex items-center justify-center bg-transparent">
              <img src="/logo.png?v=3" alt="پازل کالا" className="max-w-full max-h-full object-contain bg-transparent" />
            </div>
            <span id="app-loading-title" className="text-base sm:text-lg font-black text-black tracking-tight">
              پازل کالا
            </span>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '180ms' }} />
              <span className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '360ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Offline Alert */}
      <OfflineBanner />

      {/* Sticky Header Shelf */}
      <div className="sticky top-0 z-50 w-full max-w-full ios-3d-glass-shelf" id="sticky-header-container">
        <Header />
        <Navbar isVisible={isNavVisible} />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 animate-fadeIn pb-20 lg:pb-8">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Navigation Bar */}
      <MobileAppNavBar />

      {/* Modals & Drawers */}
      <CartDrawer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
