import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useState, useCallback, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
export const ItemSelectionModal = ({ item, isOpen, onClose, }) => {
    const { addItemToBill } = useApp();
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const variants = useMemo(() => item?.variants || [], [item]);
    const selectedVariant = useMemo(() => {
        return variants.find((v) => v.id === selectedVariantId);
    }, [variants, selectedVariantId]);
    // Reset state when the modal opens/closes
    React.useEffect(() => {
        if (isOpen && variants.length > 0) {
            // Select the first variant by default
            setSelectedVariantId(variants[0].id);
            setQuantity(1);
        }
        else if (!isOpen) {
            setSelectedVariantId('');
            setQuantity(1);
        }
    }, [isOpen, variants]);
    const handleQuantityChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1) {
            setQuantity(value);
        }
    }, []);
    const handleAddToBill = useCallback(() => {
        if (!item || !selectedVariantId || quantity < 1) {
            toast.error('Please select a variant and a valid quantity.');
            return;
        }
        const variant = variants.find((v) => v.id === selectedVariantId);
        if (!variant) {
            toast.error('Selected variant not found.');
            return;
        }
        if (variant.stock < quantity) {
            toast.warning(`Only ${variant.stock} units of ${item.name} (${variant.size}) are in stock.`);
            // Optionally, set quantity to max available stock
            // setQuantity(variant.stock);
            // return;
        }
        addItemToBill(item, selectedVariantId, quantity);
        toast.success(`${quantity} x ${item.name} (${variant.size}) added to bill.`);
        onClose();
    }, [item, selectedVariantId, quantity, variants, addItemToBill, onClose]);
    if (!item)
        return null;
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Select Variant for ", item.name] }), _jsx(DialogDescription, { children: "Choose the size, price, and quantity for the item." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { htmlFor: "variant", className: "text-right", children: "Size/Price" }), _jsx("div", { className: "col-span-3", children: _jsx(RadioGroup, { value: selectedVariantId, onValueChange: setSelectedVariantId, className: "flex flex-col space-y-1", children: variants.map((variant) => (_jsxs("div", { className: "flex items-center space-x-3 space-y-0", children: [_jsx(RadioGroupItem, { value: variant.id, id: variant.id }), _jsxs(Label, { htmlFor: variant.id, className: "flex justify-between w-full cursor-pointer", children: [_jsxs("span", { children: ["Size: ", variant.size] }), _jsxs("span", { className: "font-semibold", children: ["\u20B9", variant.price] }), _jsxs("span", { className: "text-xs text-gray-500", children: ["(Stock: ", variant.stock, ")"] })] })] }, variant.id))) }) })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { htmlFor: "quantity", className: "text-right", children: "Quantity" }), _jsx(Input, { id: "quantity", type: "number", value: quantity, onChange: handleQuantityChange, min: "1", className: "col-span-3" })] }), selectedVariant && (_jsx("div", { className: "text-center mt-2 p-2 bg-gray-100 rounded-md", children: _jsxs("p", { className: "text-lg font-bold", children: ["Total: \u20B9", (selectedVariant.price * quantity).toFixed(2)] }) }))] }), _jsx(Button, { onClick: handleAddToBill, disabled: !selectedVariant || quantity < 1, children: "Add to Bill" })] }) }));
};
