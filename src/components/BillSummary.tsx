import { Bill, PaymentMode, BillItem } from '@/types';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface BillSummaryProps {
  bill: Bill;
  onRemoveItem?: (variantId: string) => void;
  onUpdateQuantity?: (variantId: string, quantity: number) => void;
  onDiscountChange?: (discount: number, type: 'fixed' | 'percentage') => void;
  onPaymentModeChange?: (mode: PaymentMode) => void;
  onPrint?: () => void;
  onSave?: (paymentMode: PaymentMode) => void;
}

export default function BillSummary({
  bill,
  onRemoveItem,
  onUpdateQuantity,
  onDiscountChange,
  onPaymentModeChange,
  onPrint,
  onSave,
}: BillSummaryProps) {
  const [discountInput, setDiscountInput] = useState(bill.discount);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>(bill.discountType);

  const handleDiscountChange = () => {
    onDiscountChange?.(discountInput, discountType);
  };

  const paymentModes: PaymentMode[] = ['cash', 'upi', 'card'];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 lg:p-6 space-y-4">
      <h3 className="font-bold text-lg text-slate-900">Bill Summary</h3>

      {/* Bill Items */}
      {bill.items.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {bill.items.map((item) => (
	            <div key={item.variantId} className="flex items-center justify-between p-2 bg-slate-50 rounded">
	              <div className="flex-1 min-w-0">
	                <p className="text-sm font-medium text-slate-900 truncate">{item.itemName} ({item.size})</p>
	                <p className="text-xs text-slate-500">₹{item.price} × {item.quantity}</p>
	              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="font-semibold text-slate-900 w-16 text-right">₹{item.subtotal}</span>
                <div className="flex items-center gap-1">
	                  <button
	                    onClick={() => onUpdateQuantity?.(item.variantId, item.quantity - 1)}
	                    disabled={item.quantity <= 1}
	                    className="p-1 hover:bg-slate-200 rounded disabled:opacity-50"
	                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
	                  <button
	                    onClick={() => onUpdateQuantity?.(item.variantId, item.quantity + 1)}
	                    className="p-1 hover:bg-slate-200 rounded"
	                  >
                    <Plus size={14} />
                  </button>
                </div>
	                {onRemoveItem && (
	                  <button
	                    onClick={() => onRemoveItem(item.variantId)}
	                    className="p-1 hover:bg-red-50 rounded ml-1"
	                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">No items added yet</p>
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-slate-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-semibold">₹{bill.subtotal}</span>
        </div>

        {/* Discount (no GST/tax, only discount) */}
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className="text-xs text-slate-600 block mb-1">Discount</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={discountInput}
                onChange={(e) => setDiscountInput(Number(e.target.value))}
                className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                placeholder="0"
              />
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                className="px-2 py-1 border border-slate-300 rounded text-sm"
              >
                <option value="fixed">₹</option>
                <option value="percentage">%</option>
              </select>
              <button
                onClick={handleDiscountChange}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm font-medium transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600">Discount</p>
            <p className="font-semibold text-red-600">-₹{Math.round(bill.discount)}</p>
          </div>
        </div>

        {/* Total (without GST) */}
        <div className="bg-indigo-50 p-3 rounded-lg flex justify-between items-center">
          <span className="font-bold text-slate-900">Total Amount</span>
          <span className="text-2xl font-bold text-indigo-600">₹{bill.total}</span>
        </div>
      </div>

      {/* Payment Mode */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">Payment Mode</label>
        <div className="flex gap-2">
          {paymentModes.map((mode) => (
            <button
              key={mode}
              onClick={() => onPaymentModeChange?.(mode)}
              className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-colors ${
                bill.paymentMode === mode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-slate-200">
        {onPrint && (
          <button
            onClick={onPrint}
            className="flex-1 py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded font-medium transition-colors"
          >
            Print
          </button>
        )}
        {onSave && (
          <button
            onClick={() => onSave(bill.paymentMode)}
            disabled={bill.items.length === 0}
            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
          >
            Save Bill
          </button>
        )}
      </div>
    </div>
  );
}
