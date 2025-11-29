import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
// Force TypeScript AppContext (with Firebase) instead of the old JS version
import { AppProvider } from "./contexts/AppContext";
import Dashboard from "./pages/Dashboard";
import MakeBill from "./pages/MakeBill";
import ViewBills from "./pages/ViewBills";
import ItemManagement from "./pages/ItemManagement";
import CategoriesManagement from "./pages/CategoriesManagement";
import Alterations from "./pages/Alterations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
function Router() {
    return (_jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Dashboard }), _jsx(Route, { path: "/make-bill", component: MakeBill }), _jsx(Route, { path: "/view-bills", component: ViewBills }), _jsx(Route, { path: "/items", component: ItemManagement }), _jsx(Route, { path: "/categories", component: CategoriesManagement }), _jsx(Route, { path: "/alterations", component: Alterations }), _jsx(Route, { path: "/settings", component: Settings }), _jsx(Route, { path: "/404", component: NotFound }), _jsx(Route, { component: NotFound })] }));
}
function App() {
    return (_jsx(ErrorBoundary, { children: _jsx(ThemeProvider, { defaultTheme: "light", children: _jsx(TooltipProvider, { children: _jsxs(AppProvider, { children: [_jsx(Toaster, {}), _jsx(Router, {})] }) }) }) }));
}
export default App;
