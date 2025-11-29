import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import ToastContainer from './ToastContainer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {title && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
