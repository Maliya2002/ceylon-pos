import React from 'react';
import { Printer, X, FileText } from 'lucide-react';

export default function ZReportModal({ summaryData, isOpen, onClose }) {
  if (!isOpen || !summaryData) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = summaryData.date || new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const sum = summaryData.summary || {};
  const pb = summaryData.paymentBreakdown || {};
  const ob = summaryData.orderTypeBreakdown || { dineIn: {}, takeaway: {} };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold text-white">End-of-Day Z-Report</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Z-Report (80mm Thermal / ESC POS layout) */}
        <div
          id="printable-receipt"
          className="bg-white text-black p-5 rounded-lg shadow-inner font-mono text-xs leading-relaxed max-w-[80mm] mx-auto border-2 border-dashed border-black"
        >
          {/* Header */}
          <div className="text-center pb-2 border-b-2 border-black">
            <h2 className="text-sm font-black uppercase tracking-wider">CEYLON FLAVORS RESTAURANT</h2>
            <p className="text-[11px] font-bold mt-0.5">DAILY END-OF-DAY (Z-REPORT)</p>
            <div className="flex justify-between text-[10px] text-gray-800 pt-1">
              <span>Date: {currentDate}</span>
              <span>Time: {currentTime}</span>
            </div>
            <div className="text-[10px] text-gray-600">Terminal: MAIN-POS-01</div>
          </div>

          {/* Sales Summary */}
          <div className="py-2.5 border-b border-dashed border-black space-y-1 text-[11px]">
            <div className="font-black uppercase text-[11px] border-b border-black pb-0.5">
              1. Sales Totals
            </div>
            <div className="flex justify-between">
              <span>Gross Sales:</span>
              <span>LKR {(sum.grossSales || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discounts Given:</span>
              <span>- LKR {(sum.totalDiscount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge / Tax:</span>
              <span>+ LKR {(sum.totalTax || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
              <span>NET REVENUE:</span>
              <span>LKR {(sum.totalRevenue || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>Total Orders Settled:</span>
              <span>{sum.paidOrdersCount || 0}</span>
            </div>
          </div>

          {/* Payment Method Breakdown & Drawer Cash */}
          <div className="py-2.5 border-b border-dashed border-black space-y-1 text-[11px]">
            <div className="font-black uppercase text-[11px] border-b border-black pb-0.5">
              2. Cash Drawer & Payments
            </div>
            <div className="flex justify-between font-bold">
              <span>💵 Cash in Drawer:</span>
              <span>LKR {(pb.CASH || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>💳 Credit/Debit Card:</span>
              <span>LKR {(pb.CARD || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>📱 LankaQR / Online:</span>
              <span>LKR {(pb.QR || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>🔀 Split Payments:</span>
              <span>LKR {(pb.SPLIT || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Dine-In vs Takeaway */}
          <div className="py-2.5 border-b border-dashed border-black space-y-1 text-[11px]">
            <div className="font-black uppercase text-[11px] border-b border-black pb-0.5">
              3. Sales by Order Type
            </div>
            <div className="flex justify-between">
              <span>Dine-In ({ob.dineIn?.count || 0} bills):</span>
              <span>LKR {(ob.dineIn?.revenue || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Takeaway ({ob.takeaway?.count || 0} parcels):</span>
              <span>LKR {(ob.takeaway?.revenue || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-5 space-y-4 text-[10px]">
            <div className="flex justify-between pt-3 border-t border-dotted border-gray-400">
              <div>
                <p>Cashier Signature:</p>
                <div className="h-5"></div>
                <p className="font-bold">___________________</p>
              </div>
              <div className="text-right">
                <p>Manager Signature:</p>
                <div className="h-5"></div>
                <p className="font-bold">___________________</p>
              </div>
            </div>
            <p className="text-center text-gray-500 text-[9px]">
              *** OFFICIAL END-OF-DAY REGISTER CLOSING ***
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition"
          >
            <Printer className="w-4 h-4" />
            Print Z-Report Slip (80mm)
          </button>
        </div>
      </div>
    </div>
  );
}
