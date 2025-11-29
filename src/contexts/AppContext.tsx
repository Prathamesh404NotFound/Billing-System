import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Item, DBItem, Bill, ShopSettings, BillItem, PaymentMode, Category, Alteration } from "@/types";
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
  addItemToBill: (item: DBItem, variantId: string, quantity: number, price: number) => void;
  removeItemFromBill: (variantId: string) => void; // Updated to use variantId
  updateBillItem: (variantId: string, quantity: number) => void; // Updated to use variantId
  saveBill: (paymentMode: PaymentMode, customerName?: string) => Promise<void>;
  setDiscount: (discount: number, type: 'fixed' | 'percentage') => void;

  // Settings
  shopSettings: ShopSettings;
  updateShopSettings: (settings: Partial<ShopSettings>) => Promise<void>;

  // Categories
  categories: Category[];
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Alterations
  alterations: Alteration[];
  addAlteration: (alteration: Alteration) => Promise<void>;
  updateAlteration: (id: string, updates: Partial<Alteration>) => Promise<void>;
  deleteAlteration: (id: string) => Promise<void>;
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
  const [appAlterations, setAppAlterations] = useState<Alteration[]>([]);

  useEffect(() => {
    console.log("[AppContext] Subscribing to Firebase data (items, bills, shopSettings)");

    const itemsRef = ref(db, "items");
    const billsRef = ref(db, "bills");
    const settingsRef = ref(db, "settings"); // Changed from shopSettings to settings
    const categoriesRef = ref(db, "categories");
    const alterationsRef = ref(db, "alterations");

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

    const unsubAlterations = onValue(
      alterationsRef,
      snapshot => {
        const data = snapshot.val();
        console.log("[Firebase] alterations snapshot received", data);
        setAppAlterations(mapRecordToArray<Alteration>(data));
      },
      error => {
        console.error("[Firebase] Error while listening to 'alterations'", error);
      }
    );

    return () => {
      console.log("[AppContext] Unsubscribing from Firebase listeners");
      unsubItems();
      unsubBills();
      unsubSettings();
      unsubCategories();
      unsubAlterations();
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
      total: 0,
      paymentMode: 'cash',
    };
    setCurrentBill(newBill);
  }, [shopSettings.defaultDiscount]);

  const calculateBillTotals = (billItems: BillItem[], discountAmount: number, discountType: 'fixed' | 'percentage') => {
    const subtotal = billItems.reduce((sum, item) => sum + item.subtotal, 0);
    const actualDiscount = discountType === 'fixed' ? discountAmount : (subtotal * discountAmount) / 100;
    const total = subtotal - actualDiscount;

    return {
      subtotal,
      discount: actualDiscount,
      total: Math.round(total),
    };
  };

  const addItemToBill = useCallback((item: DBItem, variantId: string, quantity: number, price: number) => {
    if (!currentBill) return;
    if (price <= 0) {
      console.error("Price must be greater than zero for billing");
      return;
    }

    const variant = item.variants.find(v => v.id === variantId);
    if (!variant) {
      console.error("Variant not found for item:", item.id, "variantId:", variantId);
      return;
    }

    // The BillItem now uses variantId for uniqueness in the bill
    const existingItem = currentBill.items.find((bi) => bi.variantId === variantId && bi.price === price);
    let updatedItems: BillItem[];

    if (existingItem) {
      updatedItems = currentBill.items.map((bi) =>
        bi.variantId === variantId && bi.price === price
          ? { ...bi, quantity: bi.quantity + quantity, subtotal: (bi.quantity + quantity) * price }
          : bi
      );
    } else {
      updatedItems = [
        ...currentBill.items,
        {
          itemId: item.id,
          itemName: item.name,
          price,
          quantity,
          subtotal: quantity * price,
          variantId: variant.id,
          size: variant.size,
        },
      ];
    }

    const totals = calculateBillTotals(updatedItems, currentBill.discount, currentBill.discountType);

    setCurrentBill({
      ...currentBill,
      items: updatedItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
    });
  }, [currentBill]);

  const removeItemFromBill = useCallback((variantId: string) => {
    if (!currentBill) return;

    // Filter by variantId now
    const updatedItems = currentBill.items.filter((bi) => bi.variantId !== variantId);
    const totals = calculateBillTotals(updatedItems, currentBill.discount, currentBill.discountType);

    setCurrentBill({
      ...currentBill,
      items: updatedItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
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

    const totals = calculateBillTotals(updatedItems, currentBill.discount, currentBill.discountType);

    setCurrentBill({
      ...currentBill,
      items: updatedItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
    });
  }, [currentBill]);

  const setDiscount = useCallback((discountValue: number, type: 'fixed' | 'percentage') => {
    if (!currentBill) return;

    const totals = calculateBillTotals(currentBill.items, discountValue, type);

    setCurrentBill({
      ...currentBill,
      discount: discountValue,
      discountType: type,
      subtotal: totals.subtotal,
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
        await set(ref(db, `bills/${billToSave.id}`), billToSave);
        console.log("[Firebase] Bill saved successfully at path:", `bills/${billToSave.id}`);

        setCurrentBill(null);
      } catch (error) {
        console.error("[Firebase] Failed to save bill", error);
        throw error;
      }
    },
    [currentBill]
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

  const addAlteration = useCallback(async (alteration: Alteration) => {
    console.log("[Firebase] Adding alteration to Realtime Database", alteration);
    try {
      await set(ref(db, `alterations/${alteration.id}`), alteration);
      console.log("[Firebase] Alteration saved successfully at path:", `alterations/${alteration.id}`);
    } catch (error) {
      console.error("[Firebase] Failed to add alteration", error);
      throw error;
    }
  }, []);

  const updateAlteration = useCallback(async (id: string, updates: Partial<Alteration>) => {
    console.log("[Firebase] Updating alteration in Realtime Database", { id, updates });
    try {
      await updateRef(ref(db, `alterations/${id}`), updates);
      console.log("[Firebase] Alteration updated successfully at path:", `alterations/${id}`);
    } catch (error) {
      console.error("[Firebase] Failed to update alteration", error);
      throw error;
    }
  }, []);

  const deleteAlteration = useCallback(async (id: string) => {
    console.log("[Firebase] Deleting alteration from Realtime Database", { id });
    try {
      await remove(ref(db, `alterations/${id}`));
      console.log("[Firebase] Alteration deleted successfully at path:", `alterations/${id}`);
    } catch (error) {
      console.error("[Firebase] Failed to delete alteration", error);
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
    shopSettings,
    updateShopSettings,
    categories: appCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    alterations: appAlterations,
    addAlteration,
    updateAlteration,
    deleteAlteration,
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
