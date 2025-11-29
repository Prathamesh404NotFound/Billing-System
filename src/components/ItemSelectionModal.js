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
    const [price, setPrice] = useState(0);
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
            setPrice(0);
        }
        else if (!isOpen) {
            setSelectedVariantId('');
            setQuantity(1);
            setPrice(0);
        }
    }, [isOpen, variants]);
    const handleQuantityChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1) {
            setQuantity(value);
        }
    }, []);
    const handlePriceChange = useCallback((e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setPrice(value);
        }
        else if (e.target.value === '') {
            setPrice(0);
        }
    }, []);
    const handleAddToBill = useCallback(() => {
        if (!item || !selectedVariantId || quantity < 1 || price <= 0) {
            toast.error('Please select a variant, set a valid quantity, and enter a price.');
            return;
        }
        const variant = variants.find((v) => v.id === selectedVariantId);
        if (!variant) {
            toast.error('Selected variant not found.');
            return;
        }
        addItemToBill(item, selectedVariantId, quantity, price);
        toast.success(`${quantity} x ${item.name} (${variant.size}) added to bill.`);
        onClose();
    }, [item, selectedVariantId, quantity, price, variants, addItemToBill, onClose]);
    if (!item)
        return null;
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Select Variant for ", item.name] }), _jsx(DialogDescription, { children: "Choose the size, price, and quantity for the item." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { htmlFor: "variant", className: "text-right", children: "Size" }), _jsx("div", { className: "col-span-3", children: _jsx(RadioGroup, { value: selectedVariantId, onValueChange: setSelectedVariantId, className: "flex flex-col space-y-1", children: variants.map((variant) => (_jsxs("div", { className: "flex items-center space-x-3 space-y-0", children: [_jsx(RadioGroupItem, { value: variant.id, id: variant.id }), _jsx(Label, { htmlFor: variant.id, className: "flex justify-between w-full cursor-pointer", children: _jsxs("span", { children: ["Size: ", variant.size] }) })] }, variant.id))) }) })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { htmlFor: "price", className: "text-right", children: "Price (\u20B9)" }), _jsx(Input, { id: "price", type: "number", value: price, onChange: handlePriceChange, min: "0", className: "col-span-3" })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [_jsx(Label, { htmlFor: "quantity", className: "text-right", children: "Quantity" }), _jsx(Input, { id: "quantity", type: "number", value: quantity, onChange: handleQuantityChange, min: "1", className: "col-span-3" })] }), selectedVariant && (_jsx("div", { className: "text-center mt-2 p-2 bg-gray-100 rounded-md", children: _jsxs("p", { className: "text-lg font-bold", children: ["Total: \u20B9", (price * quantity).toFixed(2)] }) }))] }), _jsx(Button, { onClick: handleAddToBill, disabled: !selectedVariant || quantity < 1, children: "Add to Bill" })] }) }));
};
