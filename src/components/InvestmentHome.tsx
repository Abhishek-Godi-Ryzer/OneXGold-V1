/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, CheckCircle2, TrendingUp, Building, ShieldCheck, Coins, RefreshCw, Award, Lock } from 'lucide-react';

interface InvestmentHomeProps {
  onSelectGold: () => void;
  onSelectRealEstate: () => void;
}

export const InvestmentHome: React.FC<InvestmentHomeProps> = ({ onSelectGold, onSelectRealEstate }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-between">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Where would you like to <span className="text-[#22c55e]">invest today?</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-400">
          Choose an asset class and start building your passive income portfolio
        </p>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Real Estate Card */}
        <div className="bg-[#111823] border border-[#1e293b] rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between hover:border-slate-700 transition group shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#1e293b] text-emerald-400 border border-emerald-500/20 mb-6">
              Real Estate
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Invest in <span className="text-[#22c55e]">Real Estate</span>
            </h2>

            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Own a fraction of premium properties and earn stable rental income.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                <span>High rental yields</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Building className="w-4 h-4 text-[#22c55e]" />
                <span>Long-term capital growth</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
                <span>Secured by real assets</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Coins className="w-4 h-4 text-[#22c55e]" />
                <span>Low entry investment</span>
              </div>
            </div>
          </div>

          <button
            onClick={onSelectRealEstate}
            className="w-full py-3.5 px-6 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer group-hover:scale-[1.01]"
          >
            <span>Explore Real Estate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 24K Gold Card */}
        <div className="bg-[#111823] border border-[#22c55e]/40 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between hover:border-[#22c55e] transition group shadow-2xl ring-1 ring-[#22c55e]/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-6">
              Gold
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Invest in <span className="text-[#22c55e]">24K Gold</span>
            </h2>

            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Own 24K gold digitally backed by physical gold stored securely in insured vaults.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                <span>100% backed by physical gold</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Lock className="w-4 h-4 text-[#22c55e]" />
                <span>Secure & insured storage</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <RefreshCw className="w-4 h-4 text-[#22c55e]" />
                <span>Easy to buy, sell & redeem</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Coins className="w-4 h-4 text-[#22c55e]" />
                <span>Low entry investment</span>
              </div>
            </div>
          </div>

          <button
            onClick={onSelectGold}
            className="w-full py-3.5 px-6 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-[#22c55e]/20 cursor-pointer group-hover:scale-[1.01]"
          >
            <span>Explore Gold</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature Badges Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-[#0e141f] border border-[#1e293b] rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#162030] text-[#22c55e]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Verified Assets</h4>
            <p className="text-[11px] text-slate-400">All assets are legally verified & documented</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#162030] text-[#22c55e]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Secure Investments</h4>
            <p className="text-[11px] text-slate-400">Blockchain powered & transparent</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#162030] text-[#22c55e]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Passive Income</h4>
            <p className="text-[11px] text-slate-400">Earn stable returns with minimal effort</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#162030] text-[#22c55e]">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Easy Liquidity</h4>
            <p className="text-[11px] text-slate-400">Trade your tokens anytime</p>
          </div>
        </div>
      </div>

      {/* Trust & Stats Ticker */}
      <div className="py-4 border-t border-[#1a2332] flex flex-wrap items-center justify-between gap-6 text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold text-sm">25K+</span>
          <span>Happy investors</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">AED 1.2B+</span>
          <span>Invested on Onex</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold text-sm">8.2%</span>
          <span>Avg. target return (p.a.)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">100%</span>
          <span>Asset backed</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Regulated by VARA, Dubai</span>
        </div>
      </div>
    </div>
  );
};
