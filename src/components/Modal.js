import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from 'lucide-react';
export default function Modal({ isOpen, title, children, onClose, size = 'md' }) {
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-50", onClick: onClose }), _jsxs("div", { className: `relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4`, children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-slate-200", children: [_jsx("h2", { className: "text-lg font-bold text-slate-900", children: title }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-slate-100 rounded transition-colors", "aria-label": "Close modal", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: "p-4 max-h-[calc(100vh-200px)] overflow-y-auto", children: children })] })] }));
}
