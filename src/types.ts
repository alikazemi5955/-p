export type PageType =
  | 'home'
  | 'easy-buy'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'categories'
  | 'profile'
  | 'orders'
  | 'account'
  | 'account_info'
  | 'wallet'
  | 'addresses'
  | 'reviews'
  | 'lists'
  | 'wishlist'
  | 'admin'
  | 'hesabdari';

export interface ProductVariantOption {
  id?: string;
  sourceVariantId?: string;
  name: string;
  colorName?: string;
  colorNameEn?: string;
  colorCode?: string;
  code?: string;
  storage?: string;
  ram?: string;
  size?: string;
  model?: string;
  priceDelta?: number;
  price?: number;
  sourcePrice?: number;
  oldPrice?: number;
  discount?: number;
  inStock?: boolean;
  stock?: number;
  canBuy?: boolean;
  guarantee?: string;
  pack?: string;
  sku?: string;
  image?: string;
}

export interface ProductVariant {
  id?: string;
  type?: string;
  name: string;
  title?: string;
  options: ProductVariantOption[];
}

export interface ProductSpecificationItem {
  label: string;
  value: string;
}

export interface ProductSpecificationGroup {
  groupName: string;
  items: ProductSpecificationItem[];
}

export interface Product {
  id: string;
  slug?: string;
  sku?: string;
  name: string;
  persianName: string;
  brand: string;
  brandPersian?: string;
  brandEn?: string;
  category: string;
  categoryName?: string;
  categorySlug?: string;
  subcategory?: string;
  price: number;
  sourcePrice?: number;
  oldPrice?: number;
  discount?: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  stock: number;
  inStock: boolean;
  lowStockThreshold?: number;
  active?: boolean;
  description?: string;
  fullDescription?: string;
  specifications?: ProductSpecificationGroup[];
  variants?: ProductVariant[];
  badges?: string[];
  keyFeatures?: string[];
  tags?: string[];
  salesCount?: number;
  views?: number;
  source?: string;
  sourceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  selectedVariant?: ProductVariantOption;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  productId: string;
  name: string;
  persianName: string;
  image?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  selectedVariant?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  postalCode?: string;
  items: OrderItem[];
  itemsCount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'online' | 'cod' | 'wallet';
  paymentStatus: 'paid' | 'pending' | 'failed';
  trackingCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserAddress {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  fullAddress: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  username: string;
  name?: string;
  phone?: string;
  email?: string;
  role: 'admin' | 'customer';
  addresses?: UserAddress[];
  walletBalance?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId?: string;
  userName: string;
  userPhone: string;
  subject: string;
  department: string;
  status: 'new' | 'answered' | 'closed';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  reason: string;
  balanceAfter: number;
  adminUser?: string;
  createdAt: string;
}

export interface SmsLog {
  id: string;
  phone: string;
  message: string;
  status: string;
  statusText?: string;
  gateway?: string;
  createdAt: string;
}

export interface ShippingTier {
  id: string;
  minWeight?: number;
  maxWeight?: number;
  fee: number;
  title: string;
}

export interface StoreSettings {
  storeName?: string;
  storeSlogan?: string;
  storePhone?: string;
  storeEmail?: string;
  storeAddress?: string;
  noticeBarText?: string;
  noticeBarActive?: boolean;
  markupPercentage?: number;
  shippingFee?: number;
  freeShippingThreshold?: number;
  enableCOD?: boolean;
  shippingTiers?: ShippingTier[];
  taxPercentage?: number;
  banners?: Array<{
    id: string;
    title: string;
    image: string;
    link: string;
    active?: boolean;
  }>;
  quickShortcuts?: Array<{
    id: string;
    title: string;
    icon?: string;
    link: string;
    badge?: string;
  }>;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
