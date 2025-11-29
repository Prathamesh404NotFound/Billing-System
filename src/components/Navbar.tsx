import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

interface NavbarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    onMenuToggle?.(!isOpen);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-full px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-indigo-600">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            CB
          </div>
          <span className="hidden sm:inline">Billing System</span>
        </Link>

        <button
          onClick={toggleMenu}
          className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 p-4">
          <div className="space-y-2">
            <Link href="/" className="block px-4 py-2 rounded hover:bg-slate-200 transition-colors">
              Dashboard
            </Link>
            <Link href="/make-bill" className="block px-4 py-2 rounded hover:bg-slate-200 transition-colors">
              Make Bill
            </Link>
            <Link href="/view-bills" className="block px-4 py-2 rounded hover:bg-slate-200 transition-colors">
              View Bills
            </Link>
            <Link href="/items" className="block px-4 py-2 rounded hover:bg-slate-200 transition-colors">
              Items
            </Link>
            <Link href="/settings" className="block px-4 py-2 rounded hover:bg-slate-200 transition-colors">
              Settings
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
