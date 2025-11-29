import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useState, useMemo } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { Search, Eye, Printer, Share2 } from 'lucide-react';
export default function ViewBills() {
    const { bills } = useApp();
    const { show } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const [showBillModal, setShowBillModal] = useState(false);
    const filteredBills = useMemo(() => {
        return bills.filter((bill) => {
            const matchesSearch = bill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (bill.customerName && bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
            const billDate = new Date(bill.date);
            const matchesStartDate = !startDate || billDate >= new Date(startDate);
            const matchesEndDate = !endDate || billDate <= new Date(endDate);
            return matchesSearch && matchesStartDate && matchesEndDate;
        });
    }, [bills, searchQuery, startDate, endDate]);
    const handleViewBill = (bill) => {
        setSelectedBill(bill);
        setShowBillModal(true);
    };
    const handlePrintBill = (bill) => {
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
    const handleSendToWhatsApp = (bill) => {
        const message = `Bill ID: ${bill.id}\nCustomer: ${bill.customerName}\nTotal: ₹${bill.total}\nPayment: ${bill.paymentMode.toUpperCase()}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        show('Redirecting to WhatsApp...', 'info');
    };
    return (_jsxs(Layout, { title: "View Bills", children: [_jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-4 mb-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-3 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Search by Bill ID or Customer...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" })] }), _jsx("div", { children: _jsx("input", { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "Start Date" }) }), _jsx("div", { children: _jsx("input", { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", placeholder: "End Date" }) }), _jsx("button", { onClick: () => {
                                setSearchQuery('');
                                setStartDate('');
                                setEndDate('');
                            }, className: "px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors", children: "Clear Filters" })] }) }), filteredBills.length > 0 ? (_jsx("div", { className: "bg-white rounded-lg border border-slate-200 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-200 bg-slate-50", children: [_jsx("th", { className: "text-left py-3 px-4 font-semibold text-slate-900", children: "Bill ID" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold text-slate-900", children: "Date" }), _jsx("th", { className: "text-left py-3 px-4 font-semibold text-slate-900", children: "Customer" }), _jsx("th", { className: "text-right py-3 px-4 font-semibold text-slate-900", children: "Amount" }), _jsx("th", { className: "text-center py-3 px-4 font-semibold text-slate-900", children: "Payment" }), _jsx("th", { className: "text-center py-3 px-4 font-semibold text-slate-900", children: "Actions" })] }) }), _jsx("tbody", { children: filteredBills.map((bill) => (_jsxs("tr", { className: "border-b border-slate-100 hover:bg-slate-50", children: [_jsx("td", { className: "py-3 px-4 font-medium text-slate-900", children: bill.id }), _jsx("td", { className: "py-3 px-4 text-slate-600", children: new Date(bill.date).toLocaleDateString() }), _jsx("td", { className: "py-3 px-4 text-slate-600", children: bill.customerName }), _jsxs("td", { className: "py-3 px-4 text-right font-semibold text-slate-900", children: ["\u20B9", bill.total] }), _jsx("td", { className: "py-3 px-4 text-center", children: _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold ${bill.paymentMode === 'cash'
                                                    ? 'bg-green-100 text-green-800'
                                                    : bill.paymentMode === 'upi'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-purple-100 text-purple-800'}`, children: bill.paymentMode.toUpperCase() }) }), _jsx("td", { className: "py-3 px-4 text-center", children: _jsxs("div", { className: "flex gap-2 justify-center", children: [_jsx("button", { onClick: () => handleViewBill(bill), className: "p-2 hover:bg-slate-100 rounded transition-colors", title: "View Bill", children: _jsx(Eye, { size: 16, className: "text-indigo-600" }) }), _jsx("button", { onClick: () => handlePrintBill(bill), className: "p-2 hover:bg-slate-100 rounded transition-colors", title: "Print Bill", children: _jsx(Printer, { size: 16, className: "text-slate-600" }) }), _jsx("button", { onClick: () => handleSendToWhatsApp(bill), className: "p-2 hover:bg-slate-100 rounded transition-colors", title: "Send to WhatsApp", children: _jsx(Share2, { size: 16, className: "text-green-600" }) })] }) })] }, bill.id))) })] }) }) })) : (_jsx("div", { className: "bg-white rounded-lg border border-slate-200 p-12 text-center", children: _jsx("p", { className: "text-slate-500", children: "No bills found. Try adjusting your filters." }) })), _jsx(Modal, { isOpen: showBillModal, title: `Bill ${selectedBill?.id}`, onClose: () => setShowBillModal(false), children: selectedBill && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border-b border-slate-200 pb-4", children: [_jsxs("p", { className: "text-sm text-slate-600", children: [_jsx("strong", { children: "Date:" }), " ", new Date(selectedBill.date).toLocaleDateString()] }), _jsxs("p", { className: "text-sm text-slate-600", children: [_jsx("strong", { children: "Customer:" }), " ", selectedBill.customerName] }), _jsxs("p", { className: "text-sm text-slate-600", children: [_jsx("strong", { children: "Payment Mode:" }), " ", selectedBill.paymentMode.toUpperCase()] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-slate-900 mb-3", children: "Items" }), _jsx("div", { className: "space-y-2", children: selectedBill.items.map((item) => (_jsxs("div", { className: "flex justify-between text-sm border-b border-slate-100 pb-2", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-medium text-slate-900", children: [item.itemName, " (", item.size, ")"] }), _jsxs("p", { className: "text-xs text-slate-500", children: ["\u20B9", item.price, " \u00D7 ", item.quantity] })] }), _jsxs("p", { className: "font-semibold text-slate-900", children: ["\u20B9", item.subtotal] })] }, item.variantId))) })] }), _jsxs("div", { className: "bg-slate-50 p-4 rounded-lg space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Subtotal" }), _jsxs("span", { className: "font-semibold", children: ["\u20B9", selectedBill.subtotal] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Discount" }), _jsxs("span", { className: "font-semibold text-red-600", children: ["-\u20B9", Math.round(selectedBill.discount)] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-slate-600", children: ["Tax (", selectedBill.taxRate, "%)"] }), _jsxs("span", { className: "font-semibold", children: ["\u20B9", selectedBill.tax] })] }), _jsxs("div", { className: "flex justify-between text-lg border-t border-slate-200 pt-2", children: [_jsx("span", { className: "font-bold text-slate-900", children: "Total" }), _jsxs("span", { className: "font-bold text-indigo-600", children: ["\u20B9", selectedBill.total] })] })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsxs("button", { onClick: () => handlePrintBill(selectedBill), className: "flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2", children: [_jsx(Printer, { size: 16 }), "Print"] }), _jsxs("button", { onClick: () => handleSendToWhatsApp(selectedBill), className: "flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2", children: [_jsx(Share2, { size: 16 }), "WhatsApp"] })] })] })) })] }));
}
