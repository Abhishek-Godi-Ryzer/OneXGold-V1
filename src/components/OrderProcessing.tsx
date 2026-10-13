/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Coins,
  Layers,
  ArrowRight,
  RefreshCw,
  Server,
  Zap,
  Terminal,
  Activity,
  CreditCard,
  Building2,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Info,
  Sparkles,
  Wallet,
  Check,
  FileCheck,
  Sliders,
} from 'lucide-react';
import { GoldOrder, AuditEvent } from '../types/domain';
import { ExecutionDetailsDrawer } from './ExecutionDetailsDrawer';

interface OrderProcessingProps {
  order: GoldOrder;
  onProceedToSignature?: (order: GoldOrder) => void;
  onViewMyGold?: () => void;
  onViewPortfolio?: () => void;
  onBack: () => void;
}

export const OrderProcessing: React.FC<OrderProcessingProps> = ({
  order: initialOrder,
  onProceedToSignature,
  onViewMyGold,
  onViewPortfolio,
  onBack,
}) => {
  const [order, setOrder] = useState<GoldOrder>(initialOrder);

  // Default behavior is MANUAL: start at Step 1 (or current state if completed)
  const initialStep = initialOrder.status === 'COMPLETED' ? 9 : 1;
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [isAutoProcessing, setIsAutoProcessing] = useState<boolean>(false);
  const [isProcessingStep, setIsProcessingStep] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [isTechDetailsExpanded, setIsTechDetailsExpanded] = useState<boolean>(false);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState<boolean>(false);
  const [expandedStageDetail, setExpandedStageDetail] = useState<number | null>(4); // Default expand PAXG stage

  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch backend audit events for this specific order
  const fetchAuditTrail = async (orderId: string) => {
    try {
      setIsLoadingAudit(true);
      const res = await fetch(`/api/orders/${orderId}/audit`);
      if (res.ok) {
        const events: AuditEvent[] = await res.json();
        setAuditEvents(events);
      }
    } catch (err) {
      console.warn('Failed to fetch order audit events:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // Ensure backend state is synced when progressing
  const syncBackendForStep = async (stepNumber: number) => {
    try {
      if (stepNumber >= 2 && (order.status === 'DRAFT' || order.status === 'PAYMENT_PENDING')) {
        const res = await fetch(`/api/orders/${order.id}/process-payment`, { method: 'POST' });
        if (res.ok) {
          const updated: GoldOrder = await res.json();
          setOrder(updated);
          fetchAuditTrail(updated.id);
        }
      }

      if (stepNumber >= 9 && order.status !== 'COMPLETED') {
        const res = await fetch(`/api/orders/${order.id}/sign-document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signerName: 'Abhishk (Customer)', signatureIp: '194.187.249.12' }),
        });
        if (res.ok) {
          const completed: GoldOrder = await res.json();
          setOrder(completed);
          fetchAuditTrail(completed.id);
        }
      }
    } catch (err: any) {
      console.warn('Backend sync note:', err?.message);
    }
  };

  // Initial audit fetch
  useEffect(() => {
    fetchAuditTrail(order.id);
  }, [order.id]);

  // Auto-Processing Timer (approx. 2.5 seconds per stage)
  useEffect(() => {
    if (isAutoProcessing) {
      if (currentStep >= 9) {
        setIsAutoProcessing(false);
        return;
      }

      autoTimerRef.current = setTimeout(() => {
        handleAdvanceStep();
      }, 2500);
    }

    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
      }
    };
  }, [isAutoProcessing, currentStep]);

  // Advance by exactly ONE step
  const handleAdvanceStep = async () => {
    if (currentStep >= 9) return;

    setIsProcessingStep(true);
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    // Sync backend state asynchronously without blocking UI animation
    await syncBackendForStep(nextStep);
    setIsProcessingStep(false);
  };

  // Toggle Auto-Processing
  const handleToggleAuto = () => {
    if (isAutoProcessing) {
      setIsAutoProcessing(false);
    } else {
      if (currentStep >= 9) {
        setCurrentStep(1);
      }
      setIsAutoProcessing(true);
    }
  };

  // Reset interactive demonstration to Step 1
  const handleResetDemo = () => {
    setIsAutoProcessing(false);
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
    }
    setCurrentStep(1);
  };

  // Plain-English explanation for each stage (Requirement 6)
  const stepExplanations: Record<number, string> = {
    1: 'Your OneX Gold order has been created and the purchase details are locked.',
    2: 'Your payment has been confirmed.',
    3: 'OneX is checking the liquidity needed to fulfil this gold purchase.',
    4: 'The MVP is using Mock PAXG Liquidity to simulate the liquidity and execution step.',
    5: 'The required gold purchase has been confirmed.',
    6: 'The gold amount has been assigned to your OneX Gold holding.',
    7: 'Your OneX Gold holding has been updated.',
    8: 'Your OneX Gold Tokens have been updated.',
    9: 'Your OneX Gold purchase is complete.',
  };

  // Calculated values & IDs
  const quoteId = `PAXG-Q-${order.id.replace(/[^0-9]/g, '').padStart(6, '0') || '000001'}`;
  const executionId = `PAXG-EXEC-${order.id.replace(/[^0-9]/g, '').padStart(6, '0') || '000001'}`;
  const requiredPaxg = order.quote?.paxgRequired || (Number(order.quantityGrams) / 31.1034768).toFixed(6);
  const formattedGrams = Number(order.quantityGrams).toFixed(2);
  const vaultBarSerial = order.allocation?.vaultBarSerialNumber || `DXB-TG-999.9-B${order.id.replace(/[^0-9]/g, '').padStart(5, '0') || '77201'}`;

  // 9 Stages Definition (Requirement 1)
  const stages = [
    {
      step: 1,
      title: 'Order Created',
      description: 'Quantity selected in grams & price quote locked',
      explanation: stepExplanations[1],
      isDone: currentStep >= 1,
      isActive: currentStep === 1,
      icon: Terminal,
      referenceId: order.id,
      amount: `${formattedGrams}g OneX Gold • AED ${order.quote.totalPayableAed}`,
      timestamp: order.createdAt,
    },
    {
      step: 2,
      title: 'Payment Confirmed',
      description: 'Mock instant payment verified via secure gateway',
      explanation: stepExplanations[2],
      isDone: currentStep >= 2,
      isActive: currentStep === 2,
      icon: CreditCard,
      referenceId: order.payment?.transactionReference || `PAY-${order.id.slice(-6)}`,
      amount: `AED ${order.quote.totalPayableAed} Settled`,
      timestamp: currentStep >= 2 ? order.createdAt : 'Pending',
    },
    {
      step: 3,
      title: 'Liquidity Quote Received',
      description: 'Real-time spot rate confirmed with liquidity engine',
      explanation: stepExplanations[3],
      isDone: currentStep >= 3,
      isActive: currentStep === 3,
      icon: Activity,
      referenceId: quoteId,
      amount: `$${order.quote?.paxgPriceUsd || '3,350.00'} USD / oz`,
      timestamp: currentStep >= 3 ? order.createdAt : 'Pending',
    },
    {
      step: 4,
      title: 'PAXG Liquidity Used',
      description: 'Mock PAXG Liquidity pool filled behind the scenes',
      explanation: stepExplanations[4],
      isDone: currentStep >= 4,
      isActive: currentStep === 4,
      icon: Layers,
      referenceId: executionId,
      amount: `${requiredPaxg} PAXG (Simulated)`,
      timestamp: currentStep >= 4 ? order.updatedAt : 'Pending Execution',
    },
    {
      step: 5,
      title: 'Gold Purchased',
      description: 'Physical 24K fine bullion matched for allocation',
      explanation: stepExplanations[5],
      isDone: currentStep >= 5,
      isActive: currentStep === 5,
      icon: Coins,
      referenceId: `PUR-${order.id.slice(-6)}`,
      amount: `${formattedGrams}g Fine Gold 999.9 Purity`,
      timestamp: currentStep >= 5 ? order.updatedAt : 'Pending Purchase',
    },
    {
      step: 6,
      title: 'Gold Allocated',
      description: 'Physical vault bar matched in TransGuard DMCC Dubai Vault',
      explanation: stepExplanations[6],
      isDone: currentStep >= 6,
      isActive: currentStep === 6,
      icon: Building2,
      referenceId: `BAR-${vaultBarSerial}`,
      amount: `${formattedGrams}g 24K • Bar #${vaultBarSerial}`,
      timestamp: currentStep >= 6 ? (order.allocation?.allocatedAt || order.updatedAt) : 'Pending Allocation',
    },
    {
      step: 7,
      title: 'OneX Gold Balance Updated',
      description: `Credited +${formattedGrams}g to customer vault account`,
      explanation: stepExplanations[7],
      isDone: currentStep >= 7,
      isActive: currentStep === 7,
      icon: ShieldCheck,
      referenceId: 'BAL-USR-776197',
      amount: `+${formattedGrams}g OneX Gold`,
      timestamp: currentStep >= 7 ? order.updatedAt : 'Pending Balance',
    },
    {
      step: 8,
      title: 'OneX Gold Tokens Updated',
      description: `Minted +${formattedGrams} OneX Gold Tokens (1 Token = 1g Gold)`,
      explanation: stepExplanations[8],
      isDone: currentStep >= 8,
      isActive: currentStep === 8,
      icon: Zap,
      referenceId: `TKN-${order.id.slice(-6)}`,
      amount: `+${formattedGrams} OneX Gold Tokens`,
      timestamp: currentStep >= 8 ? order.updatedAt : 'Pending Mint',
    },
    {
      step: 9,
      title: 'Completed',
      description: 'Ownership recorded in institutional register & active',
      explanation: stepExplanations[9],
      isDone: currentStep >= 9,
      isActive: currentStep === 9,
      icon: CheckCircle2,
      referenceId: order.id,
      amount: 'Order Fully Finalized',
      timestamp: currentStep >= 9 ? (order.completedAt || order.updatedAt) : 'Pending Finalization',
    },
  ];

  // Dynamic execution status label for Spec Card
  const getExecutionStatusLabel = () => {
    switch (currentStep) {
      case 1:
        return 'Order Created';
      case 2:
        return 'Payment Confirmed';
      case 3:
        return 'Liquidity Quoted';
      case 4:
        return 'PAXG Liquidity Filled';
      case 5:
        return 'Gold Purchased';
      case 6:
        return 'Gold Allocated';
      case 7:
        return 'Balance Credited';
      case 8:
        return 'Tokens Minted';
      case 9:
        return 'Completed';
      default:
        return 'In Progress';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <span className="text-white font-medium">Order Execution</span>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDrawer(true)}
            className="px-4 py-2 rounded-xl bg-[#141b27] hover:bg-[#1e293b] border border-[#223047] text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg cursor-pointer"
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Full Trace Drawer</span>
          </button>
        </div>
      </div>

      {/* 2. Header (Requirement 9: Cleaned title and simulation subtitle) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1e293b]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              OneX Gold — Digital 24K Gold
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                currentStep === 9
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
              }`}
            >
              {currentStep === 9 ? 'COMPLETED' : `STAGE ${currentStep} OF 9`}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            OneX Gold purchase lifecycle with simulated PAXG liquidity and gold allocation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-[#0c121c] px-3 py-2 rounded-xl border border-[#1e293b]">
          <span className="text-slate-500">Order Ref:</span>
          <span className="text-white font-bold">{order.id}</span>
        </div>
      </div>

      {/* 3. Interactive Demonstration Controls (Requirement 2) */}
      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Prototype Demonstration Controls
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Step through the 9-stage lifecycle manually, or toggle automated simulation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Primary Step-by-Step Action Button */}
            <button
              onClick={handleAdvanceStep}
              disabled={currentStep >= 9 || isProcessingStep}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg cursor-pointer ${
                currentStep >= 9
                  ? 'bg-[#1a2333] text-slate-500 cursor-not-allowed border border-[#223047]'
                  : 'bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-[#22c55e]/20 active:scale-95'
              }`}
            >
              <ArrowRight className={`w-4 h-4 ${isProcessingStep ? 'animate-spin' : ''}`} />
              <span>
                {currentStep >= 9
                  ? 'All Stages Processed'
                  : `Process Next Step (${currentStep + 1}/9)`}
              </span>
            </button>

            {/* Auto Process Toggle Button */}
            <button
              onClick={handleToggleAuto}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
                isAutoProcessing
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#141b27] text-slate-200 border-[#223047] hover:bg-[#1e293b]'
              }`}
            >
              {isAutoProcessing ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause Auto Process</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto Process (2.5s)</span>
                </>
              )}
            </button>

            {/* Reset / Replay Demonstration */}
            <button
              onClick={handleResetDemo}
              title="Reset flow to Step 1"
              className="px-3 py-2.5 rounded-xl bg-[#141b27] hover:bg-[#1e293b] border border-[#223047] text-slate-400 hover:text-white text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Current Active Step Explanation Banner (Requirement 6) */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#0b1320] via-[#0d1726] to-[#0b1320] border border-emerald-500/30 flex items-start sm:items-center gap-3.5 shadow-inner">
          <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
            {currentStep}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Active Step {currentStep} of 9 — {stages[currentStep - 1]?.title}
              </span>
              {isAutoProcessing && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  Auto Advancing...
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">
              {stepExplanations[currentStep] || 'Processing order execution step...'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. 9-Stage Visual Stepper Timeline (Requirement 1: Always visible at all times) */}
      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            9-Stage End-to-End Progress Timeline
          </span>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            {currentStep === 9 ? 'Execution Finalized' : 'Interactive State Machine'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
          {stages.map((stage) => {
            const isDone = stage.isDone;
            const isCurrent = stage.isActive;
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.step}
                onClick={() => setExpandedStageDetail(stage.step)}
                className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400/50'
                    : isCurrent
                      ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30'
                      : 'bg-[#090d16] border-[#1a2233] opacity-60 hover:opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      STEP {stage.step}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isDone
                          ? 'bg-[#22c55e] text-black shadow-sm shadow-[#22c55e]/30'
                          : isCurrent
                            ? 'bg-amber-500 text-black animate-pulse'
                            : 'bg-[#1a2233] text-slate-400'
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : stage.step}
                    </div>
                  </div>

                  <strong className="text-[11px] font-bold text-white block leading-tight">
                    {stage.title}
                  </strong>
                </div>

                <div className="mt-2 pt-1.5 border-t border-[#1a2233] flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold font-mono px-1 py-0.5 rounded ${
                      isDone
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : isCurrent
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-slate-400 bg-[#141b27]'
                    }`}
                  >
                    {isDone ? 'COMPLETED' : isCurrent ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Main Grid: Lifecycle Details & Order Execution Spec */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section A: What Customer Receives (Requirement 4) */}
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  What Customer Receives
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                1 TOKEN = 1 GRAM GOLD
              </span>
            </div>

            {/* Visual Conversion Pathway */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-[#090d16] border border-[#1e293b] flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Customer Purchase
                </span>
                <div className="my-2">
                  <span className="text-xl font-extrabold text-white block">
                    {formattedGrams}g
                  </span>
                  <span className="text-xs text-slate-400">OneX Gold (24K 999.9)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  Locked Spot Rate
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#090d16] border border-emerald-500/20 flex flex-col justify-between relative">
                <div className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#141b27] border border-[#223047] items-center justify-center text-slate-400 z-10">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  OneX Gold Holding
                </span>
                <div className="my-2">
                  <span className="text-xl font-extrabold text-emerald-400 block">
                    {formattedGrams}g
                  </span>
                  <span className="text-xs text-slate-300">Allocated DMCC Vault Custody</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentStep >= 6 ? `Bar #${vaultBarSerial}` : 'Pending Vault Allocation'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#090d16] border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between relative">
                <div className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#141b27] border border-[#223047] items-center justify-center text-slate-400 z-10">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
                  OneX Gold Tokens
                </span>
                <div className="my-2">
                  <span className="text-xl font-extrabold text-white block">
                    {formattedGrams} Tokens
                  </span>
                  <span className="text-xs text-slate-300">1:1 Digital Depository Asset</span>
                </div>
                <span className="text-[10px] font-mono text-[#22c55e]">
                  1 OneX Gold Token = 1 gram OneX Gold
                </span>
              </div>
            </div>
          </div>

          {/* Section B: Clear Liquidity Flow Card (Requirement 3) */}
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Simulated Liquidity Mechanism
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                MOCK PAXG ENGINE
              </span>
            </div>

            {/* Explanation box */}
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-purple-200">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
                <span>OneX is using Mock PAXG Liquidity to simulate the liquidity and execution step for the MVP.</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                PAXG is an <strong>INTERNAL MVP LIQUIDITY MECHANISM</strong> used to simulate real-time institutional gold pricing and fill execution. The customer receives 1:1 physical <strong>OneX Gold</strong> and <strong>OneX Gold Tokens</strong>, not PAXG.
              </p>
            </div>

            {/* Liquidity Execution Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
              <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                <span className="text-slate-400 text-[10px] block">Liquidity Provider</span>
                <strong className="text-white text-xs">Mock PAXG Liquidity</strong>
              </div>

              <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                <span className="text-slate-400 text-[10px] block">Gold Requested</span>
                <strong className="text-emerald-400 text-xs">{formattedGrams}g</strong>
              </div>

              <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                <span className="text-slate-400 text-[10px] block">PAXG Required</span>
                <strong className="text-purple-300 text-xs">{requiredPaxg} PAXG</strong>
              </div>

              <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                <span className="text-slate-400 text-[10px] block">Quote ID</span>
                <strong className="text-slate-200 text-xs truncate block">{quoteId}</strong>
              </div>

              <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                <span className="text-slate-400 text-[10px] block">Execution ID</span>
                <strong className="text-slate-200 text-xs truncate block">
                  {currentStep >= 4 ? executionId : 'PENDING'}
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                <span className="text-slate-400 text-[10px] block">Execution Status</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    currentStep >= 4
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : currentStep === 3
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-[#141b27] text-slate-400'
                  }`}
                >
                  {currentStep >= 4 ? 'FILLED' : currentStep === 3 ? 'QUOTED' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Section C: Expandable 9-Stage Detail Breakdown List */}
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Stage Audit Records & Parameters
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Click any stage to expand parameters
              </span>
            </div>

            <div className="space-y-2.5">
              {stages.map((stage) => {
                const isExpanded = expandedStageDetail === stage.step;
                const isDone = stage.isDone;
                const isCurrent = stage.isActive;
                const StageIcon = stage.icon;

                return (
                  <div
                    key={stage.step}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isDone
                        ? 'bg-[#090d16] border-[#1e293b]'
                        : isCurrent
                          ? 'bg-[#0b1019] border-amber-500/40 ring-1 ring-amber-500/20'
                          : 'bg-[#070a10] border-[#182232] opacity-75'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedStageDetail(isExpanded ? null : stage.step)}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#121927] transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isDone
                              ? 'bg-emerald-500/10 text-[#22c55e] border border-emerald-500/30'
                              : isCurrent
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                                : 'bg-[#162030] text-slate-400 border border-[#223047]'
                          }`}
                        >
                          <StageIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">
                              0{stage.step}.
                            </span>
                            <strong className="text-white text-xs">{stage.title}</strong>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{stage.explanation}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${
                            isDone
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isCurrent
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-[#141b27] text-slate-400 border-[#223047]'
                          }`}
                        >
                          {isDone ? 'COMPLETED' : isCurrent ? 'IN PROGRESS' : 'PENDING'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3.5 bg-[#05080e] border-t border-[#182232] text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-[11px]">
                          <div className="p-2 rounded bg-[#0b1019] border border-[#182232]">
                            <span className="text-slate-400 text-[9px] block">Status</span>
                            <strong className="text-slate-200">
                              {isDone ? 'COMPLETED' : isCurrent ? 'ACTIVE' : 'PENDING'}
                            </strong>
                          </div>
                          <div className="p-2 rounded bg-[#0b1019] border border-[#182232]">
                            <span className="text-slate-400 text-[9px] block">Reference</span>
                            <strong className="text-slate-200 truncate block">{stage.referenceId}</strong>
                          </div>
                          <div className="p-2 rounded bg-[#0b1019] border border-[#182232]">
                            <span className="text-slate-400 text-[9px] block">Amount / Rate</span>
                            <strong className="text-emerald-400 truncate block">{stage.amount}</strong>
                          </div>
                          <div className="p-2 rounded bg-[#0b1019] border border-[#182232]">
                            <span className="text-slate-400 text-[9px] block">Timestamp</span>
                            <strong className="text-slate-200 truncate block">
                              {stage.timestamp !== 'Pending' &&
                              stage.timestamp !== 'Pending Execution' &&
                              stage.timestamp !== 'Pending Purchase' &&
                              stage.timestamp !== 'Pending Allocation' &&
                              stage.timestamp !== 'Pending Balance' &&
                              stage.timestamp !== 'Pending Mint' &&
                              stage.timestamp !== 'Pending Finalization'
                                ? new Date(stage.timestamp).toLocaleTimeString()
                                : stage.timestamp}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section D: Collapsible Technical Details (Requirement 7: Admin / Developer only, collapsed by default) */}
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
            <button
              onClick={() => setIsTechDetailsExpanded(!isTechDetailsExpanded)}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Execution Details
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141b27] text-slate-400 border border-[#223047]">
                  Developer / Admin Only
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{isTechDetailsExpanded ? 'Hide Technical Details' : 'Show Technical Details'}</span>
                {isTechDetailsExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {isTechDetailsExpanded && (
              <div className="pt-3 border-t border-[#1e293b] space-y-3 animate-in fade-in duration-200">
                <p className="text-xs text-slate-400">
                  Raw state transitions and simulated execution keys for internal audit verification:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">Order State</span>
                    <strong className="text-slate-200 text-xs">
                      {currentStep === 9
                        ? 'COMPLETED'
                        : currentStep >= 6
                          ? 'GOLD_ALLOCATED'
                          : currentStep >= 4
                            ? 'LIQUIDITY_FILLED'
                            : currentStep >= 2
                              ? 'PAYMENT_CONFIRMED'
                              : 'DRAFT'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">Payment State</span>
                    <strong className="text-slate-200 text-xs">
                      {currentStep >= 2 ? 'SUCCESS (SETTLED)' : 'PENDING'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">Liquidity State</span>
                    <strong className="text-slate-200 text-xs">
                      {currentStep >= 4 ? 'FILLED' : currentStep >= 3 ? 'QUOTED' : 'PENDING'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">PAXG Quote ID</span>
                    <strong className="text-slate-200 text-xs">{quoteId}</strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">PAXG Execution ID</span>
                    <strong className="text-slate-200 text-xs">
                      {currentStep >= 4 ? executionId : 'PENDING'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">PAXG Requested</span>
                    <strong className="text-slate-200 text-xs">{requiredPaxg} PAXG</strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">PAXG Executed</span>
                    <strong className="text-emerald-400 text-xs">
                      {currentStep >= 4 ? `${requiredPaxg} PAXG` : '0.000000 PAXG'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">Settlement State</span>
                    <strong className="text-slate-200 text-xs">
                      {currentStep >= 2 ? 'SETTLED (AED ESCROW)' : 'PENDING'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">Gold Allocation State</span>
                    <strong className="text-slate-200 text-xs">
                      {currentStep >= 6 ? 'ALLOCATED (DMCC SEGREGATED)' : 'PENDING'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">Holding Update State</span>
                    <strong className="text-slate-200 text-xs">
                      {currentStep >= 7 ? `CREDITED (+${formattedGrams}g)` : 'PENDING'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <span className="text-slate-400 text-[10px] block">Token Update State</span>
                    <strong className="text-slate-200 text-xs">
                      {currentStep >= 8 ? `MINTED (+${formattedGrams} TOKENS)` : 'PENDING'}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Order Execution Spec Card (Requirement 5) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl sticky top-24">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3.5">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Order Execution Spec
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                SPEC CARD
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Customer</span>
                <span className="font-bold text-white">Abhishk (User 001)</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Order ID</span>
                <span className="font-mono text-white font-bold">{order.id}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Gold Requested</span>
                <span className="font-bold text-emerald-400">
                  {formattedGrams}g OneX Gold
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">OneX Gold Tokens</span>
                <span className="font-bold text-white">
                  {formattedGrams} Tokens
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Gold Price</span>
                <span className="font-mono text-slate-200">
                  ${order.quote?.paxgPriceUsd || '3,350'}/oz (AED {order.quote?.pricePerGramAed}/g)
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Total Paid</span>
                <span className="font-bold text-white">AED {order.quote?.totalPayableAed}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">PAXG Required</span>
                <span className="font-mono text-purple-400">{requiredPaxg} PAXG</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Liquidity Provider</span>
                <span className="text-slate-300 text-right font-medium">Mock PAXG Liquidity</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Execution Status</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {getExecutionStatusLabel()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Gold Allocation Status</span>
                <span className="font-mono text-right text-slate-300">
                  {currentStep >= 6 ? `Allocated (Bar #${vaultBarSerial})` : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">OneX Gold Balance</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {currentStep >= 7 ? `+${formattedGrams}g` : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Token Balance</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {currentStep >= 8 ? `+${formattedGrams} Tokens` : 'Pending'}
                </span>
              </div>
            </div>

            {/* Section E: Completion State Summary & Actions (Requirement 10) */}
            {currentStep === 9 && (
              <div className="pt-4 border-t border-emerald-500/30 space-y-4 bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Order Completed</h4>
                    <span className="text-[11px] text-emerald-400 font-mono">Order ID: {order.id}</span>
                  </div>
                </div>

                <div className="bg-[#090d16] p-3 rounded-lg border border-emerald-500/30 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>OneX Gold Holding:</span>
                    <span className="text-emerald-400">{formattedGrams}g</span>
                  </div>
                  <div className="flex justify-between font-bold text-white">
                    <span>OneX Gold Tokens:</span>
                    <span className="text-[#22c55e]">{formattedGrams} Tokens</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1e293b] text-center font-mono">
                    1 Token = 1g OneX Gold
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {onViewMyGold && (
                    <button
                      onClick={onViewMyGold}
                      className="w-full py-3 px-4 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#22c55e]/20 cursor-pointer"
                    >
                      <Coins className="w-4 h-4" />
                      <span>View My Gold</span>
                    </button>
                  )}

                  {onViewPortfolio && (
                    <button
                      onClick={onViewPortfolio}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#141b27] hover:bg-[#1e293b] border border-[#223047] text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>View Portfolio</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Drawer Trigger */}
            <button
              onClick={() => setShowDrawer(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#141b27] hover:bg-[#1c2637] border border-[#223047] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inspect Server Audit Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Slide-Over Execution Details Drawer */}
      <ExecutionDetailsDrawer
        order={order}
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
      />
    </div>
  );
};
