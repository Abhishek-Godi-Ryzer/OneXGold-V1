/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Coins,
  CreditCard,
  FileText,
  Activity,
  Terminal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  User,
  Hash,
  Layers,
  Lock,
} from 'lucide-react';
import { GoldOrder, AuditEvent } from '../../types/domain';

interface AdminOrderInspectorProps {
  order: GoldOrder;
  customerMasked: string;
  customerTier: string;
  isOpen: boolean;
  onClose: () => void;
  onRetryOrder?: (orderId: string) => Promise<void>;
}

export const AdminOrderInspector: React.FC<AdminOrderInspectorProps> = ({
  order,
  customerMasked,
  customerTier,
  isOpen,
  onClose,
  onRetryOrder,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'customer'
    | 'quote'
    | 'payment'
    | 'liquidity'
    | 'allocation'
    | 'document'
    | 'status'
    | 'audit'
  >('customer');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [isLoadingAudits, setIsLoadingAudits] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen && order) {
      setIsLoadingAudits(true);
      fetch('/api/admin/audit-logs')
        .then((res) => (res.ok ? res.json() : []))
        .then((logs: AuditEvent[]) => {
          const filtered = logs.filter((l) => l.orderId === order.id);
          setAuditLogs(filtered);
          setIsLoadingAudits(false);
        })
        .catch(() => setIsLoadingAudits(false));
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRetry = async () => {
    if (!onRetryOrder) return;
    setIsRetrying(true);
    try {
      await onRetryOrder(order.id);
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            FAILED / ATTENTION
          </span>
        );
      case 'DOCUMENT_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            AWAITING SIGNATURE
          </span>
        );
      case 'LIQUIDITY_PENDING':
      case 'LIQUIDITY_EXECUTING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            LIQUIDITY IN-FLIGHT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600">
            {status}
          </span>
        );
    }
  };

  const navSections = [
    { id: 'customer', label: '1. Customer Order', icon: User },
    { id: 'quote', label: '2. Spot Quote', icon: Activity },
    { id: 'payment', label: '3. Payment', icon: CreditCard },
    { id: 'liquidity', label: '4. PAXG Liquidity', icon: Coins },
    { id: 'allocation', label: '5. Gold Allocation', icon: Building2 },
    { id: 'document', label: '6. Document', icon: FileText },
    { id: 'status', label: '7. Final Status', icon: ShieldCheck },
    { id: 'audit', label: '8. Audit Events', icon: Terminal, count: auditLogs.length },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0d121c] border-l border-[#1f2c42] flex flex-col h-full shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2c42] flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm">
              24K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Order Inspector — {order.id}
                </h2>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Customer: <strong className="text-slate-200">{customerMasked}</strong></span>
                <span>•</span>
                <span>Quantity: <strong className="text-amber-400">{order.quantityGrams}g Gold</strong></span>
                <span>•</span>
                <span className="font-mono text-[11px] text-slate-500">{order.createdAt}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.status === 'FAILED' && onRetryOrder && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry Failed Step'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#192336] hover:bg-[#23314c] text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 border-b border-[#1f2c42] bg-[#0c111a] overflow-x-auto text-xs font-medium py-2">
          {navSections.map((s) => {
            const Icon = s.icon;
            const isActive = activeTab === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1e2a3f] text-emerald-400 font-semibold shadow-inner border border-[#2d3d5b]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141c2b]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
                {s.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                    {s.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: CUSTOMER ORDER */}
          {activeTab === 'customer' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#121927] border border-[#1f2c42] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f2c42] pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Customer & Order Master Metadata</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1a2538] text-slate-300 uppercase tracking-wider border border-[#2b3a54]">
                    Tier: {customerTier}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] space-y-1">
                    <span className="text-slate-400 block text-[11px]">Masked Customer Identity</span>
                    <strong className="text-white text-sm font-semibold">{customerMasked}</strong>
                    <p className="text-[10px] text-slate-500">PII Privacy Protected (GDPR/ADGM Compliant)</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] space-y-1">
                    <span className="text-slate-400 block text-[11px]">Customer User ID</span>
                    <div className="flex items-center justify-between">
                      <code className="text-emerald-400 font-mono">{order.userId}</code>
                      <button
                        onClick={() => copyText(order.userId, 'userId')}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedKey === 'userId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] space-y-1">
                    <span className="text-slate-400 block text-[11px]">OneX Order Reference</span>
                    <div className="flex items-center justify-between">
                      <code className="text-white font-mono font-bold">{order.id}</code>
                      <button
                        onClick={() => copyText(order.id, 'orderId')}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedKey === 'orderId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] space-y-1">
                    <span className="text-slate-400 block text-[11px]">Idempotency Key</span>
                    <div className="flex items-center justify-between">
                      <code className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">
                        {order.idempotencyKey}
                      </code>
                      <button
                        onClick={() => copyText(order.idempotencyKey, 'idemp')}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedKey === 'idemp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] space-y-1">
                    <span className="text-slate-400 block text-[11px]">Gold Quantity</span>
                    <strong className="text-amber-400 text-sm font-mono">{order.quantityGrams} g (24K Bullion)</strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] space-y-1">
                    <span className="text-slate-400 block text-[11px]">Timestamps</span>
                    <p className="text-slate-300 font-mono text-[11px]">Created: {order.createdAt}</p>
                    {order.completedAt && (
                      <p className="text-emerald-400 font-mono text-[11px]">Completed: {order.completedAt}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: QUOTE */}
          {activeTab === 'quote' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#121927] border border-[#1f2c42] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f2c42] pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Locked Spot Gold Quote (Pricing Matrix)</h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">
                    Quote ID: {order.quote?.quoteId || 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                    <span className="text-slate-400 block text-[11px]">Gold Price (AED/g)</span>
                    <strong className="text-white font-mono text-sm">AED {order.quote?.goldPricePerGramAed}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                    <span className="text-slate-400 block text-[11px]">Gold Price (USD/oz)</span>
                    <strong className="text-white font-mono text-sm">${order.quote?.goldPriceUsdPerOunce}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                    <span className="text-slate-400 block text-[11px]">Gross Value</span>
                    <strong className="text-white font-mono text-sm">AED {order.quote?.grossGoldValueAed}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                    <span className="text-slate-400 block text-[11px]">Platform Fee (0.5%)</span>
                    <strong className="text-emerald-400 font-mono text-sm">AED {order.quote?.platformFeeAed}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                    <span className="text-slate-400 block text-[11px]">Total Payable</span>
                    <strong className="text-emerald-400 font-mono text-sm font-bold">AED {order.quote?.totalPayableAed}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                    <span className="text-slate-400 block text-[11px]">Crypto Eq. (USDT)</span>
                    <strong className="text-blue-400 font-mono text-sm">${order.quote?.cryptoEquivalentUsdt}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                    <span className="text-slate-400 block text-[11px]">Required PAXG (oz)</span>
                    <strong className="text-amber-400 font-mono text-sm">{order.quote?.paxgRequired} oz</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                    <span className="text-slate-400 block text-[11px]">PAXG Spot USD</span>
                    <strong className="text-slate-200 font-mono text-sm">${order.quote?.paxgPriceUsd}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: PAYMENT */}
          {activeTab === 'payment' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#121927] border border-[#1f2c42] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f2c42] pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Payment Settlement & Gateway Record</h3>
                  </div>
                  {order.payment ? (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {order.payment.status}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      PENDING INITIATION
                    </span>
                  )}
                </div>

                {order.payment ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Payment ID</span>
                      <code className="text-white font-mono">{order.payment.paymentId}</code>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Payment Method</span>
                      <strong className="text-emerald-400 font-semibold">{order.payment.method}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Settled Amount</span>
                      <strong className="text-white font-mono text-sm">{order.payment.amount} {order.payment.currency}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Transaction Reference</span>
                      <code className="text-slate-300 font-mono text-[11px] truncate block">{order.payment.transactionReference}</code>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] col-span-2">
                      <span className="text-slate-400 block text-[11px]">Payment Timestamp</span>
                      <p className="text-slate-300 font-mono text-[11px]">{order.payment.paidAt}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No payment record attached yet.</p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: PAXG LIQUIDITY */}
          {activeTab === 'liquidity' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#121927] border border-[#1f2c42] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f2c42] pb-3">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">PAXG Institutional Liquidity Execution</h3>
                  </div>
                  {order.liquidity?.status === 'FILLED' ? (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      FILLED (100%)
                    </span>
                  ) : order.liquidity?.status === 'REJECTED' ? (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      REJECTED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      IN-FLIGHT
                    </span>
                  )}
                </div>

                {order.liquidity ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Execution ID</span>
                      <code className="text-emerald-400 font-mono">{order.liquidity.executionId}</code>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Liquidity Provider</span>
                      <strong className="text-white font-mono">{order.liquidity.provider}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Execution Side</span>
                      <strong className="text-amber-400 font-mono">{order.liquidity.side}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Required PAXG</span>
                      <strong className="text-white font-mono">{order.liquidity.requestedPaxg} oz</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Executed / Filled PAXG</span>
                      <strong className="text-emerald-400 font-mono">{order.liquidity.filledPaxg} oz</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Execution Price (USD/oz)</span>
                      <strong className="text-white font-mono">${order.liquidity.paxgPriceUsd}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] col-span-3">
                      <span className="text-slate-400 block text-[11px]">Provider Order ID & Timestamp</span>
                      <p className="text-slate-300 font-mono text-[11px]">
                        Order Ref: {order.liquidity.providerOrderId || 'N/A'} • Executed At: {order.liquidity.executedAt}
                      </p>
                      {order.liquidity.errorMessage && (
                        <p className="text-rose-400 text-xs mt-1 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                          {order.liquidity.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">PAXG liquidity has not been executed yet.</p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: GOLD ALLOCATION */}
          {activeTab === 'allocation' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#121927] border border-[#1f2c42] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f2c42] pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">DMCC / TransGuard Physical Gold Custody</h3>
                  </div>
                  {order.allocation ? (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ALLOCATED & TITLED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-700 text-slate-400">
                      UNALLOCATED
                    </span>
                  )}
                </div>

                {order.allocation ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Allocation Certificate Number</span>
                      <strong className="text-amber-400 font-mono text-sm">{order.allocation.egrCertificateNumber}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Vault Stamped Bar Serial</span>
                      <strong className="text-white font-mono text-sm">{order.allocation.vaultBarSerialNumber}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Vault Depository Location</span>
                      <p className="text-slate-200">{order.allocation.vaultLocation}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                      <span className="text-slate-400 block text-[11px]">Custodial Depository</span>
                      <p className="text-slate-200">{order.allocation.custodian}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] col-span-2">
                      <span className="text-slate-400 block text-[11px]">Allocated Gold Weight & Purity</span>
                      <strong className="text-white font-mono">{order.allocation.goldGrams}g • {order.allocation.purity}</strong>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">Allocated At: {order.allocation.allocatedAt}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Physical gold has not been allocated to vault serial yet.</p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 6: DOCUMENT */}
          {activeTab === 'document' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#121927] border border-[#1f2c42] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f2c42] pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Title Transfer & Gold Custody Agreement</h3>
                  </div>
                  {order.document?.status === 'SIGNED' ? (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      LEGALLY SIGNED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {order.document?.status || 'PENDING'}
                    </span>
                  )}
                </div>

                {order.document ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                        <span className="text-slate-400 block text-[11px]">Document ID</span>
                        <code className="text-white font-mono">{order.document.documentId}</code>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436]">
                        <span className="text-slate-400 block text-[11px]">Signer Legal Name</span>
                        <strong className="text-emerald-400 font-semibold">{order.document.signerName || 'Pending'}</strong>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] col-span-2">
                        <span className="text-slate-400 block text-[11px]">Cryptographic Signature Hash (SHA-256)</span>
                        <code className="text-slate-300 font-mono text-[11px] block break-all">
                          {order.document.signatureHash || 'Pending signature execution'}
                        </code>
                      </div>
                      {order.document.signatureDate && (
                        <div className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] col-span-2 flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Signed At: {order.document.signatureDate}</span>
                          <span className="text-slate-400 text-[11px] font-mono">Signer IP: {order.document.signatureIp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No legal document generated yet.</p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 7: FINAL STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#121927] border border-[#1f2c42] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f2c42] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Order Operational Lifecycle Checklist</h3>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Order Initialized & Spot Quote Locked', done: Boolean(order.quote) },
                    { label: 'Payment Settlement Received', done: Boolean(order.payment?.status === 'SUCCESS') },
                    { label: 'PAXG Institutional Liquidity Filled', done: Boolean(order.liquidity?.status === 'FILLED') },
                    { label: 'DMCC Vault Bullion Allocated', done: Boolean(order.allocation) },
                    { label: 'Gold Title Agreement Executed', done: Boolean(order.document?.status === 'SIGNED') },
                    { label: 'Holdings Credited to Customer Depository', done: order.status === 'COMPLETED' },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        step.done
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                          : 'bg-[#0b1019] border-[#1a2436] text-slate-400'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {step.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span>{step.label}</span>
                      </span>
                      <span className="font-mono text-[10px] font-semibold">
                        {step.done ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>

                {order.failureReason && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      Failure Diagnosis
                    </div>
                    <p className="text-xs text-rose-300">{order.failureReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 8: AUDIT EVENTS */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#121927] border border-[#1f2c42] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1f2c42] pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Cryptographic Audit Trail ({auditLogs.length} Events)</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Immutable Order Log</span>
                </div>

                {isLoadingAudits ? (
                  <p className="text-xs text-slate-400 animate-pulse">Loading immutable audit trail...</p>
                ) : auditLogs.length > 0 ? (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div
                        key={log.eventId}
                        className="p-3 rounded-lg bg-[#0b1019] border border-[#1a2436] space-y-1.5 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="font-bold text-emerald-400">{log.eventType}</span>
                          <span className="text-[11px] text-slate-500">{log.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400">
                          <span>Actor: <strong className="text-slate-200">{log.actor}</strong></span>
                          <span>Status: <strong className="text-slate-200">{log.status}</strong></span>
                          <span>Ref: <strong className="text-slate-200">{log.referenceId || 'N/A'}</strong></span>
                        </div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <pre className="p-2 rounded bg-black/40 text-[10px] text-slate-400 overflow-x-auto border border-white/5">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific audit entries found for this order.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
