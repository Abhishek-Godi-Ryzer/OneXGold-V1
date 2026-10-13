/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Sliders, RefreshCw, Layers } from 'lucide-react';
import { SimulationConfig } from '../types/domain';

interface SimulationBannerProps {
  config: SimulationConfig;
  onOpenAdmin: () => void;
}

export const SimulationBanner: React.FC<SimulationBannerProps> = ({ config, onOpenAdmin }) => {
  return (
    <div className="bg-[#0f172a] border-b border-emerald-500/20 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400">OneX Gold Prototype Sandbox</span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Liquidity Source: <strong className="text-slate-200">{config.providerMode === 'PAXOS_SANDBOX' ? 'Paxos Sandbox Adapter' : 'PAXG Mock Provider'}</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 hidden sm:inline">1 Gold Token = 1g 24K Gold (0.032151 PAXG)</span>
        </div>

        <div className="flex items-center gap-3">
          {(config.forcePaymentFailure || config.forceLiquidityRejection || config.forceInsufficientLiquidity || config.forceAllocationFailure) && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium animate-pulse">
              Simulated Failure Armed
            </span>
          )}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Sliders className="w-3 h-3 text-emerald-400" />
            <span>Ops & Liquidity Inspector</span>
          </button>
        </div>
      </div>
    </div>
  );
};
