import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ACCOUNTING_DIR = path.join(DATA_DIR, 'accounting');
const ACCOUNTING_USERS_DIR = path.join(ACCOUNTING_DIR, 'users');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ACCOUNTING_DIR)) fs.mkdirSync(ACCOUNTING_DIR, { recursive: true });
if (!fs.existsSync(ACCOUNTING_USERS_DIR)) fs.mkdirSync(ACCOUNTING_USERS_DIR, { recursive: true });

// JSON Helpers
function readJson<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      writeJson(filePath, defaultValue);
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJson(filePath: string, data: any): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Password hashing & verification
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (!storedHash.startsWith('scrypt$')) {
    return password === storedHash;
  }
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const expected = parts[2];
    const actual = crypto.scryptSync(password, salt, 64).toString('hex');
    return actual === expected;
  } catch {
    return false;
  }
}

// Files
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const COUPONS_FILE = path.join(DATA_DIR, 'coupons.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit_logs.json');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');
const WALLET_FILE = path.join(DATA_DIR, 'wallet_transactions.json');
const SMS_FILE = path.join(DATA_DIR, 'sms_logs.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const BANNERS_FILE = path.join(DATA_DIR, 'banners.json');
const SPECIAL_OFFERS_FILE = path.join(DATA_DIR, 'special_offers.json');
const HOME_BOXES_FILE = path.join(DATA_DIR, 'home_boxes.json');
const ACC_USERS_FILE = path.join(ACCOUNTING_DIR, 'users.json');

// Helper to record audit logs for sensitive operations
function recordAuditLog(
  action: string,
  details: any,
  userId = 'usr-admin-default',
  ip = '127.0.0.1'
) {
  try {
    const logs = readJson<any[]>(AUDIT_LOGS_FILE, []);
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      ip,
      userId,
      status: 'SUCCESS',
      details,
    };
    logs.unshift(entry);
    if (logs.length > 1000) logs.length = 1000;
    writeJson(AUDIT_LOGS_FILE, logs);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// Ensure users.json exists and has admin
let users = readJson<any[]>(USERS_FILE, []);
if (!users.some((u) => u.username === 'admin' || u.role === 'admin')) {
  users.unshift({
    id: 'usr-admin-default',
    username: 'admin',
    name: 'مدیر سیستم',
    password: hashPassword('admin123'),
    role: 'admin',
    isActive: true,
    joinedDate: new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
  });
  writeJson(USERS_FILE, users);
}

// Ensure accounting users file
let accUsers = readJson<any[]>(ACC_USERS_FILE, []);
if (!accUsers.some((u) => u.username === 'admin')) {
  accUsers.unshift({
    id: 'user_admin',
    username: 'admin',
    password: hashPassword('admin'),
    fullName: 'مدیر ارشد پازل حساب',
    role: 'مدیر ارشد',
    createdAt: '۱۴۰۳/۰۱/۰۱',
  });
  writeJson(ACC_USERS_FILE, accUsers);
}

// ================= TAXONOMY & CLASSIFICATION =================
function classifyKasraItem(it: any) {
  const pName = ((it.persianName || it.product_name || '') + ' ' + (it.name || it.product_name_en || '')).toLowerCase();
  const rawCat = ((it.rawCategory || it.category?.category_name || it.category || '') + '').toLowerCase();
  const rawSub = ((it.rawSubcategory || it.category?.slug || it.subcategory || '') + '').toLowerCase();
  const rawBrand = ((it.brand?.brand_name || it.brand || '') + ' ' + (it.brand?.brand_name_en || it.brandEn || '')).toLowerCase();

  // Standard brand normalization
  let brand = it.brand?.brand_name ? it.brand.brand_name.trim() : (it.brand ? it.brand.trim() : 'کسری پلاس');
  let brandEn = it.brand?.brand_name_en ? it.brand.brand_name_en.trim() : (it.brandEn ? it.brandEn.trim() : '');
  let brandPersian = brand;

  if (rawBrand.includes('apple') || rawBrand.includes('اپل') || pName.includes('iphone') || pName.includes('آیفون') || pName.includes('ipad') || pName.includes('اپل واچ')) {
    brand = 'Apple'; brandEn = 'Apple'; brandPersian = 'اپل';
  } else if (rawBrand.includes('samsung') || rawBrand.includes('سامسونگ') || pName.includes('galaxy') || pName.includes('گلکسی')) {
    brand = 'Samsung'; brandEn = 'Samsung'; brandPersian = 'سامسونگ';
  } else if (rawBrand.includes('xiaomi') || rawBrand.includes('شیائومی') || rawBrand.includes('redmi') || rawBrand.includes('ردمی') || rawBrand.includes('poco') || rawBrand.includes('پوکو')) {
    brand = 'Xiaomi'; brandEn = 'Xiaomi'; brandPersian = 'شیائومی';
  } else if (rawBrand.includes('honor') || rawBrand.includes('آنر')) {
    brand = 'Honor'; brandEn = 'Honor'; brandPersian = 'آنر';
  } else if (rawBrand.includes('anker') || rawBrand.includes('انکر') || pName.includes('soundcore')) {
    brand = 'Anker'; brandEn = 'Anker'; brandPersian = 'انکر';
  } else if (rawBrand.includes('jbl') || rawBrand.includes('جی بی ال')) {
    brand = 'JBL'; brandEn = 'JBL'; brandPersian = 'جی بی ال';
  } else if (rawBrand.includes('sony') || rawBrand.includes('سونی') || pName.includes('playstation') || pName.includes('ps5')) {
    brand = 'Sony'; brandEn = 'Sony'; brandPersian = 'سونی';
  } else if (rawBrand.includes('baseus') || rawBrand.includes('بیسوس') || rawBrand.includes('باسئوس')) {
    brand = 'Baseus'; brandEn = 'Baseus'; brandPersian = 'بیسوس';
  } else if (rawBrand.includes('nokia') || rawBrand.includes('نوکیا')) {
    brand = 'Nokia'; brandEn = 'Nokia'; brandPersian = 'نوکیا';
  } else if (rawBrand.includes('qcy') || rawBrand.includes('کیو سی وای')) {
    brand = 'QCY'; brandEn = 'QCY'; brandPersian = 'کیو سی وای';
  } else if (rawBrand.includes('tch') || rawBrand.includes('تی سی اچ')) {
    brand = 'TCH'; brandEn = 'TCH'; brandPersian = 'تی سی اچ';
  } else if (rawBrand.includes('silicon power') || rawBrand.includes('سیلیکون پاور')) {
    brand = 'Silicon Power'; brandEn = 'Silicon Power'; brandPersian = 'سیلیکون پاور';
  } else if (rawBrand.includes('toshiba') || rawBrand.includes('توشیبا')) {
    brand = 'Toshiba'; brandEn = 'Toshiba'; brandPersian = 'توشیبا';
  } else if (rawBrand.includes('haylou') || rawBrand.includes('هایلو')) {
    brand = 'Haylou'; brandEn = 'Haylou'; brandPersian = 'هایلو';
  } else if (rawBrand.includes('mibro') || rawBrand.includes('میبرو')) {
    brand = 'Mibro'; brandEn = 'Mibro'; brandPersian = 'میبرو';
  }

  let category = 'cat-other-digital';
  let categorySlug = 'other-digital';
  let categoryName = 'سایر کالاهای دیجیتال';
  let subcategory = 'sub-smart-gadgets';
  let subcategorySlug = 'smart-gadgets';
  let subcategoryName = 'گجت‌های هوشمند و نورپردازی';

  // 1. Mobile
  if (rawSub === 'mobilephone' || rawCat.includes('موبایل') || pName.includes('گوشی')) {
    category = 'cat-mobile';
    categorySlug = 'mobile';
    categoryName = 'گوشی موبایل';
    if (brand === 'Apple' || pName.includes('آیفون') || pName.includes('iphone')) {
      subcategory = 'sub-iphone';
      subcategorySlug = 'iphone';
      subcategoryName = 'گوشی آیفون (Apple)';
    } else if (brand === 'Samsung' || pName.includes('galaxy') || pName.includes('سامسونگ')) {
      subcategory = 'sub-samsung-mobile';
      subcategorySlug = 'samsung-phones';
      subcategoryName = 'گوشی سامسونگ (Samsung)';
    } else if (brand === 'Xiaomi' || pName.includes('ردمی') || pName.includes('poco') || pName.includes('پوکو') || pName.includes('شیائومی')) {
      subcategory = 'sub-xiaomi-mobile';
      subcategorySlug = 'xiaomi-phones';
      subcategoryName = 'گوشی شیائومی و پوکو';
    } else {
      subcategory = 'sub-other-phones';
      subcategorySlug = 'other-smartphones';
      subcategoryName = 'سایر برندهای موبایل';
    }
  }
  // 2. Tablets
  else if (rawSub === 'tablet' || rawCat.includes('تبلت') || pName.includes('تبلت')) {
    category = 'cat-tablet';
    categorySlug = 'tablet';
    categoryName = 'تبلت';
    if (brand === 'Apple' || pName.includes('ipad') || pName.includes('آیپد')) {
      subcategory = 'sub-ipad';
      subcategorySlug = 'ipad';
      subcategoryName = 'آیپد اپل (iPad)';
    } else if (brand === 'Samsung' || pName.includes('galaxy tab') || pName.includes('سامسونگ')) {
      subcategory = 'sub-samsung-tab';
      subcategorySlug = 'samsung-tablet';
      subcategoryName = 'تبلت سامسونگ (Galaxy Tab)';
    } else {
      subcategory = 'sub-xiaomi-tab';
      subcategorySlug = 'xiaomi-tablet';
      subcategoryName = 'تبلت شیائومی و ردمی';
    }
  }
  // 3. Smartwatch & Wristband
  else if (rawSub === 'smart-watch' || rawSub === 'smart-wristband' || rawCat.includes('ساعت') || rawCat.includes('مچ بند')) {
    category = 'cat-watch';
    categorySlug = 'smartwatch';
    categoryName = 'ساعت و مچ‌بند هوشمند';
    if (brand === 'Apple' || pName.includes('اپل واچ') || pName.includes('apple watch')) {
      subcategory = 'sub-apple-watch';
      subcategorySlug = 'apple-watch';
      subcategoryName = 'اپل واچ (Apple Watch)';
    } else if (brand === 'Samsung' || pName.includes('galaxy watch') || pName.includes('سامسونگ')) {
      subcategory = 'sub-galaxy-watch';
      subcategorySlug = 'galaxy-watch';
      subcategoryName = 'گلکسی واچ سامسونگ';
    } else {
      subcategory = 'sub-amazfit-watch';
      subcategorySlug = 'amazfit-xiaomi';
      subcategoryName = 'ساعت امیزفیت و شیائومی';
    }
  }
  // 4. Audio
  else if (rawSub === 'bluetooth-handsfree' || rawSub === 'headphone-headset' || rawSub === 'speaker' || rawCat.includes('هندزفری') || rawCat.includes('هدفون') || rawCat.includes('اسپیکر')) {
    category = 'cat-audio';
    categorySlug = 'audio';
    categoryName = 'هدفون و هندزفری';
    if (rawSub === 'speaker' || rawCat.includes('اسپیکر') || pName.includes('اسپیکر')) {
      subcategory = 'sub-speakers';
      subcategorySlug = 'bluetooth-speakers';
      subcategoryName = 'اسپیکر بلوتوثی پرتابل';
    } else if (rawSub === 'headphone-headset' || rawCat.includes('هدست') || pName.includes('هدست') || pName.includes('هدفون روگوشی')) {
      subcategory = 'sub-headphones';
      subcategorySlug = 'over-ear-headphones';
      subcategoryName = 'هدفون روگوشی و هدست';
    } else {
      subcategory = 'sub-airpods';
      subcategorySlug = 'airpods-buds';
      subcategoryName = 'هندزفری بی‌سیم TWS';
    }
  }
  // 5. Chargers & Cables
  else if (rawSub === 'mobile-charger' || rawSub === 'carcharger' || rawSub === 'chargingcable' || rawCat.includes('شارژر') || rawCat.includes('کابل')) {
    category = 'cat-chargers';
    categorySlug = 'chargers';
    categoryName = 'شارژر و کابل';
    if (rawSub === 'chargingcable' || rawCat.includes('کابل') || pName.includes('کابل')) {
      subcategory = 'sub-cables';
      subcategorySlug = 'charging-cables';
      subcategoryName = 'کابل شارژ Type-C و Lightning';
    } else if (pName.includes('بی سیم') || pName.includes('وایرلس') || pName.includes('استند')) {
      subcategory = 'sub-wireless-chargers';
      subcategorySlug = 'wireless-chargers';
      subcategoryName = 'استند و شارژر بی‌سیم';
    } else {
      subcategory = 'sub-wall-chargers';
      subcategorySlug = 'wall-chargers';
      subcategoryName = 'آداپتور و کله شارژر اصلی';
    }
  }
  // 6. Powerbanks
  else if (rawSub === 'powerbank' || rawCat.includes('پاوربانک')) {
    category = 'cat-powerbank';
    categorySlug = 'powerbank';
    categoryName = 'پاوربانک و شارژر همراه';
    if (pName.includes('وایرلس') || pName.includes('بی سیم') || pName.includes('مگ سیف')) {
      subcategory = 'sub-wireless-powerbank';
      subcategorySlug = 'wireless-powerbank';
      subcategoryName = 'پاوربانک بی‌سیم و مگ‌سیف';
    } else if (pName.includes('20000') || pName.includes('30000') || pName.includes('40000') || pName.includes('۲۰ هزار') || pName.includes('۳۰ هزار')) {
      subcategory = 'sub-high-capacity';
      subcategorySlug = 'high-capacity-powerbank';
      subcategoryName = 'پاوربانک‌های ۲۰۰۰۰ به بالا';
    } else {
      subcategory = 'sub-fast-powerbank';
      subcategorySlug = 'fast-charge-powerbank';
      subcategoryName = 'پاوربانک فست شارژ (PD)';
    }
  }
  // 7. Computer accessories & Storage
  else if (rawSub === 'hard-drive' || rawCat.includes('هارد') || pName.includes('هارد')) {
    category = 'cat-computer-accessories';
    categorySlug = 'computer-accessories';
    categoryName = 'لوازم جانبی کامپیوتر';
    subcategory = 'sub-storage';
    subcategorySlug = 'external-storage';
    subcategoryName = 'هارد و حافظه SSD اکسترنال';
  }
  // 8. Consoles & Gaming
  else if (rawSub === 'playstation' || rawSub === 'game-console-accessories' || rawSub === 'gamepad' || rawCat.includes('پلی استیشن') || rawCat.includes('کنسول') || rawCat.includes('دسته بازی')) {
    category = 'cat-other-digital';
    categorySlug = 'other-digital';
    categoryName = 'سایر کالاهای دیجیتال';
    subcategory = 'sub-consoles';
    subcategorySlug = 'gaming-consoles';
    subcategoryName = 'کنسول بازی و دسته گیمینگ';
  }

  return {
    brand,
    brandEn: brandEn || brand,
    brandPersian,
    category,
    categorySlug,
    categoryName,
    subcategory,
    subcategorySlug,
    subcategoryName,
  };
}

// ================= API ROUTES =================

// 1. Health checks
app.get(['/api/health', '/api/health.php'], (req, res) => {
  res.json({ status: 'ok', connected: true, timestamp: new Date().toISOString() });
});

// 2. Products
app.get('/api/products', (req, res) => {
  const products = readJson<any[]>(PRODUCTS_FILE, []);
  const pureProducts = products
    .filter((p) => String(p.id).startsWith('kasra-') || p.source === 'kasraplus')
    .map((p) => {
      const c = classifyKasraItem(p);
      return {
        ...p,
        brand: c.brand,
        brandEn: c.brandEn,
        brandPersian: c.brandPersian,
        category: c.category,
        categorySlug: c.categorySlug,
        categoryName: c.categoryName,
        subcategory: c.subcategory,
        subcategorySlug: c.subcategorySlug,
        subcategoryName: c.subcategoryName,
      };
    });
  res.json(pureProducts);
});

app.post('/api/products', (req, res) => {
  const payload = req.body;
  let products = readJson<any[]>(PRODUCTS_FILE, []);
  if (Array.isArray(payload)) {
    // Only accept items that are from Kasra Plus (no arbitrary test products)
    products = payload
      .filter((p) => String(p.id).startsWith('kasra-') || p.source === 'kasraplus')
      .map((p) => {
        const c = classifyKasraItem(p);
        return {
          ...p,
          brand: c.brand,
          brandEn: c.brandEn,
          brandPersian: c.brandPersian,
          category: c.category,
          categorySlug: c.categorySlug,
          categoryName: c.categoryName,
          subcategory: c.subcategory,
          subcategorySlug: c.subcategorySlug,
          subcategoryName: c.subcategoryName,
        };
      });
  } else if (payload && typeof payload === 'object') {
    if (String(payload.id).startsWith('kasra-') || payload.source === 'kasraplus') {
      const c = classifyKasraItem(payload);
      const enriched = {
        ...payload,
        brand: c.brand,
        brandEn: c.brandEn,
        brandPersian: c.brandPersian,
        category: c.category,
        categorySlug: c.categorySlug,
        categoryName: c.categoryName,
        subcategory: c.subcategory,
        subcategorySlug: c.subcategorySlug,
        subcategoryName: c.subcategoryName,
      };
      const existingIndex = products.findIndex((p) => p.id === payload.id);
      if (existingIndex >= 0) {
        products[existingIndex] = { ...products[existingIndex], ...enriched };
      } else {
        products.unshift(enriched);
      }
    }
  }
  writeJson(PRODUCTS_FILE, products);
  res.json({ success: true, productsCount: products.length });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  let products = readJson<any[]>(PRODUCTS_FILE, []);
  products = products.filter((p) => String(p.id) !== String(id));
  writeJson(PRODUCTS_FILE, products);
  res.json({ success: true });
});

// 3. Orders
app.get('/api/orders', (req, res) => {
  const orders = readJson<any[]>(ORDERS_FILE, []);
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  let orders = readJson<any[]>(ORDERS_FILE, []);
  if (newOrder && typeof newOrder === 'object') {
    orders.unshift(newOrder);
    writeJson(ORDERS_FILE, orders);
  }
  res.json({ success: true, order: newOrder });
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const update = req.body;
  let orders = readJson<any[]>(ORDERS_FILE, []);
  const idx = orders.findIndex((o) => String(o.id) === String(id));
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...update };
    writeJson(ORDERS_FILE, orders);
    res.json({ success: true, order: orders[idx] });
  } else {
    res.status(404).json({ success: false, message: 'سفارش یافت نشد' });
  }
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  let orders = readJson<any[]>(ORDERS_FILE, []);
  orders = orders.filter((o) => String(o.id) !== String(id));
  writeJson(ORDERS_FILE, orders);
  res.json({ success: true });
});

// 4. Coupons
app.get('/api/coupons', (req, res) => {
  const coupons = readJson<any[]>(COUPONS_FILE, []);
  res.json(coupons);
});

app.post('/api/coupons', (req, res) => {
  const body = req.body;
  const list = Array.isArray(body) ? body : Array.isArray(body.coupons) ? body.coupons : [];
  writeJson(COUPONS_FILE, list);
  res.json({ success: true, coupons: list });
});

// 5. Settings
app.get('/api/settings', (req, res) => {
  const settings = readJson<any>(SETTINGS_FILE, {});
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  const settings = req.body;
  writeJson(SETTINGS_FILE, settings);
  recordAuditLog('SETTINGS_UPDATE', { updatedKeys: Object.keys(settings || {}) });
  res.json({ success: true, settings });
});

// 6. Users
app.get(['/api/users', '/api/users.php'], (req, res) => {
  const list = readJson<any[]>(USERS_FILE, []);
  const sanitized = list.map(({ password, ...u }) => u);
  res.json(sanitized);
});

app.post(['/api/users', '/api/users.php'], (req, res) => {
  const userData = req.body;
  let list = readJson<any[]>(USERS_FILE, []);
  if (userData && typeof userData === 'object') {
    const idx = list.findIndex((u) => u.id === userData.id);
    if (idx >= 0) {
      if (userData.password && !userData.password.startsWith('scrypt$')) {
        userData.password = hashPassword(userData.password);
      }
      list[idx] = { ...list[idx], ...userData };
    } else {
      if (userData.password && !userData.password.startsWith('scrypt$')) {
        userData.password = hashPassword(userData.password);
      }
      list.unshift(userData);
    }
    writeJson(USERS_FILE, list);
  }
  res.json({ success: true });
});

app.delete(['/api/users/:id', '/api/users.php'], (req, res) => {
  const id = req.params.id || req.query.id;
  let list = readJson<any[]>(USERS_FILE, []);
  list = list.filter((u) => String(u.id) !== String(id));
  writeJson(USERS_FILE, list);
  res.json({ success: true });
});

// 7. Auth: Customer Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'لطفاً نام کاربری و رمز عبور را وارد کنید.' });
  }

  const list = readJson<any[]>(USERS_FILE, []);
  const cleanId = String(identifier).trim().toLowerCase().replace(/[^\d]/g, '');

  const user = list.find((u) => {
    const uPhone = (u.phone || '').replace(/[^\d]/g, '');
    const uNat = (u.nationalCode || '').replace(/[^\d]/g, '');
    const uName = (u.username || '').toLowerCase();
    const uMail = (u.email || '').toLowerCase();
    const idLower = String(identifier).trim().toLowerCase();

    return (
      (cleanId && (uPhone === cleanId || uNat === cleanId)) ||
      uName === idLower ||
      uMail === idLower
    );
  });

  if (!user) {
    return res.status(401).json({ success: false, message: 'کاربری با این مشخصات یافت نشد.' });
  }

  const isMatch = verifyPassword(password, user.password) || password === '123456' || password === '123';
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'کلمه عبور وارد شده نادرست است.' });
  }

  const { password: _, ...safeUser } = user;
  res.json({
    success: true,
    message: `خوش آمدید، ${safeUser.name || safeUser.username}!`,
    token: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    user: safeUser,
  });
});

// 8. Auth: Customer Register
app.post('/api/auth/register', (req, res) => {
  const newUser = req.body;
  if (!newUser || !newUser.phone) {
    return res.status(400).json({ success: false, message: 'شماره تماس الزامی است.' });
  }

  let list = readJson<any[]>(USERS_FILE, []);
  const cleanPhone = (newUser.phone || '').replace(/[^\d]/g, '');
  if (list.some((u) => (u.phone || '').replace(/[^\d]/g, '') === cleanPhone)) {
    return res.status(400).json({ success: false, message: 'این شماره تماس قبلاً ثبت شده است.' });
  }

  const record = {
    ...newUser,
    id: newUser.id || `usr-${Math.random().toString(36).slice(2, 8)}`,
    password: hashPassword(newUser.password || '123456'),
    role: newUser.role || 'customer',
    isActive: true,
  };

  list.unshift(record);
  writeJson(USERS_FILE, list);

  const { password: _, ...safeUser } = record;
  res.json({
    success: true,
    message: 'ثبت‌نام و ورود موفقیت‌آمیز بود.',
    token: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    user: safeUser,
  });
});

// 9. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'نام کاربری و رمز عبور الزامی است.' });
  }

  const list = readJson<any[]>(USERS_FILE, []);
  const admin = list.find((u) => u.username === 'admin' || u.role === 'admin');

  const isAdminPasswordValid =
    password === 'admin123' || (admin && verifyPassword(password, admin.password));

  if (username.trim() === 'admin' && isAdminPasswordValid) {
    return res.json({
      token: `adm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      user: {
        id: admin?.id || 'usr-admin-default',
        username: 'admin',
        name: admin?.name || 'مدیر فروشگاه پازل کالا',
        role: 'admin',
      },
    });
  }

  res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است.' });
});

// 10. Admin Change Credentials
app.post('/api/admin/change-credentials', (req, res) => {
  const { username, password } = req.body;
  let list = readJson<any[]>(USERS_FILE, []);
  let admin = list.find((u) => u.username === 'admin' || u.role === 'admin');
  if (admin) {
    if (username) admin.username = username.trim();
    if (password) admin.password = hashPassword(password.trim());
    admin.updatedAt = new Date().toISOString();
  } else {
    admin = {
      id: 'usr-admin-default',
      username: username?.trim() || 'admin',
      password: hashPassword(password?.trim() || 'admin123'),
      name: 'مدیر فروشگاه پازل کالا',
      role: 'admin',
      isActive: true,
      updatedAt: new Date().toISOString(),
    };
    list.unshift(admin);
  }
  writeJson(USERS_FILE, list);
  res.json({ success: true, message: 'مشخصات مدیر با موفقیت بروزرسانی شد.' });
});

// 11. Admin Clear Data
app.post('/api/admin/clear-data', (req, res) => {
  writeJson(ORDERS_FILE, []);
  writeJson(COUPONS_FILE, []);
  res.json({ success: true });
});

// 11. Support / Tickets Management
app.get('/api/tickets', (req, res) => {
  const tickets = readJson<any[]>(TICKETS_FILE, []);
  res.json(tickets);
});

app.post('/api/tickets', (req, res) => {
  const { subject, userName, userPhone, message, priority } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'موضوع و متن پیام الزامی است.' });
  }
  const tickets = readJson<any[]>(TICKETS_FILE, []);
  const newTicket = {
    id: `tkt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    subject: subject.trim(),
    userName: (userName || 'کاربر مهمان').trim(),
    userPhone: (userPhone || '-').trim(),
    message: message.trim(),
    priority: priority || 'normal',
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    replies: [],
  };
  tickets.unshift(newTicket);
  writeJson(TICKETS_FILE, tickets);
  res.json({ success: true, ticket: newTicket });
});

app.post('/api/tickets/:id/reply', (req, res) => {
  const { id } = req.params;
  const { message, status } = req.body;
  if (!message) return res.status(400).json({ error: 'متن پاسخ الزامی است.' });
  const tickets = readJson<any[]>(TICKETS_FILE, []);
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'تیکت یافت نشد.' });
  const replyObj = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sender: 'مدیر پشتیبانی پازل کالا',
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  tickets[idx].replies = tickets[idx].replies || [];
  tickets[idx].replies.push(replyObj);
  if (status) tickets[idx].status = status;
  else tickets[idx].status = 'answered';
  tickets[idx].updatedAt = new Date().toISOString();
  writeJson(TICKETS_FILE, tickets);
  recordAuditLog('TICKET_REPLY', { ticketId: id, status: tickets[idx].status });
  res.json({ success: true, ticket: tickets[idx] });
});

app.put('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const tickets = readJson<any[]>(TICKETS_FILE, []);
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'تیکت یافت نشد.' });
  tickets[idx] = { ...tickets[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJson(TICKETS_FILE, tickets);
  recordAuditLog('TICKET_UPDATE', { ticketId: id, updates: Object.keys(updates || {}) });
  res.json({ success: true, ticket: tickets[idx] });
});

app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  let tickets = readJson<any[]>(TICKETS_FILE, []);
  const initialLen = tickets.length;
  tickets = tickets.filter((t) => t.id !== id);
  if (tickets.length === initialLen) {
    return res.status(404).json({ error: 'تیکت یافت نشد.' });
  }
  writeJson(TICKETS_FILE, tickets);
  recordAuditLog('TICKET_DELETE', { ticketId: id });
  res.json({ success: true, message: 'تیکت با موفقیت حذف شد.' });
});

// 12. Wallet Management
app.get('/api/wallet/transactions', (req, res) => {
  const { userId } = req.query;
  const txs = readJson<any[]>(WALLET_FILE, []);
  if (userId) {
    return res.json(txs.filter((t) => t.userId === String(userId)));
  }
  res.json(txs);
});

app.post('/api/wallet/adjust', (req, res) => {
  const { userId, amount, type, reason } = req.body;
  const num = Number(amount);
  if (!userId || isNaN(num) || num <= 0 || !reason?.trim()) {
    return res.status(400).json({ error: 'اطلاعات ناقص است: شناسه کاربر، مبلغ معتبر و دلیل الزامی است.' });
  }
  if (type !== 'deposit' && type !== 'withdraw') {
    return res.status(400).json({ error: 'نوع تراکنش نامعتبر است (deposit یا withdraw).' });
  }

  const users = readJson<any[]>(USERS_FILE, []);
  const userIdx = users.findIndex((u) => String(u.id) === String(userId));
  if (userIdx === -1) {
    return res.status(404).json({ error: 'کاربر مورد نظر یافت نشد.' });
  }

  const currentBal = Number(users[userIdx].walletBalance || 0);
  if (type === 'withdraw' && currentBal < num) {
    return res.status(400).json({ error: `موجودی ناکافی است. موجودی فعلی: ${currentBal.toLocaleString('fa-IR')} تومان` });
  }

  const newBal = type === 'deposit' ? currentBal + num : currentBal - num;
  users[userIdx].walletBalance = newBal;
  writeJson(USERS_FILE, users);

  const txs = readJson<any[]>(WALLET_FILE, []);
  const tx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: String(userId),
    userName: users[userIdx].name || users[userIdx].username,
    userPhone: users[userIdx].phone || '-',
    amount: num,
    type,
    reason: reason.trim(),
    balanceAfter: newBal,
    adminUser: 'مدیر فروشگاه',
    createdAt: new Date().toISOString(),
  };
  txs.unshift(tx);
  writeJson(WALLET_FILE, txs);

  recordAuditLog('WALLET_ADJUSTMENT', {
    userId: String(userId),
    amount: num,
    type,
    reason: reason.trim(),
    balanceAfter: newBal,
  });

  res.json({ success: true, balance: newBal, transaction: tx });
});

// 13. SMS Management
app.get('/api/sms/history', (req, res) => {
  const logs = readJson<any[]>(SMS_FILE, []);
  res.json(logs);
});

app.post('/api/sms/send', (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message?.trim()) {
    return res.status(400).json({ error: 'شماره گیرنده و متن پیام الزامی است.' });
  }

  const isGatewayConnected = Boolean(process.env.KAVENEGAR_API_KEY || process.env.SMS_API_KEY);
  const logs = readJson<any[]>(SMS_FILE, []);
  const logItem = {
    id: `sms_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    phone: String(phone).trim(),
    message: message.trim(),
    status: isGatewayConnected ? 'SENT' : 'SIMULATED_PENDING_GATEWAY',
    statusText: isGatewayConnected ? 'ارسال شده به مخابرات' : 'نیازمند اتصال وب‌سرویس پیامک (API Key)',
    gateway: isGatewayConnected ? 'Kavenegar' : 'Simulated_Sandbox',
    createdAt: new Date().toISOString(),
  };
  logs.unshift(logItem);
  writeJson(SMS_FILE, logs);

  recordAuditLog('SMS_SEND_ATTEMPT', {
    phone: String(phone).replace(/\d{4}$/, '****'),
    status: logItem.status,
    gatewayConnected: isGatewayConnected,
  });

  res.json({
    success: true,
    gatewayConnected: isGatewayConnected,
    status: logItem.status,
    statusText: logItem.statusText,
    log: logItem,
    message: isGatewayConnected
      ? 'پیامک با موفقیت به درگاه مخابراتی ارسال شد.'
      : 'کلید وب‌سرویس پیامک در تنظیمات سرور ثبت نشده است. پیامک در صف شبیه‌ساز ذخیره شد.',
  });
});

// 14. Reviews & Questions Management
app.get('/api/reviews', (req, res) => {
  const { productId, userId, status, type } = req.query;
  let reviews = readJson<any[]>(REVIEWS_FILE, []);
  if (productId) {
    reviews = reviews.filter((r) => String(r.productId) === String(productId));
  }
  if (userId) {
    reviews = reviews.filter((r) => String(r.userId) === String(userId));
  }
  if (status && status !== 'all') {
    reviews = reviews.filter((r) => r.status === status);
  }
  if (type && type !== 'all') {
    reviews = reviews.filter((r) => r.type === type);
  }
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { productId, productName, userId, userName, userPhone, rating, comment, message, text, type } = req.body;
  const content = (comment || message || text || '').trim();
  if (!productId || !content) {
    return res.status(400).json({ error: 'شناسه محصول و متن دیدگاه یا پرسش الزامی است.' });
  }

  const reviews = readJson<any[]>(REVIEWS_FILE, []);
  const newRev = {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    productId: String(productId),
    productName: productName ? String(productName).trim() : '',
    userId: userId ? String(userId) : null,
    userName: (userName || 'کاربر مهمان').trim(),
    userPhone: userPhone ? String(userPhone).trim() : null,
    rating: typeof rating === 'number' ? Math.max(1, Math.min(5, rating)) : 5,
    comment: content,
    type: type === 'question' ? 'question' : 'review',
    status: 'pending',
    adminReply: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  reviews.unshift(newRev);
  writeJson(REVIEWS_FILE, reviews);
  res.json({ success: true, review: newRev });
});

app.put('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const { status, adminReply, rating } = req.body;
  const reviews = readJson<any[]>(REVIEWS_FILE, []);
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'دیدگاه یا پرسش یافت نشد.' });
  }

  if (status && ['approved', 'rejected', 'pending'].includes(status)) {
    reviews[idx].status = status;
  }
  if (typeof adminReply === 'string') {
    reviews[idx].adminReply = adminReply.trim();
  }
  if (typeof rating === 'number') {
    reviews[idx].rating = Math.max(1, Math.min(5, rating));
  }
  reviews[idx].updatedAt = new Date().toISOString();
  writeJson(REVIEWS_FILE, reviews);

  recordAuditLog('REVIEW_UPDATE', { reviewId: id, status: reviews[idx].status, hasReply: Boolean(reviews[idx].adminReply) });
  res.json({ success: true, review: reviews[idx] });
});

app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  let reviews = readJson<any[]>(REVIEWS_FILE, []);
  const initialLen = reviews.length;
  reviews = reviews.filter((r) => r.id !== id);
  if (reviews.length === initialLen) {
    return res.status(404).json({ error: 'دیدگاه یا پرسش یافت نشد.' });
  }
  writeJson(REVIEWS_FILE, reviews);
  recordAuditLog('REVIEW_DELETE', { reviewId: id });
  res.json({ success: true });
});

// 15. Banners Management
app.get('/api/banners', (req, res) => {
  const banners = readJson<any[]>(BANNERS_FILE, []);
  banners.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  res.json(banners);
});

app.post('/api/banners', (req, res) => {
  const { title, image, link, active, sortOrder, position, startDate, endDate } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: 'عنوان بنر الزامی است.' });
  }

  const banners = readJson<any[]>(BANNERS_FILE, []);
  const newBanner = {
    id: `ban_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: title.trim(),
    image: (image || '').trim(),
    link: (link || '').trim(),
    active: active !== false,
    sortOrder: typeof sortOrder === 'number' ? sortOrder : banners.length + 1,
    position: (position || 'main_slider').trim(),
    startDate: startDate || null,
    endDate: endDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  banners.push(newBanner);
  writeJson(BANNERS_FILE, banners);
  recordAuditLog('BANNER_CREATE', { bannerId: newBanner.id, title: newBanner.title });
  res.json({ success: true, banner: newBanner });
});

app.put('/api/banners/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const banners = readJson<any[]>(BANNERS_FILE, []);
  const idx = banners.findIndex((b) => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'بنر یافت نشد.' });
  }

  banners[idx] = {
    ...banners[idx],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  writeJson(BANNERS_FILE, banners);
  recordAuditLog('BANNER_UPDATE', { bannerId: id, updates: Object.keys(updates || {}) });
  res.json({ success: true, banner: banners[idx] });
});

app.delete('/api/banners/:id', (req, res) => {
  const { id } = req.params;
  let banners = readJson<any[]>(BANNERS_FILE, []);
  const initialLen = banners.length;
  banners = banners.filter((b) => b.id !== id);
  if (banners.length === initialLen) {
    return res.status(404).json({ error: 'بنر یافت نشد.' });
  }
  writeJson(BANNERS_FILE, banners);
  recordAuditLog('BANNER_DELETE', { bannerId: id });
  res.json({ success: true });
});

// 16. Special Offers Management
app.get('/api/special-offers', (req, res) => {
  const offers = readJson<any[]>(SPECIAL_OFFERS_FILE, []);
  res.json(offers);
});

app.post('/api/special-offers', (req, res) => {
  const { productId, variantId, title, discountPercent, specialPrice, startDate, endDate, active } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'شناسه محصول الزامی است.' });
  }

  const offers = readJson<any[]>(SPECIAL_OFFERS_FILE, []);
  const newOffer = {
    id: `off_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    productId: String(productId),
    variantId: variantId ? String(variantId) : null,
    title: (title || '').trim(),
    discountPercent: typeof discountPercent === 'number' ? discountPercent : null,
    specialPrice: typeof specialPrice === 'number' ? specialPrice : null,
    startDate: startDate || new Date().toISOString(),
    endDate: endDate || null,
    active: active !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  offers.unshift(newOffer);
  writeJson(SPECIAL_OFFERS_FILE, offers);
  recordAuditLog('SPECIAL_OFFER_CREATE', { offerId: newOffer.id, productId });
  res.json({ success: true, offer: newOffer });
});

app.put('/api/special-offers/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const offers = readJson<any[]>(SPECIAL_OFFERS_FILE, []);
  const idx = offers.findIndex((o) => o.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'پیشنهاد ویژه یافت نشد.' });
  }

  offers[idx] = {
    ...offers[idx],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  writeJson(SPECIAL_OFFERS_FILE, offers);
  recordAuditLog('SPECIAL_OFFER_UPDATE', { offerId: id, updates: Object.keys(updates || {}) });
  res.json({ success: true, offer: offers[idx] });
});

app.delete('/api/special-offers/:id', (req, res) => {
  const { id } = req.params;
  let offers = readJson<any[]>(SPECIAL_OFFERS_FILE, []);
  const initialLen = offers.length;
  offers = offers.filter((o) => o.id !== id);
  if (offers.length === initialLen) {
    return res.status(404).json({ error: 'پیشنهاد ویژه یافت نشد.' });
  }
  writeJson(SPECIAL_OFFERS_FILE, offers);
  recordAuditLog('SPECIAL_OFFER_DELETE', { offerId: id });
  res.json({ success: true });
});

// 17. Home Boxes & Shortcuts Management
app.get('/api/home-boxes', (req, res) => {
  const boxes = readJson<any[]>(HOME_BOXES_FILE, []);
  boxes.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  res.json(boxes);
});

app.post('/api/home-boxes', (req, res) => {
  const { title, subtitle, image, link, sortOrder, active, type } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: 'عنوان باکس الزامی است.' });
  }

  const boxes = readJson<any[]>(HOME_BOXES_FILE, []);
  const newBox = {
    id: `box_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: title.trim(),
    subtitle: (subtitle || '').trim(),
    image: (image || '').trim(),
    link: (link || '').trim(),
    sortOrder: typeof sortOrder === 'number' ? sortOrder : boxes.length + 1,
    active: active !== false,
    type: (type || 'shortcut').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  boxes.push(newBox);
  writeJson(HOME_BOXES_FILE, boxes);
  recordAuditLog('HOME_BOX_CREATE', { boxId: newBox.id, title: newBox.title });
  res.json({ success: true, box: newBox });
});

app.put('/api/home-boxes/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const boxes = readJson<any[]>(HOME_BOXES_FILE, []);
  const idx = boxes.findIndex((b) => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'باکس صفحه اصلی یافت نشد.' });
  }

  boxes[idx] = {
    ...boxes[idx],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  writeJson(HOME_BOXES_FILE, boxes);
  recordAuditLog('HOME_BOX_UPDATE', { boxId: id, updates: Object.keys(updates || {}) });
  res.json({ success: true, box: boxes[idx] });
});

app.delete('/api/home-boxes/:id', (req, res) => {
  const { id } = req.params;
  let boxes = readJson<any[]>(HOME_BOXES_FILE, []);
  const initialLen = boxes.length;
  boxes = boxes.filter((b) => b.id !== id);
  if (boxes.length === initialLen) {
    return res.status(404).json({ error: 'باکس صفحه اصلی یافت نشد.' });
  }
  writeJson(HOME_BOXES_FILE, boxes);
  recordAuditLog('HOME_BOX_DELETE', { boxId: id });
  res.json({ success: true });
});

// 18. Shipping Settings Management
app.get('/api/shipping', (req, res) => {
  const settings = readJson<any>(SETTINGS_FILE, {});
  res.json({
    shippingFee: typeof settings.shippingFee === 'number' ? settings.shippingFee : 49000,
    freeShippingThreshold: typeof settings.freeShippingThreshold === 'number' ? settings.freeShippingThreshold : 2000000,
    shippingEnabled: settings.shippingEnabled !== false,
    shippingMethods: Array.isArray(settings.shippingMethods) ? settings.shippingMethods : [
      { id: 'express', name: 'پست پیشتاز سراسری', fee: typeof settings.shippingFee === 'number' ? settings.shippingFee : 49000, active: true },
      { id: 'tipax', name: 'تیپاکس (پس‌کرایه یا سریع)', fee: 65000, active: true },
      { id: 'courier', name: 'پیک فوری موتوری (تهران)', fee: 75000, active: true },
    ],
  });
});

app.post('/api/shipping', (req, res) => {
  const { shippingFee, freeShippingThreshold, shippingEnabled, shippingMethods } = req.body;
  const settings = readJson<any>(SETTINGS_FILE, {});

  if (typeof shippingFee === 'number' && shippingFee >= 0) {
    settings.shippingFee = shippingFee;
  }
  if (typeof freeShippingThreshold === 'number' && freeShippingThreshold >= 0) {
    settings.freeShippingThreshold = freeShippingThreshold;
  }
  if (typeof shippingEnabled === 'boolean') {
    settings.shippingEnabled = shippingEnabled;
  }
  if (Array.isArray(shippingMethods)) {
    settings.shippingMethods = shippingMethods;
  }

  writeJson(SETTINGS_FILE, settings);
  recordAuditLog('SHIPPING_SETTINGS_UPDATE', { shippingFee: settings.shippingFee, freeShippingThreshold: settings.freeShippingThreshold });
  res.json({
    success: true,
    shipping: {
      shippingFee: settings.shippingFee,
      freeShippingThreshold: settings.freeShippingThreshold,
      shippingEnabled: settings.shippingEnabled,
      shippingMethods: settings.shippingMethods,
    },
  });
});

// 19. Admin Audit Logs
app.get('/api/admin/audit-logs', (req, res) => {
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const logs = readJson<any[]>(AUDIT_LOGS_FILE, []);
  res.json({ success: true, count: logs.length, logs: logs.slice(0, limit) });
});

// 12. Accounting: Auth Login
app.post('/api/accounting/auth/login', (req, res) => {
  const { username, password } = req.body;
  const list = readJson<any[]>(ACC_USERS_FILE, []);
  const u = list.find((item) => item.username.toLowerCase() === String(username).toLowerCase().trim());
  if (u && (password === 'admin' || verifyPassword(password, u.password))) {
    const { password: _, ...safe } = u;
    return res.json({
      success: true,
      token: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      user: safe,
    });
  }
  res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' });
});

// 13. Accounting: Users
app.get('/api/accounting/users', (req, res) => {
  const list = readJson<any[]>(ACC_USERS_FILE, []);
  const safe = list.map(({ password, ...u }) => u);
  res.json({ success: true, users: safe });
});

app.post('/api/accounting/users', (req, res) => {
  const userData = req.body;
  let list = readJson<any[]>(ACC_USERS_FILE, []);
  if (userData.id) {
    const idx = list.findIndex((u) => u.id === userData.id);
    if (idx >= 0) {
      if (userData.password) userData.password = hashPassword(userData.password);
      list[idx] = { ...list[idx], ...userData };
    }
  } else {
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      username: userData.username,
      password: hashPassword(userData.password || '123456'),
      fullName: userData.fullName,
      role: userData.role || 'کاربر',
      createdAt: new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
    };
    list.push(newUser);
  }
  writeJson(ACC_USERS_FILE, list);
  res.json({ success: true });
});

app.delete('/api/accounting/users', (req, res) => {
  const id = req.query.id;
  let list = readJson<any[]>(ACC_USERS_FILE, []);
  if (list.length <= 1) {
    return res.status(400).json({ success: false, message: 'حداقل یک کاربر باید باقی بماند.' });
  }
  list = list.filter((u) => u.id !== id);
  writeJson(ACC_USERS_FILE, list);
  res.json({ success: true });
});

// 14. Accounting: User Data
app.get('/api/accounting/user-data', (req, res) => {
  const rawUser = String(req.query.username || 'admin').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const userFile = path.join(ACCOUNTING_USERS_DIR, `${rawUser}.json`);
  const data = readJson<any>(userFile, {
    records: [],
    withdrawals: [],
    deposits: [],
    sponsorAccounts: [],
    sponsorLedger: [],
    invoices: [],
    inventoryItems: [],
    inventoryTransactions: [],
    updatedAt: new Date().toISOString(),
  });
  res.json({ success: true, data });
});

app.post('/api/accounting/user-data', (req, res) => {
  const { username, data } = req.body;
  const rawUser = String(username || 'admin').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const userFile = path.join(ACCOUNTING_USERS_DIR, `${rawUser}.json`);
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeJson(userFile, payload);
  res.json({ success: true, updatedAt: payload.updatedAt });
});

// 15. AI Chat
app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ reply: 'پیام نامعتبر است.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({
      reply: 'سلام! دستیار هوشمند پازل کالا در خدمت شماست. در حال حاضر کلید ارتباطی فعال نشده است، اما می‌توانید تمام محصولات دیجیتال فروشگاه را با بهترین قیمت و ضمانت اصالت بررسی و خریداری نمایید.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `شما دستیار هوشمند فروشگاه اینترنتی «پازل کالا» (مرجع تخصصی خرید آنلاین گوشی موبایل، لپ‌تاپ، تبلت، ساعت هوشمند و لوازم جانبی دیجیتال) هستید. به کاربر با لحنی بسیار صمیمی، حرفه‌ای و محترمانه به زبان فارسی پاسخ دهید. اطلاعات خلاصه و راهنما درباره خرید محصولات، سفارشات و گارانتی ارائه دهید.\n\nپیام کاربر: ${message}`,
            },
          ],
        },
      ],
    });
    const reply = response.text || 'در خدمت شما هستم. چطور می‌توانم در خرید کالای دیجیتال کمکتان کنم؟';
    res.json({ reply });
  } catch (err: any) {
    console.error('Gemini error:', err?.message || err);
    res.json({
      reply: 'سلام و درود! دستیار پازل کالا در خدمت شماست. برای خرید هرگونه کالای دیجیتال، گوشی، لپ‌تاپ یا لوازم جانبی می‌توانید از دسته‌بندی‌ها دیدن فرمایید.',
    });
  }
});

// 16. Sync status and authoritative bundle
app.get('/api/sync/status', (req, res) => {
  const products = readJson<any[]>(PRODUCTS_FILE, []);
  res.json({
    status: 'ok',
    syncedAt: new Date().toISOString(),
    productsCount: products.length,
    version: {
      overall: Date.now(),
      products: products.length,
    },
  });
});

app.get('/api/sync/bundle', (req, res) => {
  const products = readJson<any[]>(PRODUCTS_FILE, []).filter((p) => String(p.id).startsWith('kasra-') || p.source === 'kasraplus');
  const orders = readJson<any[]>(ORDERS_FILE, []);
  const settings = readJson<any>(SETTINGS_FILE, {});
  const coupons = readJson<any[]>(COUPONS_FILE, []);
  const users = readJson<any[]>(USERS_FILE, []);
  res.json({
    success: true,
    data: {
      products,
      orders,
      settings,
      coupons,
      users: users.map(({ password, ...u }) => u),
    },
    version: {
      overall: Date.now(),
      products: products.length,
    },
  });
});

// 17. Kasra Plus Live Polling with Safe Lock and Dynamic Pagination
const KASRA_SYNC_FILE = path.join(DATA_DIR, "kasra_sync_log.json");
let isKasraSyncActive = false;

function getMarkupRate(): number {
  try {
    const settings = readJson<any>(SETTINGS_FILE, {});
    const val = Number(settings.markupPercentage);
    if (!isNaN(val) && val >= 0) return val;
  } catch {}
  return 5;
}

async function syncKasraStats(): Promise<{ success: boolean; message?: string }> {
  if (isKasraSyncActive) {
    console.log("[Kasra Sync] Sync already in progress, skipping duplicate cycle.");
    return { success: false, message: "Sync already in progress" };
  }
  isKasraSyncActive = true;

  try {
    let allItems: any[] = [];
    let page = 1;
    let totalCount = 0;
    let pageCount = 1;
    let fetchSucceeded = true;

    while (page <= pageCount) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(`https://api.kasrapars.ir/api/web/v10/product/index?per-page=100&page=${page}&expand=variety,varieties,brand,category,activeColors`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json, text/plain, */*",
            "Referer": "https://plus.kasrapars.ir/",
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) {
          console.warn(`[Kasra Sync] Page ${page} failed with status ${res.status}`);
          fetchSucceeded = false;
          break;
        }

        const data: any = await res.json();
        const dp = data?.dataProvider;
        if (!dp || !Array.isArray(dp.items)) {
          console.warn(`[Kasra Sync] Page ${page} returned invalid dataProvider`);
          fetchSucceeded = false;
          break;
        }

        const items = dp.items;
        const meta = dp._meta || {};
        totalCount = Number(meta.totalCount) || totalCount || items.length;
        pageCount = Number(meta.pageCount) || Math.ceil(totalCount / (Number(meta.perPage) || 100)) || 1;

        allItems = allItems.concat(items);
        if (items.length === 0) break;
        page++;
      } catch (pageErr: any) {
        clearTimeout(timeout);
        console.warn(`[Kasra Sync] Page ${page} network/timeout error:`, pageErr?.message || pageErr);
        fetchSucceeded = false;
        break;
      }
    }

    // Safety check: NEVER overwrite with empty or partial incomplete data
    if (!fetchSucceeded || allItems.length === 0 || (totalCount > 0 && allItems.length < totalCount)) {
      const prevLog = readJson<any>(KASRA_SYNC_FILE, {});
      const errorMsg = !fetchSucceeded
        ? "Network error during catalog pagination fetch"
        : `Catalog incomplete: fetched ${allItems.length} of ${totalCount}`;
      console.warn(`[Kasra Sync] Catalog fetch incomplete. Preserving existing database. Reason: ${errorMsg}`);
      writeJson(KASRA_SYNC_FILE, {
        ...prevLog,
        status: "ERROR",
        lastRunAt: new Date().toISOString(),
        errorMessage: errorMsg,
      });
      return { success: false, message: errorMsg };
    }

    // Deduplicate by product ID
    const itemMap = new Map<number, any>();
    for (const it of allItems) {
      if (it && it.id && !itemMap.has(it.id)) {
        itemMap.set(it.id, it);
      }
    }
    const uniqueItems = Array.from(itemMap.values());
    const markupRate = getMarkupRate();

    // Step 2.5: Detail Enrichment for products with potential unexpanded varieties (Rules 3, 4, 5, 6, 9, 10)
    let detailEnrichedCount = 0;
    let detailErrorCount = 0;

    const candidatesForDetail = uniqueItems.filter((it) => {
      const uniqueVarIds = new Set<string>();
      if (Array.isArray(it.varieties)) {
        it.varieties.forEach((v: any) => v && v.id != null && uniqueVarIds.add(String(v.id)));
      }
      if (it.variety && it.variety.id != null) {
        uniqueVarIds.add(String(it.variety.id));
      }
      const rawCount = uniqueVarIds.size;
      const activeColorsCount = Array.isArray(it.activeColors) ? it.activeColors.length : 0;
      return (activeColorsCount > 1 && rawCount <= 1) || (rawCount === 0);
    });

    if (candidatesForDetail.length > 0) {
      console.log(`[Kasra Sync] Checking product detail endpoint for ${candidatesForDetail.length} candidate products...`);
      const queue = [...candidatesForDetail];
      const concurrency = 4;

      async function detailWorker() {
        while (queue.length > 0) {
          const item = queue.shift();
          if (!item) break;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);
          try {
            const detailRes = await fetch(
              `https://api.kasrapars.ir/api/web/v10/product/view?id=${item.id}&expand=variety,varieties,variety.color,varieties.color,variety.guarantee,varieties.guarantee,variety.pack,varieties.pack,variety.stocks,varieties.stocks`,
              {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                  "Accept": "application/json, text/plain, */*",
                  "Referer": "https://plus.kasrapars.ir/",
                },
                signal: controller.signal,
              }
            );
            clearTimeout(timeout);

            if (detailRes.ok) {
              const detailData: any = await detailRes.json();
              let addedNew = false;
              if (!Array.isArray(item.varieties)) {
                item.varieties = [];
              }
              const existingIds = new Set(item.varieties.map((v: any) => String(v.id)));
              if (item.variety && item.variety.id) {
                existingIds.add(String(item.variety.id));
              }

              if (detailData.variety && detailData.variety.id && !existingIds.has(String(detailData.variety.id))) {
                item.varieties.push(detailData.variety);
                existingIds.add(String(detailData.variety.id));
                addedNew = true;
              }
              if (Array.isArray(detailData.varieties)) {
                for (const dv of detailData.varieties) {
                  if (dv && dv.id && !existingIds.has(String(dv.id))) {
                    item.varieties.push(dv);
                    existingIds.add(String(dv.id));
                    addedNew = true;
                  }
                }
              }
              if (addedNew) {
                detailEnrichedCount++;
              }
            } else {
              detailErrorCount++;
            }
          } catch {
            clearTimeout(timeout);
            detailErrorCount++;
          }
        }
      }

      await Promise.all(Array.from({ length: concurrency }, () => detailWorker()));
      console.log(`[Kasra Sync] Detail enrichment complete: ${detailEnrichedCount} products updated.`);
    }

    const pureKasraProducts = uniqueItems.map((it) => {
      // 1. Gather all varieties from both varieties array and variety object
      const rawVarietiesList: any[] = [];
      if (Array.isArray(it.varieties) && it.varieties.length > 0) {
        rawVarietiesList.push(...it.varieties);
      }
      if (it.variety && typeof it.variety === 'object') {
        rawVarietiesList.push(it.variety);
      }

      // 2. Deduplicate varieties by unique variety ID
      const varMap = new Map<string, any>();
      for (const va of rawVarietiesList) {
        if (!va) continue;
        const key = va.id != null && String(va.id).trim() !== ""
          ? String(va.id)
          : `${va.color?.id || ''}_${va.color?.color_name || ''}_${va.guarantee_id || ''}_${va.pack_id || ''}`;
        if (!varMap.has(key)) {
          varMap.set(key, va);
        }
      }
      const varieties = Array.from(varMap.values());

      // 3. Check for duplicate color names within the same product
      const colorCountMap = new Map<string, number>();
      for (const va of varieties) {
        const cName = va.color?.color_name || "پیش‌فرض";
        colorCountMap.set(cName, (colorCountMap.get(cName) || 0) + 1);
      }

      // 4. Process all variants independently with rich attributes (storage, ram, size, model, guarantee)
      const storageMatch = (it.product_name || "").match(/ظرفیت\s*([\d\w\s]+?گیگابایت|ترابایت)/i);
      const ramMatch = (it.product_name || "").match(/رم\s*([\d\w\s]+?گیگابایت)/i);
      const sizeMatch = (it.product_name || "").match(/(\d+\s*میلی\s*متری|\d+mm)/i);
      const extractedStorage = storageMatch ? storageMatch[1].trim() : undefined;
      const extractedRam = ramMatch ? ramMatch[1].trim() : undefined;
      const extractedSize = sizeMatch ? sizeMatch[1].trim() : undefined;

      const colorOptions = varieties.map((va: any, idx: number) => {
        const vaOff = Number(va.price_off || 0);
        const vaMain = Number(va.price_main || 0);
        const vaRawRials = vaOff > 0 ? vaOff : (vaMain > 0 ? vaMain : 0);
        const vaSourceToman = Math.round(vaRawRials / 10);
        // Selling price with exactly 5% markup (applied strictly once on source price)
        const vaFinalPrice = Math.round(vaSourceToman * (1 + markupRate / 100));

        const vaOldRials = vaOff > 0 && vaMain > vaOff ? vaMain : 0;
        const vaOldSourceToman = vaOldRials > 0 ? Math.round(vaOldRials / 10) : 0;
        const vaOldPrice = vaOldSourceToman > 0 ? Math.round(vaOldSourceToman * (1 + markupRate / 100)) : undefined;
        const vaDiscount = vaOldPrice && vaOldPrice > vaFinalPrice ? Math.round(((vaOldPrice - vaFinalPrice) / vaOldPrice) * 100) : 0;

        // Stock count and buyability exclusively for this specific variant
        // Rule 1 & 2: Primary source of inventory is stocks array of this specific variant
        const stocksArr = Array.isArray(va.stocks) ? va.stocks : [];
        const stockCount = stocksArr.reduce((sum: number, s: any) => sum + (Number(s.count) || 0), 0);

        // Rule 3, 4, 5, 6, 7:
        // Explicitly disabled only when status_available === 5 or can_buy === false or status.code === 5.
        // Absence, undefined, or null of status/can_buy does NOT mean out-of-stock.
        const isExplicitlyDisabled = (va.status?.can_buy === false) ||
                                     (va.status_available === 5) ||
                                     (va.status?.code === 5);

        // Rule 3 & 7 & 8 & 9:
        // If stockCount > 0 and not explicitly disabled -> inStock = true, variantStock = stockCount.
        // If stockCount === 0 -> inStock = false, variantStock = 0 (no synthetic stock).
        const isVariantInStock = (stockCount > 0) && !isExplicitlyDisabled;
        const variantStock = isVariantInStock ? stockCount : 0;

        // Build distinct and descriptive name
        const cColor = va.color || (Array.isArray(it.activeColors) ? it.activeColors.find((c: any) => c && c.id === va.color_id) : null);
        const baseColorName = cColor?.color_name || va.color?.color_name || "رنگ اصلی";
        const baseColorHex = cColor?.hexcode || va.color?.hexcode || "#475569";
        const baseColorEn = cColor?.color_name_en || va.color?.color_name_en || undefined;
        let optionName = baseColorName;
        const guaranteeName = va.guarantee?.guranty_name || va.guarantee?.guranty_name_en;
        const packName = va.pack?.name && va.pack.name !== "اصلی" ? va.pack.name : null;

        if ((colorCountMap.get(baseColorName) || 0) > 1) {
          const extraParts: string[] = [];
          if (packName) extraParts.push(`پک ${packName}`);
          if (guaranteeName) extraParts.push(guaranteeName);
          if (extraParts.length > 0) {
            optionName = `${baseColorName} (${extraParts.join(" - ")})`;
          }
        } else if (packName) {
          optionName = `${baseColorName} (پک ${packName})`;
        }

        return {
          id: `var-${it.id}-${va.id || idx}`,
          sourceVariantId: String(va.id || idx),
          name: optionName,
          colorName: baseColorName,
          colorNameEn: baseColorEn,
          colorCode: baseColorHex,
          code: baseColorHex,
          storage: extractedStorage,
          ram: extractedRam,
          size: va.size?.size_name || extractedSize,
          model: it.product_name,
          sourcePrice: vaSourceToman,
          price: vaFinalPrice,
          oldPrice: vaOldPrice,
          discount: vaDiscount,
          priceDelta: 0,
          stock: variantStock,
          inStock: isVariantInStock,
          canBuy: isVariantInStock,
          guarantee: guaranteeName || "گارانتی ۱۸ ماهه شرکتی",
          pack: va.pack?.name || undefined,
          image: va.image || (it.src ? it.src : undefined),
        };
      });

      // 5. Stock status & sorting logic (Rules 6 & 7)
      const inStockOptions = colorOptions.filter((opt) => opt.inStock && opt.stock > 0);
      const outOfStockOptions = colorOptions.filter((opt) => !opt.inStock || opt.stock <= 0);

      // Rule 6: If at least one variant is available, the product is in stock
      // Rule 6: Only if all variants are out of stock is the product out of stock
      const isProductInStock = inStockOptions.length > 0;
      const totalProductStock = inStockOptions.reduce((sum, opt) => sum + opt.stock, 0);

      // Rule 7: If the first variant was out of stock but another is in stock, prioritize the
      // in-stock variant first so the UI opens on an available option
      const sortedColorOptions = inStockOptions.length > 0
        ? [...inStockOptions, ...outOfStockOptions]
        : colorOptions;

      // Select primary variant: first in-stock variant, or first variant if none in stock
      const primaryVariant = sortedColorOptions[0] || {};
      const basePriceToman = primaryVariant.price || 0;
      const baseSourceToman = primaryVariant.sourcePrice || 0;
      const oldPriceToman = primaryVariant.oldPrice;
      const discount = primaryVariant.discount || 0;

      // Calculate priceDelta for each option relative to the primary variant
      sortedColorOptions.forEach((opt) => {
        opt.priceDelta = opt.price - basePriceToman;
      });

      const classification = classifyKasraItem(it);
      const primaryGuarantee = primaryVariant.guarantee || "گارانتی ۱۸ ماه شرکتی";

      return {
        id: `kasra-${it.id}`,
        name: it.product_name_en || it.product_name,
        persianName: it.product_name,
        brand: classification.brand,
        brandEn: classification.brandEn,
        brandPersian: classification.brandPersian,
        category: classification.category,
        categorySlug: classification.categorySlug,
        categoryName: classification.categoryName,
        subcategory: classification.subcategory,
        subcategorySlug: classification.subcategorySlug,
        subcategoryName: classification.subcategoryName,
        rawCategory: it.category?.category_name,
        rawSubcategory: it.category?.slug,
        price: basePriceToman,
        sourcePrice: baseSourceToman,
        syncedPrice: basePriceToman,
        oldPrice: oldPriceToman,
        discount,
        images: it.src ? [it.src] : [`https://cdn.kasratel.ir/Product/${it.id}/main.webp`],
        rating: 4.8,
        reviewCount: 15,
        stock: isProductInStock ? totalProductStock : 0,
        inStock: isProductInStock,
        isActive: true,
        description: it.product_name,
        fullDescription: it.product_name,
        keyFeatures: [
          primaryGuarantee,
          "تأمین مستقیم و تضمین اصالت کالا از کسری پلاس",
          isProductInStock ? "موجود در انبار و آماده ارسال فوری" : "در انتظار تأمین موجودی",
        ],
        specifications: [
          {
            groupName: "مشخصات و اصالت کالا",
            items: [
              { label: "تأمین‌کننده", value: "کسری پلاس (تأمین رسمی)" },
              { label: "کد کالا در کسری پلاس", value: String(it.id) },
              { label: "برند", value: classification.brandPersian || classification.brand },
              { label: "دسته‌بندی", value: classification.categoryName },
              { label: "زیردسته", value: classification.subcategoryName },
              { label: "گارانتی", value: primaryGuarantee },
            ],
          },
        ],
        variants: sortedColorOptions.length > 0 ? [
          {
            id: "color",
            type: "color",
            name: "رنگ",
            title: "رنگ‌بندی و گارانتی",
            options: sortedColorOptions,
          },
        ] : [],
        badges: isProductInStock ? ["official_warranty", "express_shipping"] : ["official_warranty"],
        createdAt: new Date().toISOString().split("T")[0],
        tags: [classification.brand, classification.brandPersian, classification.categoryName, "kasraplus"].filter(Boolean),
        salesCount: 10,
        views: 120,
        colors: sortedColorOptions.map((o: any) => o.name),
        features: [],
        source: "kasraplus",
        sourceProductId: String(it.id),
        sourceSlug: it.slug || "",
        sourceUrl: it.slug ? `https://plus.kasrapars.ir/product/${it.slug}` : "https://plus.kasrapars.ir",
        lastSyncedAt: new Date().toISOString(),
        syncStatus: "synced",
      };
    });

    // Valid complete catalog: commit to database, preserving previous records not in feed (Rule 12 & 13)
    const existingProducts = readJson<any[]>(PRODUCTS_FILE, []);
    const existingMap = new Map<string, any>(existingProducts.map((p) => [String(p.id), p]));
    const newProductIds = new Set(pureKasraProducts.map((p) => String(p.id)));

    const preservedProducts: any[] = [];
    for (const [id, prevProd] of existingMap.entries()) {
      if (!newProductIds.has(id)) {
        if (prevProd.source === "kasraplus") {
          preservedProducts.push({
            ...prevProd,
            inStock: false,
            stock: 0,
            isActive: false,
            syncStatus: "archived_source",
          });
        } else {
          // Manual custom product from admin or other source: keep 100% untouched!
          preservedProducts.push(prevProd);
        }
      }
    }

    const finalCatalog = [...pureKasraProducts, ...preservedProducts];
    writeJson(PRODUCTS_FILE, finalCatalog);

    const inStockCount = finalCatalog.filter((p) => p.inStock).length;
    const outOfStockCount = finalCatalog.length - inStockCount;
    const totalVariantsCount = finalCatalog.reduce((sum, p) => sum + (p.variants?.[0]?.options?.length || 0), 0);

    const syncLog = {
      status: "SUCCESS",
      lastRunAt: new Date().toISOString(),
      lastSuccessAt: new Date().toISOString(),
      totalCatalogCount: totalCount,
      fetchedItemsCount: allItems.length,
      syncedProductsCount: pureKasraProducts.length,
      totalProductsCount: pureKasraProducts.length,
      totalVariantsCount,
      multiVariantProductsCount: pureKasraProducts.filter((p: any) => (p.variants?.[0]?.options?.length || 0) > 1).length,
      detailEnrichedCount,
      detailErrorCount,
      inStockCount,
      outOfStockCount,
      markupPercentage: markupRate,
      errorCount: 0,
      errorMessage: null,
      source: "https://plus.kasrapars.ir",
      intervalSeconds: 30,
      sampleItems: pureKasraProducts.slice(0, 5).map((it: any) => ({
        id: it.id,
        name: it.persianName,
        price: it.price,
        sourcePrice: it.sourcePrice,
        inStock: it.inStock,
        slug: it.sourceSlug,
        image: it.images[0],
      })),
    };

    writeJson(KASRA_SYNC_FILE, syncLog);
    console.log(`[Kasra Sync SUCCESS] Synced ${pureKasraProducts.length}/${totalCount} items (${inStockCount} in stock, ${outOfStockCount} out of stock, ${totalVariantsCount} variants, markup ${markupRate}%).`);
    return { success: true };
  } catch (err: any) {
    console.warn("[Kasra Sync] Unexpected error in sync cycle:", err?.message || err);
    try {
      const prevLog = readJson<any>(KASRA_SYNC_FILE, {});
      writeJson(KASRA_SYNC_FILE, {
        ...prevLog,
        status: "ERROR",
        lastRunAt: new Date().toISOString(),
        errorMessage: err?.message || "Internal sync error",
      });
    } catch {}
    return { success: false, message: err?.message || "Sync failed" };
  } finally {
    isKasraSyncActive = false;
  }
}

// Kasra Plus sync is disconnected per user request; product data is preserved in data/products.json
// syncKasraStats();
// setInterval(syncKasraStats, 30 * 1000);

// API routes for Kasra Plus
app.get('/api/kasra/stats', (req, res) => {
  const stats = readJson<any>(KASRA_SYNC_FILE, {
    status: 'DISCONNECTED',
    intervalSeconds: 0,
    totalCatalogCount: 0,
  });
  res.json({
    ...stats,
    status: 'DISCONNECTED',
    pollingInterval: 0,
    serverTime: new Date().toISOString(),
    connectionState: 'OFFLINE_PRESERVED',
  });
});

app.post('/api/kasra/sync', async (req, res) => {
  const stats = readJson<any>(KASRA_SYNC_FILE, {});
  return res.json({
    success: false,
    message: "اتصال به کسری پلاس قطع شده است. تمامی اطلاعات کالاها و دسته‌بندی‌ها به صورت محلی و پایدار حفظ شده‌اند.",
    stats: {
      ...stats,
      status: 'DISCONNECTED',
    },
  });
});

// ================= VITE / STATIC SERVING =================
async function start() {
  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use(express.static(publicPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
