import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Trash2,
  Printer,
  CreditCard,
  Percent,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';

export default function CartSummary({
  cart,
  orderType,
  setOrderType,
  selectedTable,
  setSelectedTable,
  tables,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  serviceChargeEnabled,
  setServiceChargeEnabled,
  onOpenCheckout,
  onPrintKotPreview,
  existingOrder,
  onAppendItemsToTable,
}) {
  const [orderNotes, setOrderNotes] = useState('');

  // Calculate financials
  const subTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  let discountAmount = 0;
  if (discountValue > 0) {
    if (discountType === 'percent') {
      discountAmount = (subTotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }
  }

  const serviceChargeAmount = (orderType === 'DINE_IN' && serviceChargeEnabled)
    ? (subTotal - discountAmount) * 0.10
    : 0;

  const grandTotal = Math.max(0, subTotal - discountAmount + serviceChargeAmount);

  return (
    <div className="flex flex-col h-full bg-slate-800/90 border-l border-slate-700 select-none">
      {/* Header & Order Type Switcher */}
      <div className="p-4 border-b border-slate-700/80 bg-slate-800">
        {existingOrder && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-bold flex items-center justify-between">
            <span>➕ Adding to Table {tables.find(t=>t.id===selectedTable)?.number || ''}</span>
            <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded text-white">Order #{existingOrder.orderNumber}</span>
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Current Bill</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold">
              {cart.reduce((total, i) => total + i.quantity, 0)} items
            </span>
          </h3>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Dine-In vs Takeaway Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-700">
          <button
            onClick={() => setOrderType('TAKEAWAY')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              orderType === 'TAKEAWAY'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Takeaway
          </button>
          <button
            onClick={() => setOrderType('DINE_IN')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              orderType === 'DINE_IN'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            Dine-In
          </button>
        </div>

        {/* Table Selector Dropdown (Shown only when Dine-In) */}
        {orderType === 'DINE_IN' && (
          <div className="mt-3">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Select Dining Table
            </label>
            <select
              value={selectedTable || ''}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">-- Choose Table Number --</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.number} ({t.capacity} Seats) {t.isOccupied ? '🔴 Occupied' : '🟢 Free'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-700 flex items-center justify-center mb-3 text-2xl">
              🍛
            </div>
            <p className="text-sm font-semibold text-slate-400">Bill is currently empty</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Tap any food or beverage item on the left to add it to the active order
            </p>
          </div>
        ) : (
          cart.map((item, index) => (
            <div
              key={index}
              className="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-3 flex flex-col gap-2 hover:border-slate-600 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {item.name}
                  </h4>
                  {item.variantName && (
                    <span className="text-[11px] font-semibold text-orange-400 uppercase">
                      [{item.variantName}]
                    </span>
                  )}
                  {item.notes && (
                    <p className="text-[10px] text-amber-300 font-medium italic mt-0.5">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white">
                    LKR {(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    @{item.unitPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <button
                  onClick={() => onRemoveItem(index)}
                  className="text-slate-500 hover:text-red-400 p-1 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1">
                  <button
                    onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                    className="w-5 h-5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-xs font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                    className="w-5 h-5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-xs font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Calculation & Actions */}
      <div className="p-4 bg-slate-900 border-t border-slate-700/80 space-y-3">
        {/* Discount & Service Charge Options */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 font-medium">Discount:</span>
            <div className="flex items-center gap-1.5">
              <div className="flex rounded-lg overflow-hidden border border-slate-700 text-[10px] font-bold">
                <button
                  onClick={() => setDiscountType('percent')}
                  className={`px-2 py-1 ${discountType === 'percent' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  %
                </button>
                <button
                  onClick={() => setDiscountType('fixed')}
                  className={`px-2 py-1 ${discountType === 'fixed' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  LKR
                </button>
              </div>
              <input
                type="number"
                min="0"
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs font-bold text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {orderType === 'DINE_IN' && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">10% Service Charge:</span>
              <button
                onClick={() => setServiceChargeEnabled(!serviceChargeEnabled)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                  serviceChargeEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {serviceChargeEnabled ? 'Applied (10%)' : 'None'}
              </button>
            </div>
          )}
        </div>

        {/* Totals Summary */}
        <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal:</span>
            <span>LKR {subTotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>Discount:</span>
              <span>- LKR {discountAmount.toFixed(2)}</span>
            </div>
          )}
          {serviceChargeAmount > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Service Charge (10%):</span>
              <span>+ LKR {serviceChargeAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-white pt-1 border-t border-slate-700/60">
            <span>GRAND TOTAL:</span>
            <span className="text-orange-400 text-lg">LKR {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {existingOrder ? (
          <button
            onClick={onAppendItemsToTable}
            disabled={cart.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-black shadow-lg transition active:scale-95 ${
              cart.length === 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-amber-500/25 ring-2 ring-amber-400/40'
            }`}
          >
            <Printer className="w-4 h-4" />
            Send KOT & Add to Table #{tables.find(t=>t.id===selectedTable)?.number || ''}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onPrintKotPreview}
              disabled={cart.length === 0}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl border text-xs font-bold transition active:scale-95 ${
                cart.length === 0
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Printer className="w-4 h-4" />
              Print KOT Slip
            </button>

            <button
              onClick={onOpenCheckout}
              disabled={cart.length === 0}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-black shadow-lg transition active:scale-95 ${
                cart.length === 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Pay & Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
