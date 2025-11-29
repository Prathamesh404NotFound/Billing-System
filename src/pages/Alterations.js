import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';
export default function Alterations() {
    const { alterations, addAlteration, updateAlteration, deleteAlteration } = useApp();
    const [form, setForm] = useState({
        customerName: '',
        contactNumber: '',
        garmentDescription: '',
        measurements: '',
        dueDate: '',
        notes: '',
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleAdd = async () => {
        if (!form.customerName.trim() || !form.garmentDescription.trim())
            return;
        const id = `ALT-${Date.now()}`;
        const alteration = {
            id,
            isCompleted: false,
            customerName: form.customerName.trim(),
            contactNumber: form.contactNumber || undefined,
            garmentDescription: form.garmentDescription.trim(),
            measurements: form.measurements.trim(),
            dueDate: form.dueDate || undefined,
            notes: form.notes || undefined,
        };
        try {
            await addAlteration(alteration);
            setForm({
                customerName: '',
                contactNumber: '',
                garmentDescription: '',
                measurements: '',
                dueDate: '',
                notes: '',
            });
        }
        catch (err) {
            console.error('Failed to add alteration', err);
        }
    };
    const handleToggleComplete = async (alt) => {
        try {
            await updateAlteration(alt.id, { isCompleted: !alt.isCompleted });
        }
        catch (err) {
            console.error('Failed to update alteration', err);
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this alteration entry?'))
            return;
        try {
            await deleteAlteration(id);
        }
        catch (err) {
            console.error('Failed to delete alteration', err);
        }
    };
    return (_jsx(Layout, { title: "Cloth Alterations", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-slate-200 p-6", children: [_jsx("h2", { className: "text-lg font-bold text-slate-900 mb-4", children: "New Alteration" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Customer Name *" }), _jsx("input", { type: "text", name: "customerName", value: form.customerName, onChange: handleChange, className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Contact Number" }), _jsx("input", { type: "tel", name: "contactNumber", value: form.contactNumber, onChange: handleChange, className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Garment Description *" }), _jsx("input", { type: "text", name: "garmentDescription", value: form.garmentDescription, onChange: handleChange, className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "e.g., Blue jeans shortening" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Measurements / Instructions" }), _jsx("textarea", { name: "measurements", value: form.measurements, onChange: handleChange, rows: 3, className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "e.g., Waist 32, Length -2 inch" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Due Date" }), _jsx("input", { type: "date", name: "dueDate", value: form.dueDate, onChange: handleChange, className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-900 mb-1", children: "Notes" }), _jsx("input", { type: "text", name: "notes", value: form.notes, onChange: handleChange, className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" })] })] }), _jsx("button", { onClick: handleAdd, className: "w-full mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors", children: "Add Alteration" })] })] }), _jsxs("div", { className: "lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6", children: [_jsx("h2", { className: "text-lg font-bold text-slate-900 mb-4", children: "Pending & Completed" }), alterations.length === 0 ? (_jsx("p", { className: "text-sm text-slate-500", children: "No alterations recorded yet." })) : (_jsx("div", { className: "space-y-3", children: alterations
                                .slice()
                                .sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1))
                                .map((alt) => (_jsxs("div", { className: `p-3 border rounded-lg flex items-start justify-between ${alt.isCompleted ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`, children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("p", { className: "font-semibold text-slate-900", children: [alt.customerName, ' ', alt.isCompleted && (_jsx("span", { className: "ml-1 text-xs text-green-700", children: "(Completed)" }))] }), _jsx("p", { className: "text-xs text-slate-600", children: alt.garmentDescription }), alt.measurements && (_jsxs("p", { className: "text-xs text-slate-500", children: ["Measurements: ", alt.measurements] })), _jsxs("div", { className: "flex gap-3 text-xs text-slate-500", children: [alt.contactNumber && _jsxs("span", { children: ["\uD83D\uDCDE ", alt.contactNumber] }), alt.dueDate && (_jsxs("span", { children: ["Due: ", new Date(alt.dueDate).toLocaleDateString()] })), alt.notes && _jsxs("span", { children: ["Note: ", alt.notes] })] })] }), _jsxs("div", { className: "flex flex-col gap-2 ml-3", children: [_jsx("button", { onClick: () => handleToggleComplete(alt), className: "p-2 rounded-lg bg-white hover:bg-slate-100 shadow-sm", title: alt.isCompleted ? 'Mark as pending' : 'Mark as completed', children: _jsx(CheckCircle2, { size: 18, className: alt.isCompleted ? 'text-green-600' : 'text-slate-500' }) }), _jsx("button", { onClick: () => handleDelete(alt.id), className: "p-2 rounded-lg bg-white hover:bg-red-50 shadow-sm", title: "Delete", children: _jsx(Trash2, { size: 18, className: "text-red-600" }) })] })] }, alt.id))) }))] })] }) }));
}
