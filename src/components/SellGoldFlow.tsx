/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Coins,
  DollarSign,
  Building2,
  ChevronLeft,
  AlertCircle,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { GoldHolding, GoldSellQuote, GoldSellOrder } from '../types/domain';
import { formatCurrencyAed, decMul, decSub } from '../lib/decimal';

interface SellGoldFlowProps {
  currentPrice: string;
  holding: GoldHolding | null;
  onBack: () => void;
  onSuccess: () => void;
  onViewTransactions: () => void;
}

type SellStep = 'ENTER_QUANTITY' | 'REVIEW_QUOTE' | 'EXECUTING' | 'COMPLETED';

export const SellGoldFlow: React.FC<SellGoldFlowProps> = ({
  currentPrice,
  holding,
  onBack,
  onSuccess,
  onViewTransactions,
}) => {
  const [step, setStep] = useState<SellStep>('ENTER_QUANTITY');
  const [sellGrams, setSellGrams] = useState<string>('1.0000');
  const [quote, setQuote] = useState<GoldSellQuote | null>(null);
  const [quoteTimeLeft, setQuoteTimeLeft] = useState<number>(30);
  const [sellOrder, setSellOrder] = useState<GoldSellOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Execution stage simulation
  const [executionPhase, setExecutionPhase] = useState<number>(0);

  const availableGrams = Number(holding?.totalGrams || '0');

  // Handle Quote Countdown Timer
  useEffect(() => {
    if (step === 'REVIEW_QUOTE' && quote) {
      const interval = setInterval(() => {
        setQuoteTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, quote]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGetQuote = async () => {
    try {
      setErrorMsg(null);
      const gramsNum = Number(sellGrams);
      if (isNaN(gramsNum) || gramsNum <= 0) {
        throw new Error('Please enter a valid gold quantity greater than 0.');
      }
      if (gramsNum > availableGrams) {
        throw new Error(`Quantity exceeds available balance of ${availableGrams}g.`);
      }

      setIsSubmitting(true);
      const res = await fetch('/api/gold/sell/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grams: sellGrams }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch sell quote.');

      setQuote(data);
      setQuoteTimeLeft(30);
      setStep('REVIEW_QUOTE');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching quote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSell = async () => {
    if (!quote) return;
    if (quoteTimeLeft <= 0) {
      setErrorMsg('Quote has expired. Please refresh the quote.');
      return;
    }

    try {
      setErrorMsg(null);
      setStep('EXECUTING');
      setExecutionPhase(1); // Locking quote & balance

      // Progress animation
      setTimeout(() => setExecutionPhase(2), 600); // Routing to PAXG sell liquidity
      setTimeout(() => setExecutionPhase(3), 1200); // Token balance deduction
      setTimeout(() => setExecutionPhase(4), 1800); // Fiat settlement

      const idempotencyKey = `IDEM-SELL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const res = await fetch('/api/gold/sell/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote.quoteId,
          grams: quote.quantityGrams,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sell execution failed.');

      setSellOrder(data);
      setTimeout(() => {
        setStep('COMPLETED');
        onSuccess();
      }, 2200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing sell.');
      setStep('REVIEW_QUOTE');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header & Stepper */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Gold</span>
        </button>

        {/* Stepper pills */}
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'ENTER_QUANTITY'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#141b27] text-slate-400'
            }`}
          >
            1. Enter Quantity
          </span>
          <span className="text-slate-600">→</span>
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'REVIEW_QUOTE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#141b27] text-slate-400'
            }`}
          >
            2. Review Quote
          </span>
          <span className="text-slate-600">→</span>
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'EXECUTING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : step === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-[#141b27] text-slate-400'
            }`}
          >
            3. Settlement & Complete
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STAGE 1: ENTER QUANTITY */}
      {step === 'ENTER_QUANTITY' && (
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Sell 24K Gold Instantly</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Liquidate your allocated DMCC physical gold into instant AED cash via PAXG institutional sell liquidity.
            </p>
          </div>

          {/* Balance card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#141b27] p-4 rounded-xl border border-[#223047]">
            <div>
              <span className="text-[11px] text-slate-400 block">Available to Sell</span>
              <span className="text-lg font-black text-white">{holding?.totalGrams || '0.00'}g</span>
              <span className="text-[10px] text-slate-500 block">24K (999.9 Fine)</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Current Spot Price</span>
              <span className="text-lg font-black text-[#22c55e]">AED {currentPrice} / g</span>
              <span className="text-[10px] text-slate-500 block">Live Market Benchmark</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Estimated Proceeds</span>
              <span className="text-lg font-black text-amber-400">
                AED {decMul(sellGrams || 0, currentPrice)}
              </span>
              <span className="text-[10px] text-slate-500 block">Before 0.5% platform fee</span>
            </div>
          </div>

          {/* Input field & Quick % buttons */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Gold Quantity to Sell (Grams)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                max={availableGrams}
                value={sellGrams}
                onChange={(e) => setSellGrams(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#141b27] border border-[#223047] text-white text-base font-mono focus:outline-none focus:border-amber-400 pr-16"
                placeholder="0.0000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                GRAMS
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              {[0.25, 0.5, 0.75, 1.0].map((fraction) => {
                const gramsVal = (availableGrams * fraction).toFixed(4);
                return (
                  <button
                    key={fraction}
                    type="button"
                    onClick={() => setSellGrams(gramsVal)}
                    className="flex-1 py-1.5 rounded-lg bg-[#141b27] hover:bg-[#1a2333] border border-[#223047] text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {fraction === 1.0 ? 'MAX (100%)' : `${fraction * 100}%`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Institutional Liquidity Guarantee Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>PAXG Instant Execution Guarantee</span>
            </div>
            <p className="text-[11px] text-amber-200/80">
              Selling gold automatically routes through institutional PAXG sell liquidity. Funds are immediately settled in AED and credited to your primary OneX wallet balance.
            </p>
          </div>

          {/* Action button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-[#141b27] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleGetQuote}
              disabled={isSubmitting || Number(sellGrams) <= 0 || Number(sellGrams) > availableGrams}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching Market Quote...</span>
                </>
              ) : (
                <>
                  <span>Review Locked Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: REVIEW QUOTE */}
      {step === 'REVIEW_QUOTE' && quote && (
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Review Sell Quote</h2>
              <p className="text-xs text-slate-400 mt-0.5">Quote ID: {quote.quoteId}</p>
            </div>

            {/* Countdown timer badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${
                quoteTimeLeft > 5
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Quote Expires in {quoteTimeLeft}s</span>
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-[#141b27] border border-[#223047] rounded-xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Gold Quantity to Liquidate</span>
              <span className="text-white font-mono font-bold text-sm">{quote.quantityGrams}g (24K)</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Locked Spot Price (AED/g)</span>
              <span className="text-white font-mono">AED {quote.goldPricePerGramAed}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Gross Gold Value</span>
              <span className="text-white font-mono">AED {quote.grossProceedsAed}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Platform Fee (0.50%)</span>
              <span className="text-slate-300 font-mono">- AED {quote.platformFeeAed}</span>
            </div>

            <div className="border-t border-[#223047] pt-3 flex items-center justify-between text-sm font-bold">
              <span className="text-white">Net AED Proceeds to Credit</span>
              <span className="text-emerald-400 font-mono text-base">
                AED {quote.netProceedsAed}
              </span>
            </div>
          </div>

          {/* Institutional PAXG Route Information */}
          <div className="bg-[#101722] border border-[#1e293b] rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Liquidity Side</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px]">
                PAXG SELL
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>PAXG Sold</span>
              <span className="text-slate-200 font-mono">{quote.paxgSold} PAXG</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>PAXG Execution Benchmark</span>
              <span className="text-slate-200 font-mono">${quote.paxgPriceUsd} / oz</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Settlement Destination</span>
              <span className="text-emerald-400 font-semibold">OneX AED Primary Wallet (Instant)</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1e293b]">
            <button
              onClick={() => {
                setStep('ENTER_QUANTITY');
                setQuote(null);
              }}
              className="px-4 py-2 rounded-xl bg-[#141b27] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Modify Quantity
            </button>

            <div className="flex items-center gap-3">
              {quoteTimeLeft <= 0 ? (
                <button
                  onClick={handleGetQuote}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Renew Expired Quote</span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmSell}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Execute Sell</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: EXECUTING */}
      {step === 'EXECUTING' && (
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-8 sm:p-12 space-y-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">Executing Institutional Gold Sale</h3>
            <p className="text-xs text-slate-400">
              Please wait while the OneX Liquidity Engine routes the transaction through the PAXG liquidity provider and settles AED funds.
            </p>
          </div>

          {/* 4-step progress tracker */}
          <div className="max-w-md mx-auto space-y-3 text-left">
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                executionPhase >= 1
                  ? 'bg-[#141b27] border-emerald-500/50 text-white'
                  : 'bg-[#101722] border-[#223047] text-slate-500'
              }`}
            >
              <span>1. Validating Holding & Locking Quote</span>
              {executionPhase >= 1 ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              )}
            </div>

            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                executionPhase >= 2
                  ? 'bg-[#141b27] border-emerald-500/50 text-white'
                  : 'bg-[#101722] border-[#223047] text-slate-500'
              }`}
            >
              <span>2. Routing PAXG SELL Liquidity Order</span>
              {executionPhase >= 2 ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px]">Pending</span>
              )}
            </div>

            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                executionPhase >= 3
                  ? 'bg-[#141b27] border-emerald-500/50 text-white'
                  : 'bg-[#101722] border-[#223047] text-slate-500'
              }`}
            >
              <span>3. Adjusting Gold Token Balances</span>
              {executionPhase >= 3 ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px]">Pending</span>
              )}
            </div>

            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                executionPhase >= 4
                  ? 'bg-[#141b27] border-emerald-500/50 text-white'
                  : 'bg-[#101722] border-[#223047] text-slate-500'
              }`}
            >
              <span>4. Settling AED Fiat to Wallet</span>
              {executionPhase >= 4 ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px]">Pending</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: COMPLETED */}
      {step === 'COMPLETED' && sellOrder && (
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Gold Sale Completed Successfully</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Order ID: <span className="font-mono text-white">{sellOrder.id}</span> • Settled via PAXG Liquidity Desk
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold w-max">
              Funds Settled (AED)
            </span>
          </div>

          {/* Receipt Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#141b27] border border-[#223047] rounded-xl p-4 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Sale Summary
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sold Quantity</span>
                <span className="text-white font-mono font-bold">{sellOrder.quantityGrams}g (24K)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gross Proceeds</span>
                <span className="text-white font-mono">AED {sellOrder.quote.grossProceedsAed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Platform Fee (0.5%)</span>
                <span className="text-slate-300 font-mono">- AED {sellOrder.quote.platformFeeAed}</span>
              </div>
              <div className="border-t border-[#223047] pt-2 flex items-center justify-between font-bold">
                <span className="text-white">Net Credited</span>
                <span className="text-[#22c55e] font-mono text-sm">
                  AED {sellOrder.quote.netProceedsAed}
                </span>
              </div>
            </div>

            <div className="bg-[#141b27] border border-[#223047] rounded-xl p-4 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Settlement Details
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Settlement ID</span>
                <span className="text-slate-200 font-mono text-[11px]">
                  {sellOrder.settlement?.settlementId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">PAXG Executed</span>
                <span className="text-amber-400 font-mono font-bold">
                  {sellOrder.liquidity?.filledPaxg} PAXG
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Liquidity Provider</span>
                <span className="text-slate-200 font-semibold">
                  {sellOrder.liquidity?.provider === 'PAXOS_SANDBOX'
                    ? 'Paxos Sandbox API'
                    : 'Mock Institutional Liquidity Desk'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Settled At</span>
                <span className="text-slate-300">
                  {new Date(sellOrder.completedAt || Date.now()).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1e293b]">
            <button
              onClick={onViewTransactions}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#141b27] hover:bg-[#1a2333] border border-[#223047] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>View in Transaction History</span>
            </button>

            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#22c55e]/20 cursor-pointer"
            >
              <span>Return to My Gold</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
