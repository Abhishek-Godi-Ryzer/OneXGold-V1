/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Coins,
  Search,
  Eye,
  User,
  Building2,
  Lock,
  ExternalLink,
  CheckCircle2,
  FileText,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { AdminOrderSummary } from '../../types/domain';

interface CustomerHoldingRecord {
  customerId: string;
  customerName: string;
  tier: string;
  email: string;
  oneXGoldGrams: string;
  oneXGoldTokens: string;
  currentValueAed: string;
  status: string;
  lastUpdated: string;
  allocatedBars: {
    barSerial: string;
    grams: string;
    purity: string;
    vaultLocation: string;
    custodian: string;
  }[];
}

interface OneXGoldHoldingsProps {
  orders: AdminOrderSummary[];
  onSelectOrder?: (order: AdminOrderSummary) => void;
}

export const OneXGoldHoldings: React.FC<OneXGoldHoldingsProps> = ({
  orders,
  onSelectOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerHoldingRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Derive realistic customer holdings from store data
  const totalCompletedGrams = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((acc, o) => acc + (Number(o.quantityGrams) || 0), 0);

  const customerList: CustomerHoldingRecord[] = [
    {
      customerId: 'USR-ONEX-776197',
      customerName: 'Abhishk (User 001)',
      tier: 'Institutional / HNWI',
      email: 'abhishk@onex.investments',
      oneXGoldGrams: (totalCompletedGrams > 0 ? totalCompletedGrams : 10.0).toFixed(2),
      oneXGoldTokens: (totalCompletedGrams > 0 ? totalCompletedGrams : 10.0).toFixed(2),
      currentValueAed: ((totalCompletedGrams > 0 ? totalCompletedGrams : 10.0) * 306.72).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      status: 'Active • 100% DMCC Allocated',
      lastUpdated: 'Today, 14:30',
      allocatedBars: [
        {
          barSerial: 'DXB-TG-999.9-B77201',
          grams: '5.00',
          purity: '24K (999.9 Fine Gold)',
          vaultLocation: 'TransGuard DMCC Dubai Vault',
          custodian: 'OneX Bullion Custodial Depository Ltd',
        },
        {
          barSerial: 'DXB-TG-999.9-B41920',
          grams: '5.00',
          purity: '24K (999.9 Fine Gold)',
          vaultLocation: 'TransGuard DMCC Dubai Vault',
          custodian: 'OneX Bullion Custodial Depository Ltd',
        },
      ],
    },
    {
      customerId: 'USR-ONEX-882104',
      customerName: 'Al-Farooq Sovereign Trust',
      tier: 'Sovereign Institutional',
      email: 'treasury@alfarooq.ae',
      oneXGoldGrams: '50.00',
      oneXGoldTokens: '50.00',
      currentValueAed: (50 * 306.72).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      status: 'Active • 100% DMCC Allocated',
      lastUpdated: 'Yesterday, 18:15',
      allocatedBars: [
        {
          barSerial: 'DXB-TG-999.9-S99011',
          grams: '50.00',
          purity: '24K (999.9 Fine Gold)',
          vaultLocation: 'TransGuard DMCC Dubai Vault',
          custodian: 'OneX Bullion Custodial Depository Ltd',
        },
      ],
    },
    {
      customerId: 'USR-ONEX-904122',
      customerName: 'Horizon Capital DMCC',
      tier: 'Corporate Treasury',
      email: 'invest@horizoncap.ae',
      oneXGoldGrams: '25.00',
      oneXGoldTokens: '25.00',
      currentValueAed: (25 * 306.72).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      status: 'Active • 100% DMCC Allocated',
      lastUpdated: '2 days ago',
      allocatedBars: [
        {
          barSerial: 'DXB-TG-999.9-H33104',
          grams: '25.00',
          purity: '24K (999.9 Fine Gold)',
          vaultLocation: 'TransGuard DMCC Dubai Vault',
          custodian: 'OneX Bullion Custodial Depository Ltd',
        },
      ],
    },
  ];

  const filtered = customerList.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* Top Banner / Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              OneX Gold Customer Holdings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer physical 24K gold holdings allocated in TransGuard DMCC Dubai Vault and corresponding OneX Gold Tokens.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 1:1 Note */}
        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between font-mono font-semibold">
          <span>1 OneX Gold Token = 1.0000 gram 24K Physical Fine Gold</span>
          <span className="text-[11px] text-emerald-700 font-sans font-normal hidden sm:inline">
            100% Segregated & Fully Backed
          </span>
        </div>
      </div>

      {/* Holdings Table (Matches screenshot table style) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">OneX Gold</th>
                <th className="py-3 px-4">OneX Gold Tokens</th>
                <th className="py-3 px-4">Current Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((c) => (
                <tr
                  key={c.customerId}
                  onClick={() => setSelectedCustomer(c)}
                  className="hover:bg-slate-50/80 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <div>
                      <div className="font-bold text-slate-900">{c.customerName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{c.customerId}</div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">
                    {c.oneXGoldGrams}g
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 text-sm">
                    {c.oneXGoldTokens} Tokens
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                    AED {c.currentValueAed}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {c.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {c.lastUpdated}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(c);
                      }}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-slate-600 inline-flex items-center justify-center transition cursor-pointer"
                      title="View Customer Holdings"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Holding Breakdown Drawer/Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedCustomer.customerName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedCustomer.customerId} • {selectedCustomer.tier}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Balances Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-slate-600 text-[11px] block font-medium">
                    OneX Gold Physical Holding
                  </span>
                  <strong className="text-xl font-bold font-mono text-emerald-800 mt-1 block">
                    {selectedCustomer.oneXGoldGrams}g
                  </strong>
                  <span className="text-[10px] text-emerald-700 mt-1 block font-mono">
                    24K (999.9 Fine Gold)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
                  <span className="text-slate-600 text-[11px] block font-medium">
                    OneX Gold Tokens
                  </span>
                  <strong className="text-xl font-bold font-mono text-indigo-900 mt-1 block">
                    {selectedCustomer.oneXGoldTokens} Tokens
                  </strong>
                  <span className="text-[10px] text-indigo-700 mt-1 block font-mono">
                    1:1 Direct Depository Claim
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 text-[11px] block font-medium">
                    Current Portfolio Value
                  </span>
                  <strong className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                    AED {selectedCustomer.currentValueAed}
                  </strong>
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                    Spot Valuation
                  </span>
                </div>
              </div>

              {/* Conversion guarantee */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono font-bold text-slate-800 text-xs">
                1 OneX Gold Token = 1 gram of OneX Gold
              </div>

              {/* Allocated Physical Bars */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Allocated Bullion Bars (DMCC Vault)
                  </h4>
                </div>

                <div className="space-y-2">
                  {selectedCustomer.allocatedBars.map((bar, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {bar.barSerial}
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 font-bold">
                            {bar.purity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {bar.vaultLocation} • Custodian: {bar.custodian}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-700 block">
                          {bar.grams}g Fine Gold
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Segregated & Audited
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
