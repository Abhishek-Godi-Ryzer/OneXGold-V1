/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  ShieldCheck,
  CreditCard,
  Building2,
  Terminal,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { GoldOrder } from '../types/domain';

interface ExecutionDetailsDrawerProps {
  order: GoldOrder;
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutionDetailsDrawer: React.FC<ExecutionDetailsDrawerProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'json'>('pipeline');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'onex-order': true,
    'quote': true,
    'payment': true,
    'paxg-quote': true,
    'paxg-order': true,
    'paxg-fill': true,
    'gold-allocation': true,
    'document': true,
    'completion': true,
  });

  if (!isOpen) return null;

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string, idKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pipelineSteps = [
    {
      id: 'onex-order',
      name: '1. OneX Order',
      status: 'COMPLETED',
      icon: Terminal,
      timestamp: order.createdAt,
      refId: order.id,
      data: {
        'Order ID': order.id,
        'User ID': order.userId,
        'Idempotency Key': order.idempotencyKey,
        'Quantity': `${order.quantityGrams}g (24K Gold)`,
        'Status': order.status,
        'Created At': order.createdAt,
      },
    },
    {
      id: 'quote',
      name: '2. Spot Quote',
      status: order.quote ? 'COMPLETED' : 'PENDING',
      icon: Activity,
      timestamp: order.quote.quoteCreatedAt,
      refId: order.quote.quoteId,
      data: {
        'Quote ID': order.quote.quoteId,
        'Gold Price (AED/g)': `AED ${order.quote.goldPricePerGramAed}`,
        'Gold Price (USD/oz)': `$${order.quote.goldPriceUsdPerOunce}`,
        'Gross Gold Value': `AED ${order.quote.grossGoldValueAed}`,
        'Platform Fee (0.5%)': `AED ${order.quote.platformFeeAed}`,
        'Total Payable': `AED ${order.quote.totalPayableAed}`,
        'Crypto Eq. (USDT/USDC)': `$${order.quote.cryptoEquivalentUsdt}`,
        'Expires In': `${order.quote.quoteExpiresAt}`,
      },
    },
    {
      id: 'payment',
      name: '3. Payment Settlement',
      status: order.payment?.status === 'SUCCESS' ? 'COMPLETED' : order.payment?.status || 'PENDING',
      icon: CreditCard,
      timestamp: order.payment?.paidAt || order.createdAt,
      refId: order.payment?.transactionReference || order.payment?.paymentId || 'PAY-PENDING',
      data: {
        'Payment ID': order.payment?.paymentId || 'Pending',
        'Payment Method': order.payment?.method || 'Pending',
        'Settled Amount': `${order.payment?.currency || 'AED'} ${order.payment?.amount || order.quote.totalPayableAed}`,
        'Payment Status': order.payment?.status || 'PENDING',
        'Tx Reference': order.payment?.transactionReference || 'TX-PENDING',
        'Gateway Settlement': 'Authoritative Gateway Webhook',
      },
    },
    {
      id: 'paxg-quote',
      name: '4. PAXG Quote Calculation',
      status: order.quote ? 'COMPLETED' : 'PENDING',
      icon: Layers,
      timestamp: order.quote.quoteCreatedAt,
      refId: `PAXG-Q-${order.quote.quoteId}`,
      data: {
        'Conversion Constant': '1 Troy Ounce = 31.1034768 grams',
        'Requested Gold': `${order.quantityGrams} grams`,
        'Mathematical Formula': `${order.quantityGrams} ÷ 31.1034768`,
        'Calculated PAXG': `${order.quote.paxgRequired} PAXG`,
        'Market Pair': 'PAXGUSD',
        'PAXG Price (USD)': `$${order.quote.paxgPriceUsd}`,
      },
    },
    {
      id: 'paxg-order',
      name: '5. PAXG Provider Order',
      status: order.liquidity ? 'COMPLETED' : 'PENDING',
      icon: Terminal,
      timestamp: order.liquidity?.executedAt || order.updatedAt,
      refId: order.liquidity?.providerOrderId || 'PENDING',
      data: {
        'Provider': order.liquidity?.provider || 'MOCK_PAXG',
        'Provider Order ID': order.liquidity?.providerOrderId || 'PENDING',
        'Order Side': 'BUY (Market)',
        'Upstream Destination': order.liquidity?.provider === 'PAXOS_SANDBOX' ? 'Paxos Trust Company Sandbox' : 'OneX Internal Liquidity Desk',
        'Order Idempotency Key': `LIQ-IDEMP-${order.idempotencyKey}`,
      },
    },
    {
      id: 'paxg-fill',
      name: '6. PAXG Liquidity Fill',
      status: order.liquidity?.status === 'FILLED' ? 'COMPLETED' : order.liquidity?.status || 'PENDING',
      icon: CheckCircle2,
      timestamp: order.liquidity?.executedAt || 'Pending',
      refId: order.liquidity?.executionId || 'EXEC-PENDING',
      data: {
        'Execution ID': order.liquidity?.executionId || 'EXEC-PENDING',
        'Filled Amount': `${order.liquidity?.filledPaxg || order.quote.paxgRequired} PAXG`,
        'Execution Price': `$${order.liquidity?.paxgPriceUsd || order.quote.paxgPriceUsd} USD / oz`,
        'Total USD Settlement': `$${order.liquidity?.totalUsd || '0.00'} USD`,
        'Execution Status': order.liquidity?.status || 'PENDING',
        'Execution Latency': '124 ms (Synchronous Fill)',
      },
    },
    {
      id: 'gold-allocation',
      name: '7. Physical Gold Allocation',
      status: order.allocation ? 'COMPLETED' : 'PENDING',
      icon: Coins,
      timestamp: order.allocation?.allocatedAt || 'Pending',
      refId: order.allocation?.egrCertificateNumber || 'ALLOC-PENDING',
      data: {
        'Allocation ID': order.allocation?.allocationId || 'ALLOC-PENDING',
        'Allocation Certificate #': order.allocation?.egrCertificateNumber || 'ALLOC-PENDING',
        'Vault Bar Serial #': order.allocation?.vaultBarSerialNumber || 'PENDING',
        'Purity Standard': order.allocation?.purity || '24K (999.9 Fine Gold)',
        'Depository / Vault': order.allocation?.vaultLocation || 'TransGuard Dubai / DMCC Secure Vault',
        'Custodian': order.allocation?.custodian || 'OneX Custody & Vault Services Ltd',
        'Allocated Weight': `${order.allocation?.goldGrams || order.quantityGrams} grams`,
      },
    },
    {
      id: 'document',
      name: '8. Legal Ownership Agreement',
      status: order.document?.status === 'SIGNED' ? 'COMPLETED' : order.document ? 'READY_FOR_SIGNATURE' : 'PENDING',
      icon: FileText,
      timestamp: order.document?.signedAt || order.document?.createdAt || 'Pending',
      refId: order.document?.documentId || 'DOC-PENDING',
      data: {
        'Document ID': order.document?.documentId || 'DOC-PENDING',
        'Contract Template': 'TEMPLATE01_GOLD_PURCHASE_AGREEMENT',
        'Signer Name': order.document?.signerName || 'Pending Customer Signature',
        'Signature Status': order.document?.status || 'PENDING',
        'Signature Hash': order.document?.signatureHash || 'SHA-256 (Pending Signature)',
        'Signer IP': order.document?.signatureIp || '127.0.0.1',
      },
    },
    {
      id: 'completion',
      name: '9. Order Completion & Portfolio Credit',
      status: order.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
      icon: ShieldCheck,
      timestamp: order.completedAt || 'Pending',
      refId: order.id,
      data: {
        'Lifecycle State': order.status,
        'Ledger Synced': order.status === 'COMPLETED' ? 'TRUE (Balance Credited)' : 'PENDING_SIGNATURE',
        'Issued Gold Tokens': `${order.quantityGrams} Gold Tokens (1 token = 1g)`,
        'Portfolio Allocation': 'Direct Vault Ownership',
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#090d16] border-l border-[#1e293b] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#1e293b] bg-[#0d131f] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#22c55e]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Execution Details</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1e293b] text-slate-300">
                    {order.id}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Full deterministic state machine execution trace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-[#05080e] p-1 rounded-lg border border-[#1e293b]">
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                    activeTab === 'pipeline'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Pipeline Flow
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                    activeTab === 'json'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw JSON
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[#141b27] hover:bg-[#1e293b] text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'pipeline' ? (
              <div className="space-y-4">
                {/* Horizontal Quick Pipeline Tracker */}
                <div className="p-4 rounded-xl bg-[#0d131f] border border-[#1e293b]">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                    Sequential Execution Pipeline
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-[11px] font-mono text-slate-300">
                    <span className="text-emerald-400 shrink-0 font-bold">OneX Order</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-emerald-400 shrink-0 font-bold">Quote</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-emerald-400 shrink-0 font-bold">Payment</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-emerald-400 shrink-0 font-bold">PAXG Quote</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-emerald-400 shrink-0 font-bold">PAXG Order</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-emerald-400 shrink-0 font-bold">PAXG Fill</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-emerald-400 shrink-0 font-bold">Gold Allocation</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-emerald-400 shrink-0 font-bold">Document</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-emerald-400 shrink-0 font-bold">Completion</span>
                  </div>
                </div>

                {/* Step-by-Step Interactive Cards */}
                <div className="space-y-3">
                  {pipelineSteps.map((step, idx) => {
                    const isExpanded = expandedSections[step.id] ?? true;
                    const isDone = step.status === 'COMPLETED';
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.id}
                        className="rounded-xl bg-[#0e1420] border border-[#1e293b] overflow-hidden transition"
                      >
                        <button
                          onClick={() => toggleSection(step.id)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#131b2b] transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                isDone
                                  ? 'bg-emerald-500/10 text-[#22c55e] border border-emerald-500/30'
                                  : 'bg-[#1a2233] text-slate-400'
                              }`}
                            >
                              <StepIcon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">
                                {step.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Ref: {step.refId}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                isDone
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {step.status}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-[#182232] bg-[#070b12] text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
                              {Object.entries(step.data).map(([label, val]) => (
                                <div
                                  key={label}
                                  className="p-2 rounded bg-[#0b1019] border border-[#182232] flex flex-col justify-between"
                                >
                                  <span className="text-[10px] text-slate-400">{label}</span>
                                  <div className="flex items-center justify-between gap-1 mt-0.5">
                                    <span className="text-slate-200 text-[11px] truncate font-medium">
                                      {String(val)}
                                    </span>
                                    {typeof val === 'string' && val.length > 8 && (
                                      <button
                                        onClick={() => copyToClipboard(val, `${step.id}-${label}`)}
                                        className="text-slate-400 hover:text-slate-200 transition cursor-pointer p-0.5"
                                        title="Copy value"
                                      >
                                        {copiedId === `${step.id}-${label}` ? (
                                          <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Complete GoldOrder Object State
                  </span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(order, null, 2), 'raw-json')}
                    className="px-3 py-1 rounded bg-[#141b27] hover:bg-[#1e293b] text-slate-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedId === 'raw-json' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied JSON</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#05080e] border border-[#1e293b] text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-[600px]">
                  {JSON.stringify(order, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1e293b] bg-[#0d131f] flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">
              OneX Institutional Engine • Multi-Step Settlement Model
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#28384e] text-white font-semibold transition cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
