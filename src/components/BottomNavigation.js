import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, FileText, Package, Settings, Plus, Tags, Scissors } from 'lucide-react';
export default function BottomNavigation() {
    const [location] = useLocation();
    const navItems = [
        { label: 'Dashboard', href: '/', icon: _jsx(LayoutDashboard, { size: 20 }) },
        { label: 'Bills', href: '/view-bills', icon: _jsx(FileText, { size: 20 }) },
        { label: 'Items', href: '/items', icon: _jsx(Package, { size: 20 }) },
        { label: 'Categories', href: '/categories', icon: _jsx(Tags, { size: 20 }) },
        { label: 'Alter', href: '/alterations', icon: _jsx(Scissors, { size: 20 }) },
        { label: 'Settings', href: '/settings', icon: _jsx(Settings, { size: 20 }) },
    ];
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: "fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 z-40", children: _jsx("div", { className: "flex justify-around", children: navItems.map((item) => {
                        const isActive = location === item.href;
                        return (_jsxs(Link, { href: item.href, className: `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500'}`, children: [item.icon, _jsx("span", { className: "text-xs font-medium", children: item.label })] }, item.href));
                    }) }) }), _jsx(Link, { href: "/make-bill", className: "fixed bottom-20 right-4 md:hidden w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors z-30", title: "Make Bill", children: _jsx(Plus, { size: 24 }) })] }));
}
