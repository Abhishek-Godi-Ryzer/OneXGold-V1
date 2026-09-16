/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronRight,
  TrendingUp,
  Coins,
  Building,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { formatCurrencyAed } from '../lib/decimal';

interface OtcOrder {
  id: string;
  assetType: 'GOLD' | 'REAL_ESTATE';
  title: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  priceAed: string;
  quantity: string;
  unit: string;
  totalAed: string;
  seller: string;
  createdAt: string;
}

interface OtcMarketProps {
  currentSpotPrice: string;
  onNavigateToGold: () => void;
}

export const OtcMarket: React.FC<OtcMarketProps> = ({ currentSpotPrice, onNavigateToGold }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'GOLD' | 'REAL_ESTATE'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  const [orders, setOrders] = useState<OtcOrder[]>([
    {
      id: 'OTC-7721',
      assetType: 'GOLD',
      title: 'OneX Gold (24K 999.9)',
      symbol: 'ONEX-GLD-1G',
      type: 'SELL',
      priceAed: '305.90',
      quantity: '10.00',
      unit: 'Grams',
      totalAed: '3,059.00',
      seller: 'Investor #8821 (Tier 2)',
      createdAt: '2 mins ago',
    },
    {
      id: 'OTC-7720',
      assetType: 'GOLD',
      title: 'OneX Gold (24K 999.9)',
      symbol: 'ONEX-GLD-1G',
      type: 'SELL',
      priceAed: '306.10',
      quantity: '25.00',
      unit: 'Grams',
      totalAed: '7,652.50',
      seller: 'Institutional Desk DXB',
      createdAt: '14 mins ago',
    },
    {
      id: 'OTC-7719',
      assetType: 'REAL_ESTATE',
      title: 'Downtown Dubai Luxury Penthouse',
      symbol: 'PROP-DT-04',
      type: 'SELL',
      priceAed: '520.00',
      quantity: '50',
      unit: 'Tokens',
      totalAed: '26,000.00',
      seller: 'Investor #1042 (Tier 2)',
      createdAt: '1 hour ago',
    },
    {
      id: 'OTC-7718',
      assetType: 'GOLD',
      title: 'OneX Gold (24K 999.9)',
      symbol: 'ONEX-GLD-1G',
      type: 'BUY',
      priceAed: '305.00',
      quantity: '100.00',
      unit: 'Grams',
      totalAed: '30,500.00',
      seller: 'Apex Bullion Fund',
      createdAt: '2 hours ago',
    },
    {
      id: 'OTC-7717',
      assetType: 'REAL_ESTATE',
      title: 'Palm Jumeirah Signature Villa',
      symbol: 'PROP-PJ-11',
      type: 'SELL',
      priceAed: '1,150.00',
      quantity: '20',
      unit: 'Tokens',
      totalAed: '23,000.00',
      seller: 'Investor #9914 (Tier 2)',
      createdAt: '3 hours ago',
    },
  ]);

  const filteredOrders = orders.filter((o) => {
    if (filterType !== 'ALL' && o.assetType !== filterType) return false;
    if (searchQuery.trim() && !o.title.toLowerCase().includes(searchQuery.toLowerCase()) && !o.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleExecuteOrder = (order: OtcOrder) => {
    setTradeSuccessMsg(`Successfully executed OTC order ${order.id} for ${order.quantity} ${order.unit} of ${order.title}!`);
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    setTimeout(() => {
      setTradeSuccessMsg(null);
    }, 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <span>OneX Markets</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-medium">OTC Secondary Market</span>
      </nav>

      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">OTC Secondary Market</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 text-xs font-bold">
              Live Order Book
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Instant peer-to-peer liquidity for verified OneX Gold and Tokenized Real Estate assets
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="py-2.5 px-5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#22c55e]/20 cursor-pointer w-max"
        >
          <Plus className="w-4 h-4" />
          <span>Create OTC Listing</span>
        </button>
      </div>

      {tradeSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
            <span>{tradeSuccessMsg}</span>
          </div>
          <button onClick={() => setTradeSuccessMsg(null)} className="font-bold text-white ml-4 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Top Market Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] text-slate-400 block">24h OTC Volume</span>
          <span className="text-xl font-black text-white">AED 4,820,500</span>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">+14.2% today</span>
        </div>

        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] text-slate-400 block">Gold Spot Reference</span>
          <span className="text-xl font-black text-[#22c55e]">AED {currentSpotPrice} / g</span>
          <span className="text-[10px] text-slate-500 block mt-1">DMCC 24K (999.9)</span>
        </div>

        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] text-slate-400 block">Active Listings</span>
          <span className="text-xl font-black text-white">{orders.length} Orders</span>
          <span className="text-[10px] text-slate-500 block mt-1">100% Asset Backed</span>
        </div>

        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] text-slate-400 block">Settlement Time</span>
          <span className="text-xl font-black text-white">Instant (&lt; 2s)</span>
          <span className="text-[10px] text-emerald-400 block mt-1">Atomic Title Transfer</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center p-1 bg-[#141b27] border border-[#223047] rounded-xl text-xs w-full sm:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-lg font-bold transition cursor-pointer flex-1 sm:flex-initial ${
              filterType === 'ALL' ? 'bg-[#22c55e] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Listings
          </button>
          <button
            onClick={() => setFilterType('GOLD')}
            className={`px-4 py-2 rounded-lg font-bold transition cursor-pointer flex-1 sm:flex-initial flex items-center gap-1.5 ${
              filterType === 'GOLD' ? 'bg-[#22c55e] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            OneX Gold
          </button>
          <button
            onClick={() => setFilterType('REAL_ESTATE')}
            className={`px-4 py-2 rounded-lg font-bold transition cursor-pointer flex-1 sm:flex-initial flex items-center gap-1.5 ${
              filterType === 'REAL_ESTATE' ? 'bg-[#22c55e] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Real Estate
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search symbol, asset or maker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141b27] border border-[#223047] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#223047] text-slate-400">
                <th className="py-3 px-4 font-semibold">Asset / Symbol</th>
                <th className="py-3 px-4 font-semibold">Side</th>
                <th className="py-3 px-4 font-semibold">Price Per Unit</th>
                <th className="py-3 px-4 font-semibold">Volume</th>
                <th className="py-3 px-4 font-semibold">Total Value</th>
                <th className="py-3 px-4 font-semibold">Maker / Counterparty</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#141b27] transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                          order.assetType === 'GOLD'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        }`}
                      >
                        {order.assetType === 'GOLD' ? '24K' : 'RE'}
                      </div>
                      <div>
                        <strong className="text-white block">{order.title}</strong>
                        <span className="text-[11px] font-mono text-slate-400">{order.symbol}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.type === 'SELL'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'bg-blue-950/80 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {order.type === 'SELL' ? 'ASK (Sell)' : 'BID (Buy)'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white text-sm">AED {order.priceAed}</span>
                    <span className="text-[10px] text-slate-500 block">/ {order.unit === 'Grams' ? 'g' : 'token'}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-200">
                      {order.quantity} {order.unit}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#22c55e] text-sm">AED {order.totalAed}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400">
                    <div>
                      <span>{order.seller}</span>
                      <span className="text-[10px] text-slate-500 block">{order.createdAt}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleExecuteOrder(order)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      {order.type === 'SELL' ? 'Buy Now' : 'Sell to Bid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e141f] border border-[#223047] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#223047] pb-4">
              <h3 className="text-lg font-bold text-white">Create OTC Secondary Listing</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Asset from Holding</label>
                <select className="w-full px-4 py-2.5 rounded-xl bg-[#141b27] border border-[#223047] text-white focus:outline-none focus:border-[#22c55e]">
                  <option>OneX Gold (24K 999.9) (Available: 3.50g)</option>
                  <option>Downtown Dubai Luxury Penthouse (Available: 15 Tokens)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Listing Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 rounded-lg bg-[#22c55e] text-black font-bold">Sell Order (Ask)</button>
                  <button className="py-2 rounded-lg bg-[#141b27] text-slate-400 border border-[#223047]">Buy Order (Bid)</button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  defaultValue="1.00"
                  step="0.1"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141b27] border border-[#223047] text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Price per unit (AED)</label>
                <input
                  type="number"
                  defaultValue={currentSpotPrice}
                  step="0.1"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141b27] border border-[#223047] text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#141b27] text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setTradeSuccessMsg('OTC Listing created and published to secondary order book!');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs cursor-pointer"
              >
                Publish Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
