/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Receipt,
  RefreshCw,
  Plus,
  Minus,
  ArrowRight,
  Lock,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import { GoldQuote } from '../types/domain';
import { calculateQuoteBreakdown, formatCurrencyAed } from '../lib/decimal';

interface BuyGoldProps {
  currentPrice: string;
  onContinueToPayment: (quote: GoldQuote) => void;
  onBack: () => void;
}

export const BuyGold: React.FC<BuyGoldProps> = ({ currentPrice, onContinueToPayment, onBack }) => {
  const [quantityGrams, setQuantityGrams] = useState<number>(1);
  const [quote, setQuote] = useState<GoldQuote | null>(null);
  const [quoteTimeLeft, setQuoteTimeLeft] = useState<number>(30);
  const [isQuoteExpired, setIsQuoteExpired] = useState<boolean>(false);
  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);

  // Preset quantities
  const presets = [1, 5, 10, 25, 50, 100];

  // Request or calculate active quote
  const fetchQuote = async (grams: number) => {
    setLoadingQuote(true);
    setIsQuoteExpired(false);
    try {
      const res = await fetch('/api/quote/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantityGrams: grams }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
        setQuoteTimeLeft(30);
      } else {
        // Fallback to local high-precision calculation
        const breakdown = calculateQuoteBreakdown({
          quantityGrams: grams,
          goldPricePerGramAed: currentPrice,
        });
        const mockQ: GoldQuote = {
          quoteId: `QUOTE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
          goldPricePerGramAed: breakdown.goldPricePerGramAed,
          goldPriceUsdPerOunce: breakdown.goldPriceUsdPerOunce,
          quantityGrams: breakdown.quantityGrams,
          grossGoldValueAed: breakdown.grossGoldValueAed,
          platformFeeAed: breakdown.platformFeeAed,
          paymentFeeAed: breakdown.paymentFeeAed,
          totalPayableAed: breakdown.totalPayableAed,
          cryptoEquivalentUsdt: breakdown.cryptoEquivalentUsdt,
          cryptoEquivalentUsdc: breakdown.cryptoEquivalentUsdc,
          paxgPriceUsd: breakdown.paxgPriceUsd,
          paxgRequired: breakdown.paxgRequired,
          quoteCreatedAt: new Date().toISOString(),
          quoteExpiresAt: new Date(Date.now() + 30000).toISOString(),
          status: 'ACTIVE',
          provider: 'MOCK_PAXG',
        };
        setQuote(mockQ);
        setQuoteTimeLeft(30);
      }
    } catch {
      // Local fallback
      const breakdown = calculateQuoteBreakdown({
        quantityGrams: grams,
        goldPricePerGramAed: currentPrice,
      });
      const mockQ: GoldQuote = {
        quoteId: `QUOTE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
        goldPricePerGramAed: breakdown.goldPricePerGramAed,
        goldPriceUsdPerOunce: breakdown.goldPriceUsdPerOunce,
        quantityGrams: breakdown.quantityGrams,
        grossGoldValueAed: breakdown.grossGoldValueAed,
        platformFeeAed: breakdown.platformFeeAed,
        paymentFeeAed: breakdown.paymentFeeAed,
        totalPayableAed: breakdown.totalPayableAed,
        cryptoEquivalentUsdt: breakdown.cryptoEquivalentUsdt,
        cryptoEquivalentUsdc: breakdown.cryptoEquivalentUsdc,
        paxgPriceUsd: breakdown.paxgPriceUsd,
        paxgRequired: breakdown.paxgRequired,
        quoteCreatedAt: new Date().toISOString(),
        quoteExpiresAt: new Date(Date.now() + 30000).toISOString(),
        status: 'ACTIVE',
        provider: 'MOCK_PAXG',
      };
      setQuote(mockQ);
      setQuoteTimeLeft(30);
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    fetchQuote(quantityGrams);
  }, [quantityGrams, currentPrice]);

  // Expiry countdown timer (30s guaranteed quote window)
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteTimeLeft((prev) => {
        if (prev <= 1) {
          setIsQuoteExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quote?.quoteId]);

  const handleIncrement = () => {
    setQuantityGrams((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantityGrams((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handlePreset = (val: number) => {
    setQuantityGrams(val);
  };

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
        <span className="text-white font-medium">Buy Gold</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Explanations & Trust */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Buy OneX Gold</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Acquire institutional-grade 24K fine gold (999.9 purity) backed 1:1 by physical bullion in DMCC Dubai vaults.
            </p>
          </div>

          {/* Why invest through OneX Box */}
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-white">Why invest in OneX Gold?</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#162030] text-[#22c55e] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block text-sm">1:1 Physical Gold Backing</strong>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    1 OneX Gold Token represents exactly 1 gram of physical 24K investment-grade bullion.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#162030] text-[#22c55e] shrink-0 mt-0.5">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block text-sm">Insured Vault Custody</strong>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Allocated with specific bar serials in regulated TransGuard DMCC Dubai vaults.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#162030] text-[#22c55e] shrink-0 mt-0.5">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block text-sm">Transparent Institutional Pricing</strong>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Zero hidden spreads with real-time spot quote locking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#162030] text-[#22c55e] shrink-0 mt-0.5">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block text-sm">Instant Liquidity & Physical Redemption</strong>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Sell back for instant AED/crypto settlement or request physical bullion delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Gold Unit Card */}
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
                24K
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Customer Asset Definition</span>
                <p className="text-sm font-bold text-white">1 OneX Gold Token = 1g OneX Gold</p>
                <p className="text-[11px] text-slate-400">999.9 Fine Investment Grade Physical Bullion</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 text-xs font-semibold">
              1:1 Allocated
            </span>
          </div>
        </div>

        {/* Right Column: Purchase Form & Dynamic Quote */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Purchase Gold</h3>
                <span className="text-xs text-slate-400">Fixed-price guaranteed quote</span>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <Lock className="w-3 h-3 text-[#22c55e]" />
                Secure Transaction
              </span>
            </div>

            {/* Metrics pills */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#141b27] border border-[#223047] p-3 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Projected IRR</span>
                <span className="text-base font-bold text-white">8.25% P.A.</span>
              </div>
              <div className="bg-[#141b27] border border-[#223047] p-3 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Cost Per Gram</span>
                <span className="text-base font-bold text-[#22c55e]">AED {currentPrice}</span>
              </div>
            </div>

            {/* Stepper Quantity Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">Select Quantity (Grams)</span>
                <span className="text-slate-400 font-mono">1 Token = 1 Gram</span>
              </div>

              <div className="flex items-center justify-between bg-[#141b27] border border-[#223047] rounded-xl p-2">
                <button
                  onClick={handleDecrement}
                  disabled={quantityGrams <= 1}
                  className="w-10 h-10 rounded-lg bg-[#1c2637] hover:bg-[#28364d] text-white flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <span className="text-2xl font-black text-white">{quantityGrams}</span>
                  <span className="text-xs text-slate-400 ml-1.5 font-medium">Gram{quantityGrams > 1 ? 's' : ''}</span>
                </div>

                <button
                  onClick={handleIncrement}
                  className="w-10 h-10 rounded-lg bg-[#1c2637] hover:bg-[#28364d] text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center gap-2">
                {presets.map((val) => (
                  <button
                    key={val}
                    onClick={() => handlePreset(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      quantityGrams === val
                        ? 'bg-[#22c55e] text-black shadow-sm'
                        : 'bg-[#141b27] text-slate-300 hover:bg-[#1c2637] border border-[#223047]'
                    }`}
                  >
                    {val}g
                  </button>
                ))}
              </div>
            </div>

            {/* Breakdown Accordion */}
            {quote && (
              <div className="bg-[#141b27] border border-[#223047] rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Gold Value ({quantityGrams}g)</span>
                  <span className="font-semibold text-white">AED {quote.grossGoldValueAed}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    Platform Fee (0.50%)
                    <Info className="w-3 h-3 text-slate-500" />
                  </span>
                  <span className="font-medium text-slate-300">AED {quote.platformFeeAed}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Payment Fee</span>
                  <span className="font-medium text-emerald-400">AED 0.00 (Free)</span>
                </div>

                <div className="border-t border-[#223047] pt-2.5 flex items-center justify-between text-sm font-bold text-white">
                  <span>Total Payable</span>
                  <span className="text-lg text-[#22c55e]">AED {quote.totalPayableAed}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Crypto Equivalent:</span>
                  <span className="font-mono text-slate-300">{quote.cryptoEquivalentUsdt} USDT / USDC</span>
                </div>
              </div>
            )}

            {/* Price countdown warning */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-[11px] ${
              isQuoteExpired
                ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                : 'bg-[#141b27] border-[#223047] text-slate-400'
            }`}>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className={`w-3.5 h-3.5 ${isQuoteExpired ? 'text-amber-400' : 'text-[#22c55e]'}`} />
                {isQuoteExpired ? (
                  <span className="text-amber-300 font-bold">Quote Expired (30s limit). Please renew.</span>
                ) : (
                  <>
                    Live Quote valid for: <strong className="text-emerald-400 font-mono font-bold">{quoteTimeLeft}s</strong>
                  </>
                )}
              </span>
              <button
                onClick={() => fetchQuote(quantityGrams)}
                className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#2a3850] text-[#22c55e] border border-[#22c55e]/30 font-bold flex items-center gap-1 text-[11px] cursor-pointer transition shadow-sm"
              >
                <RefreshCw className={`w-3 h-3 ${loadingQuote ? 'animate-spin' : ''}`} />
                {isQuoteExpired ? 'Get New Quote' : 'Refresh'}
              </button>
            </div>

            {/* Continue to Payment Button */}
            <button
              onClick={() => {
                if (isQuoteExpired) {
                  fetchQuote(quantityGrams);
                  return;
                }
                if (quote) onContinueToPayment(quote);
              }}
              disabled={!quote || loadingQuote || isQuoteExpired}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                isQuoteExpired
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-[#22c55e]/20 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span>{isQuoteExpired ? 'Quote Expired - Click Refresh Above' : 'Continue to Payment'}</span>
              {!isQuoteExpired && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
