import { Item, Category, Bill, ShopSettings } from "../types";

// Define the structure for the items in the database
// Each item will have a base price and a list of available sizes, each with its own stock.
// The user requested to remove stock and price display, but the data structure needs to support the logic.
// Since the user wants to select price/size/quantity in a popup, we'll assume a single item can have multiple price/size/stock combinations.

export interface ItemVariant {
  id: string; // Unique ID for the variant (e.g., 's1-M-1299')
  size: string;
  price: number;
  stock: number; // Keeping stock for management purposes, even if not displayed on the main card
}

export interface DBItem extends Omit<Item, 'price'> {
  variants: ItemVariant[];
}

export interface DBData {
  items: Record<string, DBItem>;
  categories: Record<string, Category>;
  bills: Record<string, Bill>;
  settings: ShopSettings;
}

// Initial data structure for Firebase (to be used for initial population if the database is empty)
export const initialDBData: DBData = {
  items: {
    's1': {
      id: 's1', category: 'shirts', subcategory: 'Formal', name: 'Formal White Shirt', description: 'Premium cotton formal shirt',
      variants: [
        { id: 's1-S-1299', size: 'S', price: 1299, stock: 10 },
        { id: 's1-M-1299', size: 'M', price: 1299, stock: 15 },
        { id: 's1-L-1399', size: 'L', price: 1399, stock: 8 },
      ]
    },
    's2': {
      id: 's2', category: 'shirts', subcategory: 'Formal', name: 'Formal Blue Shirt', description: 'Classic blue formal shirt',
      variants: [
        { id: 's2-M-1399', size: 'M', price: 1399, stock: 20 },
        { id: 's2-XL-1499', size: 'XL', price: 1499, stock: 5 },
      ]
    },
    'p1': {
      id: 'p1', category: 'pants', subcategory: 'Formal', name: 'Formal Black Pants', description: 'Premium formal trousers',
      variants: [
        { id: 'p1-30-1599', size: '30', price: 1599, stock: 12 },
        { id: 'p1-32-1599', size: '32', price: 1599, stock: 18 },
        { id: 'p1-34-1699', size: '34', price: 1699, stock: 7 },
      ]
    },
    // Add more items as needed, converting from mockData.ts
  },
  categories: {
    'shirts': { id: 'shirts', name: 'Shirts', icon: '👔' },
    'pants': { id: 'pants', name: 'Pants', icon: '👖' },
    'tshirts': { id: 'tshirts', name: 'T-Shirts', icon: '👕' },
    'shorts': { id: 'shorts', name: 'Shorts', icon: '⏱️' },
    'innerwear': { id: 'innerwear', name: 'Innerwear', icon: '🧥' },
    'fullsets': { id: 'fullsets', name: 'Full Sets', icon: '👗' },
    'boyskids': { id: 'boyskids', name: 'Kids Wear (Boys)', icon: '👦' },
    'girlskids': { id: 'girlskids', name: 'Kids Wear (Girls)', icon: '👧' },
    'accessories': { id: 'accessories', name: 'Accessories', icon: '🎩' },
  },
  bills: {}, // Bills will be added dynamically
  settings: {
    name: 'Fashion Hub Clothing',
    address: '123 Market Street, City Center',
    contactNumber: '+91 98765 43210',
    whatsappNumber: '+91 98765 43210',
    defaultTaxRate: 18,
    defaultDiscount: 0,
    theme: 'light',
    accentColor: '#4f46e5',
  },
};

// Utility function to convert the flat mock data to the new DB structure
// This is for demonstration and initial population, not for production use.
// In a real app, the user would manage this data via the ItemManagement page.
// Since we don't have the full mockData.ts, we'll stick to the few items defined above.
// The ItemManagement page will be updated to handle the new variant structure.

// We will use the following paths in the Realtime Database:
// /categories
// /items
// /bills
// /settings
