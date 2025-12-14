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
import DealersManagement from "./pages/DealersManagement";
import Inventory from "./pages/Inventory";
import DealerPurchaseEntry from "./pages/DealerPurchaseEntry";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/make-bill"} component={MakeBill} />
      <Route path={"/view-bills"} component={ViewBills} />
      <Route path={"/items"} component={ItemManagement} />
      <Route path={"/categories"} component={CategoriesManagement} />
      <Route path={"/alterations"} component={Alterations} />
      <Route path={"/dealers"} component={DealersManagement} />
      <Route path={"/inventory"} component={Inventory} />
      <Route path={"/dealer-purchases"} component={DealerPurchaseEntry} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppProvider>
            <Toaster />
            <Router />
          </AppProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
