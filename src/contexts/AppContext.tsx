import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Item, DBItem, Bill, ShopSettings, BillItem, PaymentMode, Category } from "@/types";
import { defaultShopSettings } from "@/data/mockData";
import { initialDBData } from "@/lib/firebaseSchema";
import { db } from "@/lib/firebase";
import {
  onValue,
  ref,
  remove,
  set,
  update as updateRef,
  get, // Added get for initial data check and stock update
} from "firebase/database";

interface AppContextType {
  // Items
  items: DBItem[];
  addItem: (item: DBItem) => Promise<void>;
  updateItem: (id: string, item: Partial<DBItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemsByCategory: (category: string) => DBItem[];

  // Bills
  bills: Bill[];
  currentBill: Bill | null;
  createNewBill: () => void;
  addItemToBill: (item: DBItem, variantId: string, quantity: number) => void; // Updated signature
  removeItemFromBill: (variantId: string) => void; // Updated to use variantId
  updateBillItem: (variantId: string, quantity: number) => void; // Updated to use variantId
  saveBill: (paymentMode: PaymentMode, customerName?: string) => Promise<void>;
  setDiscount: (discount: number, type: 'fixed' | 'percentage') => void;
  setTaxRate: (rate: number) => void;

  // Settings
  shopSettings: ShopSettings;
  updateShopSettings: (settings: Partial<ShopSettings>) => Promise<void>;

  // Categories
  categories: Category[];
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}



const AppContext = createContext<AppContextType | undefined>(undefined);

const mapRecordToArray = <T,>(record?: Record<string, T> | null): T[] =>
  record ? Object.values(record) : [];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appItems, setAppItems] = useState<DBItem[]>([]);
  const [appBills, setAppBills] = useState<Bill[]>([]);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(defaultShopSettings);
  const [appCategories, setAppCategories] = useState<Category[]>([]);

  useEffect(() => {
    console.log("[AppContext] Subscribing to Firebase data (items, bills, shopSettings)");

    const itemsRef = ref(db, "items");
    const billsRef = ref(db, "bills");
    const settingsRef = ref(db, "settings"); // Changed from shopSettings to settings
    const categoriesRef = ref(db, "categories");

    // Initial data population check
    get(itemsRef).then((snapshot) => {
      if (!snapshot.exists()) {
        console.log("[Firebase] Items node empty. Populating with initial data.");
        set(ref(db, '/'), initialDBData)
          .then(() => console.log("[Firebase] Initial data populated successfully."))
          .catch(error => console.error("[Firebase] Failed to populate initial data:", error));
      }
    });

    const unsubItems = onValue(
      itemsRef,
      snapshot => {
        const val = snapshot.val();
        console.log("[Firebase] items snapshot received", val);
        setAppItems(mapRecordToArray<DBItem>(val));
      },
      error => {
        console.error("[Firebase] Error while listening to 'items'", error);
      }
    );

    const unsubBills = onValue(
      billsRef,
      snapshot => {
        const val = snapshot.val();
        console.log("[Firebase] bills snapshot received", val);
        const bills = mapRecordToArray<Bill>(val || {}).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAppBills(bills);
      },
      error => {
        console.error("[Firebase] Error while listening to 'bills'", error);
      }
    );

    const unsubSettings = onValue(
      settingsRef,
      snapshot => {
        const data = snapshot.val();
        console.log("[Firebase] settings snapshot received", data);
        if (data) {
          setShopSettings(data as ShopSettings);
        } else {
          console.log("[Firebase] settings empty, using defaultShopSettings");
          setShopSettings(defaultShopSettings);
        }
      },
      error => {
        console.error("[Firebase] Error while listening to 'shopSettings'", error);
      }
    );

    const unsubCategories = onValue(
      categoriesRef,
      snapshot => {
        const data = snapshot.val();
        console.log("[Firebase] categories snapshot received", data);

        if (data) {
          // Normal case: categories exist in DB
          setAppCategories(mapRecordToArray<Category>(data));
        } else {
          // Fallback: seed categories from initial schema if missing
          const fallbackCategories = initialDBData.categories || {};
          const fallbackArray = Object.values(fallbackCategories);
          console.log("[Firebase] categories empty, seeding from initialDBData", fallbackArray);

          setAppCategories(fallbackArray);

          // Also persist them to Realtime Database so future sessions see them
          if (fallbackArray.length > 0) {
            set(categoriesRef, fallbackCategories).catch(error => {
              console.error("[Firebase] Failed to seed categories into database", error);
            });
          }
        }
      },
      error => {
        console.error("[Firebase] Error while listening to 'categories'", error);
      }
    );

    return () => {
      console.log("[AppContext] Unsubscribing from Firebase listeners");
      unsubItems();
      unsubBills();
      unsubSettings();
      unsubCategories();
    };
  }, []);

  const createNewBill = useCallback(() => {
    const newBill: Bill = {
      id: `BILL-${Date.now()}`,
      date: new Date().toISOString(),
      items: [],
      subtotal: 0,
      discount: shopSettings.defaultDiscount,
      discountType: 'fixed',
      tax: 0,
      taxRate: shopSettings.defaultTaxRate,
      total: 0,
      paymentMode: 'cash',
    };
    setCurrentBill(newBill);
  }, [shopSettings.defaultDiscount, shopSettings.defaultTaxRate]);

  const calculateBillTotals = (billItems: BillItem[], discountAmount: number, discountType: 'fixed' | 'percentage', taxRate: number) => {
    const subtotal = billItems.reduce((sum, item) => sum + item.subtotal, 0);
    const actualDiscount = discountType === 'fixed' ? discountAmount : (subtotal * discountAmount) / 100;
    const taxableAmount = subtotal - actualDiscount;
    const tax = (taxableAmount * taxRate) / 100;
    const total = taxableAmount + tax;

    return {
      subtotal,
      discount: actualDiscount,
      tax: Math.round(tax),
      total: Math.round(total),
    };
  };

  const addItemToBill = useCallback((item: DBItem, variantId: string, quantity: number) => {
    if (!currentBill) return;

    const variant = item.variants.find(v => v.id === variantId);
    if (!variant) {
      console.error("Variant not found for item:", item.id, "variantId:", variantId);
      return;
    }

    // The BillItem now uses variantId for uniqueness in the bill
    const existingItem = currentBill.items.find((bi) => bi.variantId === variantId);
    let updatedItems: BillItem[];

    if (existingItem) {
      updatedItems = currentBill.items.map((bi) =>
        bi.variantId === variantId
          ? { ...bi, quantity: bi.quantity + quantity, subtotal: (bi.quantity + quantity) * variant.price }
          : bi
      );
    } else {
      updatedItems = [
        ...currentBill.items,
        {
          itemId: item.id,
          itemName: item.name,
          price: variant.price,
          quantity,
          subtotal: quantity * variant.price,
          variantId: variant.id,
          size: variant.size,
        },
      ];
    }

    const totals = calculateBillTotals(updatedItems, currentBill.discount, currentBill.discountType, currentBill.taxRate);

    setCurrentBill({
      ...currentBill,
      items: updatedItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
    });
  }, [currentBill]);

  const removeItemFromBill = useCallback((variantId: string) => {
    if (!currentBill) return;

    // Filter by variantId now
    const updatedItems = currentBill.items.filter((bi) => bi.variantId !== variantId);
    const totals = calculateBillTotals(updatedItems, currentBill.discount, currentBill.discountType, currentBill.taxRate);

    setCurrentBill({
      ...currentBill,
      items: updatedItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
    });
  }, [currentBill]);

  const updateBillItem = useCallback((variantId: string, quantity: number) => {
    if (!currentBill || quantity <= 0) return;

    // Update by variantId now
    const updatedItems = currentBill.items.map((bi) =>
      bi.variantId === variantId
        ? { ...bi, quantity, subtotal: quantity * bi.price }
        : bi
    );

    const totals = calculateBillTotals(updatedItems, currentBill.discount, currentBill.discountType, currentBill.taxRate);

    setCurrentBill({
      ...currentBill,
      items: updatedItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
    });
  }, [currentBill]);

  const setDiscount = useCallback((discountValue: number, type: 'fixed' | 'percentage') => {
    if (!currentBill) return;

    const totals = calculateBillTotals(currentBill.items, discountValue, type, currentBill.taxRate);

    setCurrentBill({
      ...currentBill,
      discount: discountValue,
      discountType: type,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
    });
  }, [currentBill]);

  const setTaxRate = useCallback((rate: number) => {
    if (!currentBill) return;

    const totals = calculateBillTotals(currentBill.items, currentBill.discount, currentBill.discountType, rate);

    setCurrentBill({
      ...currentBill,
      taxRate: rate,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
    });
  }, [currentBill]);

  const saveBill = useCallback(
    async (paymentMode: PaymentMode, customerName?: string) => {
      if (!currentBill || currentBill.items.length === 0) return;

      const billToSave: Bill = {
        ...currentBill,
        paymentMode,
        customerName: customerName || "Walk-in Customer",
      };

      console.log("[Firebase] Saving bill to Realtime Database", billToSave);
      try {
        // 1. Save the bill
        await set(ref(db, `bills/${billToSave.id}`), billToSave);
        console.log("[Firebase] Bill saved successfully at path:", `bills/${billToSave.id}`);

        // 2. Update stock for each item variant sold
        const stockUpdates: Record<string, number> = {};
        for (const billItem of billToSave.items) {
          const item = appItems.find(i => i.id === billItem.itemId);
          const variant = item?.variants.find(v => v.id === billItem.variantId);

          if (variant) {
            const newStock = variant.stock - billItem.quantity;
            // Path: items/{itemId}/variants/{variantIndex}/stock
            // Since we don't have the index, we'll fetch the item and find the index.
            // A better RTDB structure would be: items/{itemId}/variants/{variantId}
            // For now, we'll use a transaction or a more complex update. Let's simplify the structure in the schema first.
            // Reverting to a simpler update for now, assuming the ItemManagement page will handle the variant structure correctly.

            // To avoid complex transactions, we'll update the whole item's variants array.
            // This is a common pattern in RTDB when dealing with arrays.
            // For a robust solution, the variant structure should be an object/map, not an array.
            // Let's assume the ItemManagement page will handle the variant updates.
            // For the sake of completing the task, we'll implement a simple update that assumes the item is available in appItems.

            const itemRef = ref(db, `items/${billItem.itemId}`);
            const itemSnapshot = await get(itemRef);
            const dbItem: DBItem = itemSnapshot.val();

            if (dbItem) {
              const variantIndex = dbItem.variants.findIndex(v => v.id === billItem.variantId);
              if (variantIndex !== -1) {
                const newStock = dbItem.variants[variantIndex].stock - billItem.quantity;
                if (newStock < 0) {
                  console.warn(`[Firebase] Stock for ${billItem.itemName} (${billItem.size}) went negative!`);
                }
                // Update the stock directly in the variants array
                dbItem.variants[variantIndex].stock = newStock;
                await set(itemRef, dbItem);
                console.log(`[Firebase] Stock updated for ${billItem.itemName} (${billItem.size}) to ${newStock}`);
              }
            }
          }
        }

        setCurrentBill(null);
      } catch (error) {
        console.error("[Firebase] Failed to save bill or update stock", error);
        throw error;
      }
    },
    [currentBill, appItems]
  );

  const addItem = useCallback(async (item: DBItem) => {
    console.log("[Firebase] Adding item to Realtime Database", item);
    try {
      await set(ref(db, `items/${item.id}`), item);
      console.log("[Firebase] Item saved successfully at path:", `items/${item.id}`);
    } catch (error) {
      console.error("[Firebase] Failed to add item", error);
      throw error;
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<DBItem>) => {
    console.log("[Firebase] Updating item in Realtime Database", { id, updates });
    try {
      await updateRef(ref(db, `items/${id}`), updates);
      console.log("[Firebase] Item updated successfully at path:", `items/${id}`);
    } catch (error) {
      console.error("[Firebase] Failed to update item", error);
      throw error;
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    console.log("[Firebase] Deleting item from Realtime Database", { id });
    try {
      await remove(ref(db, `items/${id}`));
      console.log("[Firebase] Item deleted successfully at path:", `items/${id}`);
    } catch (error) {
      console.error("[Firebase] Failed to delete item", error);
      throw error;
    }
  }, []);

  const addCategory = useCallback(async (category: Category) => {
    console.log("[Firebase] Adding category to Realtime Database", category);
    try {
      await set(ref(db, `categories/${category.id}`), category);
      console.log("[Firebase] Category saved successfully at path:", `categories/${category.id}`);
    } catch (error) {
      console.error("[Firebase] Failed to add category", error);
      throw error;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    console.log("[Firebase] Updating category in Realtime Database", { id, updates });
    try {
      await updateRef(ref(db, `categories/${id}`), updates);
      console.log("[Firebase] Category updated successfully at path:", `categories/${id}`);
    } catch (error) {
      console.error("[Firebase] Failed to update category", error);
      throw error;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    console.log("[Firebase] Deleting category from Realtime Database", { id });
    try {
      await remove(ref(db, `categories/${id}`));
      console.log("[Firebase] Category deleted successfully at path:", `categories/${id}`);
    } catch (error) {
      console.error("[Firebase] Failed to delete category", error);
      throw error;
    }
  }, []);

  const getItemsByCategory = useCallback((category: string) => {
    return appItems.filter((item) => item.category === category);
  }, [appItems]);

  const updateShopSettings = useCallback(
    async (settings: Partial<ShopSettings>) => {
      const next = { ...shopSettings, ...settings };
      console.log("[Firebase] Updating settings in Realtime Database", next);
      try {
        await set(ref(db, "settings"), next);
        console.log("[Firebase] settings updated successfully");
        setShopSettings(next);
      } catch (error) {
        console.error("[Firebase] Failed to update settings", error);
        throw error;
      }
    },
    [shopSettings]
  );

  const value: AppContextType = {
    items: appItems,
    addItem,
    updateItem,
    deleteItem,
    getItemsByCategory,
    bills: appBills,
    currentBill,
    createNewBill,
    addItemToBill,
    removeItemFromBill,
    updateBillItem,
    saveBill,
    setDiscount,
    setTaxRate,
    shopSettings,
    updateShopSettings,
    categories: appCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
