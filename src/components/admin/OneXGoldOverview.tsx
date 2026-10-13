/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Coins,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Eye,
  Copy,
  Layers,
  Sparkles,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { AdminOrderSummary, LiquidityMetrics } from '../../types/domain';

interface OneXGoldOverviewProps {
  orders: AdminOrderSummary[];
  metrics: LiquidityMetrics | null;
  currentGoldPriceAed: string;
  isProviderOffline: boolean;
  onSelectOrder: (order: AdminOrderSummary) => void;
  onNavigateToTab: (tab: string) => void;
}

export const OneXGoldOverview: React.FC<OneXGoldOverviewProps> = ({
  orders,
  metrics,
  currentGoldPriceAed,
  isProviderOffline,
  onSelectOrder,
  onNavigateToTab,
}) => {
  // Compute clean operational aggregates
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const pendingOrders = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'FAILED');
  const failedOrders = orders.filter((o) => o.status === 'FAILED');

  const totalGramsPurchased = orders
    .reduce((acc, o) => acc + (Number(o.quantityGrams) || 0), 0)
    .toFixed(2);

  const totalGramsAllocated = completedOrders
    .reduce((acc, o) => acc + (Number(o.quantityGrams) || 0), 0)
    .toFixed(2);

  const tokenSupply = totalGramsAllocated;

  const availablePaxg = metrics?.availablePaxg || '100.000000';
  const usedPaxg = metrics?.usedPaxg || '12.450000';

  const recentOrders = orders.slice(0, 8);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Failed
          </span>
        );
      case 'PAYMENT_PENDING':
      case 'DOCUMENT_PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Activity className="w-3 h-3 text-blue-500" />
            Processing
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards Grid (Section 2 Requirements) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
        {/* Total Gold Purchased */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block truncate">
            Total Gold Purchased
          </span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 font-mono">
              {totalGramsPurchased} g
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">All orders</span>
        </div>

        {/* Total Gold Allocated */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block truncate">
            Total Gold Allocated
          </span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-600 font-mono">
              {totalGramsAllocated} g
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">DMCC Vault allocated</span>
        </div>

        {/* OneX Gold Token Supply */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block truncate">
            OneX Gold Token Supply
          </span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-indigo-600 font-mono">
              {tokenSupply} Tokens
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">1 Token = 1g Gold</span>
        </div>

        {/* Active Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block truncate">
            Active Orders
          </span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 font-mono">
              {orders.length}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Lifetime volume</span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block truncate">
            Pending Orders
          </span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-amber-600 font-mono">
              {pendingOrders.length}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting completion</span>
        </div>

        {/* Failed Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block truncate">
            Failed Orders
          </span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-rose-600 font-mono">
              {failedOrders.length}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Requires review</span>
        </div>

        {/* Current Mock Gold Price */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block truncate">
            Current Mock Gold Price
          </span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-900 font-mono truncate">
              AED {currentGoldPriceAed} / g
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Mock spot rate</span>
        </div>
      </div>

      {/* 2. Compact Current Liquidity Summary Card (Section 2 Requirements) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Current Liquidity
              </h3>
              <p className="text-xs text-slate-500">
                Phase 1 MVP internal liquidity engine simulating real-time market fills.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('onex-liquidity')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Liquidity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Provider:</span>
            <strong className="text-slate-900 text-xs mt-0.5 block">Mock PAXG Liquidity</strong>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Status:</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isProviderOffline ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <strong
                className={`text-xs font-mono font-bold ${
                  isProviderOffline ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {isProviderOffline ? '● OFFLINE' : '● ONLINE'}
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Available:</span>
            <strong className="text-emerald-700 font-mono text-xs mt-0.5 block">
              {availablePaxg} PAXG
            </strong>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Used:</span>
            <strong className="text-slate-700 font-mono text-xs mt-0.5 block">
              {usedPaxg} PAXG
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Recent OneX Gold Orders Table (Section 2 Requirements) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Recent OneX Gold Orders
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest gold purchase orders and liquidity execution traces.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('onex-orders')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Gold Quantity</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Liquidity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {recentOrders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => onSelectOrder(o)}
                  className="hover:bg-slate-50/80 transition cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{o.id}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-900">
                    {o.customerMasked || 'Abhishk'}
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                    {Number(o.quantityGrams).toFixed(2)}g
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-900 font-medium">
                    AED {o.order?.quote?.totalPayableAed || (Number(o.quantityGrams) * 306.72).toFixed(2)}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                      Mock PAXG
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {getStatusBadge(o.status)}
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(o);
                      }}
                      className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-slate-600 inline-flex items-center justify-center transition cursor-pointer"
                      title="View Operational Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
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
