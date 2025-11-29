import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
export default function Navbar({ onMenuToggle }) {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => {
        setIsOpen(!isOpen);
        onMenuToggle?.(!isOpen);
    };
    return (_jsxs("nav", { className: "bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm", children: [_jsxs("div", { className: "max-w-full px-4 py-3 flex items-center justify-between", children: [_jsxs(Link, { href: "/", className: "flex items-center gap-2 font-bold text-lg text-indigo-600", children: [_jsx("div", { className: "w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold", children: "CB" }), _jsx("span", { className: "hidden sm:inline", children: "Billing System" })] }), _jsx("button", { onClick: toggleMenu, className: "md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors", "aria-label": "Toggle menu", children: isOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) })] }), isOpen && (_jsx("div", { className: "md:hidden border-t border-slate-200 bg-slate-50 p-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx(Link, { href: "/", className: "block px-4 py-2 rounded hover:bg-slate-200 transition-colors", children: "Dashboard" }), _jsx(Link, { href: "/make-bill", className: "block px-4 py-2 rounded hover:bg-slate-200 transition-colors", children: "Make Bill" }), _jsx(Link, { href: "/view-bills", className: "block px-4 py-2 rounded hover:bg-slate-200 transition-colors", children: "View Bills" }), _jsx(Link, { href: "/items", className: "block px-4 py-2 rounded hover:bg-slate-200 transition-colors", children: "Items" }), _jsx(Link, { href: "/settings", className: "block px-4 py-2 rounded hover:bg-slate-200 transition-colors", children: "Settings" })] }) }))] }));
}
