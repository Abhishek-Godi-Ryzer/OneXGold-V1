/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  Lock,
  Coins,
  Building2,
  ArrowRight,
  ChevronRight,
  Users,
  FileCheck,
  Landmark,
  UserCheck,
  Eye,
  Globe,
  Clock,
  Sparkles,
} from 'lucide-react';

interface GoldLandingProps {
  currentPrice: string;
  onInvestClick: () => void;
}

export const GoldLanding: React.FC<GoldLandingProps> = ({ currentPrice, onInvestClick }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <span className="hover:text-slate-200 cursor-pointer">Primary Market</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-medium">Gold</span>
      </nav>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Left Banner */}
        <div className="lg:col-span-2 bg-[#0e141f] border border-[#1e293b] rounded-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          {/* Subtle gold glow background */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#162030] text-[#22c55e] border border-[#22c55e]/30 mb-6">
              ONE X GOLD
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Own Physical Gold <br />
              through <span className="text-[#22c55e]">OneX Gold</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
              OneX Gold Tokens represent direct ownership in 24K (999.9) physical gold held in
              secure, regulated custody. Every OneX Gold Token is 100% backed by 1 gram of real gold.
            </p>

            {/* Feature Icons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#1e293b]/80">
              <div className="text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-[#162030] border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] mb-2 mx-auto sm:mx-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-300 font-medium">100% Backed by Physical Gold</p>
              </div>

              <div className="text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-[#162030] border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] mb-2 mx-auto sm:mx-0">
                  <Lock className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-300 font-medium">Secure Custody in Regulated Vaults</p>
              </div>

              <div className="text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-[#162030] border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] mb-2 mx-auto sm:mx-0">
                  <Coins className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-300 font-medium">1:1 Backing with Real Gold</p>
              </div>

              <div className="text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-[#162030] border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] mb-2 mx-auto sm:mx-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-300 font-medium">Regulated & Compliant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Right Live Price Card */}
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400">Live Gold Price</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping"></span>
                Live
              </span>
            </div>

            <div className="mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tight">AED {currentPrice}</span>
                <span className="text-sm font-medium text-slate-400">/ g</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">24K • 999.9 Fine Gold</p>
            </div>

            <div className="my-6 border-t border-[#1e293b] pt-6 space-y-4">
              <div className="flex items-start gap-3 text-xs">
                <div className="p-1 rounded bg-[#162030] text-[#22c55e] mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block">OneX Gold Unit</strong>
                  <span className="text-slate-400">1 OneX Gold Token = 1 gram of OneX Gold</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="p-1 rounded bg-[#162030] text-[#22c55e] mt-0.5">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block">Backing</strong>
                  <span className="text-slate-400">100% backed by physical gold</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="p-1 rounded bg-[#162030] text-[#22c55e] mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block">Custody</strong>
                  <span className="text-slate-400">Held in insured, regulated vaults</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onInvestClick}
            className="w-full py-3.5 px-6 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-[#22c55e]/20 cursor-pointer"
          >
            <span>Buy OneX Gold</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* How OneX Gold Works Section */}
      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-8 sm:p-10 shadow-xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">How OneX Gold Works</h2>
          <p className="text-sm text-slate-400">From real gold to your ownership — simple, secure and fully backed.</p>
        </div>

        {/* 5 Steps Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 relative mb-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-full bg-[#162030] border-2 border-[#22c55e] flex items-center justify-center text-[#22c55e]">
                <Users className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] text-black font-bold text-[11px] flex items-center justify-center">
                1
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">1. Physical Gold</h3>
            <p className="text-xs text-slate-400 leading-relaxed">24K (999.9) gold is sourced from trusted suppliers.</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-full bg-[#162030] border-2 border-[#22c55e] flex items-center justify-center text-[#22c55e]">
                <Lock className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] text-black font-bold text-[11px] flex items-center justify-center">
                2
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">2. Secure Custody</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Gold is stored in insured, regulated vaults.</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-full bg-[#162030] border-2 border-[#22c55e] flex items-center justify-center text-[#22c55e]">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] text-black font-bold text-[11px] flex items-center justify-center">
                3
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">3. Token Issued</h3>
            <p className="text-xs text-slate-400 leading-relaxed">1 OneX Gold Token is issued for each gram of gold.</p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-full bg-[#162030] border-2 border-[#22c55e] flex items-center justify-center text-[#22c55e]">
                <Landmark className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] text-black font-bold text-[11px] flex items-center justify-center">
                4
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">4. Regulated Market</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Assets are handled through regulated bullion-market infrastructure.</p>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-full bg-[#162030] border-2 border-[#22c55e] flex items-center justify-center text-[#22c55e]">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] text-black font-bold text-[11px] flex items-center justify-center">
                5
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">5. Your Ownership</h3>
            <p className="text-xs text-slate-400 leading-relaxed">You can track, buy, sell or redeem your OneX Gold anytime on OneX.</p>
          </div>
        </div>

        {/* Green Security Banner */}
        <div className="bg-[#121c27] border border-[#22c55e]/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Every OneX Gold Token is 100% backed by physical gold.</h4>
              <p className="text-[11px] text-slate-400">Regular reconciliation ensures tokens always match the gold held in custody.</p>
            </div>
          </div>

          <button
            onClick={onInvestClick}
            className="text-xs font-semibold text-[#22c55e] hover:underline flex items-center gap-1 shrink-0"
          >
            Learn about backing <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Where Your Gold is Held Section */}
      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-8 sm:p-10 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Where your gold is held</h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Your physical gold is stored in world-class, insured vaults with strict security and audit standards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#162030] text-[#22c55e] mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Insured Vaults</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Gold is stored in fully insured, high-security vaults.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#162030] text-[#22c55e] mt-0.5">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">24/7 Monitoring</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Continuous surveillance and advanced security systems.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#162030] text-[#22c55e] mt-0.5">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Regular Audits</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Independent audits and strict compliance standards.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#162030] text-[#22c55e] mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Global Standards</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Vault partners follow international best practices.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vault Security Photography Card */}
          <div className="relative rounded-xl overflow-hidden border border-[#223047] h-64 sm:h-72 group shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
              alt="High Security Gold Depository Vault"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
              <span className="inline-block px-2.5 py-1 rounded bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 text-[10px] font-bold w-max mb-1">
                DMCC / TransGuard Dubai Vault
              </span>
              <p className="text-xs text-white font-semibold">Tier-4 Bullion Depository Facility</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Bottom Advantage Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-[#0e141f] border border-[#1e293b] rounded-xl text-xs">
        <div className="flex items-center gap-3">
          <Coins className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-[11px] text-slate-400">Minimum Investment</p>
            <strong className="text-white text-xs">AED 10</strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-[11px] text-slate-400">Digital Ownership</p>
            <strong className="text-white text-xs">Gold ownership recorded digitally</strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-[11px] text-slate-400">High Liquidity</p>
            <strong className="text-white text-xs">Buy, Sell, Redeem anytime</strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-[11px] text-slate-400">Transparent & Compliant</p>
            <strong className="text-white text-xs">Regulated & audited reserves</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
