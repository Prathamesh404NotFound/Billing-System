import { Link, useLocation } from 'wouter';
import { LayoutDashboard, FileText, Package, Settings, Plus, Tags, Scissors } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

export default function Sidebar() {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Make Bill', href: '/make-bill', icon: <Plus size={20} />, highlight: true },
    { label: 'View Bills', href: '/view-bills', icon: <FileText size={20} /> },
    { label: 'Items', href: '/items', icon: <Package size={20} /> },
    { label: 'Categories', href: '/categories', icon: <Tags size={20} /> },
    { label: 'Alterations', href: '/alterations', icon: <Scissors size={20} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0 border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 font-bold text-lg">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            CB
          </div>
          <span>Billing</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${item.highlight ? 'font-semibold' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <p>© 2024 Fashion Hub</p>
        <p>Billing System v1.0</p>
      </div>
    </aside>
  );
}
