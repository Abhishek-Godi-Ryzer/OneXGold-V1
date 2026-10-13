/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronRight,
  CheckCircle2,
  Download,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  History,
  Sparkles,
  ExternalLink,
  Coins,
} from 'lucide-react';
import { GoldOrder } from '../types/domain';

interface OrderCompletedProps {
  order: GoldOrder;
  onViewMyGold: () => void;
  onViewPortfolio: () => void;
  onViewOrders: () => void;
}

export const OrderCompleted: React.FC<OrderCompletedProps> = ({
  order,
  onViewMyGold,
  onViewPortfolio,
  onViewOrders,
}) => {
  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#eab308', '#38bdf8', '#ffffff'],
      });
    } catch {
      // Ignored if canvas-confetti unavailable
    }
  }, []);

  const handleDownloadCertificate = () => {
    const text = `
================================================================================
              ONEX GOLD CUSTODIAL ALLOCATION CERTIFICATE
================================================================================
Certificate ID:     ${order.allocation?.egrCertificateNumber || 'ALLOC-ONEX-2025-00415'}
Order Reference:    ${order.id}
Date Completed:     ${new Date(order.completedAt || order.createdAt).toUTCString()}
Status:             ALLOCATED & SIGNED

--------------------------------------------------------------------------------
INVESTOR DETAILS
--------------------------------------------------------------------------------
Name:               ${order.document?.signerName || 'Abhishk'}
Custody Account:    ${order.userId}
Asset:              OneX Gold (1 Token = 1g Gold)
Token Mint:         ${order.quantityGrams} OneX Gold Tokens

--------------------------------------------------------------------------------
BULLION ASSET SPECIFICATION
--------------------------------------------------------------------------------
Metal Type:         Fine Gold (Au)
Purity:             24K / 999.9 Fine Investment Bullion
Allocated Grams:    ${order.quantityGrams} Gram(s) OneX Gold
Depository Vault:   TransGuard Dubai / DMCC Free Zone Bullion Depository
Vault Bar Serial:   ${order.allocation?.vaultBarSerialNumber || 'DXB-TG-999.9-B77201'}
Settlement Amount:  AED ${order.quote.totalPayableAed}

--------------------------------------------------------------------------------
LEGAL & REGULATORY VERIFICATION
--------------------------------------------------------------------------------
Digital Signature:  ${order.document?.signatureHash || 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
Signature Date:     ${order.document?.signatureDate || order.completedAt}
Signature IP:       ${order.document?.signatureIp || '194.187.249.12'}
Regulator:          Regulated by Dubai Virtual Assets Regulatory Authority (VARA)
================================================================================
    `;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.allocation?.egrCertificateNumber || 'OneX-Gold-Allocation-Certificate'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={onViewMyGold} className="hover:text-slate-200 cursor-pointer">
          Primary Market
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={onViewMyGold} className="hover:text-slate-200 cursor-pointer">
          Gold
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-medium">Order Completed</span>
      </nav>

      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Purchase Complete
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Your 24K Gold is Allocated!
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Your Electronic Gold Receipt has been issued, physical bullion assigned in the DMCC vault, and the holding
          has been added to your portfolio.
        </p>
      </div>

      {/* 4-Step Progress Bar (All Green) */}
      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#22c55e] text-black font-bold flex items-center justify-center mb-2 shadow-lg shadow-[#22c55e]/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Order Submitted</span>
            <span className="text-[11px] text-emerald-400">Completed</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#22c55e] text-black font-bold flex items-center justify-center mb-2 shadow-lg shadow-[#22c55e]/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Payment Confirmed</span>
            <span className="text-[11px] text-emerald-400">Settled</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#22c55e] text-black font-bold flex items-center justify-center mb-2 shadow-lg shadow-[#22c55e]/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Gold Allocated</span>
            <span className="text-[11px] text-emerald-400">Vault Bar Assigned</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#22c55e] text-black font-bold flex items-center justify-center mb-2 shadow-lg shadow-[#22c55e]/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Document Signature</span>
            <span className="text-[11px] text-emerald-400">Signed & Validated</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Certificate & Holding Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Certificate Card */}
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#22c55e]">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#1e293b] text-slate-300 border border-slate-700 uppercase tracking-wider mb-1">
                    TEMPLATE01
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Electronic Gold Receipt & Purchase Agreement
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SIGNED
              </span>
            </div>

            {/* Allocation Details Banner */}
            <div className="bg-[#141b27] border border-[#223047] rounded-xl p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Allocation Certificate:</span>
                <span className="font-mono font-bold text-white">
                  {order.allocation?.egrCertificateNumber || 'ALLOC-ONEX-2025-00415'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Allocated Vault Bar Serial:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {order.allocation?.vaultBarSerialNumber || 'DXB-TG-999.9-B77201'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vault Location:</span>
                <span className="text-slate-200">
                  {order.allocation?.vaultLocation || 'TransGuard Dubai / DMCC Secure Vault'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Signer Verification:</span>
                <span className="text-slate-200">{order.document?.signerName || 'Abhishk'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleDownloadCertificate}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-[#22c55e]/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Allocation Agreement</span>
              </button>

              <button
                onClick={onViewMyGold}
                className="py-3.5 px-5 rounded-xl bg-[#141b27] hover:bg-[#1c2637] text-slate-200 border border-[#223047] font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>View My Gold</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-24">
            <h3 className="text-lg font-bold text-white border-b border-[#1e293b] pb-4">
              Completed Order Summary
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Gold Purchased</span>
                <span className="font-bold text-white">
                  {order.quantityGrams} Gold Token • {order.quantityGrams}g of 24K Gold
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Amount Paid</span>
                <span className="font-bold text-white">AED {order.quote.totalPayableAed}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  COMPLETED
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Order Reference</span>
                <span className="font-mono text-slate-200">{order.id}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Completion Time</span>
                <span className="text-slate-300">
                  {new Date(order.completedAt || order.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1e293b] space-y-3">
              <button
                onClick={onViewPortfolio}
                className="w-full py-3.5 px-6 rounded-xl bg-[#141b27] hover:bg-[#1c2637] text-white border border-[#223047] font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Go to Portfolio</span>
                <ArrowRight className="w-4 h-4 text-[#22c55e]" />
              </button>

              <button
                onClick={onViewOrders}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>View Full Order History</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
