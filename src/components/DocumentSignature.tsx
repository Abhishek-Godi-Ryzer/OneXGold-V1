/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronRight,
  CheckCircle2,
  FileSignature,
  Download,
  Eye,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { GoldOrder } from '../types/domain';

interface DocumentSignatureProps {
  order: GoldOrder;
  onDocumentSigned: (updatedOrder: GoldOrder) => void;
  onBack: () => void;
}

export const DocumentSignature: React.FC<DocumentSignatureProps> = ({
  order,
  onDocumentSigned,
  onBack,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [signerName, setSignerName] = useState<string>('Abhishk');
  const [hasAgreed, setHasAgreed] = useState<boolean>(true);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignSubmit = async () => {
    if (!signerName.trim() || !hasAgreed) return;

    try {
      setIsSigning(true);
      setErrorMsg(null);

      const res = await fetch(`/api/orders/${order.id}/sign-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerName,
          signatureIp: '194.187.249.12',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Signing failed');
      }

      const updatedOrder: GoldOrder = await res.json();
      setIsSigning(false);
      setModalOpen(false);
      onDocumentSigned(updatedOrder);
    } catch (err: any) {
      setIsSigning(false);
      setErrorMsg(err?.message || 'Failed to sign document.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
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
        <span className="text-white font-medium">Document Signature</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Final Step: Sign & Complete Your Purchase
        </h1>
        <p className="text-sm text-slate-400">
          Please sign your OneX Gold Custodial Allocation agreement to finalize ownership of your physical gold.
        </p>
      </div>

      {/* 4-Step Visual Progress Bar */}
      <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#22c55e] text-black font-bold flex items-center justify-center mb-2 shadow-lg shadow-[#22c55e]/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Order Submitted</span>
            <span className="text-[11px] text-emerald-400">Completed</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#22c55e] text-black font-bold flex items-center justify-center mb-2 shadow-lg shadow-[#22c55e]/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Payment Confirmed</span>
            <span className="text-[11px] text-emerald-400">Settled</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#22c55e] text-black font-bold flex items-center justify-center mb-2 shadow-lg shadow-[#22c55e]/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Gold Allocated</span>
            <span className="text-[11px] text-emerald-400">Vault Bar Assigned</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center mb-2 animate-pulse shadow-lg shadow-amber-500/20">
              <FileSignature className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Document Signature</span>
            <span className="text-[11px] text-amber-400">Action Required</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Document Card (Desktop-48.png) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <FileSignature className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#1e293b] text-slate-300 border border-slate-700 uppercase tracking-wider mb-1">
                    TEMPLATE01
                  </span>
                  <h3 className="text-base font-bold text-white">
                    OneX Gold Custodial Allocation Agreement
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold shrink-0">
                YET TO SIGN
              </span>
            </div>

            {/* Document Purpose box */}
            <div className="bg-[#141b27] border border-[#223047] rounded-xl p-5 space-y-3 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
                Document purpose and why this is important
              </h4>
              <p className="text-slate-300 leading-relaxed">
                This agreement legally binds the transfer of title for{' '}
                <strong className="text-white">{order.quantityGrams} gram(s) of OneX Gold (24K, 999.9 Purity)</strong>{' '}
                from OneX Depository to you. It confirms that the gold is segregated in the DMCC vault, unencumbered,
                and redeemable at your discretion.
              </p>
              <div className="pt-2 border-t border-[#223047] flex flex-wrap items-center gap-4 text-slate-400">
                <span>• Allocated Custody Agreement</span>
                <span>• DMCC TransGuard Vault Custody</span>
                <span>• 100% Physical Bullion Backed</span>
              </div>
            </div>

            {/* Sign CTA */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-[#22c55e]/20 cursor-pointer"
              >
                <FileSignature className="w-4 h-4" />
                <span>Review & Sign Agreement</span>
              </button>

              <button
                onClick={() => setModalOpen(true)}
                className="py-3.5 px-5 rounded-xl bg-[#141b27] hover:bg-[#1c2637] text-slate-300 border border-[#223047] font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-24">
            <h3 className="text-lg font-bold text-white border-b border-[#1e293b] pb-4">
              Order Summary
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Gold Purchased</span>
                <span className="font-bold text-white">
                  {order.quantityGrams} OneX Gold Tokens ({order.quantityGrams}g Gold)
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Amount Paid</span>
                <span className="font-bold text-white">AED {order.quote.totalPayableAed}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Allocated Bar</span>
                <span className="font-mono text-emerald-400">
                  {order.allocation?.vaultBarSerialNumber || 'DXB-TG-999.9-B88201'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Allocation Agreement</span>
                <span className="font-mono text-slate-200">
                  {order.allocation?.egrCertificateNumber || order.id}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Order ID</span>
                <span className="font-mono text-slate-200">{order.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature & Legal Document Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e141f] border border-[#223047] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#223047] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  TEMPLATE01
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  OneX Gold Custodial Allocation Agreement
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold p-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Document Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 font-sans leading-relaxed border-b border-[#223047]">
              <div className="p-4 bg-[#141b27] border border-[#223047] rounded-xl font-mono text-[11px] text-slate-300 space-y-2">
                <p className="font-bold text-white text-xs">ONEX GOLD CUSTODIAL ALLOCATION AGREEMENT</p>
                <p>Order Reference: {order.id}</p>
                <p>Buyer / Signer: {signerName}</p>
                <p>Allocated Asset: {order.quantityGrams}g OneX Gold (24K, 999.9 Fine Bullion)</p>
                <p>Token Allocation: {order.quantityGrams} OneX Gold Tokens (1 Token = 1g Gold)</p>
                <p>Vault Depository: TransGuard Dubai / DMCC Free Zone Bullion Facility</p>
                <p>Allocated Bar Serial: {order.allocation?.vaultBarSerialNumber}</p>
              </div>

              <p>
                1. <strong>Unencumbered Title:</strong> The Custodian confirms that legal ownership and unencumbered title
                to the allocated OneX Gold specified in this agreement has passed directly to the Investor upon settlement.
              </p>
              <p>
                2. <strong>Physical Segregation:</strong> The gold is held in an allocated, segregated account at the DMCC
                high-security vault facility, subject to periodic independent audits.
              </p>
              <p>
                3. <strong>Redemption Rights:</strong> The Investor retains the right to redeem OneX Gold for physical bullion
                bars or to sell on the platform at live spot rates.
              </p>
            </div>

            {/* Signature Input Form */}
            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Signer Full Name (Electronic Signature)
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141b27] border border-[#223047] text-white text-sm focus:outline-none focus:border-[#22c55e]"
                  placeholder="Enter full legal name"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="rounded bg-[#141b27] border-slate-700 text-[#22c55e] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-300 cursor-pointer">
                  I accept the OneX Gold Custodial Allocation terms and agree to apply my digital signature.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#141b27] text-slate-300 hover:bg-[#1c2637] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSignSubmit}
                  disabled={isSigning || !signerName.trim() || !hasAgreed}
                  className="px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isSigning ? (
                    <span>Applying Signature...</span>
                  ) : (
                    <>
                      <FileSignature className="w-4 h-4" />
                      <span>Sign & Authorize</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
