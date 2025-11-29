import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useEffect, } from "react";
import { defaultShopSettings, categories } from "@/data/mockData";
import { initialDBData } from "@/lib/firebaseSchema";
import { db } from "@/lib/firebase";
import { onValue, ref, remove, set, update as updateRef, get, // Added get for initial data check and stock update
 } from "firebase/database";
const AppContext = createContext(undefined);
const mapRecordToArray = (record) => record ? Object.values(record) : [];
export function AppProvider({ children }) {
    const [appItems, setAppItems] = useState([]);
    const [appBills, setAppBills] = useState([]);
    const [currentBill, setCurrentBill] = useState(null);
    const [shopSettings, setShopSettings] = useState(defaultShopSettings);
    useEffect(() => {
        console.log("[AppContext] Subscribing to Firebase data (items, bills, shopSettings)");
        // Quick connectivity test: write a tiny heartbeat node
        const heartbeatPath = `debug/heartbeat`;
        set(ref(db, heartbeatPath), { ts: Date.now() })
            .then(() => {
            console.log("[Firebase] Heartbeat write OK at path:", heartbeatPath);
        })
            .catch(error => {
            console.error("[Firebase] Heartbeat write FAILED. Check database URL/rules.", error);
        });
        const itemsRef = ref(db, "items");
        const billsRef = ref(db, "bills");
        const settingsRef = ref(db, "settings"); // Changed from shopSettings to settings
        // Initial data population check
        get(itemsRef).then((snapshot) => {
            if (!snapshot.exists()) {
                console.log("[Firebase] Items node empty. Populating with initial data.");
                set(ref(db, '/'), initialDBData)
                    .then(() => console.log("[Firebase] Initial data populated successfully."))
                    .catch(error => console.error("[Firebase] Failed to populate initial data:", error));
            }
        });
        const unsubItems = onValue(itemsRef, snapshot => {
            const val = snapshot.val();
            console.log("[Firebase] items snapshot received", val);
            setAppItems(mapRecordToArray(val));
        }, error => {
            console.error("[Firebase] Error while listening to 'items'", error);
        });
        const unsubBills = onValue(billsRef, snapshot => {
            const val = snapshot.val();
            console.log("[Firebase] bills snapshot received", val);
            const bills = mapRecordToArray(val || {}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setAppBills(bills);
        }, error => {
            console.error("[Firebase] Error while listening to 'bills'", error);
        });
        const unsubSettings = onValue(settingsRef, snapshot => {
            const data = snapshot.val();
            console.log("[Firebase] settings snapshot received", data);
            if (data) {
                setShopSettings(data);
            }
            else {
                console.log("[Firebase] settings empty, using defaultShopSettings");
                setShopSettings(defaultShopSettings);
            }
        }, error => {
            console.error("[Firebase] Error while listening to 'shopSettings'", error);
        });
        return () => {
            console.log("[AppContext] Unsubscribing from Firebase listeners");
            unsubItems();
            unsubBills();
            unsubSettings();
        };
    }, []);
    const createNewBill = useCallback(() => {
        const newBill = {
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
    const calculateBillTotals = (billItems, discountAmount, discountType, taxRate) => {
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
    const addItemToBill = useCallback((item, variantId, quantity) => {
        if (!currentBill)
            return;
        const variant = item.variants.find(v => v.id === variantId);
        if (!variant) {
            console.error("Variant not found for item:", item.id, "variantId:", variantId);
            return;
        }
        // The BillItem now uses variantId for uniqueness in the bill
        const existingItem = currentBill.items.find((bi) => bi.variantId === variantId);
        let updatedItems;
        if (existingItem) {
            updatedItems = currentBill.items.map((bi) => bi.variantId === variantId
                ? { ...bi, quantity: bi.quantity + quantity, subtotal: (bi.quantity + quantity) * variant.price }
                : bi);
        }
        else {
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
    const removeItemFromBill = useCallback((variantId) => {
        if (!currentBill)
            return;
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
    const updateBillItem = useCallback((variantId, quantity) => {
        if (!currentBill || quantity <= 0)
            return;
        // Update by variantId now
        const updatedItems = currentBill.items.map((bi) => bi.variantId === variantId
            ? { ...bi, quantity, subtotal: quantity * bi.price }
            : bi);
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
    const setDiscount = useCallback((discountValue, type) => {
        if (!currentBill)
            return;
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
    const setTaxRate = useCallback((rate) => {
        if (!currentBill)
            return;
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
    const saveBill = useCallback(async (paymentMode, customerName) => {
        if (!currentBill || currentBill.items.length === 0)
            return;
        const billToSave = {
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
            const stockUpdates = {};
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
                    const dbItem = itemSnapshot.val();
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
        }
        catch (error) {
            console.error("[Firebase] Failed to save bill or update stock", error);
            throw error;
        }
    }, [currentBill, appItems]);
    const addItem = useCallback(async (item) => {
        console.log("[Firebase] Adding item to Realtime Database", item);
        try {
            await set(ref(db, `items/${item.id}`), item);
            console.log("[Firebase] Item saved successfully at path:", `items/${item.id}`);
        }
        catch (error) {
            console.error("[Firebase] Failed to add item", error);
            throw error;
        }
    }, []);
    const updateItem = useCallback(async (id, updates) => {
        console.log("[Firebase] Updating item in Realtime Database", { id, updates });
        try {
            await updateRef(ref(db, `items/${id}`), updates);
            console.log("[Firebase] Item updated successfully at path:", `items/${id}`);
        }
        catch (error) {
            console.error("[Firebase] Failed to update item", error);
            throw error;
        }
    }, []);
    const deleteItem = useCallback(async (id) => {
        console.log("[Firebase] Deleting item from Realtime Database", { id });
        try {
            await remove(ref(db, `items/${id}`));
            console.log("[Firebase] Item deleted successfully at path:", `items/${id}`);
        }
        catch (error) {
            console.error("[Firebase] Failed to delete item", error);
            throw error;
        }
    }, []);
    const getItemsByCategory = useCallback((category) => {
        return appItems.filter((item) => item.category === category);
    }, [appItems]);
    const updateShopSettings = useCallback(async (settings) => {
        const next = { ...shopSettings, ...settings };
        console.log("[Firebase] Updating settings in Realtime Database", next);
        try {
            await set(ref(db, "settings"), next);
            console.log("[Firebase] settings updated successfully");
            setShopSettings(next);
        }
        catch (error) {
            console.error("[Firebase] Failed to update settings", error);
            throw error;
        }
    }, [shopSettings]);
    const value = {
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
        categories,
    };
    return _jsx(AppContext.Provider, { value: value, children: children });
}
export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
