/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Coins,
  CreditCard,
  FileText,
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  User,
  Info,
} from 'lucide-react';
import { GoldOrder, AdminOrderSummary } from '../../types/domain';

interface OneXOrderDetailModalProps {
  order: GoldOrder | AdminOrderSummary;
  isOpen: boolean;
  onClose: () => void;
}

export const OneXOrderDetailModal: React.FC<OneXOrderDetailModalProps> = ({
  order: orderData,
  isOpen,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !orderData) return null;

  // Extract raw order structure if passed as summary
  const order: GoldOrder = (orderData as any).order || (orderData as GoldOrder);
  const customerName = (orderData as any).customerMasked || (order.userId ? 'Abhishk (User 001)' : 'Abhishk');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedGrams = Number(order.quantityGrams || 10).toFixed(2);
  const tokensCount = order.unitTokenCount || formattedGrams;
  const quoteId = order.quote?.quoteId || `PAXG-Q-${order.id.replace(/[^0-9]/g, '').padStart(6, '0') || '000001'}`;
  const executionId = order.liquidity?.executionId || `PAXG-EXEC-${order.id.replace(/[^0-9]/g, '').padStart(6, '0') || '000001'}`;
  const requiredPaxg = order.quote?.paxgRequired || (Number(order.quantityGrams || 10) / 31.1034768).toFixed(6);
  const vaultBarSerial = order.allocation?.vaultBarSerialNumber || `DXB-TG-999.9-B${order.id.replace(/[^0-9]/g, '').padStart(5, '0') || '77201'}`;

  // 10-step lifecycle stages
  const lifecycleStages = [
    { key: 'ORDER', label: 'Order Created', isDone: true, time: order.createdAt },
    { key: 'PAYMENT', label: 'Payment Confirmed', isDone: Boolean(order.payment && order.payment.status === 'SUCCESS') || order.status === 'COMPLETED', time: order.payment?.paidAt || order.createdAt },
    { key: 'LIQUIDITY', label: 'Liquidity Quoted', isDone: Boolean(order.quote), time: order.quote?.quoteCreatedAt || order.createdAt },
    { key: 'PAXG_EXEC', label: 'PAXG Execution', isDone: Boolean(order.liquidity && order.liquidity.status === 'FILLED') || order.status === 'COMPLETED', time: order.liquidity?.executedAt || order.updatedAt },
    { key: 'GOLD_PURCHASE', label: 'Gold Purchased', isDone: Boolean(order.allocation) || order.status === 'COMPLETED', time: order.allocation?.allocatedAt || order.updatedAt },
    { key: 'SETTLEMENT', label: 'Settlement Complete', isDone: order.status === 'COMPLETED' || Boolean(order.payment), time: order.payment?.paidAt || order.updatedAt },
    { key: 'GOLD_ALLOC', label: 'Gold Allocated', isDone: Boolean(order.allocation) || order.status === 'COMPLETED', time: order.allocation?.allocatedAt || order.updatedAt },
    { key: 'HOLDING', label: 'OneX Gold Holding', isDone: order.status === 'COMPLETED', time: order.completedAt || order.updatedAt },
    { key: 'TOKENS', label: 'OneX Gold Tokens', isDone: order.status === 'COMPLETED', time: order.completedAt || order.updatedAt },
    { key: 'COMPLETED', label: 'Completed', isDone: order.status === 'COMPLETED', time: order.completedAt || order.updatedAt },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  OneX Gold Order Operations Trace
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full end-to-end lifecycle verification, liquidity execution trace, and physical vault allocation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Complete 10-Stage Lifecycle Stepper */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                10-Stage Operational Lifecycle
              </span>
              <span className="text-[11px] font-mono text-indigo-600 font-semibold">
                ORDER → PAYMENT → LIQUIDITY → PAXG → PURCHASE → SETTLEMENT → ALLOCATION → HOLDING → TOKENS → COMPLETED
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {lifecycleStages.map((st, idx) => (
                <div
                  key={st.key}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                    st.isDone
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      0{idx + 1}
                    </span>
                    {st.isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <strong className="text-[11px] font-bold mt-1 block truncate">
                    {st.label}
                  </strong>
                  <span className="text-[9px] font-mono text-slate-500 mt-0.5 truncate">
                    {st.isDone ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Order Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Order Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Order Information
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Order ID:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                    <span>{order.id}</span>
                    <button
                      onClick={() => copyToClipboard(order.id, 'orderId')}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Copy Order ID"
                    >
                      {copiedField === 'orderId' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-800">{customerName}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Gold Requested:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {formattedGrams}g OneX Gold
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">OneX Gold Tokens:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {tokensCount} Tokens
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Gold Price:</span>
                  <span className="font-mono text-slate-700">
                    AED {order.quote?.goldPricePerGramAed || '307.90'} / g ($
                    {order.quote?.goldPriceUsdPerOunce || '2,595.00'}/oz)
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Fees:</span>
                  <span className="font-mono text-slate-700">
                    AED {order.quote?.platformFeeAed || '15.40'} (Platform Custody)
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    AED {order.quote?.totalPayableAed || '3,094.40'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-emerald-100 text-emerald-800">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Customer Holding */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Customer Holding Outcome
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs mt-3">
                  <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-600 font-medium">OneX Gold Physical Holding:</span>
                      <strong className="text-emerald-800 text-sm font-mono">{formattedGrams}g</strong>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Allocated fine gold held in TransGuard DMCC Dubai Vault.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-600 font-medium">OneX Gold Tokens:</span>
                      <strong className="text-indigo-900 text-sm font-mono">{tokensCount} Tokens</strong>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      1:1 Digital Depository Asset representing physical gold.
                    </p>
                  </div>
                </div>
              </div>

              {/* Explicit Conversion Guarantee */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center font-mono text-xs font-bold text-slate-700">
                1 OneX Gold Token = 1 gram of OneX Gold
              </div>
            </div>
          </div>

          {/* Detailed Operational Sections: Liquidity, Execution & Gold */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Liquidity */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900 uppercase tracking-wide">Liquidity</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 font-semibold">
                  MOCK ENGINE
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Provider:</span>
                  <strong className="text-slate-800">Mock PAXG Liquidity</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PAXG Required:</span>
                  <strong className="text-purple-700">{requiredPaxg} PAXG</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Quote ID:</span>
                  <strong className="text-slate-700 truncate block">{quoteId}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Quote Status:</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                    FILLED
                  </span>
                </div>
              </div>
            </div>

            {/* Execution */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900 uppercase tracking-wide">Execution</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold">
                  MOCK FILL
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Execution ID:</span>
                  <strong className="text-slate-700 truncate block">{executionId}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Requested:</span>
                  <strong className="text-slate-700">{requiredPaxg} PAXG</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Executed:</span>
                  <strong className="text-emerald-700">{requiredPaxg} PAXG</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Execution Status:</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                    FILLED
                  </span>
                </div>
              </div>
            </div>

            {/* Gold Allocation */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900 uppercase tracking-wide">Gold Allocation</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 font-semibold">
                  DMCC VAULT
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Gold Purchased:</span>
                  <strong className="text-slate-800">{formattedGrams}g Fine Gold</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Gold Allocated:</span>
                  <strong className="text-emerald-700">{formattedGrams}g Segregated</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Vault Bar Serial:</span>
                  <strong className="text-slate-700 truncate block">#{vaultBarSerial}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Allocation Status:</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                    ALLOCATED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Internal MVP Note */}
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs flex items-start gap-2.5 text-purple-900">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>MVP Operational Notice:</strong> Mock PAXG Liquidity is used strictly as an internal simulation provider to model real-time spot pricing and institutional execution. The customer holds 1:1 allocated physical <strong>OneX Gold</strong> in the DMCC vault and receives <strong>OneX Gold Tokens</strong>, not PAXG.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Created: {new Date(order.createdAt).toLocaleString()}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            Close Operational Trace
          </button>
        </div>
      </div>
    </div>
  );
};
