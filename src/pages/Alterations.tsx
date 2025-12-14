import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Alteration } from '@/types';
import { useState } from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';

export default function Alterations() {
  const { alterations, addAlteration, updateAlteration, deleteAlteration } = useApp();
  const [form, setForm] = useState<Omit<Alteration, 'id' | 'isCompleted'>>({
    customerName: '',
    contactNumber: '',
    garmentDescription: '',
    measurements: '',
    dueDate: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!form.customerName.trim() || !form.garmentDescription.trim()) return;
    const id = `ALT-${Date.now()}`;
    const alteration: Alteration = {
      id,
      isCompleted: false,
      customerName: form.customerName.trim(),
      contactNumber: form.contactNumber || undefined,
      garmentDescription: form.garmentDescription.trim(),
      measurements: form.measurements.trim(),
      dueDate: form.dueDate || undefined,
      notes: form.notes || undefined,
    };
    try {
      await addAlteration(alteration);
      setForm({
        customerName: '',
        contactNumber: '',
        garmentDescription: '',
        measurements: '',
        dueDate: '',
        notes: '',
      });
    } catch (err) {
      console.error('Failed to add alteration', err);
    }
  };

  const handleToggleComplete = async (alt: Alteration) => {
    try {
      await updateAlteration(alt.id, { isCompleted: !alt.isCompleted });
    } catch (err) {
      console.error('Failed to update alteration', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this alteration entry?')) return;
    try {
      await deleteAlteration(id);
    } catch (err) {
      console.error('Failed to delete alteration', err);
    }
  };

  return (
    <Layout title="Cloth Alterations">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">New Alteration</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Garment Description *
              </label>
              <input
                type="text"
                name="garmentDescription"
                value={form.garmentDescription}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Blue jeans shortening"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Measurements / Instructions
              </label>
              <textarea
                name="measurements"
                value={form.measurements}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Waist 32, Length -2 inch"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="w-full mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              Add Alteration
            </button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Pending & Completed</h2>
          {alterations.length === 0 ? (
            <p className="text-sm text-slate-500">No alterations recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {alterations
                .slice()
                .sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1))
                .map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-3 border rounded-lg flex items-start justify-between ${
                      alt.isCompleted ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {alt.customerName}{' '}
                        {alt.isCompleted && (
                          <span className="ml-1 text-xs text-green-700">(Completed)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-600">{alt.garmentDescription}</p>
                      {alt.measurements && (
                        <p className="text-xs text-slate-500">Measurements: {alt.measurements}</p>
                      )}
                      <div className="flex gap-3 text-xs text-slate-500">
                        {alt.contactNumber && <span>📞 {alt.contactNumber}</span>}
                        {alt.dueDate && (
                          <span>Due: {new Date(alt.dueDate).toLocaleDateString()}</span>
                        )}
                        {alt.notes && <span>Note: {alt.notes}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-3">
                      <button
                        onClick={() => handleToggleComplete(alt)}
                        className="p-2 rounded-lg bg-white hover:bg-slate-100 shadow-sm"
                        title={alt.isCompleted ? 'Mark as pending' : 'Mark as completed'}
                      >
                        <CheckCircle2
                          size={18}
                          className={alt.isCompleted ? 'text-green-600' : 'text-slate-500'}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(alt.id)}
                        className="p-2 rounded-lg bg-white hover:bg-red-50 shadow-sm"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600" />
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





