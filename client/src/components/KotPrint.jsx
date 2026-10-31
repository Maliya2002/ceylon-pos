import React from 'react';
import { ChefHat, Printer, X } from 'lucide-react';

export default function KotPrint({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedTime = new Date(order.createdAt || Date.now()).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Kitchen Order Ticket (KOT)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable KOT area */}
        <div
          id="printable-receipt"
          className="bg-white text-black p-5 rounded-lg shadow-inner font-mono text-xs leading-relaxed max-w-[80mm] mx-auto border-2 border-black"
        >
          {/* KOT Header */}
          <div className="text-center pb-2 border-b-2 border-black">
            <h2 className="text-base font-black uppercase tracking-wider">KITCHEN ORDER TICKET (KOT)</h2>
            <div className="flex items-center justify-between text-sm font-black pt-1">
              <span>ORDER #{order.orderNumber || '1001'}</span>
              <span className="bg-black text-white px-2 py-0.5 rounded">
                {order.orderType === 'DINE_IN' ? `TABLE: ${order.table?.number || 'T-?'}` : 'TAKEAWAY (PARCEL)'}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-700 pt-1">
              <span>Time: {formattedTime}</span>
              <span>Server: {order.user?.name?.split(' ')[0] || 'Nuwan'}</span>
            </div>
          </div>

          {/* Items to prepare */}
          <div className="py-3 border-b-2 border-black">
            <div className="flex justify-between text-[11px] font-black uppercase border-b border-black pb-1 mb-2">
              <span>Qty  Item / Portion</span>
              <span>Notes</span>
            </div>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="border-b border-dashed border-gray-300 pb-1.5 last:border-0">
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm font-black flex items-center gap-2">
                      <span className="bg-black text-white px-1.5 py-0.2 rounded text-xs">
                        {item.quantity} x
                      </span>
                      <span>{item.product?.name || item.name}</span>
                    </div>
                    {item.variantName && (
                      <span className="text-xs font-bold text-gray-700 uppercase">
                        [{item.variantName}]
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <div className="mt-1 ml-6 text-xs font-black bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded text-red-900 uppercase">
                      ⚠️ Note: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* General Order Notes */}
          {order.notes && (
            <div className="py-2 border-b border-black">
              <span className="font-black text-xs">ORDER NOTES:</span>
              <p className="text-xs font-bold text-red-700 uppercase">{order.notes}</p>
            </div>
          )}

          {/* KOT Footer */}
          <div className="pt-2 text-center text-[10px] font-bold uppercase">
            <span>--- RUSH ORDER: PREPARE FRESH ---</span>
          </div>
        </div>

        {/* Modal actions */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm font-medium transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-bold shadow-lg shadow-amber-500/20 transition"
          >
            <Printer className="w-4 h-4" />
            Print KOT Slip (80mm)
          </button>
        </div>
      </div>
    </div>
  );
}
