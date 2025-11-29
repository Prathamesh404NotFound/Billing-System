import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'wouter';
import { Home } from 'lucide-react';
export default function NotFound() {
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center px-4", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-6xl font-bold text-slate-900 mb-4", children: "404" }), _jsx("p", { className: "text-xl text-slate-600 mb-8", children: "Page not found" }), _jsx("p", { className: "text-slate-500 mb-8", children: "The page you're looking for doesn't exist or has been moved." }), _jsxs(Link, { href: "/", className: "inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors", children: [_jsx(Home, { size: 20 }), "Back to Dashboard"] })] }) }));
}
