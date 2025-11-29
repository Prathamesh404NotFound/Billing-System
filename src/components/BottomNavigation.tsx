import { Link, useLocation } from 'wouter';
import { LayoutDashboard, FileText, Package, Settings, Plus } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Bills', href: '/view-bills', icon: <FileText size={20} /> },
    { label: 'Items', href: '/items', icon: <Package size={20} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 z-40">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button for Make Bill */}
      <Link
        href="/make-bill"
        className="fixed bottom-20 right-4 md:hidden w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors z-30"
        title="Make Bill"
      >
        <Plus size={24} />
      </Link>
    </>
  );
}
