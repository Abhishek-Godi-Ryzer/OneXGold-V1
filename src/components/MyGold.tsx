/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  TrendingUp,
  Coins,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building2,
  Lock,
  ArrowUpRight,
  Download,
  AlertCircle,
  FileCheck,
  History,
  PackageCheck,
  FileText,
} from 'lucide-react';
import { GoldHolding } from '../types/domain';
import { formatCurrencyAed, decMul } from '../lib/decimal';
import { SellGoldFlow } from './SellGoldFlow';
import { RedeemGoldFlow } from './RedeemGoldFlow';
import { TransactionHistory } from './TransactionHistory';

interface MyGoldProps {
  currentPrice: string;
  onBuyMore: () => void;
  onBack: () => void;
}

type MyGoldView = 'OVERVIEW' | 'SELL' | 'REDEEM' | 'TRANSACTIONS';

export const MyGold: React.FC<MyGoldProps> = ({ currentPrice, onBuyMore, onBack }) => {
  const [activeView, setActiveView] = useState<MyGoldView>('OVERVIEW');
  const [holding, setHolding] = useState<GoldHolding | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchHoldings = async () => {
    try {
      const res = await fetch('/api/gold/holdings');
      if (res.ok) {
        const data = await res.json();
        setHolding(data);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, [currentPrice, activeView]);

  const handleFlowSuccess = () => {
    fetchHoldings();
  };

  // Sub-views
  if (activeView === 'SELL') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <SellGoldFlow
          currentPrice={currentPrice}
          holding={holding}
          onBack={() => setActiveView('OVERVIEW')}
          onSuccess={handleFlowSuccess}
          onViewTransactions={() => setActiveView('TRANSACTIONS')}
        />
      </div>
    );
  }

  if (activeView === 'REDEEM') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <RedeemGoldFlow
          holding={holding}
          onBack={() => setActiveView('OVERVIEW')}
          onSuccess={handleFlowSuccess}
          onViewTransactions={() => setActiveView('TRANSACTIONS')}
        />
      </div>
    );
  }

  if (activeView === 'TRANSACTIONS') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <TransactionHistory onBack={() => setActiveView('OVERVIEW')} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={onBack} className="hover:text-slate-200 cursor-pointer">
          Primary Market
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={onBack} className="hover:text-slate-200 cursor-pointer">
          Gold
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-medium">My Gold</span>
      </nav>

      {/* Header & Sub-Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Gold</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
              100% Physical Custody
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Owner: <strong className="text-white">Abhishk (User 001)</strong> • {holding?.totalTokens || holding?.totalGrams || '10.00'} OneX Gold Tokens • {holding?.totalGrams || '10.00'}g of 24K (999.9) Physical Gold
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setActiveView('SELL')}
            className="py-2.5 px-4 rounded-xl bg-[#141b27] hover:bg-[#1c2638] border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Sell Gold</span>
          </button>

          <button
            onClick={() => setActiveView('REDEEM')}
            className="py-2.5 px-4 rounded-xl bg-[#141b27] hover:bg-[#1c2638] border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <PackageCheck className="w-4 h-4 text-blue-400" />
            <span>Redeem Physical Gold</span>
          </button>

          <button
            onClick={() => setActiveView('TRANSACTIONS')}
            className="py-2.5 px-4 rounded-xl bg-[#141b27] hover:bg-[#1c2638] border border-[#223047] text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>Transaction History</span>
          </button>

          <button
            onClick={onBuyMore}
            className="py-2.5 px-5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#22c55e]/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buy OneX Gold</span>
          </button>
        </div>
      </div>

      {/* 1 Token = 1g Gold Highlight Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-[#0e141f] to-emerald-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
            1:1
          </div>
          <div>
            <strong className="text-white text-sm block">1 OneX Gold Token = 1 gram of 24K Physical Gold</strong>
            <p className="text-xs text-slate-400">
              Allocated with registered bar serials in regulated TransGuard DMCC Dubai Vaults.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            Audited & Backed
          </span>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600 text-emerald-300 text-xs flex items-center justify-between">
          <span>{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="font-bold text-white ml-4 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats & Live Price Chart */}
        <div className="lg:col-span-7 space-y-6">
          {/* Value Stats Card */}
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Gold Value</span>
              <span className="text-xs font-mono text-emerald-400">100% Backed in DMCC Vault</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Total Valuation</span>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  AED {formatCurrencyAed(holding?.currentValueAed || '1073.52')}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{holding?.unrealizedGainPercent || '2.54'}% (AED {holding?.unrealizedGainAed || '27.27'})</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Total Quantity</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                  {holding?.totalGrams || '3.5000'}g
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">24K (999.9 Purity)</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Invested Capital</span>
                <div className="text-xl sm:text-2xl font-bold text-slate-200 tracking-tight">
                  AED {formatCurrencyAed(holding?.investedAed || '1076.25')}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">Avg AED {holding?.avgCostPerGramAed || '307.50'}/g</span>
              </div>
            </div>

            {/* Performance Chart Box */}
            <div className="space-y-4 pt-4 border-t border-[#1e293b]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Spot Price History (AED/g)</span>
                </div>
                <div className="flex items-center gap-1 bg-[#141b27] p-1 rounded-lg border border-[#223047]">
                  {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                        selectedTimeframe === tf
                          ? 'bg-amber-500 text-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Visualizer */}
              <div className="h-44 w-full bg-[#141b27]/60 rounded-xl p-4 border border-[#223047] flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>High: AED 308.50</span>
                  <span className="text-emerald-400 font-mono font-bold">Live: AED {currentPrice} / g</span>
                </div>

                <div className="relative h-24 w-full flex items-end">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 150">
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#eab308" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,140 Q100,120 200,130 T300,90 T400,50 L400,150 L0,150 Z"
                      fill="url(#goldGrad)"
                    />
                    <path
                      d="M0,140 Q100,120 200,130 T300,90 T400,50"
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="3"
                    />
                    <circle cx="400" cy="50" r="5" fill="#eab308" className="animate-ping" />
                    <circle cx="400" cy="50" r="4" fill="#ffffff" />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>1 May</span>
                  <span>8 May</span>
                  <span>15 May</span>
                  <span>22 May</span>
                  <span>28 May (Today)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: "What would you like to do?" */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white border-b border-[#1e293b] pb-4">
              What would you like to do?
            </h3>

            {/* Action 1: Buy OneX Gold */}
            <div
              onClick={onBuyMore}
              className="p-4 rounded-xl bg-[#141b27] border border-[#223047] hover:border-[#22c55e] transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#22c55e] group-hover:scale-105 transition">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-white text-sm block">Buy OneX Gold</strong>
                  <span className="text-xs text-slate-400">Direct spot purchase with 1:1 allocation</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#22c55e] group-hover:translate-x-0.5 transition" />
            </div>

            {/* Action 2: Sell Gold */}
            <div
              onClick={() => setActiveView('SELL')}
              className="p-4 rounded-xl bg-[#141b27] border border-[#223047] hover:border-amber-500 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-white text-sm block">Sell Gold</strong>
                  <span className="text-xs text-slate-400">Instant AED liquidity and settlement</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
            </div>

            {/* Action 3: Redeem Physical Gold */}
            <div
              onClick={() => setActiveView('REDEEM')}
              className="p-4 rounded-xl bg-[#141b27] border border-[#223047] hover:border-blue-500 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-white text-sm block">Redeem Physical Gold</strong>
                  <span className="text-xs text-slate-400">Physical DMCC 24K bullion delivery</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
            </div>

            {/* Action 4: Transaction History */}
            <div
              onClick={() => setActiveView('TRANSACTIONS')}
              className="p-4 rounded-xl bg-[#141b27] border border-[#223047] hover:border-slate-400 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:scale-105 transition">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-white text-sm block">Transaction History</strong>
                  <span className="text-xs text-slate-400">Audit logs for Buys, Sells & Redemptions</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Holdings & Allocation Ledger Table */}
      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Your Allocated Bullion Bar Holdings</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every token represents physical gold stored securely in TransGuard DMCC Dubai Vaults.
            </p>
          </div>
          <button
            onClick={() => setActiveView('TRANSACTIONS')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Ledger History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#223047] text-slate-400">
                <th className="py-3 px-4 font-semibold">Allocation Certificate</th>
                <th className="py-3 px-4 font-semibold">Vault Bar Serial</th>
                <th className="py-3 px-4 font-semibold">Quantity</th>
                <th className="py-3 px-4 font-semibold">Purchase Price</th>
                <th className="py-3 px-4 font-semibold">Current Value</th>
                <th className="py-3 px-4 font-semibold">Date Acquired</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300">
              {holding?.holdingsList.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#141b27] transition">
                  <td className="py-3 px-4 font-mono font-bold text-white">{item.egrCertificateNumber}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">{item.vaultBarSerialNumber}</td>
                  <td className="py-3 px-4 font-bold text-white">{item.grams}g (24K)</td>
                  <td className="py-3 px-4">AED {item.purchasePricePerGramAed} / g</td>
                  <td className="py-3 px-4 font-bold text-[#22c55e]">
                    AED {decMul(item.grams, currentPrice)}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(item.purchasedAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      Vault Custody
                    </span>
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
