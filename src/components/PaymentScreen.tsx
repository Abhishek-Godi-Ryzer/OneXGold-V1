/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  ArrowRight,
  CreditCard,
  Building,
  Smartphone,
  Wallet,
  CheckCircle2,
  Info,
  AlertCircle,
  Coins,
  QrCode,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { GoldQuote, PaymentMethodType } from '../types/domain';

interface PaymentScreenProps {
  quote: GoldQuote;
  onPaymentInitiated: (paymentMethod: PaymentMethodType) => void;
  onBack: () => void;
  isProcessing: boolean;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  quote,
  onPaymentInitiated,
  onBack,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'CRYPTO' | 'FIAT'>('CRYPTO');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('USDT');

  // Compute remaining seconds from quote.quoteExpiresAt
  const getSecondsLeft = () => {
    const exp = new Date(quote.quoteExpiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((exp - now) / 1000));
  };

  const [timeLeft, setTimeLeft] = useState<number>(getSecondsLeft());
  const isExpired = timeLeft <= 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getSecondsLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [quote.quoteExpiresAt]);

  const handlePay = () => {
    if (isExpired) return;
    onPaymentInitiated(selectedMethod);
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
        <button onClick={onBack} className="hover:text-slate-200 cursor-pointer">
          Buy Gold
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-medium">Payment</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Payment Methods */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Complete your payment</h1>
            <p className="text-sm text-slate-400">Choose your preferred payment method to buy Gold.</p>
          </div>

          {/* Value Badges Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#0e141f] border border-[#1e293b] rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              <span>1 Gold Token = 1g of 24K Gold</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              <span>24K (999.9) Purity</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              <span>Legally Protected</span>
            </div>
          </div>

          {/* Payment Tabs (Pay with Crypto vs Pay with Fiat) */}
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center p-1 bg-[#141b27] border border-[#223047] rounded-xl">
              <button
                onClick={() => {
                  setActiveTab('CRYPTO');
                  setSelectedMethod('USDT');
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'CRYPTO'
                    ? 'bg-[#22c55e] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Pay with Crypto (USDT / USDC)
              </button>

              <button
                onClick={() => {
                  setActiveTab('FIAT');
                  setSelectedMethod('FIAT_AED');
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'FIAT'
                    ? 'bg-[#22c55e] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Pay with Fiat (AED / UPI)
              </button>
            </div>

            {/* Crypto Options */}
            {activeTab === 'CRYPTO' && (
              <div className="space-y-3">
                {/* USDT */}
                <div
                  onClick={() => setSelectedMethod('USDT')}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedMethod === 'USDT'
                      ? 'bg-[#162232] border-[#22c55e] shadow-md ring-1 ring-[#22c55e]/30'
                      : 'bg-[#141b27] border-[#223047] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      ₮
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">USDT (Tether USD)</strong>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Fast & Low Fee
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Amount: <strong className="text-white">{quote.cryptoEquivalentUsdt} USDT</strong> (TRC20 / ERC20)
                      </p>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full border flex items-center justify-center border-slate-500">
                    {selectedMethod === 'USDT' && <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>}
                  </div>
                </div>

                {/* USDC */}
                <div
                  onClick={() => setSelectedMethod('USDC')}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedMethod === 'USDC'
                      ? 'bg-[#162232] border-[#22c55e] shadow-md ring-1 ring-[#22c55e]/30'
                      : 'bg-[#141b27] border-[#223047] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                      $
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">USDC (USD Coin)</strong>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                          Circle Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Amount: <strong className="text-white">{quote.cryptoEquivalentUsdc} USDC</strong>
                      </p>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full border flex items-center justify-center border-slate-500">
                    {selectedMethod === 'USDC' && <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>}
                  </div>
                </div>
              </div>
            )}

            {/* Fiat Options */}
            {activeTab === 'FIAT' && (
              <div className="space-y-3">
                {/* Instant Card / AED Bank */}
                <div
                  onClick={() => setSelectedMethod('FIAT_AED')}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedMethod === 'FIAT_AED'
                      ? 'bg-[#162232] border-[#22c55e] shadow-md ring-1 ring-[#22c55e]/30'
                      : 'bg-[#141b27] border-[#223047] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-white text-sm block">Credit / Debit Card & Apple Pay</strong>
                      <p className="text-xs text-slate-400 mt-0.5">Instant settlement in AED • Zero surcharge</p>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full border flex items-center justify-center border-slate-500">
                    {selectedMethod === 'FIAT_AED' && <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>}
                  </div>
                </div>

                {/* UPI (India) */}
                <div
                  onClick={() => setSelectedMethod('UPI')}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedMethod === 'UPI'
                      ? 'bg-[#162232] border-[#22c55e] shadow-md ring-1 ring-[#22c55e]/30'
                      : 'bg-[#141b27] border-[#223047] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">UPI (GPay / PhonePe / Paytm)</strong>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          Indian Users
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Pay via QR code or Virtual Payment Address (VPA)</p>
                    </div>
                  </div>

                  <div className="w-5 h-5 rounded-full border flex items-center justify-center border-slate-500">
                    {selectedMethod === 'UPI' && <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>}
                  </div>
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="p-3.5 rounded-xl bg-[#141b27] border border-[#223047] flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#22c55e] shrink-0" />
              <span>Funds are held in segregated, regulated escrow accounts until physical allocation.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-24">
            <h3 className="text-lg font-bold text-white border-b border-[#1e293b] pb-4">
              Purchase Gold Summary
            </h3>

            {/* Asset item card */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#141b27] border border-[#223047]">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                24K
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white">24K OneX Gold (Physical Bullion)</h4>
                <p className="text-[11px] text-slate-400">
                  {quote.quantityGrams} Gram(s) • {quote.quantityGrams} OneX Gold Tokens
                </p>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Gold Value ({quote.quantityGrams}g)</span>
                <span className="font-semibold text-white">AED {quote.grossGoldValueAed}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Platform Fee (0.50%)</span>
                <span className="font-medium text-slate-300">AED {quote.platformFeeAed}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Payment Processing Fee</span>
                <span className="font-medium text-[#22c55e]">AED 0.00 (Waived)</span>
              </div>

              <div className="border-t border-[#223047] pt-3 flex items-center justify-between text-sm font-bold text-white">
                <span>Total Payable</span>
                <span className="text-xl text-[#22c55e]">AED {quote.totalPayableAed}</span>
              </div>

              {selectedMethod === 'USDT' && (
                <div className="p-3 rounded-lg bg-[#141b27] border border-emerald-500/30 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>Payable in USDT:</span>
                  <span className="text-sm font-bold font-mono">{quote.cryptoEquivalentUsdt} USDT</span>
                </div>
              )}

              {selectedMethod === 'USDC' && (
                <div className="p-3 rounded-lg bg-[#141b27] border border-blue-500/30 flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span>Payable in USDC:</span>
                  <span className="text-sm font-bold font-mono">{quote.cryptoEquivalentUsdc} USDC</span>
                </div>
              )}
            </div>

            {/* Live Quote Countdown in Payment Screen */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-[11px] ${
                isExpired
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                  : 'bg-[#141b27] border-[#223047] text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-amber-400' : 'text-[#22c55e]'}`} />
                {isExpired ? (
                  <span className="text-amber-300 font-bold">Quote Expired (30s limit). Return to re-quote.</span>
                ) : (
                  <>
                    Price locked for: <strong className="text-emerald-400 font-mono font-bold">{timeLeft}s</strong>
                  </>
                )}
              </span>
              {isExpired && (
                <button
                  onClick={onBack}
                  className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#2a3850] text-[#22c55e] border border-[#223047] font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  New Quote
                </button>
              )}
            </div>

            {/* Pay Now CTA */}
            <button
              onClick={handlePay}
              disabled={isProcessing || isExpired}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                isExpired
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-[#22c55e]/20 disabled:opacity-50'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Initiating Payment...</span>
                </div>
              ) : isExpired ? (
                <span>Quote Expired - Click New Quote</span>
              ) : (
                <>
                  <span>Pay AED {quote.totalPayableAed}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
