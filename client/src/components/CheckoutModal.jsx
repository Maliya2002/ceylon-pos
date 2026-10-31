import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Split,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirmCheckout,
  orderType,
  tableName,
}) {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, CARD, QR, SPLIT
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [cardReference, setCardReference] = useState('');
  const [splitCash, setSplitCash] = useState(Math.round(totalAmount / 2));
  const [splitCard, setSplitCard] = useState(totalAmount - Math.round(totalAmount / 2));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tenderedNum = parseFloat(tenderedAmount) || 0;
  const changeDue = Math.max(0, tenderedNum - totalAmount);
  const isCashSufficient = paymentMethod !== 'CASH' || tenderedNum >= totalAmount;

  // Preset cash tender amounts common in Sri Lanka
  const quickCashOptions = [
    { label: 'Exact', value: totalAmount },
    { label: 'Rs 500', value: 500 },
    { label: 'Rs 1,000', value: 1000 },
    { label: 'Rs 2,000', value: 2000 },
    { label: 'Rs 5,000', value: 5000 },
  ];

  const handleCheckoutSubmit = async () => {
    if (paymentMethod === 'CASH' && tenderedNum < totalAmount) {
      alert(`Tendered cash (Rs ${tenderedNum}) is less than total amount (Rs ${totalAmount})`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmCheckout({
        paymentMethod,
        tenderedAmount: paymentMethod === 'CASH' ? tenderedNum : totalAmount,
        changeAmount: paymentMethod === 'CASH' ? changeDue : 0,
        cardReference: paymentMethod === 'CARD' ? cardReference : undefined,
        splitDetails: paymentMethod === 'SPLIT' ? { cash: splitCash, card: splitCard } : undefined,
      });
    } catch (err) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-400" />
              Settle Payment & Checkout
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {orderType === 'DINE_IN' ? `🍽️ Dine-In Order (Table ${tableName})` : '🛍️ Takeaway Parcel'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grand Total Banner */}
        <div className="my-5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl p-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-300">
            Total Amount Due
          </span>
          <div className="text-3xl font-black text-white mt-1">
            LKR {totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Select Payment Method
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { id: 'CASH', label: 'Cash', icon: Banknote, color: 'hover:border-emerald-500' },
              { id: 'CARD', label: 'Card', icon: CreditCard, color: 'hover:border-blue-500' },
              { id: 'QR', label: 'LankaQR', icon: QrCode, color: 'hover:border-amber-500' },
              { id: 'SPLIT', label: 'Split Pay', icon: Split, color: 'hover:border-purple-500' },
            ].map(method => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    setPaymentMethod(method.id);
                    if (method.id === 'CASH' && !tenderedAmount) {
                      setTenderedAmount(totalAmount.toString());
                    }
                  }}
                  className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border text-sm font-semibold transition active:scale-95 ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/30'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1.5" />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Specific Controls */}
        {paymentMethod === 'CASH' && (
          <div className="space-y-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">
                Cash Tendered by Customer (LKR)
              </label>
              <input
                type="number"
                value={tenderedAmount}
                onChange={e => setTenderedAmount(e.target.value)}
                placeholder="Enter amount given"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* Quick cash denomination buttons */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Quick Cash Presets:</span>
              <div className="flex flex-wrap gap-2">
                {quickCashOptions.map((btn, i) => (
                  <button
                    key={i}
                    onClick={() => setTenderedAmount(btn.value.toString())}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-orange-600 border border-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Due Display */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Change Due to Customer:</span>
              <span
                className={`text-xl font-black ${
                  tenderedNum >= totalAmount ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                LKR {changeDue.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {paymentMethod === 'CARD' && (
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
              <CreditCard className="w-4 h-4" />
              Swipe or Tap Card on Terminal (VISA / MasterCard / LankaPay)
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Card Approval / Ref # (Optional)</label>
              <input
                type="text"
                value={cardReference}
                onChange={e => setCardReference(e.target.value)}
                placeholder="e.g. REF-98432"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {paymentMethod === 'QR' && (
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 text-center">
            <div className="inline-block bg-white p-3 rounded-2xl shadow-lg mb-2">
              <div className="w-36 h-36 bg-slate-100 flex flex-col items-center justify-center border-2 border-dashed border-slate-400 rounded-xl relative overflow-hidden">
                <QrCode className="w-24 h-24 text-slate-900" />
                <span className="text-[10px] font-black text-slate-800 mt-1 uppercase tracking-wider">
                  LANKAQR READY
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-300">
              Scan with any Sri Lankan Bank App (FriMi, Flash, Genie, Commercial Q+)
            </p>
            <p className="text-[11px] text-amber-400 font-mono mt-1">
              Amount: LKR {totalAmount.toFixed(2)}
            </p>
          </div>
        )}

        {paymentMethod === 'SPLIT' && (
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-xs text-slate-400 font-medium">Split Payment (Cash + Card)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Cash Part (LKR)</label>
                <input
                  type="number"
                  value={splitCash}
                  onChange={e => {
                    const c = parseFloat(e.target.value) || 0;
                    setSplitCash(c);
                    setSplitCard(Math.max(0, totalAmount - c));
                  }}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Card Part (LKR)</label>
                <input
                  type="number"
                  value={splitCard}
                  onChange={e => {
                    const cd = parseFloat(e.target.value) || 0;
                    setSplitCard(cd);
                    setSplitCash(Math.max(0, totalAmount - cd));
                  }}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between pt-1">
              <span>Split Total: LKR {(splitCash + splitCard).toFixed(2)}</span>
              <span>Diff: LKR {Math.abs(totalAmount - (splitCash + splitCard)).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCheckoutSubmit}
            disabled={isSubmitting || !isCashSufficient}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-lg transition active:scale-95 ${
              isSubmitting || !isCashSufficient
                ? 'bg-slate-700 cursor-not-allowed opacity-50'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25 ring-2 ring-emerald-400/30'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {isSubmitting ? 'Processing...' : 'Complete Payment & Print'}
          </button>
        </div>
      </div>
    </div>
  );
}
