/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  TrendingUp,
  Wallet,
  Gift,
  Flame,
  Users,
  BookOpen,
  HelpCircle,
  LogOut,
  Building,
  Coins,
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { PortfolioSummary } from '../types/domain';
import { formatCurrencyAed, formatNumber } from '../lib/decimal';

interface PortfolioProps {
  onInvestInGold: () => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ onInvestInGold }) => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [activeAssetTab, setActiveAssetTab] = useState<'REAL_ESTATE' | 'GOLD'>('REAL_ESTATE');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL'>('1Y');

  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => setPortfolio(data))
      .catch(() => {});
  }, []);

  if (!portfolio) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading Portfolio...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Portfolio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Portfolio</h1>
          <p className="text-sm text-slate-400">Overview of your investments and performance</p>
        </div>

        <button
          onClick={onInvestInGold}
          className="py-2.5 px-5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#22c55e]/20 cursor-pointer w-max"
        >
          <Coins className="w-4 h-4" />
          <span>Add 24K Gold to Portfolio</span>
        </button>
      </div>

      {/* Top 2 Big Cards Grid (Portfolio.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Holdings & Allocation (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Holdings</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                +{portfolio.totalReturnsPercent}% Overall Return
              </span>
            </div>

            <div className="my-4">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {formatCurrencyAed(portfolio.totalHoldingsAed, false)}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Total Invested: <strong className="text-slate-200">{formatCurrencyAed(portfolio.totalInvestedAed, false)}</strong>
              </p>
            </div>

            {/* Asset Allocation Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                  Real Estate ({portfolio.allocation.realEstatePercent}%)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  24K Gold ({portfolio.allocation.goldPercent}%)
                </span>
              </div>

              {/* Visual Multi-color Progress Bar */}
              <div className="w-full h-3 rounded-full bg-[#1e293b] overflow-hidden flex">
                <div
                  className="bg-[#22c55e] h-full transition-all duration-700"
                  style={{ width: `${portfolio.allocation.realEstatePercent}%` }}
                ></div>
                <div
                  className="bg-amber-400 h-full transition-all duration-700"
                  style={{ width: `${portfolio.allocation.goldPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Sub Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[#1e293b] mt-6 text-xs">
              <div className="bg-[#141b27] border border-[#223047] p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Property Invested</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrencyAed(portfolio.allocation.realEstateInvestedAed, false)}
                </span>
              </div>

              <div className="bg-[#141b27] border border-[#223047] p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Gold Invested</span>
                <span className="text-sm font-bold text-amber-300">
                  {formatCurrencyAed(portfolio.allocation.goldInvestedAed, false)}
                </span>
              </div>

              <div className="bg-[#141b27] border border-[#223047] p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Total Returns</span>
                <span className="text-sm font-bold text-[#22c55e]">
                  +{formatCurrencyAed(portfolio.totalReturnsUnrealizedAed, false)}
                </span>
              </div>

              <div className="bg-[#141b27] border border-[#223047] p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Cashflows Received</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrencyAed(portfolio.cashflowsReceivedAed, false)}
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Payout pill */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#22c55e]" />
              <div>
                <span className="text-slate-300 block font-medium">Upcoming Dividend & Rental Payout</span>
                <strong className="text-white text-sm">{formatCurrencyAed(portfolio.upcomingPayoutAed)}</strong>
              </div>
            </div>
            <span className="text-emerald-400 font-semibold">{portfolio.upcomingPayoutDate}</span>
          </div>
        </div>

        {/* Right Column: Portfolio Performance Graph (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Portfolio Performance</h3>
                <span className="text-xs text-slate-400">Historical equity growth and cashflow yields</span>
              </div>

              <div className="flex items-center gap-1 bg-[#141b27] p-1 rounded-lg border border-[#223047]">
                {(['1M', '3M', '6M', 'YTD', '1Y', 'ALL'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      selectedTimeframe === tf
                        ? 'bg-[#22c55e] text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Multi-line SVG Graph */}
            <div className="h-64 w-full bg-[#121824] rounded-xl border border-[#223047] p-4 flex flex-col justify-between my-4 relative">
              <div className="flex items-center justify-between text-[11px] text-slate-400 z-10">
                <span>AED 3,600,000</span>
                <span className="text-emerald-400 font-bold font-mono">+22.5% Annualized</span>
              </div>

              <svg viewBox="0 0 500 200" className="w-full h-44 overflow-visible">
                {/* Gridlines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#1e293b" strokeDasharray="4" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="4" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#1e293b" strokeDasharray="4" />

                {/* Line 1: Green Portfolio Total */}
                <path
                  d="M 0,160 Q 120,140 250,110 T 380,60 T 500,30"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                />

                {/* Line 2: Blue Real Estate */}
                <path
                  d="M 0,170 Q 120,155 250,130 T 380,95 T 500,75"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />

                {/* Line 3: Yellow Gold */}
                <path
                  d="M 0,185 Q 120,175 250,160 T 380,140 T 500,120"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
              </svg>

              <div className="flex items-center justify-between text-[10px] text-slate-500 z-10 pt-2 border-t border-[#1e293b]">
                <span>Aug 24</span>
                <span>Nov 24</span>
                <span>Feb 25</span>
                <span>May 25</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Graph Legend */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#22c55e] rounded-full"></span>
              <span>Total Portfolio Value</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#38bdf8] rounded-full"></span>
              <span>Real Estate Equity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#fbbf24] rounded-full"></span>
              <span>24K Gold Bullion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Section (Portfolio.png) */}
      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white">My Assets</h3>
            <div className="flex items-center p-1 bg-[#141b27] border border-[#223047] rounded-xl text-xs">
              <button
                onClick={() => setActiveAssetTab('REAL_ESTATE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeAssetTab === 'REAL_ESTATE'
                    ? 'bg-[#22c55e] text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Real Estate ({portfolio.realEstateAssets.length})
              </button>

              <button
                onClick={() => setActiveAssetTab('GOLD')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeAssetTab === 'GOLD'
                    ? 'bg-[#22c55e] text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                OneX Gold ({portfolio.goldAssets.length})
              </button>
            </div>
          </div>
        </div>

        {/* Real Estate Assets List */}
        {activeAssetTab === 'REAL_ESTATE' && (
          <div className="space-y-3">
            {portfolio.realEstateAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-4 rounded-xl bg-[#141b27] border border-[#223047] hover:border-slate-600 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#27354a]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{asset.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1e293b] text-slate-300">
                        {asset.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{asset.location}</p>
                    <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
                      Est. IRR {asset.estIrr}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Current Value</span>
                    <strong className="text-white">{formatCurrencyAed(asset.currentValueAed, false)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Invested</span>
                    <strong className="text-slate-300">{formatCurrencyAed(asset.investedAed, false)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gained Value</span>
                    <strong className="text-[#22c55e]">+{formatCurrencyAed(asset.gainedValueAed, false)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cashflows</span>
                    <strong className="text-white">{formatCurrencyAed(asset.cashflowsAed, false)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gold Assets List */}
        {activeAssetTab === 'GOLD' && (
          <div className="space-y-3">
            {portfolio.goldAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-4 rounded-xl bg-[#141b27] border border-[#223047] hover:border-amber-500/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base">
                    24K
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{asset.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {asset.grams} Allocated
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{asset.egrNumber}</p>
                    <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-block">
                      DMCC Insured Vault
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Current Value</span>
                    <strong className="text-white">{formatCurrencyAed(asset.currentValueAed, false)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Invested</span>
                    <strong className="text-slate-300">{formatCurrencyAed(asset.investedAed, false)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gained Value</span>
                    <strong className="text-[#22c55e]">+{formatCurrencyAed(asset.gainedValueAed, false)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Annual Target</span>
                    <strong className="text-emerald-400">{asset.estIrr}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
