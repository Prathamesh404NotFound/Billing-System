import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { Category } from '@/types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function CategoriesManagement() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');

  const resetForm = () => {
    setEditingCategory(null);
    setName('');
    setIcon('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = editingCategory?.id || name.toLowerCase().replace(/\s+/g, '-');
    const base: Category = { id, name: name.trim(), icon: icon || undefined };

    try {
      if (editingCategory) {
        await updateCategory(id, { name: base.name, icon: base.icon });
      } else {
        await addCategory(base);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save category', err);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon || '');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
    } catch (err) {
      console.error('Failed to delete category', err);
    }
  };

  return (
    <Layout title="Categories">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Add Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Shirts"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Icon (emoji)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 👔"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {editingCategory ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">All Categories</h2>
          {categories.length === 0 ? (
            <p className="text-slate-500 text-sm">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{cat.icon}</div>
                    <div>
                      <p className="font-semibold text-slate-900">{cat.name}</p>
                      <p className="text-xs text-slate-500">ID: {cat.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit2 size={16} className="text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}





