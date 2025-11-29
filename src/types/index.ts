export interface Category {
  id: string;
  name: string;
  icon?: string;
}

// Base Item (without price/stock, which are now in variants)
export interface Item {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  description?: string;
  image?: string;
}

export interface ItemVariant {
  id: string; // Unique ID for the variant (e.g., 's1-M-1299')
  size: string;
  price: number;
  stock: number; // Keeping stock for management purposes
}

// Database Item (Item + Variants)
export interface DBItem extends Item {
  variants: ItemVariant[];
}

// Bill Types
export interface BillItem {
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  subtotal: number;
  // New fields to track the specific variant sold
  variantId: string;
  size: string;
}

export type PaymentMode = 'cash' | 'upi' | 'card';

export interface Bill {
  id: string;
  date: string;
  customerName?: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  tax: number;
  taxRate: number;
  total: number;
  paymentMode: PaymentMode;
}

// Shop Settings
export interface ShopSettings {
  name: string;
  address: string;
  contactNumber: string;
  whatsappNumber: string;
  logo?: string;
  defaultTaxRate: number;
  defaultDiscount: number;
  theme: 'light' | 'dark';
  accentColor: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalBills: number;
  todaysSales: number;
  totalItems: number;
  totalRevenue: number;
  dailySalesData: { date: string; sales: number }[];
}
