import React, { useState } from 'react';
import {
  Users,
  UtensilsCrossed,
  CheckCircle,
  PlusCircle,
  Clock,
  CreditCard,
  RefreshCw,
  Receipt,
  X,
} from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import ReceiptPrint from './ReceiptPrint';
import { api } from '../api';

export default function TablesManager({ tables, onRefreshTables, onSelectTableForNewOrder }) {
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);
  const [checkoutTableOrder, setCheckoutTableOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [checkoutInfo, setCheckoutInfo] = useState(null);

  const occupiedCount = tables.filter((t) => t.isOccupied).length;
  const availableCount = tables.length - occupiedCount;

  const handleTableClick = (table) => {
    if (table.isOccupied && table.activeOrder) {
      setSelectedTableDetails(table);
    } else {
      // Start new order for this table
      onSelectTableForNewOrder(table.id);
    }
  };

  const handleFreeTableManually = async (tableId) => {
    try {
      await api.toggleProductStatus ? api.updateOrderStatus : null; // sanity
      const res = await fetch(`/api/tables/${tableId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('pos_token')}`,
        },
      });
      if (res.ok) {
        onRefreshTables();
        setSelectedTableDetails(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmTableCheckout = async ({ paymentMethod, tenderedAmount, changeAmount }) => {
    if (!checkoutTableOrder) return;

    try {
      const res = await api.checkoutOrder(checkoutTableOrder.id, {
        paymentMethod,
        tenderedAmount,
      });

      setReceiptOrder(res.order);
      setCheckoutInfo({ tenderedAmount, changeAmount });
      setCheckoutTableOrder(null);
      setSelectedTableDetails(null);
      onRefreshTables();
    } catch (err) {
      alert('Checkout error: ' + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* Header & Stats */}
      <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Dining Tables Floor Layout</h2>
            <p className="text-xs text-slate-400">
              Manage Dine-In tables, monitor active bills and seat guests
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{availableCount} Tables Free</span>
          </div>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>{occupiedCount} Tables Occupied</span>
          </div>

          <button
            onClick={onRefreshTables}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tables Grid Layout */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const isOccupied = table.isOccupied;
            const activeOrder = table.activeOrder;

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-200 cursor-pointer active:scale-95 shadow-xl ${
                  isOccupied
                    ? 'bg-slate-800/90 border-amber-500/50 hover:border-amber-400 ring-1 ring-amber-500/30'
                    : 'bg-slate-800/60 border-slate-700/70 hover:border-emerald-500/50 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-black text-white">{table.number}</span>
                      <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{table.capacity} Persons</span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        isOccupied
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isOccupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>

                  {/* Active Order Details if occupied */}
                  {isOccupied && activeOrder ? (
                    <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300 font-semibold">
                        <span>Order #{activeOrder.orderNumber}</span>
                        <span className="text-[10px] text-amber-400 font-bold uppercase">
                          {activeOrder.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Items: {activeOrder.itemsCount}</span>
                        <span className="text-white font-black">
                          LKR {Number(activeOrder.grandTotal).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 pt-3 border-t border-slate-700/40 text-center">
                      <span className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <PlusCircle className="w-3.5 h-3.5" /> Tap to Seat Guests
                      </span>
                    </div>
                  )}
                </div>

                {isOccupied && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Dining
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCheckoutTableOrder(activeOrder);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition active:scale-95"
                    >
                      Checkout
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Details Modal */}
      {selectedTableDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Table {selectedTableDetails.number} Details
                </h3>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">
                  Occupied • {selectedTableDetails.capacity} Seats
                </p>
              </div>
              <button
                onClick={() => setSelectedTableDetails(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTableDetails.activeOrder && (
              <div className="my-5 bg-slate-900/60 p-4 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Order Number:</span>
                  <span className="text-white font-bold">
                    #{selectedTableDetails.activeOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Status:</span>
                  <span className="text-amber-400 font-bold uppercase">
                    {selectedTableDetails.activeOrder.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Current Bill Total:</span>
                  <span className="text-orange-400 font-black">
                    LKR {Number(selectedTableDetails.activeOrder.grandTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-700">
              <button
                onClick={() => handleFreeTableManually(selectedTableDetails.id)}
                className="px-3.5 py-2.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition"
              >
                Force Free Table
              </button>
              <button
                onClick={() => {
                  onSelectTableForNewOrder(selectedTableDetails.id, selectedTableDetails.activeOrder);
                  setSelectedTableDetails(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition"
              >
                + Add Items to Bill
              </button>
              <button
                onClick={() => {
                  setCheckoutTableOrder(selectedTableDetails.activeOrder);
                  setSelectedTableDetails(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition"
              >
                Settle & Checkout Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal for Table Bill */}
      {checkoutTableOrder && (
        <CheckoutModal
          isOpen={Boolean(checkoutTableOrder)}
          onClose={() => setCheckoutTableOrder(null)}
          totalAmount={Number(checkoutTableOrder.grandTotal) || 0}
          orderType="DINE_IN"
          tableName={selectedTableDetails?.number || 'T-?'}
          onConfirmCheckout={handleConfirmTableCheckout}
        />
      )}

      {/* Thermal Receipt Print */}
      <ReceiptPrint
        order={receiptOrder}
        checkoutInfo={checkoutInfo}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}
