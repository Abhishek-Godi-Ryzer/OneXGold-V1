/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  ShieldCheck,
  Layers,
  Activity,
  AlertTriangle,
  RefreshCw,
  Clock,
  Terminal,
  Database,
  CheckCircle2,
  XCircle,
  FileCode,
  DollarSign,
} from 'lucide-react';
import { AuditEvent, SimulationConfig } from '../types/domain';

interface AdminOpsConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminOpsConsole: React.FC<AdminOpsConsoleProps> = ({ isOpen, onClose }) => {
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [liquidityStatus, setLiquidityStatus] = useState<any>(null);
  const [config, setConfig] = useState<SimulationConfig>({
    providerMode: 'MOCK_PAXG',
    liquidityDelayMs: 1200,
    allocationDelayMs: 1500,
    forcePaymentFailure: false,
    forceLiquidityRejection: false,
    forceInsufficientLiquidity: false,
    forceAllocationFailure: false,
  });
  const [spotPrice, setSpotPrice] = useState<string>('306.72');
  const [filterEventType, setFilterEventType] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'LIQUIDITY' | 'SIMULATION'>('AUDIT');

  const fetchData = async () => {
    try {
      const [logsRes, liqRes, cfgRes] = await Promise.all([
        fetch('/api/admin/audit-logs'),
        fetch('/api/admin/liquidity-status'),
        fetch('/api/admin/config'),
      ]);

      if (logsRes.ok) setAuditLogs(await logsRes.json());
      if (liqRes.ok) setLiquidityStatus(await liqRes.json());
      if (cfgRes.ok) {
        const data = await cfgRes.json();
        setConfig(data.config);
        setSpotPrice(data.currentPricePerGramAed);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const updateConfig = async (newConfig: Partial<SimulationConfig>, newPrice?: string) => {
    try {
      const payload: any = { ...newConfig };
      if (newPrice) payload.currentPricePerGramAed = newPrice;

      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        if (data.currentPricePerGramAed) setSpotPrice(data.currentPricePerGramAed);
      }
    } catch {
      // Ignored
    }
  };

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    if (filterEventType === 'ALL') return true;
    return log.eventType.includes(filterEventType);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0f17] border border-[#223047] rounded-2xl max-w-5xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-[#1e293b] flex items-center justify-between bg-[#0e1422]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#22c55e]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">OneX Ops & Liquidity Inspector</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Sandbox Controls
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audit event streaming, PAXG provider swap, and failure injection testing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-[#141b27] border border-[#223047] text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#141b27] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer border border-[#223047]"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center px-6 border-b border-[#1e293b] bg-[#0b0f17] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'AUDIT'
                ? 'border-[#22c55e] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Audit Events Trail ({auditLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('LIQUIDITY')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'LIQUIDITY'
                ? 'border-[#22c55e] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            PAXG Liquidity Engine
          </button>

          <button
            onClick={() => setActiveTab('SIMULATION')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'SIMULATION'
                ? 'border-[#22c55e] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Failure & Latency Simulator
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#090d14] space-y-6">
          {/* TAB 1: AUDIT EVENTS */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Immutable state machine events recorded with actor provenance:
                </span>

                <div className="flex items-center gap-1.5 text-[11px]">
                  {['ALL', 'QUOTE', 'PAYMENT', 'PAXG', 'ALLOCATION', 'DOCUMENT', 'ORDER'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterEventType(filter)}
                      className={`px-2.5 py-1 rounded transition cursor-pointer ${
                        filterEventType === filter
                          ? 'bg-[#22c55e] text-black font-bold'
                          : 'bg-[#141b27] text-slate-400 hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredLogs.map((log) => (
                  <div
                    key={log.eventId}
                    className="p-3.5 rounded-xl bg-[#0f1520] border border-[#1e293b] text-xs space-y-2 font-mono"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#22c55e] font-bold text-[10px]">
                          {log.eventType}
                        </span>
                        <span className="text-slate-200 font-semibold">{log.orderId}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 text-[11px]">Actor: {log.actor}</span>
                      </div>

                      <span className="text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-[#090d14] p-2.5 rounded-lg border border-[#182232] overflow-x-auto">
                      <span className="text-slate-500">Metadata: </span>
                      {JSON.stringify(log.metadata)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PAXG LIQUIDITY INSPECTOR */}
          {activeTab === 'LIQUIDITY' && (
            <div className="space-y-6">
              {/* Provider Selector */}
              <div className="p-5 rounded-2xl bg-[#0f1520] border border-[#1e293b] space-y-4">
                <h3 className="text-sm font-bold text-white">Active PAXG Liquidity Adapter</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => updateConfig({ providerMode: 'MOCK_PAXG' })}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                      config.providerMode === 'MOCK_PAXG'
                        ? 'bg-[#162232] border-[#22c55e] ring-1 ring-[#22c55e]/30'
                        : 'bg-[#141b27] border-[#223047]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-white text-xs">MOCK_PAXG_LIQUIDITY_ENGINE</strong>
                      {config.providerMode === 'MOCK_PAXG' && (
                        <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      In-memory simulated order book, real-time balance tracking, and configurable slippage.
                    </p>
                  </button>

                  <button
                    onClick={() => updateConfig({ providerMode: 'PAXOS_SANDBOX' })}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                      config.providerMode === 'PAXOS_SANDBOX'
                        ? 'bg-[#162232] border-[#22c55e] ring-1 ring-[#22c55e]/30'
                        : 'bg-[#141b27] border-[#223047]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-white text-xs">PAXOS_SANDBOX_PAXG_ADAPTER</strong>
                      {config.providerMode === 'PAXOS_SANDBOX' && (
                        <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Paxos Sandbox connector (api.sandbox.paxos.com/v2).
                    </p>
                    {config.providerMode === 'PAXOS_SANDBOX' && (
                      <p className="text-[10px] text-amber-400/90 mt-1 font-mono">
                        {liquidityStatus?.paxosConfigured
                          ? '✓ Paxos Sandbox credentials active'
                          : 'Sandbox liquidity provider not configured (graceful mock fallback active)'}
                      </p>
                    )}
                  </button>
                </div>
              </div>

              {/* Balance & Pool Stats */}
              {liquidityStatus?.balance && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#0f1520] border border-[#1e293b]">
                    <span className="text-slate-400 block text-[11px]">Available PAXG Pool</span>
                    <strong className="text-lg text-white font-mono">{liquidityStatus.balance.availablePaxg}</strong>
                    <span className="text-[10px] text-slate-500 block">Fine Troy Ounces</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0f1520] border border-[#1e293b]">
                    <span className="text-slate-400 block text-[11px]">Equivalent Physical Gold</span>
                    <strong className="text-lg text-[#22c55e] font-mono">
                      {liquidityStatus.balance.equivalentGoldGrams}g
                    </strong>
                    <span className="text-[10px] text-slate-500 block">24K Bullion</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0f1520] border border-[#1e293b]">
                    <span className="text-slate-400 block text-[11px]">Locked / Allocated</span>
                    <strong className="text-lg text-amber-300 font-mono">{liquidityStatus.balance.lockedPaxg}</strong>
                    <span className="text-[10px] text-slate-500 block">Troy Ounces</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0f1520] border border-[#1e293b]">
                    <span className="text-slate-400 block text-[11px]">Health Status</span>
                    <strong className="text-lg text-emerald-400">{liquidityStatus.balance.status}</strong>
                    <span className="text-[10px] text-slate-500 block">Sub-second execution</span>
                  </div>
                </div>
              )}

              {/* Troy Ounce Formula Reference */}
              <div className="p-4 rounded-xl bg-[#0f1520] border border-[#1e293b] text-xs text-slate-300 space-y-1 font-mono">
                <p className="font-bold text-white">Financial & Conversion Constants:</p>
                <p>• 1 Fine Troy Ounce = 31.1034768 Grams (Standard ISO 4217 XAU)</p>
                <p>• 1 PAXG Token = 1 Fine Troy Ounce of Gold</p>
                <p>• 1 OneX Gold Token = 1.0000 Grams 24K Gold = 0.03215074 PAXG</p>
              </div>
            </div>
          )}

          {/* TAB 3: FAILURE & RESILIENCE SIMULATOR */}
          {activeTab === 'SIMULATION' && (
            <div className="space-y-6">
              {/* Spot Price Override */}
              <div className="p-5 rounded-2xl bg-[#0f1520] border border-[#1e293b] space-y-3">
                <h3 className="text-sm font-bold text-white">Live Gold Spot Price Simulator (AED / g)</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.10"
                    value={spotPrice}
                    onChange={(e) => setSpotPrice(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-[#141b27] border border-[#223047] text-white text-sm focus:outline-none focus:border-[#22c55e] w-48 font-mono"
                  />
                  <button
                    onClick={() => updateConfig({}, spotPrice)}
                    className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs cursor-pointer"
                  >
                    Apply Price Update
                  </button>
                </div>
              </div>

              {/* Latency Slider */}
              <div className="p-5 rounded-2xl bg-[#0f1520] border border-[#1e293b] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-bold text-white">Simulated Pipeline Latency</h3>
                  <span className="font-mono text-emerald-400">{config.liquidityDelayMs} ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4000"
                  step="200"
                  value={config.liquidityDelayMs}
                  onChange={(e) => updateConfig({ liquidityDelayMs: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-[#22c55e]"
                />
              </div>

              {/* Failure Toggles */}
              <div className="p-5 rounded-2xl bg-[#0f1520] border border-[#1e293b] space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  PAXG Liquidity & Lifecycle Failure Injection
                </h3>

                {/* Dropdown for explicit PAXG Failure Modes */}
                <div className="p-3.5 rounded-xl bg-[#141b27] border border-[#223047] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-white text-xs block">PAXG Liquidity Failure Mode</strong>
                      <span className="text-[11px] text-slate-400">
                        Select specific failure scenario specified in PAXG Liquidity spec
                      </span>
                    </div>
                    <select
                      value={config.paxgFailureMode || 'NONE'}
                      onChange={(e) => updateConfig({ paxgFailureMode: e.target.value as any })}
                      className="px-3 py-1.5 rounded-lg bg-[#0a0f18] border border-[#223047] text-xs text-emerald-400 font-mono focus:border-emerald-500 outline-none cursor-pointer"
                    >
                      <option value="NONE">NONE (Normal Full Fill)</option>
                      <option value="QUOTE_EXPIRED">QUOTE_EXPIRED (Quote validity &gt; 30s)</option>
                      <option value="INSUFFICIENT_LIQUIDITY">INSUFFICIENT_LIQUIDITY (Order exceeds pool)</option>
                      <option value="EXECUTION_REJECTED">EXECUTION_REJECTED (Market price slippage)</option>
                      <option value="PARTIAL_FILL">PARTIAL_FILL (50% filled)</option>
                      <option value="EXECUTION_TIMEOUT">EXECUTION_TIMEOUT (Provider timeout &gt; 5000ms)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Force Payment Failure */}
                  <label className="p-3.5 rounded-xl bg-[#141b27] border border-[#223047] flex items-center justify-between cursor-pointer hover:border-slate-500">
                    <div>
                      <strong className="text-white block">Force Payment Decline</strong>
                      <span className="text-[11px] text-slate-400">Simulate card/UPI decline error</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.forcePaymentFailure}
                      onChange={(e) => updateConfig({ forcePaymentFailure: e.target.checked })}
                      className="w-4 h-4 rounded text-red-500 focus:ring-0 accent-red-500 cursor-pointer"
                    />
                  </label>

                  {/* Force Allocation Failure */}
                  <label className="p-3.5 rounded-xl bg-[#141b27] border border-[#223047] flex items-center justify-between cursor-pointer hover:border-slate-500">
                    <div>
                      <strong className="text-white block">Force Vault Bar Allocation Error</strong>
                      <span className="text-[11px] text-slate-400">Simulate DMCC depository timeout</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.forceAllocationFailure}
                      onChange={(e) => updateConfig({ forceAllocationFailure: e.target.checked })}
                      className="w-4 h-4 rounded text-red-500 focus:ring-0 accent-red-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
