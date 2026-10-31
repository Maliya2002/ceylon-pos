import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Banknote,
  CreditCard,
  QrCode,
  UtensilsCrossed,
  ShoppingBag,
  FileText,
  Calendar,
  Award,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api';
import ZReportModal from './ZReportModal';

export default function ReportsDashboard() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isZReportOpen, setIsZReportOpen] = useState(false);

  useEffect(() => {
    loadDailyReport();
  }, [selectedDate]);

  const loadDailyReport = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDailySummary(selectedDate);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sum = reportData?.summary || {};
  const pb = reportData?.paymentBreakdown || {};
  const ob = reportData?.orderTypeBreakdown || { dineIn: {}, takeaway: {} };
  const bestSellers = reportData?.bestSellingItems || [];

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* Header & Date Selector */}
      <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Sales Analytics & Cash Reports</h2>
            <p className="text-xs text-slate-400">
              End-of-day revenue, payment reconciliation, and top dishes
            </p>
          </div>
        </div>

        {/* Date picker and Z-Report button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none"
            />
          </div>

          <button
            onClick={() => setIsZReportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition active:scale-95"
          >
            <FileText className="w-4 h-4" />
            Print Z-Report
          </button>

          <button
            onClick={loadDailyReport}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              LKR {(sum.totalRevenue || 0).toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              From {sum.paidOrdersCount || 0} completed orders
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              💵 Cash in Drawer
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              LKR {(pb.CASH || 0).toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Physical cash collected</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              💳 Card Payments
            </span>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
              LKR {(pb.CARD || 0).toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">VISA / MasterCard POS</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              📱 LankaQR & Online
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">
              LKR {(pb.QR || 0).toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Q+ / FriMi / Flash transfers</p>
          </div>
        </div>

        {/* Breakdown Row: Order Types & Best Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Order Type */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-orange-400" />
              Sales by Order Type
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 mb-1">
                  <UtensilsCrossed className="w-4 h-4" />
                  🍽️ Dine-In
                </div>
                <div className="text-xl font-bold text-white">
                  LKR {(ob.dineIn?.revenue || 0).toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {ob.dineIn?.count || 0} Tables Served
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  🛍️ Takeaway / Parcels
                </div>
                <div className="text-xl font-bold text-white">
                  LKR {(ob.takeaway?.revenue || 0).toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {ob.takeaway?.count || 0} Parcels Handed
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Gross Menu Sales:</span>
                <span>LKR {(sum.grossSales || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Discounts Deducted:</span>
                <span>- LKR {(sum.totalDiscount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charges Collected:</span>
                <span>+ LKR {(sum.totalTax || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Best Selling Dishes */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Best-Selling Sri Lankan Dishes
            </h3>

            {bestSellers.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No items sold yet on this date.
              </p>
            ) : (
              <div className="space-y-2">
                {bestSellers.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-black flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <span className="text-[10px] text-slate-400">({item.variant})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-400">
                        {item.quantity} sold
                      </div>
                      <div className="text-[10px] text-slate-400">
                        LKR {item.revenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Z-Report Modal */}
      <ZReportModal
        summaryData={reportData}
        isOpen={isZReportOpen}
        onClose={() => setIsZReportOpen(false)}
      />
    </div>
  );
}
