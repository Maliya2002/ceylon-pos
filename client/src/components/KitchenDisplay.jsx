import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle,
  PlayCircle,
  CheckCheck,
  Printer,
  RefreshCw,
  UtensilsCrossed,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api';
import KotPrint from './KotPrint';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('ACTIVE'); // ACTIVE, PENDING, PREPARING, READY, COMPLETED
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKotOrder, setSelectedKotOrder] = useState(null);

  useEffect(() => {
    loadOrders();
    // Auto refresh active orders every 10 seconds for real-time kitchen feed
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const activeOrders = await api.getActiveOrders();
      setOrders(activeOrders);
    } catch (err) {
      console.error('Failed to load kitchen orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      // Optimistic update
      setOrders((prev) =>
        prev
          .map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
          .filter((o) => (newStatus === 'COMPLETED' ? false : true))
      );
      loadOrders();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Helper for elapsed time
  const getTimeElapsed = (createdAt) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'ACTIVE') return ['PENDING', 'PREPARING', 'READY'].includes(order.status);
    return order.status === selectedFilter;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* KDS Header & Filter Bar */}
      <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Kitchen Display System (KDS)
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold animate-pulse">
                LIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time orders queue for kitchen chefs & cookline
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {[
            { id: 'ACTIVE', label: `All Active (${orders.length})` },
            { id: 'PENDING', label: `Pending (${orders.filter((o) => o.status === 'PENDING').length})` },
            { id: 'PREPARING', label: `Cooking (${orders.filter((o) => o.status === 'PREPARING').length})` },
            { id: 'READY', label: `Ready (${orders.filter((o) => o.status === 'READY').length})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                selectedFilter === pill.id
                  ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          ))}

          <button
            onClick={loadOrders}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title="Refresh order queue"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {isLoading && orders.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <CheckCheck className="w-16 h-16 text-slate-600 mb-3" />
            <p className="text-lg font-bold text-slate-300">Kitchen Queue is Clear!</p>
            <p className="text-xs text-slate-400 mt-1">
              All tickets have been prepared and served.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => {
              const isDineIn = order.orderType === 'DINE_IN';
              const isPending = order.status === 'PENDING';
              const isPreparing = order.status === 'PREPARING';
              const isReady = order.status === 'READY';

              // Header theme based on status
              const statusBadgeColor = isPending
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : isPreparing
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

              return (
                <div
                  key={order.id}
                  className={`flex flex-col justify-between bg-slate-800 border rounded-3xl overflow-hidden shadow-xl transition-all duration-200 ${
                    isPending
                      ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                      : isPreparing
                      ? 'border-blue-500/60 ring-1 ring-blue-500/30'
                      : 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className="p-4 bg-slate-850 border-b border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusBadgeColor}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedKotOrder(order)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition"
                        title="Print KOT slip"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-750 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        {isDineIn ? (
                          <>
                            <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />
                            <span>TABLE {order.table?.number || 'T-?'}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                            <span>TAKEAWAY (PARCEL)</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeElapsed(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items to cook */}
                  <div className="p-4 flex-1 space-y-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="pb-2.5 border-b border-slate-700/50 last:border-0"
                      >
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-700 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                              {item.quantity}x
                            </span>
                            <span className="text-sm font-bold text-white leading-snug">
                              {item.product?.name || item.name}
                            </span>
                          </div>
                          {item.variantName && (
                            <span className="text-[11px] font-semibold text-slate-400 uppercase shrink-0">
                              [{item.variantName}]
                            </span>
                          )}
                        </div>

                        {item.notes && (
                          <div className="mt-1 ml-8 text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                            ⚠️ {item.notes}
                          </div>
                        )}
                      </div>
                    ))}

                    {order.notes && (
                      <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">
                          Order Note:
                        </span>
                        <span className="text-slate-200">{order.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Action Buttons */}
                  <div className="p-3 bg-slate-850 border-t border-slate-700/80">
                    {isPending && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'PREPARING')}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black shadow-lg shadow-amber-500/20 transition active:scale-95"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Start Cooking (Mark Preparing)
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'READY')}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-black shadow-lg shadow-blue-500/20 transition active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Ready to Serve
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-500/20 transition active:scale-95"
                      >
                        <CheckCheck className="w-4 h-4" />
                        Order Served (Complete)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KOT Print Modal */}
      <KotPrint
        order={selectedKotOrder}
        onClose={() => setSelectedKotOrder(null)}
      />
    </div>
  );
}
