import Layout from '@/components/Layout';
import { useDealers } from '@/hooks/useDealers';
import { useState, useMemo } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { Dealer } from '@/types';
import { sanitizeDealerData, sanitizePhoneNumber, sanitizeString } from '@/lib/sanitize';
import { Plus, Edit2, Trash2, Search, Store, Phone, MapPin, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortField = 'name' | 'shop' | 'date' | null;
type SortDirection = 'asc' | 'desc';

export default function DealersManagement() {
  const { dealers, addDealer, updateDealer, deleteDealer, searchDealers, dealerExistsByMobile } = useDealers();
  const { show } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [formData, setFormData] = useState<Partial<Dealer>>({
    dealerName: '',
    shopName: '',
    mobileNumber: '',
    whatsappNumber: '',
    address: '',
    notes: '',
  });

  const filteredAndSortedDealers = useMemo(() => {
    let result = searchQuery ? searchDealers(searchQuery) : dealers;

    if (sortField) {
      result = [...result].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'name':
            comparison = a.dealerName.localeCompare(b.dealerName);
            break;
          case 'shop':
            comparison = a.shopName.localeCompare(b.shopName);
            break;
          case 'date':
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            comparison = dateA - dateB;
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [dealers, searchQuery, sortField, sortDirection, searchDealers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-slate-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="text-indigo-600" />
    ) : (
      <ArrowDown size={14} className="text-indigo-600" />
    );
  };

  const handleOpenModal = (dealer?: Dealer) => {
    if (dealer) {
      setEditingDealer(dealer);
      setFormData(dealer);
    } else {
      setEditingDealer(null);
      setFormData({
        dealerName: '',
        shopName: '',
        mobileNumber: '',
        whatsappNumber: '',
        address: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDealer(null);
    setFormData({
      dealerName: '',
      shopName: '',
      mobileNumber: '',
      whatsappNumber: '',
      address: '',
      notes: '',
    });
  };

  const handleSave = async () => {
    if (!formData.dealerName?.trim() || !formData.shopName?.trim() || !formData.mobileNumber?.trim()) {
      show('Please fill in all required fields (Dealer Name, Shop Name, Mobile Number)', 'error');
      return;
    }

    // Sanitize input data
    const sanitized = sanitizeDealerData({
      dealerName: formData.dealerName,
      shopName: formData.shopName,
      mobileNumber: formData.mobileNumber,
      whatsappNumber: formData.whatsappNumber,
      address: formData.address,
      notes: formData.notes,
    });

    // Validate required fields after sanitization
    if (!sanitized.dealerName || !sanitized.shopName || !sanitized.mobileNumber) {
      show('Please fill in all required fields with valid data', 'error');
      return;
    }

    // Check for duplicate mobile number
    if (dealerExistsByMobile(sanitized.mobileNumber, editingDealer?.id)) {
      show('A dealer with this mobile number already exists', 'error');
      return;
    }

    try {
      const dealerData: Dealer = {
        id: editingDealer?.id || `dealer-${Date.now()}`,
        dealerName: sanitized.dealerName,
        shopName: sanitized.shopName,
        mobileNumber: sanitized.mobileNumber,
        whatsappNumber: sanitized.whatsappNumber,
        address: sanitized.address,
        notes: sanitized.notes,
        createdAt: editingDealer?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingDealer) {
        await updateDealer(editingDealer.id, dealerData);
        show('Dealer updated successfully!', 'success');
      } else {
        await addDealer(dealerData);
        show('Dealer added successfully!', 'success');
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      show('Failed to save dealer', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this dealer?')) return;
    try {
      await deleteDealer(id);
      show('Dealer deleted successfully!', 'success');
    } catch (error) {
      console.error(error);
      show('Failed to delete dealer', 'error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Layout title="Dealer Management">
      {/* Header Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 w-full md:w-auto">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search dealers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Dealer
          </button>
        </div>
      </div>

      {/* Dealers Table */}
      {filteredAndSortedDealers.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    >
                      Dealer Name
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    <button
                      onClick={() => handleSort('shop')}
                      className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    >
                      Shop Name
                      <SortIcon field="shop" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Mobile</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Address</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    >
                      Created
                      <SortIcon field="date" />
                    </button>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedDealers.map((dealer) => (
                  <tr key={dealer.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{dealer.dealerName}</td>
                    <td className="py-3 px-4 text-slate-600 flex items-center gap-2">
                      <Store size={16} className="text-slate-400" />
                      {dealer.shopName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 flex items-center gap-2">
                      <Phone size={16} className="text-slate-400" />
                      {dealer.mobileNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      {dealer.address || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {dealer.createdAt ? new Date(dealer.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleOpenModal(dealer)}
                          className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-indigo-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(dealer.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
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
          <p className="text-slate-500">
            {searchQuery ? 'No dealers found matching your search.' : 'No dealers added yet. Click "Add Dealer" to get started.'}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingDealer ? 'Edit Dealer' : 'Add New Dealer'}
        onClose={handleCloseModal}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Dealer Name *
              </label>
              <input
                type="text"
                name="dealerName"
                value={formData.dealerName || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Shop Name *
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., ABC Wholesale"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., +91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                name="whatsappNumber"
                value={formData.whatsappNumber || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., +91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Full address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Additional notes or remarks"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              {editingDealer ? 'Update Dealer' : 'Add Dealer'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

