import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useState, useMemo } from 'react';
import ItemCard from '@/components/ItemCard';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { DBItem, ItemVariant } from '@/types';
import { Plus, Grid3x3, List, Search, Trash2, Edit2 } from 'lucide-react';

export default function ItemManagement() {
  const { items, addItem, updateItem, deleteItem, categories } = useApp();
  const { show } = useToast();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DBItem | null>(null);
  const [formData, setFormData] = useState<Partial<DBItem>>({
    category: '',
    subcategory: '',
    name: '',
    description: '',
  });
  const [variants, setVariants] = useState<ItemVariant[]>([]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const handleOpenModal = (item?: DBItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
      setVariants(item.variants);
    } else {
      setEditingItem(null);
      setFormData({
        category: '',
        subcategory: '',
        name: '',
        description: '',
      });
      // Start with one empty variant for new items
      setVariants([{ id: `v-${Date.now()}`, size: '', price: 0, stock: 0 }]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setVariants([]);
  };

  const handleSaveItem = async () => {
    if (
      !formData.name ||
      !formData.category ||
      !formData.subcategory
    ) {
      show("Please fill in all required fields (Name, Category, Subcategory)", "error");
      return;
    }

    const validVariants = variants.filter(v => v.size && v.price > 0);
    if (validVariants.length === 0) {
      show("Please add at least one valid variant (Size and Price > 0)", "error");
      return;
    }

    try {
      const baseItem: Partial<DBItem> = {
        category: formData.category!,
        subcategory: formData.subcategory!,
        name: formData.name!,
        description: formData.description,
      };

      if (editingItem) {
        // Update base item details
        await updateItem(editingItem.id, { ...baseItem, variants: validVariants });
        show("Item updated successfully!", "success");
      } else {
        const newItem: DBItem = {
          id: `item-${Date.now()}`,
          category: baseItem.category!,
          subcategory: baseItem.subcategory!,
          name: baseItem.name!,
          description: baseItem.description,
          variants: validVariants,
        };
        await addItem(newItem);
        show("Item added successfully!", "success");
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      show("Something went wrong while saving item", "error");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteItem(itemId);
      show("Item deleted successfully!", "success");
    } catch (error) {
      console.error(error);
      show("Failed to delete item", "error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariantChange = (index: number, field: keyof ItemVariant, value: string | number) => {
    const newVariants = [...variants];
    const isNumberField = field === 'price' || field === 'stock';
    const finalValue = isNumberField ? Number(value) : value;

    // Ensure ID is unique and stable
    if (field === 'size' || field === 'price') {
      newVariants[index] = {
        ...newVariants[index],
        [field]: finalValue,
        id: `v-${newVariants[index].id.split('-')[1]}-${finalValue}`, // Update ID based on size/price change
      };
    } else {
      newVariants[index] = {
        ...newVariants[index],
        [field]: finalValue,
      };
    }

    setVariants(newVariants);
  };

  const handleAddVariant = () => {
    setVariants([...variants, { id: `v-${Date.now()}`, size: '', price: 0, stock: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  return (
    <Layout title="Item Management">
      {/* Header Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search and Filter */}
          <div className="flex-1 flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search items..."
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
          </div>

          {/* View Toggle and Add Button */}
          <div className="flex gap-2 w-full md:w-auto">
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
            <button
              onClick={() => handleOpenModal()}
              className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Items Display */}
      {filteredItems.length > 0 ? (
        viewMode === 'table' ? (
          // Table View
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Item Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Category</th>
	                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Subcategory</th>
	                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Variants</th>
	                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Actions</th>
	                  </tr>
	                </thead>
	                <tbody>
	                  {filteredItems.map((item) => (
	                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
	                      <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
	                      <td className="py-3 px-4 text-slate-600">
	                        {categories.find((c) => c.id === item.category)?.name}
	                      </td>
	                      <td className="py-3 px-4 text-slate-600">{item.subcategory}</td>
	                      <td className="py-3 px-4 text-right font-semibold text-indigo-600">{item.variants.length}</td>
	                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="text-indigo-600 hover:text-indigo-700 font-medium mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                variant="detailed"
                onEdit={handleOpenModal}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No items found. Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={showModal}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        onClose={handleCloseModal}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Subcategory *</label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Formal, Casual"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Item Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Formal White Shirt"
            />
          </div>

	          {/* Price field removed and replaced by Variants section */}
	          <div className="space-y-4 border-t pt-4 border-slate-200">
	            <h3 className="text-lg font-bold text-slate-900">Variants (Size, Price, Stock)</h3>
	            {variants.map((variant, index) => (
	              <div key={variant.id} className="flex gap-2 items-end p-3 border border-slate-200 rounded-lg">
	                <div className="flex-1">
	                  <label className="block text-xs font-medium text-slate-500 mb-1">Size *</label>
	                  <input
	                    type="text"
	                    value={variant.size}
	                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
	                    className="w-full px-2 py-1 border border-slate-300 rounded-lg text-sm"
	                    placeholder="e.g., S, M, 32"
	                  />
	                </div>
	                <div className="flex-1">
	                  <label className="block text-xs font-medium text-slate-500 mb-1">Price (₹) *</label>
	                  <input
	                    type="number"
	                    value={variant.price}
	                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
	                    className="w-full px-2 py-1 border border-slate-300 rounded-lg text-sm"
	                    placeholder="0"
	                  />
	                </div>
	                <div className="flex-1">
	                  <label className="block text-xs font-medium text-slate-500 mb-1">Stock</label>
	                  <input
	                    type="number"
	                    value={variant.stock}
	                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
	                    className="w-full px-2 py-1 border border-slate-300 rounded-lg text-sm"
	                    placeholder="0"
	                  />
	                </div>
	                <button
	                  onClick={() => handleRemoveVariant(index)}
	                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
	                  title="Remove Variant"
	                >
	                  <Trash2 size={18} />
	                </button>
	              </div>
	            ))}
	            <button
	              onClick={handleAddVariant}
	              className="w-full px-4 py-2 border border-dashed border-indigo-400 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
	            >
	              <Plus size={18} />
	              Add New Variant
	            </button>
	          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional description"
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
              onClick={handleSaveItem}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
