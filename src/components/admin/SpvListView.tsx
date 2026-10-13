/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Eye,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface SpvRecord {
  id: string;
  name: string;
  type: string;
  investors: number;
  aum: string;
  lastActivity: string;
  blockchainAddress: string;
  isActive: boolean;
}

export const SpvListView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'DRAFTS' | 'INACTIVE'>('ACTIVE');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [spvs, setSpvs] = useState<SpvRecord[]>([
    {
      id: 'SPV-D6A4',
      name: 'Skyline Holdings',
      type: 'Private Limited',
      investors: 2,
      aum: '₹1,12,000',
      lastActivity: '09/01/2026',
      blockchainAddress: '0xc79B501B63...F8F5eB189',
      isActive: true,
    },
    {
      id: 'SPV-8D1E',
      name: 'BlueRiver Infrastructure SPV',
      type: 'Private Limited',
      investors: 2,
      aum: '₹1,12,000',
      lastActivity: '08/10/2026',
      blockchainAddress: '0x8f476a8Bae...391Eb14F5',
      isActive: true,
    },
    {
      id: 'SPV-E0B7',
      name: 'Bharat Renewable Infra Ventures',
      type: 'Private Limited',
      investors: 1,
      aum: '₹1,07,000',
      lastActivity: '08/03/2026',
      blockchainAddress: '0xaF7Ca8f6eA...8106a95eC',
      isActive: true,
    },
    {
      id: 'SPV-2F60',
      name: 'Avatar',
      type: 'Private Limited',
      investors: 1,
      aum: '₹76,194',
      lastActivity: '07/24/2026',
      blockchainAddress: 'Not deployed',
      isActive: true,
    },
    {
      id: 'SPV-2FA2',
      name: 'Golden Gate Real Estate',
      type: 'LLC',
      investors: 2,
      aum: 'AED 738,500',
      lastActivity: '07/18/2026',
      blockchainAddress: '0x5069BfA58C...113E4a11',
      isActive: true,
    },
    {
      id: 'SPV-A906',
      name: 'KalamWings 2.0',
      type: 'Private Limited',
      investors: 1,
      aum: '₹1,04,000',
      lastActivity: '07/20/2026',
      blockchainAddress: '0xC70281Fff2...FaFE4A7FF',
      isActive: true,
    },
  ]);

  const copyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSpv = (id: string) => {
    setSpvs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const filtered = spvs.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Special Purpose Vehicles (SPV) List
          </h2>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5046e5] hover:bg-[#4338ca] text-white text-xs font-semibold shadow-xs transition cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add SPV</span>
        </button>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SPV Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter By Type</span>
            </button>
            <span className="text-[11px] text-slate-400">No filters selected</span>
          </div>
        </div>

        {/* Tab Underline Bar */}
        <div className="flex items-center gap-6 border-t border-slate-100 pt-3 text-xs">
          {[
            { id: 'ACTIVE', label: 'Active', count: spvs.filter((s) => s.isActive).length },
            { id: 'DRAFTS', label: 'Drafts', count: 0 },
            { id: 'INACTIVE', label: 'Inactive', count: spvs.filter((s) => !s.isActive).length },
          ].map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-2 font-medium flex items-center gap-1.5 transition cursor-pointer relative ${
                  isActive
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {t.count}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SPVs Table (Matches screenshot 1:1) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Spv Id</th>
                <th className="py-3 px-4">SPV Name</th>
                <th className="py-3 px-4">SPV Type</th>
                <th className="py-3 px-4">Total Investors</th>
                <th className="py-3 px-4">AUM</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Blockchain Address</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition group">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{s.id}</span>
                      <button
                        onClick={(e) => copyId(s.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        title="Copy SPV ID"
                      >
                        {copiedId === s.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {s.name}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {s.type}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-800">
                    {s.investors}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                    {s.aum}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {s.lastActivity}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {s.blockchainAddress === 'Not deployed' ? (
                      <span className="text-slate-400">Not deployed</span>
                    ) : (
                      <span className="text-indigo-600">{s.blockchainAddress}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleSpv(s.id)}
                      className={`w-9 h-5 rounded-full transition-colors relative inline-block cursor-pointer ${
                        s.isActive ? 'bg-[#5046e5]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                          s.isActive ? 'right-0.75' : 'left-0.75'
                        }`}
                      />
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition cursor-pointer"
                        title="Edit SPV"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
