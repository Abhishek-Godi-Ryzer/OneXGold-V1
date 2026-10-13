/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  History,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Download,
  Coins,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { GoldOrder } from '../types/domain';

interface OrdersListProps {
  onSelectOrder: (order: GoldOrder) => void;
  onBack: () => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({ onSelectOrder, onBack }) => {
  const [orders, setOrders] = useState<GoldOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={onBack} className="hover:text-slate-200 cursor-pointer">
          Primary Market
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-medium">Orders History</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Order Lifecycle History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of all Electronic Gold Receipt purchases and lifecycle state transitions
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b27] border border-[#223047] text-xs text-slate-300 hover:text-white cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#223047] text-slate-400">
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Asset Quantity</th>
                <th className="py-3 px-4 font-semibold">Total Paid</th>
                <th className="py-3 px-4 font-semibold">PAXG Liquidity</th>
                <th className="py-3 px-4 font-semibold">Allocation Agreement</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Created At</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#141b27] transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{order.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">
                    {order.quantityGrams}g 24K Gold
                  </td>
                  <td className="py-3.5 px-4 text-[#22c55e] font-bold">
                    AED {order.quote.totalPayableAed}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {order.liquidity?.filledPaxg ? `${order.liquidity.filledPaxg} PAXG` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400">
                    {order.allocation?.egrCertificateNumber || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : order.status === 'FAILED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="px-3 py-1 rounded-lg bg-[#1e293b] hover:bg-[#2e3e56] text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>View Lifecycle</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
