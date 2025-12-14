import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useState, useMemo } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { InventoryItem } from '@/types';
import { Search, Package, AlertTriangle, Grid3x3, List, TrendingDown, TrendingUp } from 'lucide-react';

export default function Inventory() {
  const { inventory, items, categories, getLowStockItems } = useApp();
  const { show } = useToast();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const lowStockItems = getLowStockItems(10);

  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((inv) =>
        inv.itemName.toLowerCase().includes(query) ||
        inv.category.toLowerCase().includes(query) ||
        inv.variant.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((inv) => inv.category === selectedCategory);
    }

    // Filter low stock
    if (showLowStockOnly) {
      filtered = filtered.filter((inv) => inv.stock <= 10);
    }

    return filtered.sort((a, b) => a.itemName.localeCompare(b.itemName));
  }, [inventory, searchQuery, selectedCategory, showLowStockOnly]);

  const totalStockValue = useMemo(() => {
    return filteredInventory.reduce((sum, inv) => sum + inv.stock * inv.costPrice, 0);
  }, [filteredInventory]);

  return (
    <Layout title="Inventory Management">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Items</p>
          <p className="text-2xl font-bold text-slate-900">{inventory.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Stock Value</p>
          <p className="text-2xl font-bold text-indigo-600">₹{totalStockValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Low Stock Items</p>
          <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Units</p>
          <p className="text-2xl font-bold text-slate-900">
            {inventory.reduce((sum, inv) => sum + inv.stock, 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by item name, category, or variant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-slate-700">Low Stock Only</span>
            </label>
          </div>

          <div className="flex gap-2 border border-slate-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Table view"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'card'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Card view"
            >
              <Grid3x3 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Display */}
      {filteredInventory.length > 0 ? (
        viewMode === 'table' ? (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Item Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Variant</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Stock</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Cost Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Selling Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Value</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((inv) => {
                    const isLowStock = inv.stock <= 10;
                    return (
                      <tr
                        key={`${inv.itemId}_${inv.variantId}`}
                        className={`border-b border-slate-100 hover:bg-slate-50 ${
                          isLowStock ? 'bg-orange-50' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-slate-400" />
                            {inv.itemName}
                            {isLowStock && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Low
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {categories.find((c) => c.id === inv.category)?.name || inv.category}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{inv.variant}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">
                          {inv.stock}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">₹{inv.costPrice}</td>
                        <td className="py-3 px-4 text-right text-slate-600">₹{inv.sellingPrice}</td>
                        <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                          ₹{(inv.stock * inv.costPrice).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          {new Date(inv.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((inv) => {
              const isLowStock = inv.stock <= 10;
              return (
                <div
                  key={`${inv.itemId}_${inv.variantId}`}
                  className={`bg-white rounded-lg border p-4 ${
                    isLowStock ? 'border-orange-300 bg-orange-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{inv.itemName}</h3>
                      <p className="text-sm text-slate-600">
                        {categories.find((c) => c.id === inv.category)?.name || inv.category} • {inv.variant}
                      </p>
                    </div>
                    {isLowStock && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Stock:</span>
                      <span className={`font-semibold ${isLowStock ? 'text-orange-600' : 'text-slate-900'}`}>
                        {inv.stock} units
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Cost Price:</span>
                      <span className="text-slate-900">₹{inv.costPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Selling Price:</span>
                      <span className="text-slate-900">₹{inv.sellingPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                      <span className="text-slate-600">Total Value:</span>
                      <span className="font-semibold text-indigo-600">
                        ₹{(inv.stock * inv.costPrice).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Updated: {new Date(inv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No inventory items found. Try adjusting your filters.</p>
        </div>
      )}
    </Layout>
  );
}

