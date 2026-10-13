/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  History,
  TrendingDown,
  TrendingUp,
  PackageCheck,
  ChevronLeft,
  Search,
  ExternalLink,
  ShieldCheck,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Boxes,
  Clock,
  X,
  FileText,
} from 'lucide-react';
import { GoldTransaction, AuditEvent } from '../types/domain';
import { store } from '../lib/store';

interface TransactionHistoryProps {
  onBack: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  onBack,
  onSelectOrder,
}) => {
  const [transactions, setTransactions] = useState<GoldTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'REDEEM'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTxn, setSelectedTxn] = useState<GoldTransaction | null>(null);
  const [drawerAudits, setDrawerAudits] = useState<AuditEvent[]>([]);
  const [drawerLoading, setDrawerLoading] = useState<boolean>(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gold/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } else {
        setTransactions(store.getAllTransactions());
      }
    } catch {
      setTransactions(store.getAllTransactions());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const openTxnDetails = async (txn: GoldTransaction) => {
    setSelectedTxn(txn);
    setDrawerLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const audits: AuditEvent[] = await res.json();
        const filtered = audits.filter(
          (a) =>
            a.orderId === txn.orderId ||
            a.referenceId === txn.referenceId ||
            a.orderId.includes(txn.orderId)
        );
        setDrawerAudits(filtered);
      } else {
        const filtered = store.auditEvents.filter(
          (a) =>
            a.orderId === txn.orderId ||
            a.referenceId === txn.referenceId ||
            a.orderId.includes(txn.orderId)
        );
        setDrawerAudits(filtered);
      }
    } catch {
      const filtered = store.auditEvents.filter(
        (a) =>
          a.orderId === txn.orderId ||
          a.referenceId === txn.referenceId ||
          a.orderId.includes(txn.orderId)
      );
      setDrawerAudits(filtered);
    } finally {
      setDrawerLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter !== 'ALL' && t.type !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.orderId.toLowerCase().includes(q) ||
        (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to My Gold</span>
          </button>
          <div className="flex items-center gap-2.5">
            <History className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Gold Transaction History</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete institutional audit trail for 24K Physical Gold Buys, Sells, and Bullion Redemptions.
          </p>
        </div>

        {/* Quick filter tabs */}
        <div className="flex items-center gap-1.5 bg-[#141b27] p-1 rounded-xl border border-[#223047]">
          {(['ALL', 'BUY', 'SELL', 'REDEEM'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === tab
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL'
                ? 'All'
                : tab === 'BUY'
                ? 'PAXG Buy'
                : tab === 'SELL'
                ? 'PAXG Sell'
                : 'Redeem'}
            </button>
          ))}
        </div>
      </div>

      {/* Search and summary metrics */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Order ID, allocation, or tracking code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141b27] border border-[#223047] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredTransactions.length} transaction(s)
        </span>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-amber-400" />
          <span>Loading ledger transactions...</span>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-12 text-center space-y-3">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No transactions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Transactions will appear here when you execute gold buys, sells, or vault redemptions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((txn) => {
            const isBuy = txn.type === 'BUY';
            const isSell = txn.type === 'SELL';
            const isRedeem = txn.type === 'REDEEM';

            return (
              <div
                key={txn.id}
                onClick={() => openTxnDetails(txn)}
                className="bg-[#0e141f] hover:bg-[#121927] border border-[#1e293b] hover:border-[#2f3e58] rounded-xl p-4 sm:p-5 transition-all duration-200 cursor-pointer group space-y-3 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isBuy
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isSell
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {isBuy ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : isSell ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <PackageCheck className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            isBuy
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isSell
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {isBuy ? 'PAXG BUY' : isSell ? 'PAXG SELL' : 'PHYSICAL REDEEM'}
                        </span>
                        <span className="text-white font-bold text-sm">{txn.orderId}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{txn.description}</p>
                    </div>
                  </div>

                  {/* Quantity & Amount */}
                  <div className="text-left sm:text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 border-[#1e293b] pt-2 sm:pt-0">
                    <span
                      className={`text-sm font-black font-mono ${
                        isBuy
                          ? 'text-emerald-400'
                          : isSell
                          ? 'text-amber-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {isBuy ? `+${txn.quantityGrams}g` : `-${txn.quantityGrams}g`}
                    </span>
                    {txn.amountAed && (
                      <span className="text-xs text-slate-300 font-mono">
                        AED {txn.amountAed}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(txn.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Sub-row with PAXG / Reference Details */}
                <div className="flex items-center justify-between border-t border-[#1a2333] pt-2.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    {txn.paxgDetails && (
                      <span className="flex items-center gap-1 text-slate-300 font-mono">
                        <Boxes className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {txn.paxgDetails.side} {txn.paxgDetails.paxgAmount} PAXG @ ${txn.paxgDetails.paxgPriceUsd}
                        </span>
                      </span>
                    )}
                    {txn.referenceId && (
                      <span className="text-slate-400 font-mono">
                        Ref: {txn.referenceId}
                      </span>
                    )}
                  </div>

                  <span className="text-amber-400 group-hover:text-amber-300 font-semibold flex items-center gap-1 text-xs">
                    <span>Audit Trail</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Details & Audit Drawer Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0a0f18] border-l border-[#1e293b] h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Transaction Audit Record
                </span>
                <h3 className="text-lg font-bold text-white">{selectedTxn.orderId}</h3>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-2 rounded-lg bg-[#141b27] hover:bg-[#1a2333] text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Card */}
            <div className="bg-[#101722] border border-[#1e293b] rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Operation Type</span>
                <span className="text-white font-bold">{selectedTxn.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Quantity</span>
                <span className="text-white font-mono font-bold">{selectedTxn.quantityGrams}g 24K Gold</span>
              </div>
              {selectedTxn.amountAed && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Value (AED)</span>
                  <span className="text-emerald-400 font-mono font-bold">AED {selectedTxn.amountAed}</span>
                </div>
              )}
              {selectedTxn.referenceId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Reference / Tracking ID</span>
                  <span className="text-slate-200 font-mono">{selectedTxn.referenceId}</span>
                </div>
              )}
              {selectedTxn.paxgDetails && (
                <div className="border-t border-[#1e293b] pt-2 flex items-center justify-between">
                  <span className="text-slate-400">PAXG Liquidity Execution</span>
                  <span className="text-amber-400 font-mono">
                    {selectedTxn.paxgDetails.side} {selectedTxn.paxgDetails.paxgAmount} PAXG
                  </span>
                </div>
              )}
            </div>

            {/* Audit Trail Timeline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Cryptographic Audit Timeline
                </h4>
              </div>

              {drawerLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading audit events...</div>
              ) : drawerAudits.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#141b27] border border-[#223047] text-xs text-slate-400 text-center">
                  Audit events recorded and archived to immutable ledger.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {drawerAudits.map((event, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#141b27] border border-[#223047] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono text-[11px]">
                          {event.eventType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Actor: <strong className="text-slate-300">{event.actor}</strong> • Ref: {event.referenceId || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTxn(null)}
              className="w-full py-2.5 rounded-xl bg-[#141b27] hover:bg-[#1a2333] text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
