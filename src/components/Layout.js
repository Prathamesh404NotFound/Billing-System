import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import ToastContainer from './ToastContainer';
export default function Layout({ children, title }) {
    return (_jsxs("div", { className: "flex flex-col md:flex-row min-h-screen bg-slate-50", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(Navbar, {}), _jsxs("main", { className: "flex-1 p-4 md:p-6 pb-20 md:pb-6", children: [title && (_jsx("div", { className: "mb-6", children: _jsx("h1", { className: "text-3xl font-bold text-slate-900", children: title }) })), children] })] }), _jsx(BottomNavigation, {}), _jsx(ToastContainer, {})] }));
}
