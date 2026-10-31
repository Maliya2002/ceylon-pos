import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  Save,
  X,
} from 'lucide-react';
import { api } from '../api';

export default function MenuManager() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New/Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    basePrice: '',
    variants: [
      { name: 'Regular', price: '' },
    ],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (productId) => {
    try {
      const res = await api.toggleProductStatus(productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isAvailable: res.product.isAvailable } : p))
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      basePrice: '',
      variants: [
        { name: 'Full', price: '' },
        { name: 'Half', price: '' },
      ],
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.basePrice) {
      alert('Please fill product name, category and base price');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId,
        basePrice: parseFloat(formData.basePrice),
        variants: formData.variants.filter(v => v.name && v.price).map(v => ({
          name: v.name,
          price: parseFloat(v.price),
        })),
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.addProduct(payload);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.deleteProduct(productId);
      loadData();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* Header & Category Filter */}
      <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Menu & Pricing Management</h2>
            <p className="text-xs text-slate-400">
              Update dishes, toggle Out-of-Stock (ඉවරයි), adjust prices & variants
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add New Dish / Drink
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              selectedCategory === 'ALL'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                selectedCategory === c.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Dish / Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Portions & Variants</th>
                <th className="py-3 px-4 text-center">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredProducts.map((p) => {
                const isAvailable = p.isAvailable !== false;
                return (
                  <tr key={p.id} className="hover:bg-slate-750/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {p.category?.name || 'General'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-amber-400">
                      LKR {Number(p.basePrice).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.variants && p.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {p.variants.map((v, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg bg-slate-900/60 border border-slate-700 text-[10px] text-slate-300 font-medium"
                            >
                              {v.name}: Rs {v.price}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Single Portion</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(p.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border transition active:scale-95 ${
                          isAvailable
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`}
                        title="Click to toggle availability"
                      >
                        {isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Stock (ලබාගත හැක)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Sold Out (ඉවරයි)</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">Add New Sri Lankan Dish / Item</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Item Name (e.g. Mixed Basmati Fried Rice)
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cheese Dolphin Kottu"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Base Price (LKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="850"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Portions / Variants (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        variants: [...formData.variants, { name: '', price: '' }],
                      })
                    }
                    className="text-xs text-orange-400 hover:text-orange-300 font-bold"
                  >
                    + Add Portion
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.variants.map((v, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Portion (Full, Half, Regular)"
                        value={v.name}
                        onChange={(e) => {
                          const updated = [...formData.variants];
                          updated[i].name = e.target.value;
                          setFormData({ ...formData, variants: updated });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="Price (LKR)"
                        value={v.price}
                        onChange={(e) => {
                          const updated = [...formData.variants];
                          updated[i].price = e.target.value;
                          setFormData({ ...formData, variants: updated });
                        }}
                        className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            variants: formData.variants.filter((_, idx) => idx !== i),
                          });
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25"
                >
                  <Save className="w-4 h-4" />
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
