import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';

export default function ReceiptPrint({ order, checkoutInfo, onClose }) {
  if (!order) return null;

  const [paperWidth, setPaperWidth] = useState('80mm'); // '80mm' or '58mm'

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const tendered = checkoutInfo?.tenderedAmount ?? order.grandTotal;
  const change = checkoutInfo?.changeAmount ?? Math.max(0, tendered - order.grandTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">Thermal Receipt Preview</h3>
          </div>

          {/* 80mm vs 58mm Toggle */}
          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-700 text-[10px] font-bold">
            <button
              onClick={() => setPaperWidth('80mm')}
              className={`px-2 py-1 rounded-lg transition ${
                paperWidth === '80mm' ? 'bg-orange-500 text-white' : 'text-slate-400'
              }`}
            >
              80mm
            </button>
            <button
              onClick={() => setPaperWidth('58mm')}
              className={`px-2 py-1 rounded-lg transition ${
                paperWidth === '58mm' ? 'bg-orange-500 text-white' : 'text-slate-400'
              }`}
            >
              58mm
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div
          id="printable-receipt"
          style={{ maxWidth: paperWidth }}
          className={`bg-white text-black p-4 rounded-lg shadow-inner font-mono leading-relaxed mx-auto border border-dashed border-gray-400 ${
            paperWidth === '58mm' ? 'text-[10px]' : 'text-xs'
          }`}
        >
          {/* Header */}
          <div className="text-center pb-2 border-b border-dashed border-black">
            <h2 className={`font-black tracking-wider uppercase ${paperWidth === '58mm' ? 'text-xs' : 'text-sm'}`}>
              CEYLON FLAVORS RESTAURANT
            </h2>
            <p className="text-[10px] font-medium">123, Galle Road, Colombo 03</p>
            <p className="text-[10px]">Tel: 011-2345678 / 077-1234567</p>
            <p className="text-[9px] text-gray-700">TRN: 104598231-7000</p>
          </div>

          {/* Metadata */}
          <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
            <div className="flex justify-between font-bold">
              <span>Order #: {order.orderNumber || '1001'}</span>
              <span className="uppercase">
                {order.orderType === 'DINE_IN'
                  ? `🍽️ DINE-IN (${order.table?.number || 'T-?'})`
                  : '🛍️ TAKEAWAY'}
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Date: {formattedDate}</span>
              <span>Cashier: {order.user?.name?.split(' ')[0] || 'Nuwan'}</span>
            </div>
          </div>

          {/* Items */}
          <div className="py-2 border-b border-dashed border-black">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black text-[9px] uppercase">
                  <th className="pb-1">Item</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Price</th>
                  <th className="pb-1 text-right">Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dotted divide-gray-300">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-1 pr-1">
                      <div className="font-bold">
                        {item.product?.name || item.name}
                      </div>
                      {item.variantName && (
                        <div className="text-[9px] text-gray-600">({item.variantName})</div>
                      )}
                      {item.notes && (
                        <div className="text-[8px] italic text-gray-800">Note: {item.notes}</div>
                      )}
                    </td>
                    <td className="py-1 text-center font-bold">{item.quantity}</td>
                    <td className="py-1 text-right">{(item.unitPrice || 0).toFixed(2)}</td>
                    <td className="py-1 text-right font-bold">
                      {(item.totalPrice || (item.unitPrice * item.quantity)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>LKR {(order.subTotal || 0).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Discount:</span>
                <span>- LKR {Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between">
                <span>Service Charge:</span>
                <span>+ LKR {Number(order.tax).toFixed(2)}</span>
              </div>
            )}
            <div className={`flex justify-between font-black pt-1 border-t border-black ${paperWidth === '58mm' ? 'text-xs' : 'text-sm'}`}>
              <span>GRAND TOTAL:</span>
              <span>LKR {(order.grandTotal || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold uppercase">{order.paymentMethod || 'CASH'}</span>
            </div>
            {order.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between">
                  <span>Cash Tendered:</span>
                  <span>LKR {Number(tendered).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Change Due:</span>
                  <span>LKR {Number(change).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 text-center text-[9px] space-y-0.5">
            <p className="font-bold uppercase">Bohoma Sthuthi! Thank You!</p>
            <p className="text-gray-500">Software: Ceylon Flavors POS Mini</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition"
          >
            <Printer className="w-4 h-4" />
            Print Receipt ({paperWidth})
          </button>
        </div>
      </div>
    </div>
  );
}
