import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useState, useMemo } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { Search, Eye, Printer, Share2 } from 'lucide-react';
import { Bill } from '@/types';

export default function ViewBills() {
  const { bills } = useApp();
  const { show } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        bill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bill.customerName && bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

      const billDate = new Date(bill.date);
      const matchesStartDate = !startDate || billDate >= new Date(startDate);
      const matchesEndDate = !endDate || billDate <= new Date(endDate);

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [bills, searchQuery, startDate, endDate]);

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowBillModal(true);
  };

  const handlePrintBill = (bill: Bill) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Bill ${bill.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .bill-details { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .total-section { text-align: right; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Bill Receipt</h1>
              <p>Bill ID: ${bill.id}</p>
              <p>Date: ${new Date(bill.date).toLocaleDateString()}</p>
            </div>
            <div class="bill-details">
              <p><strong>Customer:</strong> ${bill.customerName}</p>
              <p><strong>Payment Mode:</strong> ${bill.paymentMode.toUpperCase()}</p>
            </div>
            <table>
              <thead>
                <tr>
	                  <th>Item (Size)</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${bill.items.map((item) => `
                  <tr>
	                    <td>${item.itemName} (${item.size})</td>
                    <td>₹${item.price}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.subtotal}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total-section">
              <p><strong>Subtotal:</strong> ₹${bill.subtotal}</p>
              <p><strong>Discount:</strong> -₹${Math.round(bill.discount)}</p>
              <p><strong>Tax (${bill.taxRate}%):</strong> ₹${bill.tax}</p>
              <h2><strong>Total:</strong> ₹${bill.total}</h2>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    show('Bill printed successfully!', 'success');
  };

  const handleSendToWhatsApp = (bill: Bill) => {
    const message = `Bill ID: ${bill.id}\nCustomer: ${bill.customerName}\nTotal: ₹${bill.total}\nPayment: ${bill.paymentMode.toUpperCase()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    show('Redirecting to WhatsApp...', 'info');
  };

  return (
    <Layout title="View Bills">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Bill ID or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Start Date"
            />
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="End Date"
            />
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setStartDate('');
              setEndDate('');
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bills Table */}
      {filteredBills.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Bill ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Customer</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Payment</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{bill.id}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{bill.customerName}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">₹{bill.total}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          bill.paymentMode === 'cash'
                            ? 'bg-green-100 text-green-800'
                            : bill.paymentMode === 'upi'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {bill.paymentMode.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleViewBill(bill)}
                          className="p-2 hover:bg-slate-100 rounded transition-colors"
                          title="View Bill"
                        >
                          <Eye size={16} className="text-indigo-600" />
                        </button>
                        <button
                          onClick={() => handlePrintBill(bill)}
                          className="p-2 hover:bg-slate-100 rounded transition-colors"
                          title="Print Bill"
                        >
                          <Printer size={16} className="text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleSendToWhatsApp(bill)}
                          className="p-2 hover:bg-slate-100 rounded transition-colors"
                          title="Send to WhatsApp"
                        >
                          <Share2 size={16} className="text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No bills found. Try adjusting your filters.</p>
        </div>
      )}

      {/* Bill Details Modal */}
      <Modal
        isOpen={showBillModal}
        title={`Bill ${selectedBill?.id}`}
        onClose={() => setShowBillModal(false)}
      >
        {selectedBill && (
          <div className="space-y-4">
            {/* Bill Header */}
            <div className="border-b border-slate-200 pb-4">
              <p className="text-sm text-slate-600">
                <strong>Date:</strong> {new Date(selectedBill.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Customer:</strong> {selectedBill.customerName}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Payment Mode:</strong> {selectedBill.paymentMode.toUpperCase()}
              </p>
            </div>

            {/* Bill Items */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Items</h3>
              <div className="space-y-2">
	                {selectedBill.items.map((item) => (
	                  <div key={item.variantId} className="flex justify-between text-sm border-b border-slate-100 pb-2">
	                    <div>
	                      <p className="font-medium text-slate-900">{item.itemName} ({item.size})</p>
	                      <p className="text-xs text-slate-500">₹{item.price} × {item.quantity}</p>
	                    </div>
	                    <p className="font-semibold text-slate-900">₹{item.subtotal}</p>
	                  </div>
	                ))}
              </div>
            </div>

            {/* Bill Totals */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold">₹{selectedBill.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Discount</span>
                <span className="font-semibold text-red-600">-₹{Math.round(selectedBill.discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax ({selectedBill.taxRate}%)</span>
                <span className="font-semibold">₹{selectedBill.tax}</span>
              </div>
              <div className="flex justify-between text-lg border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-indigo-600">₹{selectedBill.total}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handlePrintBill(selectedBill)}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={() => handleSendToWhatsApp(selectedBill)}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                WhatsApp
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
