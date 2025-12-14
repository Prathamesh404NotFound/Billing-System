import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Link } from 'wouter';
import { TrendingUp, ShoppingCart, Package, DollarSign, Warehouse, Users, ArrowUp } from 'lucide-react';
import { useMemo } from 'react';

export default function Dashboard() {
  const { bills, items, inventory, dealerPurchases, dealers, getLowStockItems } = useApp();

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todaysBills = bills.filter((b) => new Date(b.date).toDateString() === today);
    const todaysSales = todaysBills.reduce((sum, b) => sum + b.total, 0);

    // Today's purchases
    const todaysPurchases = dealerPurchases.filter(
      (p) => new Date(p.purchaseDate).toDateString() === today
    );
    const todaysPurchaseValue = todaysPurchases.reduce((sum, p) => sum + p.totalValue, 0);

    // This month's purchases
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthPurchases = dealerPurchases.filter(
      (p) => new Date(p.purchaseDate) >= monthStart
    );
    const monthPurchaseValue = thisMonthPurchases.reduce((sum, p) => sum + p.totalValue, 0);

    // Total stock value
    const totalStockValue = inventory.reduce((sum, inv) => sum + inv.stock * inv.costPrice, 0);

    // Top suppliers (dealers) by purchase value
    const dealerStats = dealerPurchases.reduce((acc, purchase) => {
      if (!acc[purchase.dealerId]) {
        acc[purchase.dealerId] = { dealerId: purchase.dealerId, dealerName: purchase.dealerName, totalValue: 0 };
      }
      acc[purchase.dealerId].totalValue += purchase.totalValue;
      return acc;
    }, {} as Record<string, { dealerId: string; dealerName: string; totalValue: number }>);

    const topSuppliers = Object.values(dealerStats)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    // Recently added stock (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentStock = inventory.filter(
      (inv) => new Date(inv.updatedAt) >= weekAgo
    );

    return {
      totalBills: bills.length,
      todaysSales,
      totalItems: items.length,
      totalRevenue: bills.reduce((sum, b) => sum + b.total, 0),
      totalStockValue,
      todaysPurchaseValue,
      monthPurchaseValue,
      topSuppliers,
      recentStockCount: recentStock.length,
      lowStockCount: getLowStockItems(10).length,
    };
  }, [bills, items, inventory, dealerPurchases, getLowStockItems]);

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
          value={`₹${stats.todaysSales.toLocaleString()}`}
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
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          color="bg-orange-600"
        />
        <StatCard
          icon={Warehouse}
          label="Stock Value"
          value={`₹${stats.totalStockValue.toLocaleString()}`}
          color="bg-indigo-600"
        />
        <StatCard
          icon={ArrowUp}
          label="Today's Purchases"
          value={`₹${stats.todaysPurchaseValue.toLocaleString()}`}
          color="bg-teal-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Month Purchases"
          value={`₹${stats.monthPurchaseValue.toLocaleString()}`}
          color="bg-cyan-600"
        />
        <StatCard
          icon={Package}
          label="Low Stock Items"
          value={stats.lowStockCount}
          color="bg-red-600"
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
          <Link
            href="/inventory"
            className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors text-center"
          >
            <p className="font-semibold text-indigo-900">Inventory</p>
            <p className="text-sm text-indigo-700">Stock management</p>
          </Link>
          <Link
            href="/dealers"
            className="p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors text-center"
          >
            <p className="font-semibold text-teal-900">Dealers</p>
            <p className="text-sm text-teal-700">Supplier management</p>
          </Link>
          <Link
            href="/dealer-purchases"
            className="p-4 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors text-center"
          >
            <p className="font-semibold text-cyan-900">Purchases</p>
            <p className="text-sm text-cyan-700">Add stock entries</p>
          </Link>
        </div>
      </div>

      {/* Top Suppliers */}
      {stats.topSuppliers.length > 0 && (
        <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Top Suppliers</h2>
          <div className="space-y-3">
            {stats.topSuppliers.map((supplier, index) => (
              <div
                key={supplier.dealerId}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{supplier.dealerName}</p>
                    <p className="text-xs text-slate-500">Dealer ID: {supplier.dealerId}</p>
                  </div>
                </div>
                <p className="font-bold text-indigo-600">₹{supplier.totalValue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Added Stock */}
      {stats.recentStockCount > 0 && (
        <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recently Added Stock</h2>
          <p className="text-slate-600">
            {stats.recentStockCount} items updated in the last 7 days
          </p>
        </div>
      )}

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
