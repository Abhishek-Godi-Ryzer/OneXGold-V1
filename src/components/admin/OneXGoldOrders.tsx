/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Copy,
  Check,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { AdminOrderSummary } from '../../types/domain';

interface OneXGoldOrdersProps {
  orders: AdminOrderSummary[];
  onSelectOrder: (order: AdminOrderSummary) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const OneXGoldOrders: React.FC<OneXGoldOrdersProps> = ({
  orders,
  onSelectOrder,
  onRefresh,
  isRefreshing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'FAILED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter orders based on search and tab
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerMasked && o.customerMasked.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.order?.quote?.quoteId && o.order.quote.quoteId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'COMPLETED') return o.status === 'COMPLETED';
    if (activeTab === 'FAILED') return o.status === 'FAILED';
    if (activeTab === 'PENDING') return o.status === 'PAYMENT_PENDING' || o.status === 'DOCUMENT_PENDING';
    if (activeTab === 'PROCESSING') return o.status !== 'COMPLETED' && o.status !== 'FAILED';

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
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
            <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
            Processing
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Search & Filter (Matches screenshot visual style) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Right: Filter button & Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-medium text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter By Status</span>
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                title="Refresh Orders"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Filters (Matches screenshot tab underline style) */}
        <div className="flex items-center gap-6 border-t border-slate-100 pt-3 text-xs">
          {[
            { id: 'ALL', label: 'All Orders', count: orders.length },
            { id: 'COMPLETED', label: 'Completed', count: orders.filter((o) => o.status === 'COMPLETED').length },
            { id: 'PROCESSING', label: 'Processing', count: orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'FAILED').length },
            { id: 'PENDING', label: 'Pending', count: orders.filter((o) => o.status === 'PAYMENT_PENDING' || o.status === 'DOCUMENT_PENDING').length },
            { id: 'FAILED', label: 'Failed', count: orders.filter((o) => o.status === 'FAILED').length },
          ].map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-2 font-medium flex items-center gap-1.5 transition cursor-pointer relative ${
                  isActive
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>{t.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-slate-100 text-slate-900' : 'bg-slate-50 text-slate-400'}`}>
                  {t.count}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table (Matches screenshot table style) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Gold Quantity</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Liquidity</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No OneX Gold orders match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => onSelectOrder(o)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{o.id}</span>
                        <button
                          onClick={(e) => copyOrderId(o.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                          title="Copy Order ID"
                        >
                          {copiedId === o.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {o.customerMasked || 'Abhishk (User 001)'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {Number(o.quantityGrams).toFixed(2)}g
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-900 font-semibold">
                      AED {o.order?.quote?.totalPayableAed || (Number(o.quantityGrams) * 306.72).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                        Mock PAXG
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(o.status)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(o.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(o);
                        }}
                        className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-slate-600 inline-flex items-center justify-center transition cursor-pointer"
                        title="View Operational Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
