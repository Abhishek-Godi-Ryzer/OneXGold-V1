/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  Sliders,
  History,
  Sparkles,
  Building,
  Coins,
  Wallet,
  CheckCircle2,
  X,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: any) => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate, onOpenAdmin }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [primaryMenuOpen, setPrimaryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: 'n1',
      title: 'OneX Gold Allocated',
      desc: '10.00g OneX Gold allocated & stored in TransGuard DMCC Vault.',
      time: '5m ago',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Spot Gold Price Update',
      desc: 'OneX Gold 24K (999.9) spot price updated to AED 394.88/g ($3,350/oz).',
      time: '25m ago',
      unread: false,
    },
    {
      id: 'n3',
      title: 'Mock PAXG Liquidity Verified',
      desc: '1:1 allocated reserve audit verified against vault custody balance.',
      time: '2h ago',
      unread: false,
    },
  ];

  const searchItems = [
    { type: 'Gold', title: 'OneX Gold 24K (DMCC Vault Custody)', tab: 'gold-landing' },
    { type: 'Gold', title: 'Buy OneX Gold (1 Token = 1g Gold)', tab: 'buy-gold' },
    { type: 'Holdings', title: 'My Gold & OneX Gold Tokens', tab: 'my-gold' },
    { type: 'Market', title: 'OTC Secondary Market & Order Book', tab: 'otc-market' },
    { type: 'Portfolio', title: 'Investment Portfolio & Allocation', tab: 'portfolio' },
    { type: 'History', title: 'Order Lifecycle History & Audit Trail', tab: 'orders-list' },
  ];

  const filteredSearch = searchItems.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="bg-[#0b0f14] border-b border-[#1e293b] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-8 lg:gap-10">
          {/* 1. OneX Logo */}
          <button
            onClick={() => onNavigate('investment-home')}
            className="flex items-center gap-1.5 focus:outline-none text-left cursor-pointer group shrink-0"
          >
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tighter text-white">ONE</span>
              <span className="text-2xl font-black tracking-tighter text-[#22c55e] ml-0.5">X</span>
            </div>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
              Gold
            </span>
          </button>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            {/* 2. Primary Market */}
            <div className="relative">
              <button
                onClick={() => setPrimaryMenuOpen(!primaryMenuOpen)}
                className={`relative py-5 transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'gold-landing' || activeTab === 'investment-home' || activeTab === 'buy-gold'
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>OneX Gold</span>
                <ChevronDown className="w-3.5 h-3.5" />
                {(activeTab === 'gold-landing' || activeTab === 'investment-home' || activeTab === 'buy-gold') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22c55e]"></span>
                )}
              </button>

              {primaryMenuOpen && (
                <div
                  className="absolute left-0 mt-0 w-64 bg-[#121824] border border-[#223047] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in"
                  onClick={() => setPrimaryMenuOpen(false)}
                >
                  <button
                    onClick={() => onNavigate('gold-landing')}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-[#1c273a] hover:text-white flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                      24K
                    </div>
                    <div>
                      <strong className="text-white block">OneX Gold (24K)</strong>
                      <span className="text-[11px] text-slate-400">1 Token = 1g Physical Gold</span>
                    </div>
                  </button>

                  <button
                    onClick={() => onNavigate('investment-home')}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-[#1c273a] hover:text-white flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#162030] text-[#22c55e] flex items-center justify-center">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-white block">Institutional Asset Hub</strong>
                      <span className="text-[11px] text-slate-400">Gold & Real Estate Overview</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 3. OTC Market */}
            <button
              onClick={() => onNavigate('otc-market')}
              className={`relative py-5 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'otc-market' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>OTC Market</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30">
                P2P
              </span>
              {activeTab === 'otc-market' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22c55e]"></span>
              )}
            </button>

            {/* 4. Portfolio */}
            <button
              onClick={() => onNavigate('portfolio')}
              className={`relative py-5 transition cursor-pointer ${
                activeTab === 'portfolio' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Portfolio
              {activeTab === 'portfolio' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22c55e]"></span>
              )}
            </button>

            {/* My Gold */}
            <button
              onClick={() => onNavigate('my-gold')}
              className={`relative py-5 transition cursor-pointer ${
                activeTab === 'my-gold' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Gold
              {activeTab === 'my-gold' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22c55e]"></span>
              )}
            </button>

            {/* Admin & Operations Dashboard */}
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className={`relative py-5 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'admin-dashboard' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Admin Ops</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PRO
              </span>
              {activeTab === 'admin-dashboard' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22c55e]"></span>
              )}
            </button>
          </nav>
        </div>

        {/* Right: Search, Notifications, Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Action Button: Buy 24K Gold */}
          <button
            onClick={() => onNavigate('buy-gold')}
            className="hidden sm:flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Buy 24K Gold
          </button>

          {/* 5. Search Button */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg bg-[#141b27] border border-[#223047] hover:border-slate-500 text-slate-300 hover:text-white transition cursor-pointer"
              title="Search Assets & Orders"
            >
              <Search className="w-4 h-4" />
            </button>

            {searchOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121824] border border-[#223047] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in">
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search gold, real estate, orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#1a2332] border border-[#27354a] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {filteredSearch.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onNavigate(item.tab);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#1c273a] flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1e293b] text-emerald-400 border border-emerald-500/20">
                          {item.type}
                        </span>
                        <span className="text-slate-200">{item.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotifMenuOpen(!notifMenuOpen)}
              className="p-2 rounded-lg bg-[#141b27] border border-[#223047] hover:border-slate-500 text-slate-300 hover:text-white transition cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
            </button>

            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#121824] border border-[#223047] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#223047] pb-2 mb-2">
                  <h4 className="text-xs font-bold text-white">Notifications</h4>
                  <span className="text-[10px] text-[#22c55e] font-semibold">Mark all read</span>
                </div>

                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-lg bg-[#162030] border border-[#223047] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs">{n.title}</strong>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#161f2e] border border-[#27354a] hover:border-slate-600 transition cursor-pointer text-slate-200"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-green-400 text-black font-bold text-xs flex items-center justify-center">
                A
              </div>
              <span className="text-xs font-semibold hidden sm:inline">Abhishk</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#121824] border border-[#223047] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in"
                onClick={() => setProfileMenuOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-[#223047]">
                  <p className="text-xs font-bold text-white">Abhishk</p>
                  <p className="text-[11px] text-slate-400">abhishk@onex.investments</p>
                  <div className="mt-2 flex items-center justify-between bg-[#141b27] border border-[#223047] rounded-lg p-2">
                    <span className="text-[11px] text-slate-400">Wallet Balance:</span>
                    <span className="text-xs font-bold text-[#22c55e]">AED 45,200.00</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('my-gold')}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#1c273a] hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  My Gold Holdings
                </button>

                <button
                  onClick={() => onNavigate('portfolio')}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#1c273a] hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  My Portfolio
                </button>

                <button
                  onClick={() => onNavigate('orders-list')}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#1c273a] hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Order History & Allocations
                </button>

                <div className="border-t border-[#223047] my-1"></div>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onNavigate('admin-dashboard');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-amber-400 hover:bg-[#1c273a] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Admin Liquidity & Ops Console
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

