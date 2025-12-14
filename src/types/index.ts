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
  // price and stock are intentionally omitted from the UI/business logic.
  // They may still exist in older database records but are no longer used.
  price?: number;
  stock?: number;
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
  defaultDiscount: number;
  theme: 'light' | 'dark';
  accentColor: string;
}

// Cloth Alteration tracking
export interface Alteration {
  id: string;
  customerName: string;
  contactNumber?: string;
  garmentDescription: string;
  measurements: string;
  dueDate?: string;
  notes?: string;
  isCompleted: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  totalBills: number;
  todaysSales: number;
  totalItems: number;
  totalRevenue: number;
  dailySalesData: { date: string; sales: number }[];
}

// Dealer Management
export interface Dealer {
  id: string;
  dealerName: string;
  shopName: string;
  mobileNumber: string;
  whatsappNumber?: string;
  address: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Inventory Management
export interface InventoryItem {
  itemId: string;
  itemName: string;
  category: string;
  variant: string; // variantId or size
  variantId: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  updatedAt: string;
}

// Stock History Log
export interface StockHistory {
  id: string;
  itemId: string;
  variantId: string;
  itemName: string;
  variant: string;
  change: number; // positive for increase, negative for decrease
  previousStock: number;
  newStock: number;
  reason: 'purchase' | 'sale' | 'adjustment' | 'manual';
  referenceId?: string; // billId or purchaseId
  timestamp: string;
  notes?: string;
}

// Dealer Purchase
export interface PurchaseItem {
  itemId: string;
  itemName: string;
  variantId: string;
  variant: string; // size
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface DealerPurchase {
  id: string;
  dealerId: string;
  dealerName: string;
  purchaseDate: string;
  items: PurchaseItem[];
  totalQuantity: number;
  totalValue: number;
  notes?: string;
  createdAt: string;
}
