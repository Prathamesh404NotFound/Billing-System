import Modal from './Modal';
import { DBItem, Category } from '@/types';
import { Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UnmatchedItem {
  itemName: string;
  size?: string;
  quantity: number;
  costPrice: number;
}

interface Props {
  isOpen: boolean;
  unmatchedItem: UnmatchedItem | null;
  categories: Category[];
  existingItems: DBItem[];
  onClose: () => void;
  onCreateItem: (item: {
    name: string;
    category: string;
    subcategory: string;
    size: string;
  }) => Promise<DBItem | null>;
  onMatchExisting: (item: DBItem, variantId: string) => void;
  onSkip: () => void;
}

/**
 * Modal for handling unmatched items from Gemini extraction
 * Allows user to create new item or match with existing
 */
export default function UnmatchedItemModal({
  isOpen,
  unmatchedItem,
  categories,
  existingItems,
  onClose,
  onCreateItem,
  onMatchExisting,
  onSkip,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [subcategory, setSubcategory] = useState('');
  const [size, setSize] = useState(unmatchedItem?.size || '');
  const [isCreating, setIsCreating] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState<DBItem[]>([]);

  // Find suggested matches when item name changes
  useEffect(() => {
    if (unmatchedItem?.itemName) {
      const query = unmatchedItem.itemName.toLowerCase();
      const matches = existingItems
        .filter((item) => item.name.toLowerCase().includes(query) || query.includes(item.name.toLowerCase()))
        .slice(0, 5);
      setSuggestedMatches(matches);
    } else {
      setSuggestedMatches([]);
    }
  }, [unmatchedItem?.itemName, existingItems]);

  const handleCreateItem = async () => {
    if (!selectedCategory || !subcategory || !size) {
      return;
    }

    setIsCreating(true);
    try {
      const newItem = await onCreateItem({
        name: unmatchedItem!.itemName,
        category: selectedCategory,
        subcategory,
        size,
      });

      if (newItem) {
        // Find the variant we just created
        const variant = newItem.variants.find((v) => v.size === size);
        if (variant) {
          onMatchExisting(newItem, variant.id);
        }
      }
    } catch (error) {
      console.error('Failed to create item:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleMatchExisting = (item: DBItem) => {
    // Use first variant or let user select
    const variant = item.variants[0];
    if (variant) {
      onMatchExisting(item, variant.id);
    }
  };

  if (!unmatchedItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      title="Item Not Found"
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600 mb-1">Extracted Item:</p>
          <p className="font-semibold text-slate-900">{unmatchedItem.itemName}</p>
          {unmatchedItem.size && (
            <p className="text-sm text-slate-600">Size: {unmatchedItem.size}</p>
          )}
          <p className="text-sm text-slate-600">
            Qty: {unmatchedItem.quantity} × ₹{unmatchedItem.costPrice}
          </p>
        </div>

        {/* Suggested Matches */}
        {suggestedMatches.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-900 mb-2">Suggested Matches:</p>
            <div className="space-y-2">
              {suggestedMatches.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMatchExisting(item)}
                  className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-600">
                    {categories.find((c) => c.id === item.category)?.name} • {item.subcategory}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create New Item */}
        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Create New Item:</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Category *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Subcategory *
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Formal, Casual"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Size *
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., S, M, L, 32"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleCreateItem}
            disabled={!selectedCategory || !subcategory || !size || isCreating}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>Creating...</>
            ) : (
              <>
                <Plus size={16} />
                Create Item
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

