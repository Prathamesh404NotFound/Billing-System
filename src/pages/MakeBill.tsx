import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useEffect, useState } from 'react';
import ItemCard from '@/components/ItemCard';
import BillSummary from '@/components/BillSummary';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { DBItem, PaymentMode } from '@/types';

export default function MakeBill() {
  const { currentBill, createNewBill, getItemsByCategory, categories, addItemToBill, removeItemFromBill, updateBillItem, setDiscount, setTaxRate, saveBill } = useApp();
  const { show } = useToast();
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [customerName, setCustomerName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [selectedItemForModal, setSelectedItemForModal] = useState<DBItem | null>(null);

  const categoryItems = selectedCategory ? getItemsByCategory(selectedCategory) : [];

  useEffect(() => {
    if (!currentBill) {
      createNewBill();
    }
  }, [currentBill, createNewBill]);

  // When categories load from Firebase, auto-select the first one
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const openItemSelectionModal = (item: DBItem) => {
    setSelectedItemForModal(item);
  };

  const closeItemSelectionModal = () => {
    setSelectedItemForModal(null);
  };

  // The addItemToBill logic is now handled entirely within ItemSelectionModal
  // The ItemCard's onSelect prop will call openItemSelectionModal, which will open the modal.
  // The modal will call addItemToBill from AppContext.
  // We need to update the BillSummary to show the size. This is done in BillSummary.tsx.

  const handleSaveBill = () => {
    if (!currentBill || currentBill.items.length === 0) {
      show('Please add items to the bill', 'error');
      return;
    }
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      await saveBill(paymentMode, customerName || undefined);
      show('Bill saved successfully!', 'success');
      setShowSaveModal(false);
      setCustomerName('');
      createNewBill();
    } catch (error) {
      console.error(error);
      show('Failed to save bill. Please try again.', 'error');
    }
  };

  const handlePrintBill = () => {
    if (!currentBill || currentBill.items.length === 0) {
      show('Please add items to the bill', 'error');
      return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Bill Receipt</title>
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
              <p>Date: ${new Date(currentBill.date).toLocaleDateString()}</p>
            </div>
            <div class="bill-details">
              <p><strong>Customer:</strong> ${customerName || 'Walk-in Customer'}</p>
              <p><strong>Payment Mode:</strong> ${paymentMode.toUpperCase()}</p>
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
                ${currentBill.items.map((item) => `
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
              <p><strong>Subtotal:</strong> ₹${currentBill.subtotal}</p>
              <p><strong>Discount:</strong> -₹${Math.round(currentBill.discount)}</p>
              <p><strong>Tax (${currentBill.taxRate}%):</strong> ₹${currentBill.tax}</p>
              <h2><strong>Total:</strong> ₹${currentBill.total}</h2>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    show('Bill printed successfully!', 'success');
  };

  const handleSendToWhatsApp = () => {
    if (!currentBill || currentBill.items.length === 0) {
      show('Please add items to the bill', 'error');
      return;
    }

    const itemsList = currentBill.items.map((item) => `${item.itemName} (${item.quantity}x ₹${item.price})`).join('\n');
    const message = `Bill Summary\n\n${itemsList}\n\nSubtotal: ₹${currentBill.subtotal}\nDiscount: -₹${Math.round(currentBill.discount)}\nTax: ₹${currentBill.tax}\n\nTotal: ₹${currentBill.total}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    show('Redirecting to WhatsApp...', 'info');
  };

  if (!currentBill) {
    return (
      <Layout title="Make Bill">
        <div className="text-center py-12">
          <p className="text-slate-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Make Bill">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Selection */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Select Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-lg font-medium transition-all text-center ${
                    selectedCategory === category.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
              <div className="text-xl mb-1">{category.icon}</div>
              <div className="text-xs">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Items</h2>
            {categoryItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoryItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    variant="selectable"
                    onSelect={openItemSelectionModal}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No items in this category</p>
              </div>
            )}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BillSummary
              bill={currentBill}
              onRemoveItem={removeItemFromBill}
              onUpdateQuantity={updateBillItem}
              onDiscountChange={setDiscount}
              onTaxRateChange={setTaxRate}
              onPaymentModeChange={(mode) => setPaymentMode(mode)}
              onPrint={handlePrintBill}
              onSave={() => handleSaveBill()}
            />

            {/* Additional Actions */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleSendToWhatsApp}
                disabled={currentBill.items.length === 0}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                Send to WhatsApp
              </button>
              <button
                onClick={() => {
                  createNewBill();
                  setCustomerName('');
                  show('Bill cleared!', 'info');
                }}
                className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors"
              >
                Clear Bill
              </button>
            </div>
          </div>
        </div>
      </div>

	      {/* The old price modal is replaced by ItemSelectionModal which is opened by ItemCard */}
	      {/* The ItemSelectionModal component is rendered by ItemCard, so we don't need it here. */}

      {/* Save Bill Modal */}
      <Modal
        isOpen={showSaveModal}
        title="Save Bill"
        onClose={() => setShowSaveModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Customer Name (Optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter customer name"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-3">Bill Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Items</span>
                <span className="font-semibold">{currentBill.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold">₹{currentBill.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Discount</span>
                <span className="font-semibold text-red-600">-₹{Math.round(currentBill.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax</span>
                <span className="font-semibold">₹{currentBill.tax}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-indigo-600 text-lg">₹{currentBill.total}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setShowSaveModal(false)}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSave}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Confirm & Save
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
