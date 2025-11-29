import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, FileText, Package, Settings, Plus } from 'lucide-react';
export default function Sidebar() {
    const [location] = useLocation();
    const navItems = [
        { label: 'Dashboard', href: '/', icon: _jsx(LayoutDashboard, { size: 20 }) },
        { label: 'Make Bill', href: '/make-bill', icon: _jsx(Plus, { size: 20 }), highlight: true },
        { label: 'View Bills', href: '/view-bills', icon: _jsx(FileText, { size: 20 }) },
        { label: 'Items', href: '/items', icon: _jsx(Package, { size: 20 }) },
        { label: 'Settings', href: '/settings', icon: _jsx(Settings, { size: 20 }) },
    ];
    return (_jsxs("aside", { className: "hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0 border-r border-slate-800", children: [_jsx("div", { className: "p-6 border-b border-slate-800", children: _jsxs(Link, { href: "/", className: "flex items-center gap-3 font-bold text-lg", children: [_jsx("div", { className: "w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center", children: "CB" }), _jsx("span", { children: "Billing" })] }) }), _jsx("nav", { className: "flex-1 p-4 space-y-2", children: navItems.map((item) => {
                    const isActive = location === item.href;
                    return (_jsxs(Link, { href: item.href, className: `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'} ${item.highlight ? 'font-semibold' : ''}`, children: [item.icon, _jsx("span", { children: item.label })] }, item.href));
                }) }), _jsxs("div", { className: "p-4 border-t border-slate-800 text-xs text-slate-400", children: [_jsx("p", { children: "\u00A9 2024 Fashion Hub" }), _jsx("p", { children: "Billing System v1.0" })] })] }));
}
