import React from 'react';
import { Plus, AlertOctagon } from 'lucide-react';

export default function ProductCard({ product, onSelect }) {
  const isAvailable = product.isAvailable !== false;
  const hasVariants = product.variants && product.variants.length > 1;

  const lowestPrice = hasVariants
    ? Math.min(...product.variants.map(v => v.price))
    : product.basePrice;

  return (
    <div
      onClick={() => isAvailable && onSelect(product)}
      className={`group relative flex flex-col justify-between p-4 rounded-3xl border transition-all duration-200 select-none ${
        isAvailable
          ? 'bg-slate-800/90 border-slate-700/80 hover:border-orange-500/60 hover:bg-slate-800 shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] cursor-pointer'
          : 'bg-slate-900/60 border-slate-800 opacity-60 cursor-not-allowed'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition leading-snug">
            {product.name}
          </h4>
          {!isAvailable && (
            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" /> Sold Out
            </span>
          )}
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {product.variants.slice(0, 3).map((v, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 font-medium"
              >
                {v.name}: Rs {v.price}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">
            {hasVariants ? 'From' : 'Price'}
          </span>
          <span className="text-base sm:text-lg font-black text-amber-400">
            LKR {lowestPrice.toFixed(2)}
          </span>
        </div>

        <button
          disabled={!isAvailable}
          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition ${
            isAvailable
              ? 'bg-orange-500 group-hover:bg-orange-600 text-white shadow-md shadow-orange-500/30'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
