import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Product,
  CartItem,
  Order,
  User,
  StoreSettings,
  Toast,
  PageType,
  ProductVariantOption,
} from '../types.ts';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  user: User | null;
  settings: StoreSettings;
  currentPage: PageType;
  selectedProduct: Product | null;
  quickViewProduct: Product | null;
  isCartDrawerOpen: boolean;
  isAuthModalOpen: boolean;
  isAppDownloadModalOpen: boolean;
  isShippingTariffModalOpen: boolean;
  searchQuery: string;
  toasts: Toast[];
  isServerConnected: boolean;
  isServerSyncing: boolean;

  // Actions
  setCurrentPage: (page: PageType) => void;
  setSelectedProduct: (product: Product | null) => void;
  setQuickViewProduct: (product: Product | null) => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsAppDownloadModalOpen: (open: boolean) => void;
  setIsShippingTariffModalOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  // Cart
  addToCart: (product: Product, variant?: ProductVariantOption, qty?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  cartTotalAmount: number;
  cartItemsCount: number;

  // User & Auth
  login: (userData: User) => void;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;

  // Orders
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;

  // Products
  reloadProducts: () => Promise<void>;

  // Toasts
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('puzzlekala_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem('puzzlekala_orders');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const cached = localStorage.getItem('puzzlekala_cart');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('puzzlekala_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const cached = localStorage.getItem('puzzlekala_settings');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    try {
      if (typeof window !== 'undefined') {
        const hash = (window.location.hash || '').toLowerCase();
        const pathname = (window.location.pathname || '').toLowerCase();
        const search = (window.location.search || '').toLowerCase();

        if (hash.includes('admin') || pathname.includes('/admin') || search.includes('admin')) return 'admin';
        if (hash.includes('hesabdari') || hash.includes('pazel-hesab')) return 'hesabdari';
        if (
          hash.includes('profile') ||
          hash.includes('orders') ||
          hash.includes('account') ||
          hash.includes('wallet') ||
          hash.includes('addresses') ||
          hash.includes('reviews') ||
          hash.includes('lists')
        ) return 'profile';
        if (hash.includes('cart')) return 'cart';
        if (hash.includes('checkout')) return 'checkout';
        if (hash.includes('products')) return 'products';
        if (hash.includes('easy-buy')) return 'easy-buy';
        if (hash.includes('categories')) return 'categories';
      }
    } catch {}
    return 'home';
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAppDownloadModalOpen, setIsAppDownloadModalOpen] = useState<boolean>(false);
  const [isShippingTariffModalOpen, setIsShippingTariffModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true);
  const [isServerSyncing, setIsServerSyncing] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('puzzlekala_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('puzzlekala_user', JSON.stringify(user));
      else localStorage.removeItem('puzzlekala_user');
    } catch {}
  }, [user]);

  // Toast helper
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch initial data from server
  const reloadProducts = useCallback(async () => {
    try {
      setIsServerSyncing(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          localStorage.setItem('puzzlekala_products', JSON.stringify(data));
          setIsServerConnected(true);
        }
      }
    } catch {
      setIsServerConnected(false);
    } finally {
      setIsServerSyncing(false);
    }
  }, []);

  const reloadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        localStorage.setItem('puzzlekala_settings', JSON.stringify(data));
      }
    } catch {}
  }, []);

  const reloadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
          localStorage.setItem('puzzlekala_orders', JSON.stringify(data));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    reloadProducts();
    reloadSettings();
    reloadOrders();
  }, [reloadProducts, reloadSettings, reloadOrders]);

  // Cart operations
  const addToCart = useCallback(
    (product: Product, variant?: ProductVariantOption, qty: number = 1) => {
      setCart((prev) => {
        const variantKey = variant ? variant.name : 'default';
        const cartItemId = `${product.id}_${variantKey}`;
        const existingIdx = prev.findIndex((item) => item.id === cartItemId);
        const unitPrice = variant?.price ?? product.price;

        if (existingIdx !== -1) {
          const updated = [...prev];
          const newQty = updated[existingIdx].quantity + qty;
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: newQty,
            totalPrice: newQty * unitPrice,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: cartItemId,
              productId: product.id,
              product,
              selectedVariant: variant,
              quantity: qty,
              unitPrice,
              totalPrice: qty * unitPrice,
            },
          ];
        }
      });
      addToast(`«${product.persianName}» به سبد خرید اضافه شد`, 'success');
    },
    [addToast]
  );

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  }, []);

  const updateCartQuantity = useCallback((cartItemId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              quantity: qty,
              totalPrice: qty * item.unitPrice,
            }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // User auth
  const login = useCallback(
    (userData: User) => {
      setUser(userData);
      addToast(`خوش آمدید، ${userData.name || userData.username}`, 'success');
    },
    [addToast]
  );

  const logout = useCallback(() => {
    setUser(null);
    addToast('از حساب کاربری خارج شدید', 'info');
  }, [addToast]);

  const updateUserProfile = useCallback(
    async (data: Partial<User>): Promise<boolean> => {
      if (!user) return false;
      const updated = { ...user, ...data };
      setUser(updated);
      try {
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        addToast('اطلاعات کاربری با موفقیت بروزرسانی شد', 'success');
        return true;
      } catch {
        addToast('خطا در ذخیره‌سازی اطلاعات کاربری', 'error');
        return false;
      }
    },
    [user, addToast]
  );

  // Orders
  const createOrder = useCallback(
    async (orderData: Partial<Order>): Promise<Order | null> => {
      try {
        const orderNumber = 'PZK-' + Math.floor(100000 + Math.random() * 900000);
        const newOrder: Order = {
          id: 'ord_' + Date.now(),
          orderNumber,
          customerName: orderData.customerName || user?.name || 'مشتری پازل کالا',
          customerPhone: orderData.customerPhone || user?.phone || '',
          customerAddress: orderData.customerAddress || '',
          postalCode: orderData.postalCode || '',
          items: cart.map((c) => ({
            productId: c.productId,
            name: c.product.name,
            persianName: c.product.persianName,
            image: c.product.images?.[0] || '',
            quantity: c.quantity,
            price: c.unitPrice,
            totalPrice: c.totalPrice,
            selectedVariant: c.selectedVariant?.name,
          })),
          itemsCount: cartItemsCount,
          subtotal: cartTotalAmount,
          shippingFee: orderData.shippingFee ?? (settings.shippingFee || 49000),
          discountAmount: orderData.discountAmount || 0,
          totalAmount:
            cartTotalAmount +
            (orderData.shippingFee ?? (settings.shippingFee || 49000)) -
            (orderData.discountAmount || 0),
          status: 'processing',
          paymentMethod: orderData.paymentMethod || 'online',
          paymentStatus: 'paid',
          createdAt: new Date().toISOString(),
          ...orderData,
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder),
        });

        if (res.ok) {
          setOrders((prev) => [newOrder, ...prev]);
          clearCart();
          addToast(`سفارش شماره ${orderNumber} با موفقیت ثبت شد`, 'success');
          return newOrder;
        }
        return null;
      } catch (err) {
        addToast('خطا در ثبت نهایی سفارش', 'error');
        return null;
      }
    },
    [cart, cartItemsCount, cartTotalAmount, settings, user, clearCart, addToast]
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        cart,
        user,
        settings,
        currentPage,
        selectedProduct,
        quickViewProduct,
        isCartDrawerOpen,
        isAuthModalOpen,
        isAppDownloadModalOpen,
        isShippingTariffModalOpen,
        searchQuery,
        toasts,
        isServerConnected,
        isServerSyncing,
        setCurrentPage,
        setSelectedProduct,
        setQuickViewProduct,
        setIsCartDrawerOpen,
        setIsAuthModalOpen,
        setIsAppDownloadModalOpen,
        setIsShippingTariffModalOpen,
        setSearchQuery,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalAmount,
        cartItemsCount,
        login,
        logout,
        updateUserProfile,
        createOrder,
        reloadProducts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
