import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

export default function VariantModal({ product, isOpen, onClose, onAddToCart }) {
  if (!isOpen || !product) return null;

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [customNote, setCustomNote] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Common Sri Lankan restaurant quick modifiers
  const quickModifiers = [
    'Less Spicy',
    'Extra Spicy (Kochchi)',
    'Extra Gravy (Hodi)',
    'Chili Paste on Side',
    'Add Fried Egg (+Rs 120)',
    'Extra Cheese (+Rs 200)',
    'No Onions',
    'Parcel Separately',
  ];

  const toggleModifier = (mod) => {
    if (selectedModifiers.includes(mod)) {
      setSelectedModifiers(selectedModifiers.filter(m => m !== mod));
    } else {
      setSelectedModifiers([...selectedModifiers, mod]);
    }
  };

  const calculateItemPrice = () => {
    let base = selectedVariant ? selectedVariant.price : product.basePrice;
    if (selectedModifiers.includes('Add Fried Egg (+Rs 120)')) base += 120;
    if (selectedModifiers.includes('Extra Cheese (+Rs 200)')) base += 200;
    return base;
  };

  const handleAdd = () => {
    const unitPrice = calculateItemPrice();
    const allNotes = [...selectedModifiers];
    if (customNote.trim()) allNotes.push(customNote.trim());

    onAddToCart({
      productId: product.id,
      name: product.name,
      variantName: selectedVariant ? selectedVariant.name : 'Regular',
      quantity,
      unitPrice,
      notes: allNotes.join(', '),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-white">{product.name}</h3>
            <p className="text-xs text-orange-400 font-semibold mt-0.5">
              Select Portion & Kitchen Customizations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portion / Variant selector */}
        {product.variants && product.variants.length > 0 && (
          <div className="my-4">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Portion Size
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id || selectedVariant?.name === v.name;
                return (
                  <button
                    key={v.id || v.name}
                    onClick={() => setSelectedVariant(v)}
                    className={`py-3 px-3 rounded-2xl border text-center transition active:scale-95 ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 ring-2 ring-orange-400/30'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="text-sm font-bold">{v.name}</div>
                    <div className="text-xs font-semibold mt-0.5 opacity-90">
                      LKR {v.price.toFixed(2)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modifiers & Kitchen notes */}
        <div className="my-4">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Kitchen Modifiers / Add-ons
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickModifiers.map((mod) => {
              const active = selectedModifiers.includes(mod);
              return (
                <button
                  key={mod}
                  onClick={() => toggleModifier(mod)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                    active
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  {active ? `✓ ${mod}` : mod}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Custom kitchen note (e.g. less salt, warm)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Quantity Controller */}
        <div className="my-4 flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-700">
          <span className="text-sm font-semibold text-slate-300">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center border border-slate-600 active:scale-95"
            >
              -
            </button>
            <span className="text-lg font-black text-white w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center border border-slate-600 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Total & Confirm Button */}
        <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total for Item</span>
            <span className="text-xl font-black text-white">
              LKR {(calculateItemPrice() * quantity).toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/25 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            Add to Bill
          </button>
        </div>
      </div>
    </div>
  );
}
