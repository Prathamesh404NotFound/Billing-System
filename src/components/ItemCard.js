import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ItemSelectionModal } from './ItemSelectionModal';
import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
export default function ItemCard({ item, variant = 'compact', onAddToBill, onEdit, onDelete, onSelect, }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleCardClick = () => {
        // The 'selectable' variant is used in MakeBill.tsx
        if (variant === 'selectable') {
            setIsModalOpen(true);
        }
        else if (onAddToBill) {
            // This path is now deprecated as we use the modal for adding to bill
            // but keeping it for safety if the compact variant is used elsewhere.
            // onAddToBill(item, 1);
        }
    };
    if (variant === 'selectable') {
        return (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", onClick: handleCardClick, className: "text-left bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500", children: [_jsx("div", { className: "flex items-start justify-between mb-3", children: _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-slate-900", children: item.name }), _jsx("p", { className: "text-sm text-slate-500", children: item.subcategory })] }) }), item.description && (_jsx("p", { className: "text-sm text-slate-600 mb-3 line-clamp-2", children: item.description })), _jsx("p", { className: "text-xs font-medium text-indigo-600", children: "Tap to select size, price, and quantity" })] }), _jsx(ItemSelectionModal, { item: item, isOpen: isModalOpen, onClose: () => setIsModalOpen(false) })] }));
    }
    if (variant === 'detailed') {
        return (_jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-slate-900", children: item.name }), _jsx("p", { className: "text-sm text-slate-500", children: item.subcategory })] }), _jsxs("div", { className: "flex gap-2", children: [onEdit && (_jsx("button", { onClick: () => onEdit(item), className: "p-2 hover:bg-slate-100 rounded transition-colors", title: "Edit", children: _jsx(Edit2, { size: 16, className: "text-slate-600" }) })), onDelete && (_jsx("button", { onClick: () => onDelete(item.id), className: "p-2 hover:bg-red-50 rounded transition-colors", title: "Delete", children: _jsx(Trash2, { size: 16, className: "text-red-600" }) }))] })] }), item.description && (_jsx("p", { className: "text-sm text-slate-600 mb-3", children: item.description })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Variants" }), _jsx("p", { className: "font-bold text-lg text-indigo-600", children: item.variants.length })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Category" }), _jsx("p", { className: "font-bold text-sm text-slate-900", children: item.category })] })] })] }));
    }
    // Default compact variant
    return (_jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-shadow", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-semibold text-sm text-slate-900 truncate", children: item.name }), _jsx("p", { className: "text-xs text-slate-500", children: item.subcategory })] }), _jsxs("span", { className: "text-sm font-bold text-indigo-600 ml-2", children: ["Variants: ", item.variants.length] })] }), _jsx("div", { className: "flex items-center justify-end text-xs", children: _jsx("p", { className: "text-xs text-slate-500 italic", children: "View Details" }) })] }));
}
