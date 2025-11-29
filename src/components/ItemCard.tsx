import { DBItem } from '@/types';
import { ItemSelectionModal } from './ItemSelectionModal';
import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface ItemCardProps {
  item: DBItem;
  variant?: 'compact' | 'detailed' | 'selectable';
  onAddToBill?: (item: DBItem, quantity: number) => void;
  onEdit?: (item: DBItem) => void;
  onDelete?: (itemId: string) => void;
  onSelect?: (item: DBItem) => void;
}

export default function ItemCard({
  item,
  variant = 'compact',
  onAddToBill,
  onEdit,
  onDelete,
  onSelect,
}: ItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    // The 'selectable' variant is used in MakeBill.tsx
    if (variant === 'selectable') {
      setIsModalOpen(true);
    } else if (onAddToBill) {
      // This path is now deprecated as we use the modal for adding to bill
      // but keeping it for safety if the compact variant is used elsewhere.
      // onAddToBill(item, 1);
    }
  };

  if (variant === 'selectable') {
    return (
      <>
        <button
          type="button"
          onClick={handleCardClick}
          className="text-left bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{item.name}</h3>
              <p className="text-sm text-slate-500">{item.subcategory}</p>
            </div>
            {/* Price removed as per user request */}
          </div>

          {item.description && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{item.description}</p>
          )}

          <p className="text-xs font-medium text-indigo-600">Tap to select size, price, and quantity</p>
        </button>
        <ItemSelectionModal
          item={item}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{item.name}</h3>
            <p className="text-sm text-slate-500">{item.subcategory}</p>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="p-2 hover:bg-slate-100 rounded transition-colors"
                title="Edit"
              >
                <Edit2 size={16} className="text-slate-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            )}
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-slate-600 mb-3">{item.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Variants</p>
            <p className="font-bold text-lg text-indigo-600">{item.variants.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Category</p>
            <p className="font-bold text-sm text-slate-900">{item.category}</p>
          </div>
        </div>
      </div>
    );
  }

  // Default compact variant
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-slate-900 truncate">{item.name}</h4>
          <p className="text-xs text-slate-500">{item.subcategory}</p>
        </div>
        <span className="text-sm font-bold text-indigo-600 ml-2">Variants: {item.variants.length}</span>
      </div>
      <div className="flex items-center justify-end text-xs">
        {/* Add button removed as item selection is now via modal */}
        <p className="text-xs text-slate-500 italic">View Details</p>
      </div>
    </div>
  );
}
