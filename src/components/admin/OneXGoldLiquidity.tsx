/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Coins,
  Activity,
  Plus,
  RotateCcw,
  Power,
  Edit2,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  Info,
  RefreshCw,
} from 'lucide-react';
import { LiquidityMetrics, SimulationConfig, AuditEvent } from '../../types/domain';

interface OneXGoldLiquidityProps {
  metrics: LiquidityMetrics | null;
  simConfig: SimulationConfig;
  currentGoldPriceAed: string;
  isProviderOffline: boolean;
  auditLogs: AuditEvent[];
  onAddLiquidity: (amount: string) => Promise<void>;
  onResetLiquidity: () => Promise<void>;
  onToggleOffline: () => Promise<void>;
  onUpdatePrice: (newPriceAed: string) => Promise<void>;
  onUpdateSimulationMode: (mode: string) => Promise<void>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const OneXGoldLiquidity: React.FC<OneXGoldLiquidityProps> = ({
  metrics,
  simConfig,
  currentGoldPriceAed,
  isProviderOffline,
  auditLogs,
  onAddLiquidity,
  onResetLiquidity,
  onToggleOffline,
  onUpdatePrice,
  onUpdateSimulationMode,
  onRefresh,
  isRefreshing,
}) => {
  const [addAmount, setAddAmount] = useState<string>('50');
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPrice, setEditedPrice] = useState(currentGoldPriceAed);
  const [activeSimulationMode, setActiveSimulationMode] = useState<string>(
    simConfig.paxgFailureMode || (simConfig.forceLiquidityRejection ? 'REJECTED' : 'SUCCESS')
  );
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const availablePaxg = metrics?.availablePaxg || '100.000000';
  const usedPaxg = metrics?.usedPaxg || '12.450000';
  const totalPaxg = (Number(availablePaxg) + Number(usedPaxg)).toFixed(6);

  const showNotice = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAddSubmit = async (amt: string) => {
    if (!amt || Number(amt) <= 0) return;
    setIsSubmittingAdd(true);
    try {
      await onAddLiquidity(amt);
      showNotice(`Successfully injected ${amt} Mock PAXG into liquidity pool.`);
    } catch (e: any) {
      showNotice(e.message || 'Failed to add liquidity', 'error');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleSavePrice = async () => {
    if (!editedPrice || Number(editedPrice) <= 0) return;
    try {
      await onUpdatePrice(editedPrice);
      setIsEditingPrice(false);
      showNotice(`Mock Gold Price updated to AED ${editedPrice} / g.`);
    } catch (e: any) {
      showNotice(e.message || 'Failed to update price', 'error');
    }
  };

  const handleSetSimulationMode = async (mode: string) => {
    setActiveSimulationMode(mode);
    try {
      await onUpdateSimulationMode(mode);
      showNotice(`Simulation mode switched to: ${mode}`);
    } catch (e: any) {
      showNotice(e.message || 'Failed to update simulation mode', 'error');
    }
  };

  // Filter or construct clean liquidity activity records
  const liquidityActivities = [
    {
      time: '14:32',
      order: 'ORD-418',
      activity: 'Quote Execution',
      paxgAmount: '0.321507 PAXG',
      status: 'FILLED',
    },
    {
      time: '14:28',
      order: 'ORD-415',
      activity: 'Quote Locked',
      paxgAmount: '0.032151 PAXG',
      status: 'FILLED',
    },
    {
      time: '14:15',
      order: 'ORD-308',
      activity: 'Quote Execution',
      paxgAmount: '0.160754 PAXG',
      status: 'FILLED',
    },
    {
      time: '14:02',
      order: 'ORD-301',
      activity: 'Liquidity Pool Reserve',
      paxgAmount: '0.160754 PAXG',
      status: 'FILLED',
    },
    {
      time: '13:45',
      order: 'SYS-OPS-ADJ',
      activity: 'Mock Liquidity Add',
      paxgAmount: '+50.000000 PAXG',
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Toast Notice */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition animate-in fade-in ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : actionNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {actionNotice.type === 'error' && <XCircle className="w-4 h-4 text-rose-600" />}
            {actionNotice.type === 'info' && <Info className="w-4 h-4 text-indigo-600" />}
            <span>{actionNotice.text}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Header Banner (Section 5 Requirements) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900">Gold Liquidity</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                Phase 1 MVP
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Liquidity Provider: <strong className="text-slate-800 font-semibold">Mock PAXG Liquidity</strong> •
              Status: <span className={isProviderOffline ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {isProviderOffline ? '● OFFLINE' : '● ONLINE'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
                <span>Sync Desk</span>
              </button>
            )}
          </div>
        </div>

        {/* Phase 1 MVP Explanation Banner */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            <strong>Operational Context:</strong> Mock PAXG Liquidity is used to simulate the liquidity and execution step during the OneX Gold MVP. It models instant institutional fills and spot conversions before gold is segregated in the DMCC vault.
          </span>
        </div>
      </div>

      {/* Mock PAXG Liquidity Balance & Controls (Sections 6, 7, 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Balance & Add Liquidity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Mock PAXG Liquidity Balance
            </h3>
            <button
              onClick={onResetLiquidity}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              title="Reset to 100 PAXG"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Available</span>
              <strong className="text-xs font-mono font-bold text-emerald-700 mt-0.5 block truncate">
                {availablePaxg}
              </strong>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Used</span>
              <strong className="text-xs font-mono font-bold text-slate-700 mt-0.5 block truncate">
                {usedPaxg}
              </strong>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Total Pool</span>
              <strong className="text-xs font-mono font-bold text-indigo-900 mt-0.5 block truncate">
                {totalPaxg}
              </strong>
            </div>
          </div>

          {/* Add Mock Liquidity */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">
              Add Mock Liquidity (PAXG)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleAddSubmit(addAmount)}
                disabled={isSubmittingAdd}
                className="px-3.5 py-1.5 rounded-lg bg-[#5046e5] hover:bg-[#4338ca] text-white font-semibold text-xs transition cursor-pointer whitespace-nowrap"
              >
                Add Liquidity
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              {['10', '50', '100'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAddSubmit(amt)}
                  className="flex-1 py-1 px-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-semibold transition cursor-pointer"
                >
                  +{amt} PAXG
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Provider Status & Mock Gold Price (Sections 7 & 8) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Provider Status & Connectivity
              </h3>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Provider Status:</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isProviderOffline ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                  <strong
                    className={`text-sm font-bold font-mono ${
                      isProviderOffline ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {isProviderOffline ? 'OFFLINE' : 'ONLINE'}
                  </strong>
                </div>
              </div>

              <button
                onClick={onToggleOffline}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isProviderOffline
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {isProviderOffline ? 'Set Online' : 'Set Offline'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              If the provider is offline and a new order requires liquidity, the order will fail or remain in pending state.
            </p>
          </div>

          {/* Mock Gold Price Editor (Section 8) */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Mock Gold Price</span>
              {!isEditingPrice && (
                <button
                  onClick={() => setIsEditingPrice(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Price</span>
                </button>
              )}
            </div>

            {isEditingPrice ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSavePrice}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingPrice(false);
                    setEditedPrice(currentGoldPriceAed);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-baseline justify-between font-mono">
                <span className="text-sm font-bold text-slate-900">
                  AED {currentGoldPriceAed} / g
                </span>
                <span className="text-[11px] text-slate-500">
                  ~${(Number(currentGoldPriceAed) / 3.6725 * 31.1034768).toFixed(2)}/oz
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Simulation Controls (Section 9) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Liquidity Simulation Controls
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Simulate success and failure scenarios for operator verification.
            </p>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'SUCCESS',
                label: 'Execute Successfully',
                desc: 'Normal flow: liquidity execution succeeds and order completes',
                color: 'emerald',
              },
              {
                id: 'PARTIAL_FILL',
                label: 'Partial Fill',
                desc: 'Simulate 50% partial execution fill',
                color: 'blue',
              },
              {
                id: 'REJECTED',
                label: 'Reject',
                desc: 'Liquidity execution is rejected by upstream engine',
                color: 'rose',
              },
              {
                id: 'TIMEOUT',
                label: 'Timeout',
                desc: 'Liquidity request remains pending / times out',
                color: 'amber',
              },
              {
                id: 'QUOTE_EXPIRED',
                label: 'Quote Expired',
                desc: 'Quote expires and order requires a fresh quote',
                color: 'purple',
              },
            ].map((sim) => {
              const isActive = activeSimulationMode === sim.id;
              return (
                <button
                  key={sim.id}
                  onClick={() => handleSetSimulationMode(sim.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5">
                    {isActive ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">
                      {sim.label}
                    </strong>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      {sim.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Liquidity Activity Table (Section 10 Requirements) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Recent Liquidity Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live quote executions, fills, and liquidity adjustments.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">PAXG Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {liquidityActivities.map((act, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {act.time}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {act.order}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {act.activity}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-purple-700">
                    {act.paxgAmount}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
