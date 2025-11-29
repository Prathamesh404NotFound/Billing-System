import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Link } from 'wouter';
import { TrendingUp, ShoppingCart, Package, DollarSign } from 'lucide-react';
import { useMemo } from 'react';

export default function Dashboard() {
  const { bills, items } = useApp();

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todaysBills = bills.filter((b) => new Date(b.date).toDateString() === today);
    const todaysSales = todaysBills.reduce((sum, b) => sum + b.total, 0);

    return {
      totalBills: bills.length,
      todaysSales,
      totalItems: items.length,
      totalRevenue: bills.reduce((sum, b) => sum + b.total, 0),
    };
  }, [bills, items]);

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className={`bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{label}</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ShoppingCart}
          label="Total Bills"
          value={stats.totalBills}
          color="bg-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Today's Sales"
          value={`₹${stats.todaysSales}`}
          color="bg-green-600"
        />
        <StatCard
          icon={Package}
          label="Total Items"
          value={stats.totalItems}
          color="bg-purple-600"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${stats.totalRevenue}`}
          color="bg-orange-600"
        />
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/make-bill"
            className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors text-center"
          >
            <p className="font-semibold text-indigo-900">Make Bill</p>
            <p className="text-sm text-indigo-700">Create new bill</p>
          </Link>
          <Link
            href="/view-bills"
            className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-center"
          >
            <p className="font-semibold text-blue-900">View Bills</p>
            <p className="text-sm text-blue-700">See all bills</p>
          </Link>
          <Link
            href="/items"
            className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors text-center"
          >
            <p className="font-semibold text-green-900">Item Management</p>
            <p className="text-sm text-green-700">Manage items</p>
          </Link>
          <Link
            href="/categories"
            className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors text-center"
          >
            <p className="font-semibold text-purple-900">Categories</p>
            <p className="text-sm text-purple-700">Organise product groups</p>
          </Link>
          <Link
            href="/alterations"
            className="p-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors text-center"
          >
            <p className="font-semibold text-rose-900">Alterations</p>
            <p className="text-sm text-rose-700">Track stitching jobs</p>
          </Link>
        </div>
      </div>

      {/* Recent Bills */}
      {bills.length > 0 && (
        <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Bills</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Bill ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Customer</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Payment</th>
                </tr>
              </thead>
              <tbody>
                {bills.slice(0, 5).map((bill) => (
                  <tr key={bill.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{bill.id}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{bill.customerName}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">₹{bill.total}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bill.paymentMode === 'cash'
                          ? 'bg-green-100 text-green-800'
                          : bill.paymentMode === 'upi'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {bill.paymentMode.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
