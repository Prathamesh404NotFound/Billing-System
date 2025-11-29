// This file is no longer used as data is now managed by Firebase Realtime Database.
// The initial data is defined in src/lib/firebaseSchema.ts.
// The types are defined in src/types/index.ts.

import { Category, Item, Bill, ShopSettings } from "@/types";

export const categories: Category[] = [];
export const items: Item[] = [];
export const mockBills: Bill[] = [];
export const defaultShopSettings: ShopSettings = {
  name: 'Fashion Hub Clothing',
  address: '123 Market Street, City Center',
  contactNumber: '+91 98765 43210',
  whatsappNumber: '+91 98765 43210',
  defaultTaxRate: 18,
  defaultDiscount: 0,
  theme: 'light',
  accentColor: '#4f46e5',
};
