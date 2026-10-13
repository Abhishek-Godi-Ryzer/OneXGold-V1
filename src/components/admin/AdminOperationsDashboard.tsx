/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Package,
  FileText,
  Users,
  LayoutDashboard,
  Layers,
  Coins,
  ShieldCheck,
  UserCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Edit2,
  Eye,
  CheckCircle2,
  Clock,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  AdminOrderSummary,
  LiquidityMetrics,
  VaultInventoryBar,
  ReconciliationReport,
  AuditEvent,
  SimulationConfig,
} from '../../types/domain';
import { store } from '../../lib/store';
import { mockPaxgProvider } from '../../providers/paxg/MockPaxgLiquidityProvider';
import { SpvListView } from './SpvListView';
import { OneXGoldOverview } from './OneXGoldOverview';
import { OneXGoldOrders } from './OneXGoldOrders';
import { OneXGoldLiquidity } from './OneXGoldLiquidity';
import { OneXGoldHoldings } from './OneXGoldHoldings';
import { OneXOrderDetailModal } from './OneXOrderDetailModal';

interface AdminOperationsDashboardProps {
  onBackToApp?: () => void;
}

type AdminNavTab =
  | 'spvs'
  | 'assets'
  | 'orders'
  | 'investors'
  | 'onex-overview'
  | 'onex-orders'
  | 'onex-liquidity'
  | 'onex-holdings'
  | 'roles'
  | 'config';

export const AdminOperationsDashboard: React.FC<AdminOperationsDashboardProps> = ({
  onBackToApp,
}) => {
  const [activeNav, setActiveNav] = useState<AdminNavTab>('onex-overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Live Data States initialized with local store data as immediate fallback
  const [orders, setOrders] = useState<AdminOrderSummary[]>(() => {
    try {
      return store.getAdminOrders();
    } catch {
      return [];
    }
  });
  const [metrics, setMetrics] = useState<LiquidityMetrics | null>(() => {
    try {
      return store.getLiquidityMetrics();
    } catch {
      return null;
    }
  });
  const [inventory, setInventory] = useState<VaultInventoryBar[]>(() => {
    try {
      return store.getVaultInventory();
    } catch {
      return [];
    }
  });
  const [reconciliation, setReconciliation] = useState<ReconciliationReport | null>(() => {
    try {
      return store.getReconciliationReport();
    } catch {
      return null;
    }
  });
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    try {
      return store.auditEvents;
    } catch {
      return [];
    }
  });
  const [simConfig, setSimConfig] = useState<SimulationConfig>(() => {
    try {
      return store.simulationConfig;
    } catch {
      return {
        providerMode: 'MOCK_PAXG',
        liquidityDelayMs: 1200,
        allocationDelayMs: 1500,
        forcePaymentFailure: false,
        forceLiquidityRejection: false,
        forceInsufficientLiquidity: false,
        forceAllocationFailure: false,
      };
    }
  });
  const [currentGoldPriceAed, setCurrentGoldPriceAed] = useState<string>(() => {
    try {
      return store.currentPricePerGramAed;
    } catch {
      return '306.72';
    }
  });
  const [isProviderOffline, setIsProviderOffline] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderSummary | null>(null);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const results = await Promise.allSettled([
        fetch('/api/admin/orders'),
        fetch('/api/admin/liquidity-metrics'),
        fetch('/api/admin/vault-inventory'),
        fetch('/api/admin/reconciliation'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/admin/config'),
        fetch('/api/admin/liquidity-status'),
      ]);

      const [ordRes, metRes, invRes, recRes, audRes, cfgRes, liqRes] = results;

      if (ordRes.status === 'fulfilled' && ordRes.value.ok) {
        setOrders(await ordRes.value.json());
      } else {
        setOrders(store.getAdminOrders());
      }

      if (metRes.status === 'fulfilled' && metRes.value.ok) {
        setMetrics(await metRes.value.json());
      } else {
        setMetrics(store.getLiquidityMetrics());
      }

      if (invRes.status === 'fulfilled' && invRes.value.ok) {
        setInventory(await invRes.value.json());
      } else {
        setInventory(store.getVaultInventory());
      }

      if (recRes.status === 'fulfilled' && recRes.value.ok) {
        setReconciliation(await recRes.value.json());
      } else {
        setReconciliation(store.getReconciliationReport());
      }

      if (audRes.status === 'fulfilled' && audRes.value.ok) {
        setAuditLogs(await audRes.value.json());
      } else {
        setAuditLogs([...store.auditEvents]);
      }

      if (cfgRes.status === 'fulfilled' && cfgRes.value.ok) {
        const c = await cfgRes.value.json();
        if (c.config) setSimConfig(c.config);
        if (c.currentPricePerGramAed) setCurrentGoldPriceAed(c.currentPricePerGramAed);
      } else {
        setSimConfig({ ...store.simulationConfig });
        setCurrentGoldPriceAed(store.currentPricePerGramAed);
      }

      if (liqRes.status === 'fulfilled' && liqRes.value.ok) {
        const l = await liqRes.value.json();
        if (l.balance?.status) {
          setIsProviderOffline(l.balance.status === 'OFFLINE');
        }
      }
    } catch {
      // Safe fallback from local store
      try {
        setOrders(store.getAdminOrders());
        setMetrics(store.getLiquidityMetrics());
        setInventory(store.getVaultInventory());
        setReconciliation(store.getReconciliationReport());
        setAuditLogs([...store.auditEvents]);
        setSimConfig({ ...store.simulationConfig });
        setCurrentGoldPriceAed(store.currentPricePerGramAed);
      } catch {
        // Safe no-op
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 8000);
    return () => clearInterval(timer);
  }, []);

  // Operations actions
  const handleAddLiquidity = async (amount: string) => {
    try {
      const res = await fetch('/api/admin/liquidity/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        throw new Error('Failed to add mock liquidity via API.');
      }
    } catch {
      // Local fallback
      mockPaxgProvider.addMockLiquidity(amount);
      store.recordAuditEvent({
        orderId: 'SYS-OPS-LIQUIDITY',
        userId: 'OPS-ADMIN',
        eventType: 'PAXG_ORDER_FILLED',
        status: 'LIQUIDITY_ADJUSTED',
        referenceId: `ADJ-${Date.now()}`,
        actor: 'ADMIN',
        metadata: { action: 'ADD_MOCK_PAXG', amount },
      });
    }
    await fetchData();
  };

  const handleResetLiquidity = async () => {
    try {
      const res = await fetch('/api/admin/liquidity/reset', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to reset liquidity via API.');
      }
    } catch {
      mockPaxgProvider.resetLiquidity();
      store.recordAuditEvent({
        orderId: 'SYS-OPS-LIQUIDITY',
        userId: 'OPS-ADMIN',
        eventType: 'PAXG_ORDER_FILLED',
        status: 'LIQUIDITY_RESET',
        referenceId: `RST-${Date.now()}`,
        actor: 'ADMIN',
        metadata: { action: 'RESET_MOCK_LIQUIDITY', newBalance: '100.000000' },
      });
    }
    await fetchData();
  };

  const handleToggleOffline = async () => {
    try {
      const res = await fetch('/api/admin/liquidity/toggle-offline', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsProviderOffline(data.isOffline);
      } else {
        const offline = mockPaxgProvider.toggleOffline();
        setIsProviderOffline(offline);
      }
    } catch {
      const offline = mockPaxgProvider.toggleOffline();
      setIsProviderOffline(offline);
    }
    await fetchData();
  };

  const handleUpdatePrice = async (newPriceAed: string) => {
    try {
      const res = await fetch('/api/admin/liquidity/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricePerGramAed: newPriceAed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pricePerGramAed) setCurrentGoldPriceAed(data.pricePerGramAed);
      } else {
        store.currentPricePerGramAed = Number(newPriceAed).toFixed(2);
        const calculatedUsd = (Number(newPriceAed) / 3.6725 * 31.1034768).toFixed(2);
        mockPaxgProvider.setMockPrice(calculatedUsd);
        setCurrentGoldPriceAed(store.currentPricePerGramAed);
      }
    } catch {
      store.currentPricePerGramAed = Number(newPriceAed).toFixed(2);
      const calculatedUsd = (Number(newPriceAed) / 3.6725 * 31.1034768).toFixed(2);
      mockPaxgProvider.setMockPrice(calculatedUsd);
      setCurrentGoldPriceAed(store.currentPricePerGramAed);
    }
    await fetchData();
  };

  const handleUpdateSimulationMode = async (mode: string) => {
    const payload: any = {
      paxgFailureMode: mode,
      forceLiquidityRejection: mode === 'REJECTED',
      forceInsufficientLiquidity: mode === 'INSUFFICIENT_LIQUIDITY',
    };
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Config update failed');
      }
    } catch {
      store.simulationConfig.paxgFailureMode = mode as any;
      store.simulationConfig.forceLiquidityRejection = mode === 'REJECTED';
      store.simulationConfig.forceInsufficientLiquidity = mode === 'INSUFFICIENT_LIQUIDITY';
    }
    await fetchData();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex">
      {/* ========================================================================= */}
      {/* 1. EXISTING ADMIN SIDEBAR (Section 1 Requirements) */}
      {/* ========================================================================= */}
      <aside
        className={`bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between transition-all duration-200 z-20 ${
          isSidebarCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#5046e5] text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                1X
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <h1 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                    OneX Admin
                  </h1>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Operations Desk
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {/* Top Core Sections (Preserved exactly as in existing Admin UI) */}
            <button
              onClick={() => setActiveNav('spvs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeNav === 'spvs'
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building2 className={`w-4 h-4 shrink-0 ${activeNav === 'spvs' ? 'text-slate-900' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>SPVs</span>}
            </button>

            <button
              onClick={() => setActiveNav('assets')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeNav === 'assets'
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Package className={`w-4 h-4 shrink-0 ${activeNav === 'assets' ? 'text-slate-900' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Assets</span>}
            </button>

            <button
              onClick={() => setActiveNav('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeNav === 'orders'
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className={`w-4 h-4 shrink-0 ${activeNav === 'orders' ? 'text-slate-900' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Orders</span>}
            </button>

            <button
              onClick={() => setActiveNav('investors')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeNav === 'investors'
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className={`w-4 h-4 shrink-0 ${activeNav === 'investors' ? 'text-slate-900' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Investors</span>}
            </button>

            {/* ONE X GOLD SECTION (Section 1 Requirements) */}
            <div className="pt-5 pb-1">
              {!isSidebarCollapsed ? (
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  ONE X GOLD
                </div>
              ) : (
                <div className="h-px bg-slate-200 my-2" />
              )}
            </div>

            {/* Overview */}
            <button
              onClick={() => setActiveNav('onex-overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeNav === 'onex-overview'
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeNav === 'onex-overview' ? 'text-indigo-600' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Overview</span>}
            </button>

            {/* Orders */}
            <button
              onClick={() => setActiveNav('onex-orders')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeNav === 'onex-orders'
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className={`w-4 h-4 shrink-0 ${activeNav === 'onex-orders' ? 'text-indigo-600' : 'text-slate-500'}`} />
                {!isSidebarCollapsed && <span>Orders</span>}
              </div>
              {!isSidebarCollapsed && orders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 text-slate-700 font-semibold">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Liquidity */}
            <button
              onClick={() => setActiveNav('onex-liquidity')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeNav === 'onex-liquidity'
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Coins className={`w-4 h-4 shrink-0 ${activeNav === 'onex-liquidity' ? 'text-indigo-600' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Liquidity</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isProviderOffline ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
              )}
            </button>

            {/* Holdings */}
            <button
              onClick={() => setActiveNav('onex-holdings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeNav === 'onex-holdings'
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 shrink-0 ${activeNav === 'onex-holdings' ? 'text-indigo-600' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Holdings</span>}
            </button>

            {/* Admin Management Section */}
            <div className="pt-5 pb-1">
              {!isSidebarCollapsed ? (
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  SYSTEM
                </div>
              ) : (
                <div className="h-px bg-slate-200 my-2" />
              )}
            </div>

            <button
              onClick={() => setActiveNav('roles')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeNav === 'roles'
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <UserCheck className={`w-4 h-4 shrink-0 ${activeNav === 'roles' ? 'text-slate-900' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Role Management</span>}
            </button>

            <button
              onClick={() => setActiveNav('config')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeNav === 'config'
                  ? 'bg-slate-100 font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className={`w-4 h-4 shrink-0 ${activeNav === 'config' ? 'text-slate-900' : 'text-slate-500'}`} />
              {!isSidebarCollapsed && <span>Configuration</span>}
            </button>
          </nav>

          {/* Bottom Controls: Logout & Collapse */}
          <div className="p-3 border-t border-slate-100 space-y-1">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Exit Admin & Return to Customer App"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Logout</span>}
              </button>
            )}

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 mx-auto" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN ADMIN CONTENT WORKSPACE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              {activeNav === 'spvs' && 'Special Purpose Vehicles'}
              {activeNav === 'assets' && 'Institutional Asset Inventory'}
              {activeNav === 'orders' && 'Platform Orders'}
              {activeNav === 'investors' && 'Investor Directory'}
              {activeNav === 'onex-overview' && 'OneX Gold Operations Overview'}
              {activeNav === 'onex-orders' && 'OneX Gold Orders'}
              {activeNav === 'onex-liquidity' && 'Gold Liquidity & Execution Desk'}
              {activeNav === 'onex-holdings' && 'OneX Gold Customer Holdings'}
              {activeNav === 'roles' && 'Role & Access Management'}
              {activeNav === 'config' && 'Platform Configuration'}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              LIVE OPS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer"
              title="Sync Live Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5046e5] hover:bg-[#4338ca] text-white font-semibold text-xs transition cursor-pointer shadow-xs"
              >
                <span>Customer App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 sm:p-8 max-w-7xl w-full">
          {/* View 1: SPVs (Matches Screenshot 100%) */}
          {activeNav === 'spvs' && <SpvListView />}

          {/* View 2: Assets */}
          {activeNav === 'assets' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h2 className="text-base font-bold text-slate-900">Institutional Assets</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tokenized real estate SPVs and physical gold vault inventory registered on the OneX institutional platform.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Commodity Asset</span>
                  <h3 className="text-sm font-bold text-slate-900">24K Physical Bullion (DMCC)</h3>
                  <div className="text-xs text-slate-600">Custody: TransGuard Vault, Dubai</div>
                  <div className="font-mono text-emerald-700 font-bold text-sm">120.00g Allocated</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Real Estate SPV</span>
                  <h3 className="text-sm font-bold text-slate-900">InfinityAssets Commercial SPV</h3>
                  <div className="text-xs text-slate-600">Location: Business Bay, Dubai</div>
                  <div className="font-mono text-indigo-700 font-bold text-sm">AED 720,000 AUM</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Real Estate SPV</span>
                  <h3 className="text-sm font-bold text-slate-900">Palm Crest Residences SPV</h3>
                  <div className="text-xs text-slate-600">Location: Dubai Marina</div>
                  <div className="font-mono text-indigo-700 font-bold text-sm">AED 420,000 AUM</div>
                </div>
              </div>
            </div>
          )}

          {/* View 3: Orders (Standard Platform Orders) */}
          {activeNav === 'orders' && (
            <div className="space-y-4">
              <OneXGoldOrders
                orders={orders}
                onSelectOrder={(ord) => setSelectedOrder(ord)}
                onRefresh={fetchData}
                isRefreshing={isRefreshing}
              />
            </div>
          )}

          {/* View 4: Investors */}
          {activeNav === 'investors' && (
            <div className="space-y-4">
              <OneXGoldHoldings
                orders={orders}
                onSelectOrder={(ord) => setSelectedOrder(ord)}
              />
            </div>
          )}

          {/* View 5: ONE X GOLD -> OVERVIEW */}
          {activeNav === 'onex-overview' && (
            <OneXGoldOverview
              orders={orders}
              metrics={metrics}
              currentGoldPriceAed={currentGoldPriceAed}
              isProviderOffline={isProviderOffline}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onNavigateToTab={(tab) => setActiveNav(tab as AdminNavTab)}
            />
          )}

          {/* View 6: ONE X GOLD -> ORDERS */}
          {activeNav === 'onex-orders' && (
            <OneXGoldOrders
              orders={orders}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onRefresh={fetchData}
              isRefreshing={isRefreshing}
            />
          )}

          {/* View 7: ONE X GOLD -> LIQUIDITY */}
          {activeNav === 'onex-liquidity' && (
            <OneXGoldLiquidity
              metrics={metrics}
              simConfig={simConfig}
              currentGoldPriceAed={currentGoldPriceAed}
              isProviderOffline={isProviderOffline}
              auditLogs={auditLogs}
              onAddLiquidity={handleAddLiquidity}
              onResetLiquidity={handleResetLiquidity}
              onToggleOffline={handleToggleOffline}
              onUpdatePrice={handleUpdatePrice}
              onUpdateSimulationMode={handleUpdateSimulationMode}
              onRefresh={fetchData}
              isRefreshing={isRefreshing}
            />
          )}

          {/* View 8: ONE X GOLD -> HOLDINGS */}
          {activeNav === 'onex-holdings' && (
            <OneXGoldHoldings
              orders={orders}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
            />
          )}

          {/* View 9: Role Management */}
          {activeNav === 'roles' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h2 className="text-base font-bold text-slate-900">Role & Access Management</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage institutional permissions, dual-custody authorization keys, and compliance audit roles.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Assigned Operators</th>
                      <th className="py-3 px-4">Permissions</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">Operations Desk Admin</td>
                      <td className="py-3 px-4">ops-admin@onex.investments</td>
                      <td className="py-3 px-4">Liquidity injection, Spot rate adjustments, Order re-execution</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">Vault Depository Auditor</td>
                      <td className="py-3 px-4">auditor@dmcc.ae</td>
                      <td className="py-3 px-4">DMCC physical inventory reconciliation & bar certificate sign-off</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View 10: Configuration */}
          {activeNav === 'config' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
                <h2 className="text-base font-bold text-slate-900">Platform Configuration</h2>
                <p className="text-xs text-slate-500">
                  Global parameters for OneX institutional tokenization, custody fees, and DMCC vault endpoints.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Default Custody Depository:</span>
                    <strong className="text-slate-800">TransGuard DMCC Dubai Vault (UAE)</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Peg Currency:</span>
                    <strong className="text-slate-800">AED (3.6725 USD Fixed Peg)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detailed Order Trace Modal */}
      {selectedOrder && (
        <OneXOrderDetailModal
          order={selectedOrder}
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
