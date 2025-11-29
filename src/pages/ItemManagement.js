import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useState, useMemo } from 'react';
import ItemCard from '@/components/ItemCard';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { Plus, Grid3x3, List, Search, Trash2 } from 'lucide-react';
export default function ItemManagement() {
    const { items, addItem, updateItem, deleteItem, categories } = useApp();
    const { show } = useToast();
    const [viewMode, setViewMode] = useState('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        category: '',
        subcategory: '',
        name: '',
        description: '',
    });
    const [variants, setVariants] = useState([]);
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, searchQuery, selectedCategory]);
    const handleOpenModal = (item) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
            setVariants(item.variants);
        }
        else {
            setEditingItem(null);
            setFormData({
                category: '',
                subcategory: '',
                name: '',
                description: '',
            });
            // Start with one empty variant for new items
            setVariants([{ id: `v-${Date.now()}`, size: '' }]);
        }
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setVariants([]);
    };
    const handleSaveItem = async () => {
        if (!formData.name ||
            !formData.category ||
            !formData.subcategory) {
            show("Please fill in all required fields (Name, Category, Subcategory)", "error");
            return;
        }
        const validVariants = variants.filter(v => v.size);
        if (validVariants.length === 0) {
            show("Please add at least one valid variant (Size and Price > 0)", "error");
            return;
        }
        try {
            const baseItem = {
                category: formData.category,
                subcategory: formData.subcategory,
                name: formData.name,
                description: formData.description,
            };
            if (editingItem) {
                // Update base item details
                await updateItem(editingItem.id, { ...baseItem, variants: validVariants });
                show("Item updated successfully!", "success");
            }
            else {
                const newItem = {
                    id: `item-${Date.now()}`,
                    category: baseItem.category,
                    subcategory: baseItem.subcategory,
                    name: baseItem.name,
                    description: baseItem.description,
                    variants: validVariants,
                };
                await addItem(newItem);
                show("Item added successfully!", "success");
            }
            handleCloseModal();
        }
        catch (error) {
            console.error(error);
            show("Something went wrong while saving item", "error");
        }
    };
    const handleDeleteItem = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this item?"))
            return;
        try {
            await deleteItem(itemId);
            show("Item deleted successfully!", "success");
        }
        catch (error) {
            console.error(error);
            show("Failed to delete item", "error");
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        const finalValue = value;
        // Ensure ID is unique and stable based on size
        if (field === 'size') {
            newVariants[index] = {
                ...newVariants[index],
                [field]: finalValue,
                id: `v-${index}-${finalValue}`, // Update ID based on size change
            };
        }
        else {
            newVariants[index] = {
                ...newVariants[index],
                [field]: finalValue,
            };
        }
        setVariants(newVariants);
    };
    const handleAddVariant = () => {
        setVariants([...variants, { id: `v-${Date.now()}`, size: '' }]);
    };
    const handleRemoveVariant = (index) => {
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
    };
    return (_jsxs(Layout, { title: "Item Management", children: [_jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-4 mb-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-start md:items-center justify-between", children: [_jsxs("div", { className: "flex-1 flex flex-col md:flex-row gap-4 w-full md:w-auto", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-3 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Search items...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" })] }), _jsxs("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [_jsx("option", { value: "", children: "All Categories" }), categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.name }, cat.id)))] })] }), _jsxs("div", { className: "flex gap-2 w-full md:w-auto", children: [_jsxs("div", { className: "flex gap-2 border border-slate-300 rounded-lg p-1", children: [_jsx("button", { onClick: () => setViewMode('table'), className: `p-2 rounded transition-colors ${viewMode === 'table'
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-600 hover:bg-slate-100'}`, title: "Table view", children: _jsx(List, { size: 18 }) }), _jsx("button", { onClick: () => setViewMode('card'), className: `p-2 rounded transition-colors ${viewMode === 'card'
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-600 hover:bg-slate-100'}`, title: "Card view", children: _jsx(Grid3x3, { size: 18 }) })] }), _jsxs("button", { onClick: () => handleOpenModal(), className: "flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2", children: [_jsx(Plus, { size: 18 }), "Add Item"] })] })] }) }), filteredItems.length > 0 ? (viewMode === 'table' ? (
            // Table View
            _jsx("div", { className: "bg-white rounded-lg border border-slate-200 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-200 bg-slate-50", children: [_jsx("th", { className: "text-left py-3 px-4 font-semibold text-slate-900", children: "Item Name" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold text-slate-900", children: "Category" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold text-slate-900", children: "Subcategory" }), _jsx("th", { className: "text-right py-3 px-4 font-semibold text-slate-900", children: "Variants" }), _jsx("th", { className: "text-center py-3 px-4 font-semibold text-slate-900", children: "Actions" })] }) }), _jsx("tbody", { children: filteredItems.map((item) => (_jsxs("tr", { className: "border-b border-slate-100 hover:bg-slate-50", children: [_jsx("td", { className: "py-3 px-4 font-medium text-slate-900", children: item.name }), _jsx("td", { className: "py-3 px-4 text-slate-600", children: categories.find((c) => c.id === item.category)?.name }), _jsx("td", { className: "py-3 px-4 text-slate-600", children: item.subcategory }), _jsx("td", { className: "py-3 px-4 text-right font-semibold text-indigo-600", children: item.variants.length }), _jsxs("td", { className: "py-3 px-4 text-center", children: [_jsx("button", { onClick: () => handleOpenModal(item), className: "text-indigo-600 hover:text-indigo-700 font-medium mr-3", children: "Edit" }), _jsx("button", { onClick: () => handleDeleteItem(item.id), className: "text-red-600 hover:text-red-700 font-medium", children: "Delete" })] })] }, item.id))) })] }) }) })) : (
            // Card View
            _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredItems.map((item) => (_jsx(ItemCard, { item: item, variant: "detailed", onEdit: handleOpenModal, onDelete: handleDeleteItem }, item.id))) }))) : (_jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-12 text-center", children: _jsx("p", { className: "text-slate-500", children: "No items found. Try adjusting your search or filters." }) })), _jsx(Modal, { isOpen: showModal, title: editingItem ? 'Edit Item' : 'Add New Item', onClose: handleCloseModal, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Category *" }), _jsxs("select", { name: "category", value: formData.category || '', onChange: handleInputChange, className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [_jsx("option", { value: "", children: "Select Category" }), categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.name }, cat.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Subcategory *" }), _jsx("input", { type: "text", name: "subcategory", value: formData.subcategory || '', onChange: handleInputChange, className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "e.g., Formal, Casual" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Item Name *" }), _jsx("input", { type: "text", name: "name", value: formData.name || '', onChange: handleInputChange, className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "e.g., Formal White Shirt" })] }), _jsxs("div", { className: "space-y-4 border-t pt-4 border-slate-200", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Variants (Sizes)" }), variants.map((variant, index) => (_jsxs("div", { className: "flex gap-2 items-end p-3 border border-slate-200 rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-xs font-medium text-slate-500 mb-1", children: "Size *" }), _jsx("input", { type: "text", value: variant.size, onChange: (e) => handleVariantChange(index, 'size', e.target.value), className: "w-full px-2 py-1 border border-slate-300 rounded-lg text-sm", placeholder: "e.g., S, M, 32" })] }), _jsx("button", { onClick: () => handleRemoveVariant(index), className: "p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors", title: "Remove Variant", children: _jsx(Trash2, { size: 18 }) })] }, variant.id))), _jsxs("button", { onClick: handleAddVariant, className: "w-full px-4 py-2 border border-dashed border-indigo-400 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2", children: [_jsx(Plus, { size: 18 }), "Add New Variant"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Description" }), _jsx("textarea", { name: "description", value: formData.description || '', onChange: handleInputChange, rows: 3, className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Optional description" })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx("button", { onClick: handleCloseModal, className: "flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleSaveItem, className: "flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors", children: editingItem ? 'Update Item' : 'Add Item' })] })] }) })] }));
}
