import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { DBItem, Dealer, PurchaseItem, DealerPurchase } from '@/types';
import { extractBillData, fuzzyMatchItem } from '@/lib/gemini';
import { sanitizeString, sanitizeNumber } from '@/lib/sanitize';
import { GeminiErrorBoundary } from '@/components/GeminiErrorBoundary';
import UnmatchedItemModal from '@/components/UnmatchedItemModal';
import { Plus, Trash2, Upload, Loader2, X, CheckCircle2 } from 'lucide-react';
import ItemCard from '@/components/ItemCard';

interface PurchaseFormItem extends PurchaseItem {
  matchedItemId?: string;
  matchedVariantId?: string;
}

export default function DealerPurchaseEntry() {
  const {
    dealers,
    items,
    categories,
    getItemsByCategory,
    addDealerPurchase,
    addItem,
  } = useApp();
  const { show } = useToast();

  const [selectedDealer, setSelectedDealer] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseFormItem[]>([]);
  const [selectedItemForModal, setSelectedItemForModal] = useState<DBItem | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [unmatchedItems, setUnmatchedItems] = useState<Array<{
    itemName: string;
    size?: string;
    quantity: number;
    costPrice: number;
  }>>([]);
  const [currentUnmatchedIndex, setCurrentUnmatchedIndex] = useState(0);

  const categoryItems = selectedCategory ? getItemsByCategory(selectedCategory) : [];

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      show('Please upload a valid image file (JPG/PNG)', 'error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      show('Image size should be less than 10MB', 'error');
      return;
    }

    setUploadedImage(file);
    setIsExtracting(true);

    try {
      const data = await extractBillData(file);
      setExtractedData(data);

      // Auto-fill dealer if found
      if (data.dealerName) {
        const matchedDealer = dealers.find(
          (d) => d.dealerName.toLowerCase() === data.dealerName?.toLowerCase()
        );
        if (matchedDealer) {
          setSelectedDealer(matchedDealer.id);
        }
      }

      // Process extracted items with fuzzy matching
      const processedItems: PurchaseFormItem[] = [];
      for (const extractedItem of data.items) {
        if (!extractedItem.itemName || extractedItem.quantity <= 0 || extractedItem.costPrice <= 0) {
          continue;
        }

        // Try to match with existing items
        const match = fuzzyMatchItem(extractedItem.itemName, items.map(i => ({ id: i.id, name: i.name })));
        
        if (match && match.score >= 0.5) {
          // Found a match, find the item and variant
          const matchedItem = items.find(i => i.id === match.id);
          if (matchedItem) {
            // Try to find matching variant by size, or use first variant
            const variant = extractedItem.size
              ? matchedItem.variants.find(v => v.size.toLowerCase() === extractedItem.size?.toLowerCase())
              : matchedItem.variants[0];

            if (variant) {
              processedItems.push({
                itemId: matchedItem.id,
                itemName: matchedItem.name,
                variantId: variant.id,
                variant: variant.size || extractedItem.size || 'N/A',
                quantity: extractedItem.quantity,
                costPrice: extractedItem.costPrice,
                subtotal: extractedItem.quantity * extractedItem.costPrice,
                matchedItemId: matchedItem.id,
                matchedVariantId: variant.id,
              });
            }
          }
        } else {
          // No match found - add to unmatched items queue
          setUnmatchedItems((prev) => [
            ...prev,
            {
              itemName: extractedItem.itemName,
              size: extractedItem.size,
              quantity: extractedItem.quantity,
              costPrice: extractedItem.costPrice,
            },
          ]);
        }
      }

      setPurchaseItems(processedItems);
      show(`Extracted ${processedItems.length} items from bill image`, 'success');
    } catch (error) {
      console.error('Gemini extraction error:', error);
      show(
        error instanceof Error
          ? `Failed to extract bill data: ${error.message}`
          : 'Failed to extract bill data. Please try manual entry.',
        'error'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const openItemSelectionModal = (item: DBItem) => {
    setSelectedItemForModal(item);
  };

  const closeItemSelectionModal = () => {
    setSelectedItemForModal(null);
  };

  const handleAddItemToPurchase = (item: DBItem, variantId: string, quantity: number, costPrice: number) => {
    const variant = item.variants.find(v => v.id === variantId);
    if (!variant) return;

    const existingIndex = purchaseItems.findIndex(
      (pi) => pi.itemId === item.id && pi.variantId === variantId
    );

    if (existingIndex >= 0) {
      // Update existing item
      const updated = [...purchaseItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
        costPrice: costPrice,
        subtotal: (updated[existingIndex].quantity + quantity) * costPrice,
      };
      setPurchaseItems(updated);
    } else {
      // Add new item
      setPurchaseItems([
        ...purchaseItems,
        {
          itemId: item.id,
          itemName: item.name,
          variantId: variant.id,
          variant: variant.size,
          quantity,
          costPrice,
          subtotal: quantity * costPrice,
          matchedItemId: item.id,
          matchedVariantId: variant.id,
        },
      ]);
    }

    closeItemSelectionModal();
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof PurchaseFormItem, value: string | number) => {
    const updated = [...purchaseItems];
    updated[index] = {
      ...updated[index],
      [field]: typeof value === 'string' ? sanitizeString(value) : sanitizeNumber(value),
    };
    if (field === 'quantity' || field === 'costPrice') {
      updated[index].subtotal = updated[index].quantity * updated[index].costPrice;
    }
    setPurchaseItems(updated);
  };

  const handleCreateUnmatchedItem = async (itemData: {
    name: string;
    category: string;
    subcategory: string;
    size: string;
  }): Promise<DBItem | null> => {
    try {
      const newItem: DBItem = {
        id: `item-${Date.now()}`,
        category: itemData.category,
        subcategory: sanitizeString(itemData.subcategory),
        name: sanitizeString(itemData.name),
        variants: [
          {
            id: `v-${Date.now()}`,
            size: sanitizeString(itemData.size),
          },
        ],
      };

      await addItem(newItem);
      show('Item created successfully!', 'success');
      return newItem;
    } catch (error) {
      console.error('Failed to create item:', error);
      show('Failed to create item', 'error');
      return null;
    }
  };

  const handleMatchUnmatchedItem = (item: DBItem, variantId: string) => {
    const unmatched = unmatchedItems[currentUnmatchedIndex];
    if (!unmatched) return;

    // Add matched item to purchase items
    const variant = item.variants.find((v) => v.id === variantId);
    if (variant) {
      setPurchaseItems((prev) => [
        ...prev,
        {
          itemId: item.id,
          itemName: item.name,
          variantId: variant.id,
          variant: variant.size,
          quantity: unmatched.quantity,
          costPrice: unmatched.costPrice,
          subtotal: unmatched.quantity * unmatched.costPrice,
          matchedItemId: item.id,
          matchedVariantId: variant.id,
        },
      ]);
    }

    // Move to next unmatched item or close
    if (currentUnmatchedIndex < unmatchedItems.length - 1) {
      setCurrentUnmatchedIndex(currentUnmatchedIndex + 1);
    } else {
      setUnmatchedItems([]);
      setCurrentUnmatchedIndex(0);
    }
  };

  const handleSkipUnmatchedItem = () => {
    if (currentUnmatchedIndex < unmatchedItems.length - 1) {
      setCurrentUnmatchedIndex(currentUnmatchedIndex + 1);
    } else {
      setUnmatchedItems([]);
      setCurrentUnmatchedIndex(0);
    }
  };

  const totalQuantity = purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSave = async () => {
    if (!selectedDealer) {
      show('Please select a dealer', 'error');
      return;
    }

    if (purchaseItems.length === 0) {
      show('Please add at least one item', 'error');
      return;
    }

    const dealer = dealers.find(d => d.id === selectedDealer);
    if (!dealer) {
      show('Selected dealer not found', 'error');
      return;
    }

    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      const dealer = dealers.find(d => d.id === selectedDealer);
      if (!dealer) {
        show('Selected dealer not found', 'error');
        return;
      }

      // Validate all items have valid itemId and variantId
      const validItems = purchaseItems.filter(item => {
        if (!item.matchedItemId || !item.matchedVariantId) {
          // Item needs to be created or matched
          show(`Item "${item.itemName}" needs to be matched or created first`, 'error');
          return false;
        }
        return true;
      });

      if (validItems.length === 0) {
        show('No valid items to save', 'error');
        return;
      }

      const purchase: DealerPurchase = {
        id: `PURCHASE-${Date.now()}`,
        dealerId: selectedDealer,
        dealerName: dealer.dealerName,
        purchaseDate,
        items: validItems.map(item => ({
          itemId: item.matchedItemId!,
          itemName: item.itemName,
          variantId: item.matchedVariantId!,
          variant: item.variant,
          quantity: item.quantity,
          costPrice: item.costPrice,
          subtotal: item.subtotal,
        })),
        totalQuantity,
        totalValue,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
      };

      await addDealerPurchase(purchase);
      show('Purchase saved successfully! Inventory updated.', 'success');

      // Reset form
      setSelectedDealer('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setPurchaseItems([]);
      setNotes('');
      setUploadedImage(null);
      setExtractedData(null);
      setShowSaveModal(false);
    } catch (error) {
      console.error(error);
      show('Failed to save purchase. Please try again.', 'error');
    }
  };

  return (
    <Layout title="Dealer Purchase Entry">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dealer & Date Selection */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Purchase Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Dealer *
                </label>
                <select
                  value={selectedDealer}
                  onChange={(e) => setSelectedDealer(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Dealer</option>
                  {dealers.map((dealer) => (
                    <option key={dealer.id} value={dealer.id}>
                      {dealer.dealerName} - {dealer.shopName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Upload Bill Image (Optional)</h2>
            <GeminiErrorBoundary>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="bill-image-upload"
                    disabled={isExtracting}
                  />
                  <label
                    htmlFor="bill-image-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${
                      isExtracting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 size={32} className="text-indigo-600 animate-spin" />
                        <p className="text-sm text-slate-600">Extracting data from image...</p>
                      </>
                    ) : (
                      <>
                        <Upload size={32} className="text-slate-400" />
                        <p className="text-sm text-slate-600">
                          Click to upload bill image (JPG/PNG)
                        </p>
                        <p className="text-xs text-slate-500">AI will extract items automatically</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </GeminiErrorBoundary>
              {uploadedImage && !isExtracting && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-sm text-slate-700 flex-1">{uploadedImage.name}</span>
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setExtractedData(null);
                    }}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <X size={16} className="text-slate-600" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Item Selection */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Add Items</h2>
            <div className="mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categoryItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onSelect={() => openItemSelectionModal(item)}
                />
              ))}
            </div>
          </div>

          {/* Purchase Items List */}
          {purchaseItems.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Purchase Items</h2>
              <div className="space-y-3">
                {purchaseItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.itemName}</p>
                      <p className="text-sm text-slate-600">{item.variant}</p>
                      {!item.matchedItemId && (
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ Item needs to be matched or created
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.costPrice}
                        onChange={(e) =>
                          handleUpdateItem(index, 'costPrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1 border border-slate-300 rounded text-sm"
                        placeholder="Cost"
                      />
                      <span className="w-20 text-right text-sm font-semibold text-slate-900">
                        ₹{item.subtotal.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <label className="block text-sm font-medium text-slate-900 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Additional notes about this purchase..."
            />
          </div>
        </div>

        {/* Right Panel - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Purchase Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Items:</span>
                <span className="font-semibold text-slate-900">{purchaseItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Quantity:</span>
                <span className="font-semibold text-slate-900">{totalQuantity}</span>
              </div>
              <div className="flex justify-between text-lg pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-900">Total Value:</span>
                <span className="font-bold text-indigo-600">₹{totalValue.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={!selectedDealer || purchaseItems.length === 0}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Save Purchase
            </button>
          </div>
        </div>
      </div>

      {/* Item Selection Modal */}
      {selectedItemForModal && (
        <Modal
          isOpen={!!selectedItemForModal}
          title={`Select ${selectedItemForModal.name}`}
          onClose={closeItemSelectionModal}
          size="md"
        >
          <div className="space-y-4">
            {selectedItemForModal.variants.map((variant) => (
              <div
                key={variant.id}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-slate-900">Size: {variant.size}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    id={`qty-${variant.id}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Cost Price"
                    id={`cost-${variant.id}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const qtyInput = document.getElementById(`qty-${variant.id}`) as HTMLInputElement;
                      const costInput = document.getElementById(`cost-${variant.id}`) as HTMLInputElement;
                      const quantity = parseInt(qtyInput.value) || 1;
                      const costPrice = parseFloat(costInput.value) || 0;
                      if (costPrice > 0) {
                        handleAddItemToPurchase(selectedItemForModal, variant.id, quantity, costPrice);
                      } else {
                        show('Please enter a valid cost price', 'error');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Unmatched Item Modal */}
      <UnmatchedItemModal
        isOpen={unmatchedItems.length > 0 && currentUnmatchedIndex < unmatchedItems.length}
        unmatchedItem={unmatchedItems[currentUnmatchedIndex] || null}
        categories={categories}
        existingItems={items}
        onClose={() => {
          setUnmatchedItems([]);
          setCurrentUnmatchedIndex(0);
        }}
        onCreateItem={handleCreateUnmatchedItem}
        onMatchExisting={handleMatchUnmatchedItem}
        onSkip={handleSkipUnmatchedItem}
      />

      {/* Save Confirmation Modal */}
      <Modal
        isOpen={showSaveModal}
        title="Confirm Purchase"
        onClose={() => setShowSaveModal(false)}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to save this purchase? This will update inventory stock.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Items:</span>
              <span className="font-semibold">{purchaseItems.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Quantity:</span>
              <span className="font-semibold">{totalQuantity}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900">Total Value:</span>
              <span className="font-bold text-indigo-600">₹{totalValue.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setShowSaveModal(false)}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSave}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Confirm & Save
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

