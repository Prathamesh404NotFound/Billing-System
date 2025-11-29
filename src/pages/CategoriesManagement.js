import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
export default function CategoriesManagement() {
    const { categories, addCategory, updateCategory, deleteCategory } = useApp();
    const [editingCategory, setEditingCategory] = useState(null);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const resetForm = () => {
        setEditingCategory(null);
        setName('');
        setIcon('');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim())
            return;
        const id = editingCategory?.id || name.toLowerCase().replace(/\s+/g, '-');
        const base = { id, name: name.trim(), icon: icon || undefined };
        try {
            if (editingCategory) {
                await updateCategory(id, { name: base.name, icon: base.icon });
            }
            else {
                await addCategory(base);
            }
            resetForm();
        }
        catch (err) {
            console.error('Failed to save category', err);
        }
    };
    const handleEdit = (cat) => {
        setEditingCategory(cat);
        setName(cat.name);
        setIcon(cat.icon || '');
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?'))
            return;
        try {
            await deleteCategory(id);
        }
        catch (err) {
            console.error('Failed to delete category', err);
        }
    };
    return (_jsx(Layout, { title: "Categories", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-6", children: [_jsx("h2", { className: "text-lg font-bold text-slate-900 mb-4", children: editingCategory ? 'Edit Category' : 'Add Category' }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Name *" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "e.g., Shirts" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Icon (emoji)" }), _jsx("input", { type: "text", value: icon, onChange: (e) => setIcon(e.target.value), className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "e.g., \uD83D\uDC54" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: resetForm, className: "flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors", children: "Clear" }), _jsxs("button", { type: "submit", className: "flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2", children: [_jsx(Plus, { size: 16 }), editingCategory ? 'Update' : 'Add'] })] })] })] }), _jsxs("div", { className: "lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6", children: [_jsx("h2", { className: "text-lg font-bold text-slate-900 mb-4", children: "All Categories" }), categories.length === 0 ? (_jsx("p", { className: "text-slate-500 text-sm", children: "No categories yet." })) : (_jsx("div", { className: "space-y-2", children: categories.map((cat) => (_jsxs("div", { className: "flex items-center justify-between p-3 border border-slate-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "text-2xl", children: cat.icon }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900", children: cat.name }), _jsxs("p", { className: "text-xs text-slate-500", children: ["ID: ", cat.id] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEdit(cat), className: "p-2 hover:bg-slate-100 rounded-lg", children: _jsx(Edit2, { size: 16, className: "text-slate-600" }) }), _jsx("button", { onClick: () => handleDelete(cat.id), className: "p-2 hover:bg-red-50 rounded-lg", children: _jsx(Trash2, { size: 16, className: "text-red-600" }) })] })] }, cat.id))) }))] })] }) }));
}
