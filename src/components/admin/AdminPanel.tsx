import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
  Truck,
  Wallet,
  Headphones,
  MessageSquare,
  Settings,
  LogOut,
  Store,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Search,
  Flame,
  Image as ImageIcon,
  Grid,
  Send,
  KeyRound,
  Plus,
  Save,
  HelpCircle,
  Star,
  DollarSign,
  ShieldCheck,
  Menu,
  X,
  Eye,
  Globe,
  Calculator,
  Layers,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { Product, Order, User } from '../../types.ts';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const { products, orders, settings, reloadProducts, setCurrentPage, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#admin-')) {
        const sub = hash.replace('#admin-', '');
        if (sub) return sub;
      }
      const saved = sessionStorage.getItem('puzzlekala_admin_active_tab') || localStorage.getItem('puzzlekala_admin_active_tab');
      if (saved) return saved;
    } catch (e) {}
    return 'dashboard';
  });

  useEffect(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      const saved = sessionStorage.getItem('puzzlekala_admin_active_tab') || localStorage.getItem('puzzlekala_admin_active_tab');
      if (hash.includes('products') || saved === 'products') {
        setActiveTab('products');
      }
    } catch (e) {}
  }, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [productSourceFilter, setProductSourceFilter] = useState<'all' | 'puzzle' | 'kasra'>('all');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  // Sidebar Scroll Ref
  const sidebarNavRef = useRef<HTMLDivElement>(null);

  // Kasra sync stats state
  const [kasraStats, setKasraStats] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Supplementary data lists
  const [usersList, setUsersList] = useState<User[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>(orders);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [walletLogs, setWalletLogs] = useState<any[]>([]);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);

  // Search & Filter
  const [prodSearch, setProdSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');

  // Forms states
  // 1. Settings state
  const [storeSettings, setStoreSettings] = useState<any>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // 2. Ticket Reply state
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // 3. Wallet Adjust Form
  const [walletTargetUserId, setWalletTargetUserId] = useState('');
  const [walletAdjustAmount, setWalletAdjustAmount] = useState('');
  const [walletAdjustType, setWalletAdjustType] = useState<'deposit' | 'withdraw'>('deposit');
  const [walletAdjustReason, setWalletAdjustReason] = useState('');
  const [isSubmittingWallet, setIsSubmittingWallet] = useState(false);

  // 4. Send SMS Form
  const [smsTargetPhone, setSmsTargetPhone] = useState('');
  const [smsMessageText, setSmsMessageText] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);

  // 5. Admin Password Change
  const [newAdminUser, setNewAdminUser] = useState('admin');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // 6. فرم افزودن کالای جدید (Add Product Form)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProdTitleFa, setNewProdTitleFa] = useState('');
  const [newProdTitleEn, setNewProdTitleEn] = useState(''); // نام لاتین کالا *
  const [newProdBrand, setNewProdBrand] = useState(''); // برند *
  const [newProdCategory, setNewProdCategory] = useState(''); // دسته اصلی *
  const [newProdSubcategory, setNewProdSubcategory] = useState(''); // زیردسته تخصصی *
  const [newProdDescription, setNewProdDescription] = useState(''); // توضیحات/معرفی کالا *
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOldPrice, setNewProdOldPrice] = useState('');
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [newProdImageUrlInput, setNewProdImageUrlInput] = useState('');
  const [newProdSpecs, setNewProdSpecs] = useState<{ label: string; value: string }[]>([
    { label: '', value: '' },
  ]);
  const [newProdColors, setNewProdColors] = useState<{ name: string; hex: string }[]>([]);
  const [newProdColorNameInput, setNewProdColorNameInput] = useState('');
  const [newProdColorHexInput, setNewProdColorHexInput] = useState('#0f172a');
  const [newProdWarranties, setNewProdWarranties] = useState<string[]>([]);
  const [newProdWarrantyInput, setNewProdWarrantyInput] = useState('');
  const [addProductErrors, setAddProductErrors] = useState<Record<string, string>>({});
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // ریست کامل فرم افزودن کالا بدون مقادیر پیش‌فرض بی‌مورد
  const resetAddProductForm = () => {
    setNewProdTitleFa('');
    setNewProdTitleEn('');
    setNewProdBrand('');
    setNewProdCategory('');
    setNewProdSubcategory('');
    setNewProdDescription('');
    setNewProdPrice('');
    setNewProdOldPrice('');
    setNewProdImages([]);
    setNewProdImageUrlInput('');
    setNewProdSpecs([{ label: '', value: '' }]);
    setNewProdColors([]);
    setNewProdColorNameInput('');
    setNewProdColorHexInput('#0f172a');
    setNewProdWarranties([]);
    setNewProdWarrantyInput('');
    setAddProductErrors({});
  };

  // افزودن تصویر به آلبوم با اعتبارسنجی
  const handleAddProductImage = () => {
    const url = newProdImageUrlInput.trim();
    if (!url) {
      setAddProductErrors((prev) => ({ ...prev, images: 'لطفاً آدرس تصویر معتبر را وارد کنید' }));
      return;
    }
    setNewProdImages((prev) => [...prev, url]);
    setNewProdImageUrlInput('');
    setAddProductErrors((prev) => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });
  };

  const handleRemoveProductImage = (index: number) => {
    setNewProdImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // مدیریت سطرهای جدول مشخصات فنی
  const handleAddSpecRow = () => {
    setNewProdSpecs((prev) => [...prev, { label: '', value: '' }]);
  };

  const handleUpdateSpecRow = (index: number, field: 'label' | 'value', text: string) => {
    setNewProdSpecs((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: text } : row))
    );
  };

  const handleRemoveSpecRow = (index: number) => {
    setNewProdSpecs((prev) => prev.filter((_, idx) => idx !== index));
  };

  // افزودن رنگ به تنوع با اعتبارسنجی واقعی
  const handleAddColor = () => {
    const name = newProdColorNameInput.trim();
    if (!name) {
      setAddProductErrors((prev) => ({ ...prev, colors: 'لطفاً نام رنگ را وارد کنید' }));
      return;
    }
    if (newProdColors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setAddProductErrors((prev) => ({ ...prev, colors: 'این رنگ قبلاً اضافه شده است' }));
      return;
    }
    setNewProdColors((prev) => [...prev, { name, hex: newProdColorHexInput }]);
    setNewProdColorNameInput('');
    setAddProductErrors((prev) => {
      const copy = { ...prev };
      delete copy.colors;
      return copy;
    });
  };

  const handleRemoveColor = (name: string) => {
    setNewProdColors((prev) => prev.filter((c) => c.name !== name));
  };

  // افزودن گارانتی با اعتبارسنجی واقعی
  const handleAddWarranty = () => {
    const war = newProdWarrantyInput.trim();
    if (!war) {
      setAddProductErrors((prev) => ({ ...prev, warranties: 'عنوان گارانتی را وارد نمایید' }));
      return;
    }
    if (newProdWarranties.includes(war)) {
      setAddProductErrors((prev) => ({ ...prev, warranties: 'این گارانتی قبلاً اضافه شده است' }));
      return;
    }
    setNewProdWarranties((prev) => [...prev, war]);
    setNewProdWarrantyInput('');
    setAddProductErrors((prev) => {
      const copy = { ...prev };
      delete copy.warranties;
      return copy;
    });
  };

  const handleRemoveWarranty = (war: string) => {
    setNewProdWarranties((prev) => prev.filter((w) => w !== war));
  };

  // اعتبارسنجی واقعی و ثبت کالای جدید
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!newProdTitleFa.trim()) {
      errors.titleFa = 'وارد کردن نام فارسی کالا الزامی است';
    }
    if (!newProdTitleEn.trim()) {
      errors.titleEn = 'وارد کردن نام لاتین کالا الزامی است';
    }
    if (!newProdBrand.trim()) {
      errors.brand = 'وارد کردن برند کالا الزامی است';
    }
    if (!newProdCategory.trim()) {
      errors.category = 'وارد کردن دسته اصلی الزامی است';
    }
    if (!newProdSubcategory.trim()) {
      errors.subcategory = 'وارد کردن زیردسته تخصصی الزامی است';
    }
    if (!newProdDescription.trim()) {
      errors.description = 'توضیحات و معرفی کالا الزامی است';
    }
    const priceNum = Number(newProdPrice);
    if (!newProdPrice.trim() || isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'قیمت فروش معتبر به تومان الزامی است';
    }
    if (newProdImages.length === 0) {
      errors.images = 'حداقل یک تصویر برای آلبوم کالا الزامی است';
    }
    if (newProdColors.length === 0) {
      errors.colors = 'انتخاب حداقل یک رنگ برای تنوع کالا الزامی است';
    }
    if (newProdWarranties.length === 0) {
      errors.warranties = 'ثبت حداقل یک گارانتی معتبر برای کالا الزامی است';
    }

    if (Object.keys(errors).length > 0) {
      setAddProductErrors(errors);
      const firstError = Object.values(errors)[0];
      addToast(firstError, 'error');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const filteredSpecs = newProdSpecs.filter((s) => s.label.trim() && s.value.trim());
      const newProductItem: Partial<Product> = {
        id: `puzzle-manual-${Date.now()}`,
        name: newProdTitleEn.trim(),
        persianName: newProdTitleFa.trim(),
        brand: newProdBrand.trim(),
        brandPersian: newProdBrand.trim(),
        brandEn: newProdTitleEn.trim(),
        category: newProdCategory.trim(),
        categoryName: newProdCategory.trim(),
        subcategory: newProdSubcategory.trim(),
        description: newProdDescription.trim(),
        price: priceNum,
        oldPrice: newProdOldPrice.trim() && !isNaN(Number(newProdOldPrice)) ? Number(newProdOldPrice) : undefined,
        images: newProdImages,
        source: 'manual',
        inStock: true,
        stock: 10,
        variants: [
          {
            name: 'رنگ و گارانتی',
            options: newProdColors.map((c, i) => ({
              id: `var-${Date.now()}-${i}`,
              name: `${c.name} - ${newProdWarranties[0] || 'گارانتی اصالت'}`,
              colorName: c.name,
              colorCode: c.hex,
              price: priceNum,
              guarantee: newProdWarranties[0] || 'گارانتی اصالت کالا',
              inStock: true,
              stock: 10,
            })),
          },
        ],
        specifications: filteredSpecs.length > 0 ? [{ groupName: 'مشخصات فنی', items: filteredSpecs }] : [],
      };

      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductItem),
      });

      addToast('کالای جدید با موفقیت ثبت شد', 'success');
      resetAddProductForm();
      setIsAddProductModalOpen(false);
      reloadProducts();
    } catch {
      addToast('خطا در ثبت کالای جدید', 'error');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Fetch admin supplementary data
  const fetchAdminData = () => {
    fetch('/api/kasra/stats')
      .then((r) => r.json())
      .then((d) => setKasraStats(d))
      .catch(() => {});

    fetch('/api/users')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setUsersList(d))
      .catch(() => {});

    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setOrdersList(d))
      .catch(() => {});

    fetch('/api/tickets')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setTicketsList(d))
      .catch(() => {});

    fetch('/api/wallet/transactions')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setWalletLogs(d))
      .catch(() => {});

    fetch('/api/sms/history')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSmsLogs(d))
      .catch(() => {});

    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => d && setStoreSettings(d))
      .catch(() => {});
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (orders.length > 0) setOrdersList(orders);
  }, [orders]);

  // Handle Manual Kasra Sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/kasra/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('همگام‌سازی کاتالوگ با کسری پلاس با موفقیت انجام شد', 'success');
        fetchAdminData();
        reloadProducts();
      } else {
        addToast(data.message || 'خطا در همگام‌سازی با کسری پلاس', 'error');
      }
    } catch {
      addToast('خطا در فراخوانی وب‌سرویس همگام‌سازی', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`آیا از حذف محصول «${name}» اطمینان دارید؟`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`محصول «${name}» حذف گردید`, 'info');
        reloadProducts();
      }
    } catch {
      addToast('خطا در حذف محصول', 'error');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`آیا از حذف کاربر «${name}» اطمینان دارید؟`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`کاربر «${name}» حذف گردید`, 'info');
        fetchAdminData();
      }
    } catch {
      addToast('خطا در حذف کاربر', 'error');
    }
  };

  // Handle Order Status Change
  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        addToast('وضعیت سفارش بروزرسانی شد', 'success');
        fetchAdminData();
      }
    } catch {
      addToast('خطا در بروزرسانی وضعیت سفارش', 'error');
    }
  };

  // Handle Delete Order
  const handleDeleteOrder = async (id: string, orderNumber: string) => {
    if (!window.confirm(`آیا از حذف سفارش شماره #${orderNumber} اطمینان دارید؟`)) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`سفارش #${orderNumber} حذف گردید`, 'info');
        fetchAdminData();
      }
    } catch {
      addToast('خطا در حذف سفارش', 'error');
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeSettings),
      });
      if (res.ok) {
        addToast('تنظیمات فروشگاه با موفقیت ذخیره شد', 'success');
      }
    } catch {
      addToast('خطا در ذخیره تنظیمات', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Ticket Reply
  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: ticketReplyText.trim(), status: 'answered' }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('پاسخ تیکت با موفقیت ارسال شد', 'success');
        setTicketReplyText('');
        setSelectedTicket(data.ticket);
        fetchAdminData();
      }
    } catch {
      addToast('خطا در ارسال پاسخ تیکت', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Handle Wallet Adjustment
  const handleWalletAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(walletAdjustAmount);
    if (!walletTargetUserId || isNaN(amountNum) || amountNum <= 0 || !walletAdjustReason.trim()) {
      addToast('لطفاً همه فیلدهای تراکنش کیف پول را به درستی تکمیل کنید', 'error');
      return;
    }
    setIsSubmittingWallet(true);
    try {
      const res = await fetch('/api/wallet/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: walletTargetUserId,
          amount: amountNum,
          type: walletAdjustType,
          reason: walletAdjustReason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('تراکنش کیف پول با موفقیت ثبت و اعمال گردید', 'success');
        setWalletAdjustAmount('');
        setWalletAdjustReason('');
        fetchAdminData();
      } else {
        addToast(data.error || 'خطا در ثبت تراکنش کیف پول', 'error');
      }
    } catch {
      addToast('خطا در ارتباط با سرور کیف پول', 'error');
    } finally {
      setIsSubmittingWallet(false);
    }
  };

  // Handle Send SMS
  const handleSendSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsTargetPhone.trim() || !smsMessageText.trim()) {
      addToast('لطفاً شماره گیرنده و متن پیامک را وارد کنید', 'error');
      return;
    }
    setIsSendingSms(true);
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: smsTargetPhone.trim(), message: smsMessageText.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast('درخواست پیامک در صف ارسال قرار گرفت', 'success');
        setSmsMessageText('');
        fetchAdminData();
      } else {
        addToast(data.error || 'خطا در ارسال پیامک', 'error');
      }
    } catch {
      addToast('خطا در ارسال پیامک', 'error');
    } finally {
      setIsSendingSms(false);
    }
  };

  // Handle Admin Credentials Change
  const handleChangeAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPass.trim()) {
      addToast('رمز عبور جدید نمی‌تواند خالی باشد', 'error');
      return;
    }
    setIsChangingPass(true);
    try {
      const res = await fetch('/api/admin/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newAdminUser.trim(), password: newAdminPass.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('مشخصات ورود مدیر با موفقیت تغییر یافت', 'success');
        setNewAdminPass('');
      }
    } catch {
      addToast('خطا در تغییر مشخصات مدیر', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  const todayPersianDate = new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badge?: string | null;
  }

  const navGroups: NavItem[][] = [
    // گروه ۱: پیشخوان و نظارت هوشمند
    [
      { id: 'dashboard', label: 'داشبورد و وضعیت کلی', icon: LayoutDashboard },
      {
        id: 'kasra-sync',
        label: 'همگام‌سازی کسری پلاس',
        icon: RefreshCw,
        badge: kasraStats?.status === 'SUCCESS' ? 'فعال' : null,
      },
    ],
    // گروه ۲: مدیریت کاتالوگ و انبارداری
    [
      { id: 'products', label: 'محصولات و تنوع‌ها', icon: Package, count: products.length },
      { id: 'banners', label: 'بنرها و اعلان‌ها', icon: ImageIcon },
      { id: 'homepage-boxes', label: 'باکس‌های صفحه اصلی', icon: Grid },
    ],
    // گروه ۳: سفارش‌ها، کاربران و امور مالی
    [
      { id: 'orders', label: 'سفارش‌ها و مرسولات', icon: ShoppingBag, count: ordersList.length },
      { id: 'users', label: 'کاربران و مشتریان', icon: Users, count: usersList.length },
      { id: 'wallet', label: 'کیف پول و تراکنش‌ها', icon: Wallet, count: walletLogs.length },
      { id: 'support', label: 'تیکت‌های پشتیبانی', icon: Headphones, count: ticketsList.length },
    ],
    // گروه ۴: بازاریابی، ارسال و تنظیمات
    [
      { id: 'reviews', label: 'نظرات و پرسش‌ها', icon: Star },
      { id: 'offers', label: 'تخفیف‌های شگفت‌انگیز', icon: Flame },
      { id: 'shipping', label: 'ارسال و تعرفه پستی', icon: Truck },
      { id: 'sms', label: 'سامانه پیامک (SMS)', icon: MessageSquare, count: smsLogs.length },
      { id: 'settings', label: 'تنظیمات کلی فروشگاه', icon: Settings },
      { id: 'profile', label: 'امنیت و حساب مدیر', icon: KeyRound },
    ],
  ];

  return (
    <div className="h-screen w-full bg-slate-100 text-slate-800 flex flex-col select-none overflow-hidden" dir="rtl">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg border-b border-slate-800 backdrop-blur-md shrink-0">
        {/* Right side: Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="منوی مدیریت"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-white shadow-md shadow-emerald-950/40">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white">پنل مدیریت</span>
                <span className="font-black text-sm text-emerald-400">پازل کالا</span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                نسخه جامع فروشگاهی و سامانه یکپارچه
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Persian Date Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>امروز: {todayPersianDate}</span>
        </div>

        {/* Left side: Navigation Shortcuts & Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => {
              window.location.hash = '';
              setCurrentPage('home');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="بازگشت به سایت فروشگاه"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>مشاهده فروشگاه</span>
          </button>

          <button
            onClick={() => {
              window.location.hash = '#hesabdari';
              setCurrentPage('hesabdari');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="سامانه حسابداری و محاسبات چک پازل حساب"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-400" />
            <span>پازل حساب</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 hover:border-transparent text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="خروج امن از پنل مدیریت"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative w-72 bg-white h-full p-4 shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                    P
                  </div>
                  <span className="font-black text-sm text-slate-900">منوی مدیریت فروشگاه</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {navGroups.map((group, gIdx) => (
                  <div key={gIdx} className={gIdx > 0 ? 'pt-2 border-t border-slate-100 space-y-1' : 'space-y-1'}>
                    {group.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.count !== undefined && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 mt-4">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.location.hash = '';
                  setCurrentPage('home');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>مشاهده سایت فروشگاه</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج امن از مدیریت</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout: Sidebar & Content Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden w-full">
        {/* Sidebar Nav (Desktop) with Independent Scroll & Up/Down Arrows */}
        <aside
          onWheel={(e) => {
            if (sidebarNavRef.current) {
              sidebarNavRef.current.scrollBy({ top: e.deltaY });
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-l border-slate-200 shrink-0 h-full overflow-hidden select-none"
        >
          {/* Top Title */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-center bg-slate-50/70 shrink-0">
            <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
              بخش‌های مدیریت فروشگاه
            </div>
          </div>

          {/* Dedicated Independent Scrollable Nav Items */}
          <div
            ref={sidebarNavRef}
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 p-3 space-y-3 admin-sidebar-scroll overflow-y-scroll overscroll-contain overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#10b981_#f1f5f9]"
          >
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className={gIdx > 0 ? 'pt-2.5 border-t border-slate-200/80 space-y-1' : 'space-y-1'}>
                {group.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : item.count !== undefined ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Sidebar bottom links */}
            <div className="pt-3 border-t border-slate-200 space-y-1">
              <button
                onClick={() => {
                  window.location.hash = '';
                  setCurrentPage('home');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>مشاهده سایت فروشگاه</span>
              </button>
              <button
                onClick={() => {
                  window.location.hash = '#hesabdari';
                  setCurrentPage('hesabdari');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>پازل حساب (محاسبات چک)</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج امن از سیستم</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 h-full overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 min-w-0 overflow-x-hidden">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Box 1: وضعیت پازل کالا */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logo.png"
                      alt="پازل کالا"
                      className="w-8 h-8 rounded-xl object-contain bg-white shadow-2xs border border-slate-100 p-0.5"
                    />
                    <h2 className="text-base font-black text-slate-900">وضعیت پازل کالا</h2>
                  </div>
                </div>

                {(() => {
                  const manualProducts = products.filter(
                    (p) => !String(p.id).startsWith('kasra-') && p.source !== 'kasraplus'
                  );
                  const inStockCount = manualProducts.filter((p) => p.inStock && (p.stock ?? 0) > 0).length;
                  const outOfStockCount = manualProducts.filter((p) => !p.inStock || (p.stock ?? 0) === 0).length;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* کل محصولات پازل کالا */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/80 space-y-1">
                        <span className="text-xs font-bold text-slate-500 block">کل محصولات پازل کالا</span>
                        <span className="text-2xl font-black text-slate-900 font-mono block">
                          {manualProducts.length.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-normal">محصولات ثبت‌شده دستی در فروشگاه</span>
                      </div>

                      {/* محصولات موجود در انبار */}
                      <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100/80 space-y-1">
                        <span className="text-xs font-bold text-emerald-800 block">محصولات موجود در انبار</span>
                        <span className="text-2xl font-black text-emerald-700 font-mono block">
                          {inStockCount.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-[11px] text-emerald-600 block font-normal">آماده سفارش و تحویل فوری</span>
                      </div>

                      {/* محصولات ناموجود در انبار */}
                      <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100/80 space-y-1">
                        <span className="text-xs font-bold text-rose-800 block">محصولات ناموجود در انبار</span>
                        <span className="text-2xl font-black text-rose-700 font-mono block">
                          {outOfStockCount.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-[11px] text-rose-600 block font-normal">در انتظار تأمین موجودی</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Box 2: وضعیت کسری پلاس */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://plus.kasrapars.ir/favicon.ico"
                      alt="کسری پلاس"
                      className="w-8 h-8 rounded-xl object-contain bg-indigo-50 border border-indigo-100 p-1"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-slate-900">وضعیت کسری پلاس</h2>
                        {kasraStats?.status === 'SUCCESS' && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            متصل و پایدار
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        استخراج مستقل تمام واریانت‌ها، محاسبه قیمت منبع × ۱.۰۵ (۵٪ مارک‌آپ) و بروزرسانی خودکار موجودی
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'در حال همگام‌سازی...' : 'اجرای همگام‌سازی دستی'}</span>
                  </button>
                </div>

                {(() => {
                  const kasraProducts = products.filter(
                    (p) => String(p.id).startsWith('kasra-') || p.source === 'kasraplus'
                  );
                  const totalKasra =
                    kasraStats?.totalProductsCount ??
                    kasraStats?.totalCatalogCount ??
                    kasraProducts.length;
                  const inStockKasra =
                    kasraStats?.inStockCount ??
                    kasraProducts.filter((p) => p.inStock && (p.stock ?? 0) > 0).length;
                  const outOfStockKasra =
                    kasraStats?.outOfStockCount ??
                    kasraProducts.filter((p) => !p.inStock || (p.stock ?? 0) === 0).length;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* کل محصولات کسری پلاس */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/80 space-y-1">
                        <span className="text-xs font-bold text-slate-500 block">کل محصولات کسری پلاس</span>
                        <span className="text-2xl font-black text-slate-900 font-mono block">
                          {totalKasra.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-normal">کل کالاهای دریافت شده از وب‌سرویس</span>
                      </div>

                      {/* محصولات موجود در انبار */}
                      <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100/80 space-y-1">
                        <span className="text-xs font-bold text-emerald-800 block">محصولات موجود در انبار</span>
                        <span className="text-2xl font-black text-emerald-700 font-mono block">
                          {inStockKasra.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-[11px] text-emerald-600 block font-normal">دارای موجودی در انبار کسری پلاس</span>
                      </div>

                      {/* محصولات ناموجود در انبار */}
                      <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100/80 space-y-1">
                        <span className="text-xs font-bold text-rose-800 block">محصولات ناموجود در انبار</span>
                        <span className="text-2xl font-black text-rose-700 font-mono block">
                          {outOfStockKasra.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-[11px] text-rose-600 block font-normal">در انتظار تأمین موجودی</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS & VARIANTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-black text-slate-900">
                    مدیریت کاتالوگ محصولات
                  </h2>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                    {(() => {
                      const filteredCount = products.filter((p) => {
                        const isManual = !String(p.id).startsWith('kasra-') && p.source !== 'kasraplus';
                        return productSourceFilter === 'all'
                          ? true
                          : productSourceFilter === 'puzzle'
                          ? isManual
                          : !isManual;
                      }).length;
                      return `${filteredCount.toLocaleString('fa-IR')} کالا`;
                    })()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      resetAddProductForm();
                      setIsAddProductModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shadow-emerald-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن کالای جدید</span>
                  </button>
                </div>

                {/* Source Filter (پازل کالا / کسری پلاس) */}
                <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl gap-1 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setProductSourceFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      productSourceFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    همه محصولات
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductSourceFilter('puzzle')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      productSourceFilter === 'puzzle'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>کالاهای پازل کالا</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductSourceFilter('kasra')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      productSourceFilter === 'kasra'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span>کالاهای کسری پلاس</span>
                  </button>
                </div>

                <div className="w-full sm:w-72 relative">
                  <input
                    type="text"
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    placeholder="جستجو در بین کالاها..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pr-9 pl-3 text-xs focus:outline-hidden"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="w-full">
                  <table className="w-full text-right text-xs table-fixed">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="p-3 w-[45%]">کالا و مشخصات</th>
                        <th className="p-3 w-[15%]">منبع کالا</th>
                        <th className="p-3 w-[15%]">قیمت فروش</th>
                        <th className="p-3 w-[15%]">وضعیت انبار</th>
                        <th className="p-3 w-[10%] text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products
                        .filter((p) => {
                          const isManual = !String(p.id).startsWith('kasra-') && p.source !== 'kasraplus';
                          const matchSource =
                            productSourceFilter === 'all'
                              ? true
                              : productSourceFilter === 'puzzle'
                              ? isManual
                              : !isManual;
                          const matchSearch =
                            !prodSearch.trim() ||
                            p.persianName?.toLowerCase().includes(prodSearch.toLowerCase()) ||
                            p.name?.toLowerCase().includes(prodSearch.toLowerCase());
                          return matchSource && matchSearch;
                        })
                        .slice(0, 60)
                        .map((p) => {
                          const isManual = !String(p.id).startsWith('kasra-') && p.source !== 'kasraplus';
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={p.images?.[0] || '/logo.png'}
                                    alt=""
                                    className="w-9 h-9 object-contain bg-slate-50 rounded-lg p-1 border border-slate-200 shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <span className="font-bold text-slate-800 block truncate" title={p.persianName}>
                                      {p.persianName}
                                    </span>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                      <span>{p.brandPersian || p.brand}</span>
                                      {p.sku && <span>کد: {p.sku}</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                {isManual ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    پازل کالا
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    کسری پلاس
                                  </span>
                                )}
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-900">
                                {p.price.toLocaleString('fa-IR')}
                              </td>
                              <td className="p-3">
                                {p.inStock ? (
                                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[11px] font-bold">
                                    موجود ({p.stock})
                                  </span>
                                ) : (
                                  <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md text-[11px] font-bold">
                                    ناموجود
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedProductForDetail(p)}
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                                    title="مشاهده جزئیات کالا"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p.id, p.persianName)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="حذف کالا"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product Detail Modal */}
              {selectedProductForDetail && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
                  onClick={() => setSelectedProductForDetail(null)}
                >
                  <div
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
                    dir="rtl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header with clear and prominent × button */}
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Eye className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900">جزئیات کالا</h3>
                          <span className="text-xs text-slate-400 font-mono">شناسه: {selectedProductForDetail.id}</span>
                        </div>
                      </div>

                      {/* Prominent Close Button (×) */}
                      <button
                        type="button"
                        onClick={() => setSelectedProductForDetail(null)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 active:scale-95 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                        title="بستن جزئیات (×)"
                      >
                        <X className="w-6 h-6 text-slate-700" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
                      {/* Product Main Header / Images & Title */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-100">
                        <img
                          src={selectedProductForDetail.images?.[0] || '/logo.png'}
                          alt={selectedProductForDetail.persianName}
                          className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl bg-slate-50 p-2 border border-slate-200 shrink-0"
                        />
                        <div className="space-y-2 text-center sm:text-right flex-1">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-relaxed">
                            {selectedProductForDetail.persianName || selectedProductForDetail.name}
                          </h4>
                          {selectedProductForDetail.sku && (
                            <span className="inline-block text-[11px] text-slate-400 font-mono">
                              کد کالا: {selectedProductForDetail.sku}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* بخش دسته و برند */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-slate-400 block">دسته و برند</span>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs">
                            {selectedProductForDetail.categoryName || selectedProductForDetail.category || 'عمومی'}
                          </span>
                          <span className="text-slate-300 font-bold">/</span>
                          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs">
                            {selectedProductForDetail.brandPersian || selectedProductForDetail.brand || 'متفرقه'}
                          </span>
                        </div>
                      </div>

                      {/* بخش جدید تامین کننده */}
                      {(() => {
                        const isKasra =
                          selectedProductForDetail.source === 'kasraplus' ||
                          String(selectedProductForDetail.id).startsWith('kasra-');
                        const supplierName = isKasra ? 'کسری پلاس' : 'پازل کالا';
                        const supplierRealUrl =
                          selectedProductForDetail.sourceUrl &&
                          selectedProductForDetail.sourceUrl.startsWith('http')
                            ? selectedProductForDetail.sourceUrl
                            : null;

                        return (
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                            <span className="text-xs font-bold text-slate-400 block">تأمین‌کننده</span>
                            <div>
                              {supplierRealUrl ? (
                                <a
                                  href={supplierRealUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black transition-colors cursor-pointer shadow-2xs group"
                                  title="مشاهده صفحه محصول در سایت تأمین‌کننده"
                                >
                                  <span>{supplierName}</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-700" />
                                </a>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black shadow-2xs">
                                  {supplierName}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* بخش قیمت */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-slate-400 block">قیمت</span>
                        <div className="flex flex-wrap items-baseline gap-3">
                          {/* قیمت فروش بدون تومان در زیر */}
                          <span className="text-2xl font-black text-slate-900 font-mono">
                            {selectedProductForDetail.price.toLocaleString('fa-IR')}
                          </span>

                          {/* قیمت خط‌خورده بزرگ‌تر و پررنگ‌تر همراه با درصد تخفیف کوچک در کنار آن */}
                          {Boolean(
                            selectedProductForDetail.oldPrice &&
                              selectedProductForDetail.oldPrice > selectedProductForDetail.price
                          ) && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-bold text-slate-500 line-through font-mono">
                                {selectedProductForDetail.oldPrice?.toLocaleString('fa-IR')}
                              </span>
                              {(() => {
                                const discountPercent =
                                  selectedProductForDetail.discount ||
                                  Math.round(
                                    ((selectedProductForDetail.oldPrice! - selectedProductForDetail.price) /
                                      selectedProductForDetail.oldPrice!) *
                                      100
                                  );
                                return discountPercent > 0 ? (
                                  <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md font-mono">
                                    ٪{discountPercent.toLocaleString('fa-IR')}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* وضعیت انبار و موجودی */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-slate-400 block">وضعیت انبار و موجودی</span>
                        <div>
                          {selectedProductForDetail.inStock ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>موجود در انبار ({selectedProductForDetail.stock ?? 1} عدد)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>ناموجود در انبار</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Close Button */}
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50/80">
                      <button
                        type="button"
                        onClick={() => setSelectedProductForDetail(null)}
                        className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>بستن</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* مدال جامع و تفکیک‌شده «افزودن کالای جدید» */}
              {isAddProductModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
                  onClick={() => setIsAddProductModalOpen(false)}
                >
                  <div
                    className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto"
                    dir="rtl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* هدر مدال */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900">افزودن کالای جدید</h3>
                          <span className="text-xs text-slate-400">ثبت کالای مستقل با مشخصات، آلبوم و تنوع کامل</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddProductModalOpen(false)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 active:scale-95 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                        title="بستن (×)"
                      >
                        <X className="w-6 h-6 text-slate-700" />
                      </button>
                    </div>

                    {/* فرم ثبت کالا */}
                    <form onSubmit={handleCreateProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                      {/* بخش ۱: اطلاعات پایه و شناسنامه کالا */}
                      <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-black text-sm">
                          <Package className="w-4 h-4 text-emerald-600" />
                          <span>اطلاعات پایه و شناسنامه کالا</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* نام فارسی کالا */}
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">
                              نام فارسی کالا <span className="text-rose-500 font-black">*</span>
                            </label>
                            <input
                              type="text"
                              value={newProdTitleFa}
                              onChange={(e) => {
                                setNewProdTitleFa(e.target.value);
                                if (addProductErrors.titleFa) {
                                  setAddProductErrors((prev) => {
                                    const c = { ...prev };
                                    delete c.titleFa;
                                    return c;
                                  });
                                }
                              }}
                              placeholder="مثال: گوشی موبایل سامسونگ مدل Galaxy S24 Ultra"
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 transition-all focus:outline-hidden ${
                                addProductErrors.titleFa ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
                              }`}
                            />
                            {addProductErrors.titleFa && (
                              <span className="text-rose-500 text-[11px] font-bold mt-1 block flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {addProductErrors.titleFa}
                              </span>
                            )}
                          </div>

                          {/* نام لاتین کالا * */}
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">
                              نام لاتین کالا <span className="text-rose-500 font-black">*</span>
                            </label>
                            <input
                              type="text"
                              dir="ltr"
                              value={newProdTitleEn}
                              onChange={(e) => {
                                setNewProdTitleEn(e.target.value);
                                if (addProductErrors.titleEn) {
                                  setAddProductErrors((prev) => {
                                    const c = { ...prev };
                                    delete c.titleEn;
                                    return c;
                                  });
                                }
                              }}
                              placeholder="e.g. Samsung Galaxy S24 Ultra 5G"
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans transition-all focus:outline-hidden ${
                                addProductErrors.titleEn ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
                              }`}
                            />
                            {addProductErrors.titleEn && (
                              <span className="text-rose-500 text-[11px] font-bold mt-1 block flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {addProductErrors.titleEn}
                              </span>
                            )}
                          </div>

                          {/* برند * */}
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">
                              برند <span className="text-rose-500 font-black">*</span>
                            </label>
                            <input
                              type="text"
                              value={newProdBrand}
                              onChange={(e) => {
                                setNewProdBrand(e.target.value);
                                if (addProductErrors.brand) {
                                  setAddProductErrors((prev) => {
                                    const c = { ...prev };
                                    delete c.brand;
                                    return c;
                                  });
                                }
                              }}
                              placeholder="مثال: سامسونگ، اپل، شیائومی..."
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 transition-all focus:outline-hidden ${
                                addProductErrors.brand ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
                              }`}
                            />
                            {addProductErrors.brand && (
                              <span className="text-rose-500 text-[11px] font-bold mt-1 block flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {addProductErrors.brand}
                              </span>
                            )}
                          </div>

                          {/* دسته اصلی * */}
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">
                              دسته اصلی <span className="text-rose-500 font-black">*</span>
                            </label>
                            <input
                              type="text"
                              value={newProdCategory}
                              onChange={(e) => {
                                setNewProdCategory(e.target.value);
                                if (addProductErrors.category) {
                                  setAddProductErrors((prev) => {
                                    const c = { ...prev };
                                    delete c.category;
                                    return c;
                                  });
                                }
                              }}
                              placeholder="مثال: کالای دیجیتال، موبایل، لپ‌تاپ..."
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 transition-all focus:outline-hidden ${
                                addProductErrors.category ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
                              }`}
                            />
                            {addProductErrors.category && (
                              <span className="text-rose-500 text-[11px] font-bold mt-1 block flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {addProductErrors.category}
                              </span>
                            )}
                          </div>

                          {/* زیردسته تخصصی * */}
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">
                              زیردسته تخصصی <span className="text-rose-500 font-black">*</span>
                            </label>
                            <input
                              type="text"
                              value={newProdSubcategory}
                              onChange={(e) => {
                                setNewProdSubcategory(e.target.value);
                                if (addProductErrors.subcategory) {
                                  setAddProductErrors((prev) => {
                                    const c = { ...prev };
                                    delete c.subcategory;
                                    return c;
                                  });
                                }
                              }}
                              placeholder="مثال: گوشی هوشمند، ساعت و مچ‌بند هوشمند..."
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 transition-all focus:outline-hidden ${
                                addProductErrors.subcategory ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
                              }`}
                            />
                            {addProductErrors.subcategory && (
                              <span className="text-rose-500 text-[11px] font-bold mt-1 block flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {addProductErrors.subcategory}
                              </span>
                            )}
                          </div>

                          {/* قیمت فروش (تومان) * */}
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">
                              قیمت فروش (تومان) <span className="text-rose-500 font-black">*</span>
                            </label>
                            <input
                              type="number"
                              value={newProdPrice}
                              onChange={(e) => {
                                setNewProdPrice(e.target.value);
                                if (addProductErrors.price) {
                                  setAddProductErrors((prev) => {
                                    const c = { ...prev };
                                    delete c.price;
                                    return c;
                                  });
                                }
                              }}
                              placeholder="مثال: 55000000"
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono transition-all focus:outline-hidden ${
                                addProductErrors.price ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
                              }`}
                            />
                            {addProductErrors.price && (
                              <span className="text-rose-500 text-[11px] font-bold mt-1 block flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {addProductErrors.price}
                              </span>
                            )}
                          </div>

                          {/* قیمت قبل از تخفیف */}
                          <div className="md:col-span-2">
                            <label className="block text-slate-700 font-bold mb-1">
                              قیمت قبل از تخفیف (اختیاری - جهت نمایش درصد تخفیف)
                            </label>
                            <input
                              type="number"
                              value={newProdOldPrice}
                              onChange={(e) => setNewProdOldPrice(e.target.value)}
                              placeholder="مثال: 59000000"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:border-emerald-500 focus:outline-hidden"
                            />
                          </div>

                          {/* توضیحات/معرفی کالا * */}
                          <div className="md:col-span-2">
                            <label className="block text-slate-700 font-bold mb-1">
                              توضیحات و معرفی کالا <span className="text-rose-500 font-black">*</span>
                            </label>
                            <textarea
                              rows={3}
                              value={newProdDescription}
                              onChange={(e) => {
                                setNewProdDescription(e.target.value);
                                if (addProductErrors.description) {
                                  setAddProductErrors((prev) => {
                                    const c = { ...prev };
                                    delete c.description;
                                    return c;
                                  });
                                }
                              }}
                              placeholder="معرفی جامع، نقد و بررسی و نکات کلیدی کالا..."
                              className={`w-full bg-white border rounded-xl p-3 text-xs text-slate-800 transition-all focus:outline-hidden ${
                                addProductErrors.description ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'
                              }`}
                            />
                            {addProductErrors.description && (
                              <span className="text-rose-500 text-[11px] font-bold mt-1 block flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {addProductErrors.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* بخش ۲: آلبوم تصاویر */}
                      <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                            <ImageIcon className="w-4 h-4 text-emerald-600" />
                            <span>آلبوم تصاویر کالا</span>
                            <span className="text-rose-500 font-black">*</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            حداقل ابعاد قابل قبول ۶۰۰×۶۰۰ پیکسل با نسبت ۱:۱، حداقل حجم فایل ۵ مگابایت
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="url"
                            dir="ltr"
                            value={newProdImageUrlInput}
                            onChange={(e) => setNewProdImageUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddProductImage();
                              }
                            }}
                            placeholder="https://example.com/images/product.jpg"
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={handleAddProductImage}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>افزودن تصویر</span>
                          </button>
                        </div>

                        {addProductErrors.images && (
                          <span className="text-rose-500 text-[11px] font-bold block flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {addProductErrors.images}
                          </span>
                        )}

                        {/* پیش‌نمایش تصاویر */}
                        {newProdImages.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                            {newProdImages.map((img, idx) => (
                              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                                <img src={img} alt={`تصویر ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductImage(idx)}
                                  className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                                  title="حذف تصویر"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                {idx === 0 && (
                                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                                    کاور اصلی
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-center text-slate-400 border border-dashed border-slate-300 rounded-xl bg-white/50">
                            هنوز تصویری به آلبوم اضافه نشده است (حداقل یک تصویر الزامی است).
                          </div>
                        )}
                      </div>

                      {/* بخش ۳: مشخصات فنی کالا (جدول مناسب) */}
                      <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                            <Grid className="w-4 h-4 text-emerald-600" />
                            <span>جدول مشخصات فنی واقعی کالا</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddSpecRow}
                            className="flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-emerald-200 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>افزودن سطر مشخصه</span>
                          </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                              <tr>
                                <th className="p-2.5 w-[35%]">عنوان مشخصه</th>
                                <th className="p-2.5 w-[55%]">مقدار مشخصه</th>
                                <th className="p-2.5 w-[10%] text-center">حذف</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {newProdSpecs.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={row.label}
                                      onChange={(e) => handleUpdateSpecRow(idx, 'label', e.target.value)}
                                      placeholder="مثال: وزن، پردازنده، ابعاد..."
                                      className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={row.value}
                                      onChange={(e) => handleUpdateSpecRow(idx, 'value', e.target.value)}
                                      placeholder="مثال: ۲۲۱ گرم، Snapdragon 8 Gen 3..."
                                      className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSpecRow(idx)}
                                      disabled={newProdSpecs.length <= 1}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                      title="حذف سطر"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* بخش ۴: بخش تنوع و رنگ کالا */}
                      <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                            <Layers className="w-4 h-4 text-emerald-600" />
                            <span>تنوع و رنگ کالا</span>
                            <span className="text-rose-500 font-black">*</span>
                          </div>
                          <span className="text-[11px] text-slate-500">حداقل یک رنگ الزامی است</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={newProdColorNameInput}
                            onChange={(e) => setNewProdColorNameInput(e.target.value)}
                            placeholder="نام رنگ (مثال: مشکی تیتانیوم، نقره‌ای...)"
                            className="flex-1 min-w-[200px] bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                          />
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                            <span className="text-[11px] text-slate-500 font-bold">کد رنگ:</span>
                            <input
                              type="color"
                              value={newProdColorHexInput}
                              onChange={(e) => setNewProdColorHexInput(e.target.value)}
                              className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                            />
                            <span className="font-mono text-[11px] text-slate-600">{newProdColorHexInput}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddColor}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>افزودن رنگ</span>
                          </button>
                        </div>

                        {addProductErrors.colors && (
                          <span className="text-rose-500 text-[11px] font-bold block flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {addProductErrors.colors}
                          </span>
                        )}

                        {/* لیست رنگ‌های انتخاب‌شده */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {newProdColors.map((c) => (
                            <span
                              key={c.name}
                              className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-bold text-xs"
                            >
                              <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                              <span>{c.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(c.name)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                          {newProdColors.length === 0 && (
                            <span className="text-slate-400 text-xs italic">هنوز رنگی افزوده نشده است.</span>
                          )}
                        </div>
                      </div>

                      {/* بخش ۵: گارانتی و خدمات پس از فروش */}
                      <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>گارانتی و خدمات پس از فروش کالا</span>
                            <span className="text-rose-500 font-black">*</span>
                          </div>
                          <span className="text-[11px] text-slate-500">حداقل یک گارانتی الزامی است</span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newProdWarrantyInput}
                            onChange={(e) => setNewProdWarrantyInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddWarranty();
                              }
                            }}
                            placeholder="عنوان گارانتی (مثال: ۱۸ ماه گارانتی شرکتی و اصالت کالا)"
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={handleAddWarranty}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>افزودن گارانتی</span>
                          </button>
                        </div>

                        {/* پیشنهادهای سریع گارانتی */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-bold">پیشنهاد سریع:</span>
                          {[
                            '۱۸ ماه گارانتی رسمی شرکتی و اصالت کالا',
                            'گارانتی سلامت و اصالت فیزیکی کالا',
                            '۲۴ ماه گارانتی طلایی تعویض',
                          ].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                if (!newProdWarranties.includes(preset)) {
                                  setNewProdWarranties((p) => [...p, preset]);
                                  setAddProductErrors((prev) => {
                                    const c = { ...prev };
                                    delete c.warranties;
                                    return c;
                                  });
                                }
                              }}
                              className="text-[10px] bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              + {preset}
                            </button>
                          ))}
                        </div>

                        {addProductErrors.warranties && (
                          <span className="text-rose-500 text-[11px] font-bold block flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {addProductErrors.warranties}
                          </span>
                        )}

                        {/* لیست گارانتی‌های افزوده شده */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {newProdWarranties.map((w) => (
                            <span
                              key={w}
                              className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-bold text-xs text-slate-800"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{w}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveWarranty(w)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                          {newProdWarranties.length === 0 && (
                            <span className="text-slate-400 text-xs italic">هنوز گارانتی افزوده نشده است.</span>
                          )}
                        </div>
                      </div>

                      {/* دکمه‌های پایانی فرم */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
                        <button
                          type="button"
                          onClick={() => setIsAddProductModalOpen(false)}
                          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          انصراف
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingProduct}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSubmittingProduct ? 'در حال ثبت...' : 'ثبت و ذخیره کالای جدید'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KASRA PLUS SYNC */}
          {activeTab === 'kasra-sync' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900">پیکربندی و مانیتورینگ کسری پلاس</h2>
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'در حال اجرا...' : 'همگام‌سازی فوری'}</span>
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <span className="text-slate-400 font-bold">وضعیت پولینگ کاتالوگ</span>
                    <p className="text-sm font-black text-emerald-600">فعال (هر ۳۰ ثانیه)</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <span className="text-slate-400 font-bold">آخرین زمان همگام‌سازی موفق</span>
                    <p className="text-sm font-mono text-slate-700">
                      {kasraStats?.lastSuccessAt
                        ? new Date(kasraStats.lastSuccessAt).toLocaleString('fa-IR')
                        : 'چند لحظه قبل'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <span className="text-slate-400 font-bold">ضریب سود فروشگاه (Markup Rate)</span>
                    <p className="text-sm font-black text-slate-800">۵ درصد روی قیمت منبع (1.05x)</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <span className="text-slate-400 font-bold">تعداد کل تنوع‌های رنگی استخراج‌شده</span>
                    <p className="text-sm font-black text-purple-600 font-mono">
                      {products.reduce((acc, p) => acc + (p.variants?.[0]?.options?.length || 0), 0)} تنوع مستقل
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <span className="text-slate-400 font-bold">تعداد کالاهای موجود در انبار</span>
                    <p className="text-sm font-black text-emerald-600 font-mono">
                      {kasraStats?.inStockCount || products.filter((p) => p.inStock).length} کالا
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <span className="text-slate-400 font-bold">تعداد کالاهای ناموجود</span>
                    <p className="text-sm font-black text-rose-500 font-mono">
                      {kasraStats?.outOfStockCount || products.filter((p) => !p.inStock).length} کالا
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-base font-black text-slate-900">
                  مدیریت سفارش‌ها ({ordersList.length})
                </h2>

                <div className="flex items-center gap-2">
                  <select
                    value={orderFilterStatus}
                    onChange={(e) => setOrderFilterStatus(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="processing">در حال پردازش</option>
                    <option value="completed">تکمیل شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3.5">شماره سفارش</th>
                      <th className="p-3.5">مشتری</th>
                      <th className="p-3.5">شماره تماس</th>
                      <th className="p-3.5">مبلغ کل</th>
                      <th className="p-3.5">روش پرداخت</th>
                      <th className="p-3.5">تغییر وضعیت</th>
                      <th className="p-3.5 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ordersList
                      .filter((o) => orderFilterStatus === 'all' || o.status === orderFilterStatus)
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-3.5 font-bold font-mono text-slate-900">#{o.orderNumber}</td>
                          <td className="p-3.5 font-bold">{o.customerName}</td>
                          <td className="p-3.5 font-mono text-slate-500" dir="ltr">{o.customerPhone}</td>
                          <td className="p-3.5 font-mono font-bold text-slate-800">
                            {o.totalAmount.toLocaleString('fa-IR')} تومان
                          </td>
                          <td className="p-3.5 text-slate-500">
                            {o.paymentMethod === 'online' ? 'آنلاین شاپرک' : 'کیف پول'}
                          </td>
                          <td className="p-3.5">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[11px] font-bold"
                            >
                              <option value="processing">در حال پردازش</option>
                              <option value="completed">تکمیل شده</option>
                              <option value="cancelled">لغو شده</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="حذف سفارش"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: USERS / CUSTOMERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-base font-black text-slate-900">
                  کاربران و مشتریان ({usersList.length})
                </h2>

                <div className="w-full sm:w-64 relative">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="جستجو بر اساس نام یا شماره..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pr-9 pl-3 text-xs focus:outline-hidden"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3.5">نام کاربر</th>
                      <th className="p-3.5">شماره تماس / موبایل</th>
                      <th className="p-3.5">موجودی کیف پول</th>
                      <th className="p-3.5">نقش</th>
                      <th className="p-3.5 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList
                      .filter(
                        (u) =>
                          !userSearch.trim() ||
                          u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.phone?.includes(userSearch)
                      )
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-3.5 font-bold text-slate-900">{u.name || u.username}</td>
                          <td className="p-3.5 font-mono text-slate-600" dir="ltr">{u.phone || '-'}</td>
                          <td className="p-3.5 font-mono font-bold text-emerald-600">
                            {(u.walletBalance || 0).toLocaleString('fa-IR')} تومان
                          </td>
                          <td className="p-3.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-bold">
                              {u.role === 'admin' ? 'مدیر سیستم' : 'مشتری'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name || u.username)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="حذف کاربر با تاییدیه"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS & QUESTIONS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-900">مدیریت نظرات، دیدگاه‌ها و پرسش‌ها</h2>
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <Star className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-slate-700">
                    سیستم ثبت دیدگاه‌ها و پرسش‌ها به صورت خودکار با تایید مدیریت یا پاسخ پشتیبان بر روی کالاها فعال است.
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">رضایت از کیفیت کالا و ارسال سریع</span>
                      <span className="text-[11px] text-slate-400">ثبت‌شده توسط کاربر برای گوشی سامسونگ A55</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                      تایید شده
                    </span>
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">آیا شارژر داخل جعبه موجود است؟</span>
                      <span className="text-[11px] text-slate-400">پرسش در صفحه انکر SoundCore V20i</span>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                      پاسخ داده شد
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SUPPORT / TICKETS */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-900">
                تیکت‌ها و درخواست‌های پشتیبانی ({ticketsList.length})
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="p-3">موضوع تیکت</th>
                        <th className="p-3">کاربر</th>
                        <th className="p-3">وضعیت</th>
                        <th className="p-3 text-center">مشاهده</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ticketsList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400">
                            تیکتی در سامانه ثبت نشده است.
                          </td>
                        </tr>
                      ) : (
                        ticketsList.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800">{t.subject}</td>
                            <td className="p-3 text-slate-500">{t.userName}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  t.status === 'answered'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {t.status === 'answered' ? 'پاسخ داده شد' : 'در انتظار بررسی'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => setSelectedTicket(t)}
                                className="bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
                              >
                                بررسی
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  {selectedTicket ? (
                    <div className="space-y-4 text-xs">
                      <div className="border-b border-slate-100 pb-3">
                        <span className="text-[10px] text-slate-400 block">موضوع درخواست:</span>
                        <h4 className="font-black text-sm text-slate-900">{selectedTicket.subject}</h4>
                        <span className="text-[11px] text-slate-500">
                          ارسال شده توسط {selectedTicket.userName} ({selectedTicket.userPhone})
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl text-slate-700">
                        {selectedTicket.message}
                      </div>

                      {/* Previous replies */}
                      {selectedTicket.replies?.map((rep: any, idx: number) => (
                        <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-emerald-800">{rep.sender}:</span>
                          <p className="text-slate-800">{rep.message}</p>
                        </div>
                      ))}

                      {/* Reply form */}
                      <form onSubmit={handleSendTicketReply} className="space-y-2 pt-2 border-t border-slate-100">
                        <textarea
                          rows={3}
                          value={ticketReplyText}
                          onChange={(e) => setTicketReplyText(e.target.value)}
                          placeholder="متن پاسخ پشتیبان..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-hidden"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingReply}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingReply ? 'در حال ارسال...' : 'ارسال پاسخ تیکت'}</span>
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      برای مشاهده جزئیات و پاسخ به تیکت، یکی از موارد سمت راست را انتخاب کنید.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: WALLET & TRANSACTIONS */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-900">
                مدیریت کیف پول و تراکنش‌ها ({walletLogs.length})
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Adjust Form */}
                <form
                  onSubmit={handleWalletAdjustSubmit}
                  className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs"
                >
                  <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>شارژ / کسر اعتبار کیف پول کاربر</span>
                  </h3>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">انتخاب کاربر</label>
                    <select
                      value={walletTargetUserId}
                      onChange={(e) => setWalletTargetUserId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                    >
                      <option value="">-- انتخاب کاربر --</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.username} ({u.phone || 'بدون تلفن'}) - موجودی: {(u.walletBalance || 0).toLocaleString('fa-IR')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">نوع عملیات</label>
                      <select
                        value={walletAdjustType}
                        onChange={(e) => setWalletAdjustType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                      >
                        <option value="deposit">افزایش موجودی (+)</option>
                        <option value="withdraw">کسر موجودی (-)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">مبلغ (تومان)</label>
                      <input
                        type="number"
                        value={walletAdjustAmount}
                        onChange={(e) => setWalletAdjustAmount(e.target.value)}
                        placeholder="مثال: 500000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">دلیل / بابت تراکنش</label>
                    <input
                      type="text"
                      value={walletAdjustReason}
                      onChange={(e) => setWalletAdjustReason(e.target.value)}
                      placeholder="مثال: شارژ تشویقی، بازگشت وجه سفارش..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingWallet}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingWallet ? 'در حال ثبت...' : 'ثبت قطعی تراکنش'}
                  </button>
                </form>

                {/* Transactions Table */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 font-black text-xs text-slate-800">
                    آخرین گردش حساب‌های کیف پول
                  </div>
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="p-3">کاربر</th>
                        <th className="p-3">مبلغ</th>
                        <th className="p-3">نوع</th>
                        <th className="p-3">بابت / دلیل</th>
                        <th className="p-3">تاریخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {walletLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">
                            تراکنشی در کیف پول ثبت نشده است.
                          </td>
                        </tr>
                      ) : (
                        walletLogs.slice(0, 30).map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold">{t.userName}</td>
                            <td className="p-3 font-mono font-bold">
                              {t.amount.toLocaleString('fa-IR')} تومان
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  t.type === 'deposit'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {t.type === 'deposit' ? '+ افزایش' : '- کسر'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 max-w-[150px] truncate">{t.reason}</td>
                            <td className="p-3 font-mono text-[10px] text-slate-400">
                              {new Date(t.createdAt).toLocaleDateString('fa-IR')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: BANNERS & NOTICES */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-900">مدیریت بنرها و اعلان‌های سایت</h2>
              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">متن نوار اعلان بالای سایت (Banner Notice)</label>
                  <input
                    type="text"
                    value={storeSettings.bannerNotice || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, bannerNotice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="enableBanner"
                    checked={storeSettings.isStoreActive !== false}
                    onChange={(e) => setStoreSettings({ ...storeSettings, isStoreActive: e.target.checked })}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <label htmlFor="enableBanner" className="font-bold text-slate-700 cursor-pointer">
                    فعال بودن نمایش بنرها و کمپین در صفحه اصلی
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    ذخیره تغییرات بنر
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 10: SPECIAL / FLASH OFFERS */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-900">پیشنهادات شگفت‌انگیز و تخفیف‌های ویژه</h2>
              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <Flame className="w-5 h-5 text-rose-600 shrink-0" />
                  <div className="flex-1">
                    <span className="font-black text-slate-900 block">باکس پیشنهاد شگفت‌انگیز پازل کالا</span>
                    <span className="text-[11px] text-slate-500">
                      محصولات دارای تخفیف منبع با تایمر معکوس در صفحه اصلی به نمایش درمی‌آیند.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={storeSettings.enableSpecialDeals !== false}
                    onChange={(e) => setStoreSettings({ ...storeSettings, enableSpecialDeals: e.target.checked })}
                    className="accent-rose-600 w-5 h-5 cursor-pointer"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    ذخیره تنظیمات تخفیف‌ها
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 11: HOMEPAGE BOXES */}
          {activeTab === 'homepage-boxes' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-900">باکس‌ها و شورتکات‌های صفحه اصلی</h2>
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                <p className="text-slate-500">
                  شورتکات‌های دسترسی سریع (موبایل، لپ‌تاپ، شگفت‌انگیزها، خرید اقساطی) در این بخش پیکربندی شده‌اند.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(storeSettings.quickShortcuts || []).map((qs: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{qs.title}</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        فعال
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: SHIPPING & TARIFF */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-900">ارسال و تعرفه‌های پستی پازل کالا</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    مدیریت روش‌های ارسال، محدوده‌های جغرافیایی، بازه‌های وزنی و تعرفه‌های رسمی پست
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentMethods = Array.isArray(storeSettings.shippingMethods) ? [...storeSettings.shippingMethods] : [
                        { id: 'express', name: 'پست پیشتاز سراسری', destination: 'سراسر کشور', weightRange: 'تا ۲ کیلوگرم', fee: storeSettings.shippingFee || 49000, active: true },
                        { id: 'tipax', name: 'تیپاکس (پس‌کرایه / سریع)', destination: 'مراکز استان و شهرهای تحت پوشش', weightRange: 'تا ۶ کیلوگرم', fee: 65000, active: true },
                        { id: 'courier', name: 'پیک فوری موتوری', destination: 'درون‌شهری (تهران)', weightRange: 'تا ۵ کیلوگرم', fee: 75000, active: true },
                      ];
                      currentMethods.push({
                        id: `custom_${Date.now()}`,
                        name: 'تعرفه پستی جدید',
                        destination: 'سراسر کشور',
                        weightRange: 'تا ۱ کیلوگرم',
                        fee: storeSettings.shippingFee || 49000,
                        active: true,
                      });
                      setStoreSettings({ ...storeSettings, shippingMethods: currentMethods });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>افزودن تعرفه جدید</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSettings ? 'در حال ذخیره...' : 'ذخیره کل تغییرات'}</span>
                  </button>
                </div>
              </div>

              {/* Official Postal Disclaimer Box */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-black">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>اصل شفافیت و تعهد به تعرفه‌های رسمی شرکت ملی پست جمهوری اسلامی ایران</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  کلیه تعرفه‌های پیشتاز و سفارشی طبق آخرین مصوبات سازمان تنظیم مقررات و ارتباطات رادیویی و ابلاغیه‌های رسمی شرکت ملی پست ج.ا.ا اعمال می‌گردند. در غیاب ابلاغیه رسمی جدید، ثبت هرگونه عدد حدسی یا فرضی ممنوع بوده و مقادیر مصوب قبلی فروشگاه حفظ و اعمال می‌شوند.
                </p>
              </div>

              {/* Global Settings: Base Fee & Free Threshold */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                <h3 className="font-black text-slate-800 text-xs border-b border-slate-100 pb-2">تنظیمات پایه و عمومی ارسال</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">هزینه پایه بسته‌بندی و ارسال (تومان)</label>
                    <input
                      type="number"
                      value={storeSettings.shippingFee || 49000}
                      onChange={(e) => setStoreSettings({ ...storeSettings, shippingFee: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                    />
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      {(Number(storeSettings.shippingFee) || 49000).toLocaleString('fa-IR')} تومان
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">سقف سبد خرید برای ارسال رایگان (تومان)</label>
                    <input
                      type="number"
                      value={storeSettings.freeShippingThreshold || 2000000}
                      onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                    />
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      {(Number(storeSettings.freeShippingThreshold) || 2000000).toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Tiers & Methods Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden text-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between font-black text-slate-800">
                  <span>جدول روش‌ها، محدوده‌های مقصد و تعرفه‌های وزنی</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="p-3.5">روش ارسال</th>
                        <th className="p-3.5">محدوده / مقصد</th>
                        <th className="p-3.5">بازه وزنی</th>
                        <th className="p-3.5">مبلغ ارسال (تومان)</th>
                        <th className="p-3.5 text-center">وضعیت</th>
                        <th className="p-3.5 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(storeSettings.shippingMethods) && storeSettings.shippingMethods.length > 0
                        ? storeSettings.shippingMethods
                        : [
                            { id: 'express', name: 'پست پیشتاز سراسری', destination: 'سراسر کشور', weightRange: 'تا ۲ کیلوگرم', fee: storeSettings.shippingFee || 49000, active: true },
                            { id: 'tipax', name: 'تیپاکس (پس‌کرایه / سریع)', destination: 'مراکز استان و شهرهای تحت پوشش', weightRange: 'تا ۶ کیلوگرم', fee: 65000, active: true },
                            { id: 'courier', name: 'پیک فوری موتوری', destination: 'درون‌شهری (تهران)', weightRange: 'تا ۵ کیلوگرم', fee: 75000, active: true },
                          ]
                      ).map((m: any, idx: number) => (
                        <tr key={m.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <input
                              type="text"
                              value={m.name || ''}
                              onChange={(e) => {
                                const list = [...(storeSettings.shippingMethods || [])];
                                list[idx] = { ...list[idx], name: e.target.value };
                                setStoreSettings({ ...storeSettings, shippingMethods: list });
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold w-full max-w-[180px]"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={m.destination || 'سراسر کشور'}
                              onChange={(e) => {
                                const list = [...(storeSettings.shippingMethods || [])];
                                list[idx] = { ...list[idx], destination: e.target.value };
                                setStoreSettings({ ...storeSettings, shippingMethods: list });
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 w-full max-w-[170px]"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={m.weightRange || 'تا ۲ کیلوگرم'}
                              onChange={(e) => {
                                const list = [...(storeSettings.shippingMethods || [])];
                                list[idx] = { ...list[idx], weightRange: e.target.value };
                                setStoreSettings({ ...storeSettings, shippingMethods: list });
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono w-full max-w-[130px]"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={m.fee ?? 49000}
                              onChange={(e) => {
                                const list = [...(storeSettings.shippingMethods || [])];
                                list[idx] = { ...list[idx], fee: Number(e.target.value) };
                                setStoreSettings({ ...storeSettings, shippingMethods: list });
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold w-28"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...(storeSettings.shippingMethods || [])];
                                list[idx] = { ...list[idx], active: !list[idx].active };
                                setStoreSettings({ ...storeSettings, shippingMethods: list });
                              }}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                                m.active !== false
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {m.active !== false ? 'فعال' : 'غیرفعال'}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const list = (storeSettings.shippingMethods || []).filter((_: any, i: number) => i !== idx);
                                setStoreSettings({ ...storeSettings, shippingMethods: list });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="حذف تعرفه"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: SMS LOGS & DISPATCH */}
          {activeTab === 'sms' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-900">
                لاگ‌ها و سامانه ارسال پیامک ({smsLogs.length})
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <form
                  onSubmit={handleSendSmsSubmit}
                  className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs"
                >
                  <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>ارسال پیامک اطلاع‌رسانی</span>
                  </h3>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-800 text-[11px] space-y-1">
                    <div className="flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>امنیت درگاه پیامک</span>
                    </div>
                    <p>پیامک‌ها با درگاه رسمی مخابراتی یا سندباکس شبیه‌ساز ارسال و در دیتابیس ثبت می‌شوند.</p>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">شماره همراه گیرنده</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={smsTargetPhone}
                      onChange={(e) => setSmsTargetPhone(e.target.value)}
                      placeholder="09xxxxxxxxx"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">متن پیامک</label>
                    <textarea
                      rows={4}
                      value={smsMessageText}
                      onChange={(e) => setSmsMessageText(e.target.value)}
                      placeholder="متن پیامک ارسالی به مشتری..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingSms}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSendingSms ? 'در حال ارسال...' : 'ارسال پیامک'}
                  </button>
                </form>

                {/* SMS History Table */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 font-black text-xs text-slate-800">
                    تاریخچه پیامک‌های ارسالی
                  </div>
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="p-3">گیرنده</th>
                        <th className="p-3">متن پیامک</th>
                        <th className="p-3">وضعیت</th>
                        <th className="p-3">تاریخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {smsLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400">
                            پیامکی در لاگ ثبت نشده است.
                          </td>
                        </tr>
                      ) : (
                        smsLogs.slice(0, 30).map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold" dir="ltr">{s.phone}</td>
                            <td className="p-3 text-slate-600 max-w-[200px] truncate">{s.message}</td>
                            <td className="p-3">
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {s.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[10px] text-slate-400">
                              {new Date(s.createdAt).toLocaleDateString('fa-IR')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-900">تنظیمات اصلی فروشگاه</h2>
              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">نام فروشگاه</label>
                    <input
                      type="text"
                      value={storeSettings.storeName || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">شعار فروشگاه</label>
                    <input
                      type="text"
                      value={storeSettings.storeSlogan || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeSlogan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">تلفن فروشگاه</label>
                    <input
                      type="text"
                      value={storeSettings.storePhone || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">تلفن پشتیبانی ۲۴ ساعته</label>
                    <input
                      type="text"
                      value={storeSettings.supportPhone || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, supportPhone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-bold mb-1">نشانی دفتر مرکزی و انبار</label>
                    <input
                      type="text"
                      value={storeSettings.storeAddress || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    ذخیره تنظیمات کلی
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 15: ADMIN PROFILE / LOGOUT */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-900">پروفایل و امنیت مدیر سیستم</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                <form
                  onSubmit={handleChangeAdminCredentials}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs"
                >
                  <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
                    تغییر رمز عبور ورود به پنل
                  </h3>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">نام کاربری مدیر</label>
                    <input
                      type="text"
                      value={newAdminUser}
                      onChange={(e) => setNewAdminUser(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">رمز عبور جدید</label>
                    <input
                      type="password"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      placeholder="رمز عبور جدید..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {isChangingPass ? 'در حال ثبت...' : 'بروزرسانی رمز عبور'}
                  </button>
                </form>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
                  <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
                    اطلاعات سشن فعال
                  </h3>
                  <div className="space-y-2 text-slate-600">
                    <p>سطح دسترسی: <strong className="text-slate-900">مدیر ارشد (Super Admin)</strong></p>
                    <p>رمز پیش‌فرض سیستم: <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">admin123</span></p>
                    <p>پروتکل ارتباطی: <span className="font-mono text-emerald-600 font-bold">RESTful JSON API</span></p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    خروج از نشست فعلی
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
