/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PackageCheck,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  Building2,
  Lock,
  RefreshCw,
  FileCheck2,
  MapPin,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { GoldHolding, GoldRedemptionRequest } from '../types/domain';

interface RedeemGoldFlowProps {
  holding: GoldHolding | null;
  onBack: () => void;
  onSuccess: () => void;
  onViewTransactions: () => void;
}

type RedeemStep = 'ENTER_QUANTITY' | 'VALIDATION' | 'PROCESSING' | 'COMPLETED';

export const RedeemGoldFlow: React.FC<RedeemGoldFlowProps> = ({
  holding,
  onBack,
  onSuccess,
  onViewTransactions,
}) => {
  const [step, setStep] = useState<RedeemStep>('ENTER_QUANTITY');
  const [redeemGrams, setRedeemGrams] = useState<string>('1.0000');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    'Villa 14, Palm Jumeirah, Dubai, United Arab Emirates'
  );
  const [recipientName, setRecipientName] = useState<string>('Abhishk');
  const [recipientPhone, setRecipientPhone] = useState<string>('+971 50 123 4567');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [redemptionRequest, setRedemptionRequest] = useState<GoldRedemptionRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingPhase, setProcessingPhase] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const availableGrams = Number(holding?.totalGrams || '0');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleValidate = async () => {
    try {
      setErrorMsg(null);
      const gramsNum = Number(redeemGrams);
      if (isNaN(gramsNum) || gramsNum < 1) {
        throw new Error('Minimum physical bullion bar redemption quantity is 1.00g (24K Fine Gold).');
      }
      if (gramsNum > availableGrams) {
        throw new Error(`Insufficient holdings. Available in vault custody: ${availableGrams}g.`);
      }
      if (!deliveryAddress || deliveryAddress.trim().length < 5) {
        throw new Error('Please enter a valid UAE delivery address.');
      }

      setIsSubmitting(true);
      const res = await fetch('/api/gold/redeem/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grams: redeemGrams,
          deliveryAddress,
          recipientName,
          recipientPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Validation failed.');

      setValidationResult(data);
      setStep('VALIDATION');
    } catch (err: any) {
      setErrorMsg(err.message || 'Validation error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRedemption = async () => {
    try {
      setErrorMsg(null);
      setStep('PROCESSING');
      setProcessingPhase(1); // Redemption request registration

      setTimeout(() => setProcessingPhase(2), 600); // Token balance adjustment
      setTimeout(() => setProcessingPhase(3), 1200); // Vault custody deallocation
      setTimeout(() => setProcessingPhase(4), 1800); // Physical reconciliation

      const idempotencyKey = `IDEM-RED-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const res = await fetch('/api/gold/redeem/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grams: redeemGrams,
          deliveryAddress,
          recipientName,
          recipientPhone,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Redemption execution failed.');

      setRedemptionRequest(data);
      setTimeout(() => {
        setStep('COMPLETED');
        onSuccess();
      }, 2200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing redemption.');
      setStep('VALIDATION');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header & Stepper */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Gold</span>
        </button>

        {/* Stepper pills */}
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'ENTER_QUANTITY'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-[#141b27] text-slate-400'
            }`}
          >
            1. Enter Quantity
          </span>
          <span className="text-slate-600">→</span>
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'VALIDATION'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-[#141b27] text-slate-400'
            }`}
          >
            2. Vault Validation
          </span>
          <span className="text-slate-600">→</span>
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'PROCESSING'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse'
                : step === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-[#141b27] text-slate-400'
            }`}
          >
            3. Dispatched & Complete
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STAGE 1: ENTER QUANTITY & DETAILS */}
      {step === 'ENTER_QUANTITY' && (
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Physical Gold Vault Redemption</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Redeem allocated 24K (999.9 Fine Gold) bullion bars from TransGuard DMCC Dubai Vault custody for armored doorstep delivery.
            </p>
          </div>

          {/* Balance card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#141b27] p-4 rounded-xl border border-[#223047]">
            <div>
              <span className="text-[11px] text-slate-400 block">Total In Vault Custody</span>
              <span className="text-lg font-black text-white">{holding?.totalGrams || '0.00'}g</span>
              <span className="text-[10px] text-slate-500 block">DMCC Vault Registered</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Minimum Redemption</span>
              <span className="text-lg font-black text-blue-400">1.0000g</span>
              <span className="text-[10px] text-slate-500 block">Individually Serialized Bar</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Insured Vault Dispatch</span>
              <span className="text-lg font-black text-emerald-400">Complimentary</span>
              <span className="text-[10px] text-slate-500 block">TransGuard Armored Van</span>
            </div>
          </div>

          {/* Input field */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Gold Bullion Quantity to Redeem (Grams)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="1.0000"
                max={availableGrams}
                value={redeemGrams}
                onChange={(e) => setRedeemGrams(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#141b27] border border-[#223047] text-white text-base font-mono focus:outline-none focus:border-blue-400 pr-16"
                placeholder="1.0000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                GRAMS
              </span>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 pt-1">
              {['1.0000', '2.0000', '3.5000'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRedeemGrams(val)}
                  className="flex-1 py-1.5 rounded-lg bg-[#141b27] hover:bg-[#1a2333] border border-[#223047] text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {val === String(holding?.totalGrams) ? `All (${val}g)` : `${val}g Bar`}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Details Inputs */}
          <div className="space-y-4 pt-2 border-t border-[#1e293b]">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Secured Delivery Destination (UAE & GCC)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Recipient Full Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b27] border border-[#223047] text-white text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Contact Phone (for Courier OTP)</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b27] border border-[#223047] text-white text-xs focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Delivery Street Address & Landmark</label>
              <textarea
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b27] border border-[#223047] text-white text-xs focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-[#141b27] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleValidate}
              disabled={isSubmitting || Number(redeemGrams) < 1 || Number(redeemGrams) > availableGrams}
              className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating Vault Bars...</span>
                </>
              ) : (
                <>
                  <span>Validate Vault Custody</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: VALIDATION */}
      {step === 'VALIDATION' && validationResult && (
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Vault Validation Passed</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Custody verified with TransGuard DMCC Bullion Vault Registry
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Authenticity</span>
            </span>
          </div>

          {/* Allocation Details */}
          <div className="bg-[#141b27] border border-[#223047] rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Allocated Bullion Bars for De-Allocation & Dispatch
            </h4>

            <div className="space-y-2">
              {validationResult.deallocatingBars?.map((bar: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0e141f] border border-[#223047] text-xs font-mono"
                >
                  <div>
                    <span className="text-white font-bold block">{bar.vaultBarSerialNumber}</span>
                    <span className="text-slate-400 text-[11px]">{bar.egrCertificateNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold">{bar.grams}g</span>
                    <span className="text-slate-500 text-[10px] block">24K 999.9 Fine Gold</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#223047] pt-3 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Balance After Redemption</span>
                <span className="text-white font-bold font-mono">{validationResult.holdingBalanceAfter}g</span>
              </div>
              <div>
                <span className="text-slate-400 block">Dispatch Fee</span>
                <span className="text-emerald-400 font-bold font-mono">AED 0.00 (Free Insured)</span>
              </div>
            </div>
          </div>

          {/* Delivery summary */}
          <div className="bg-[#101722] border border-[#1e293b] rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Armored Delivery Details</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Recipient: <strong className="text-white">{recipientName}</strong> ({recipientPhone})<br />
              Address: <strong className="text-white">{deliveryAddress}</strong><br />
              Courier: <strong className="text-slate-200">{validationResult.courier}</strong>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1e293b]">
            <button
              onClick={() => setStep('ENTER_QUANTITY')}
              className="px-4 py-2 rounded-xl bg-[#141b27] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Modify Request
            </button>

            <button
              onClick={handleConfirmRedemption}
              className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Dispatch Vault Gold</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: PROCESSING */}
      {step === 'PROCESSING' && (
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-8 sm:p-12 space-y-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400 animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">Processing Physical Vault Redemption</h3>
            <p className="text-xs text-slate-400">
              De-allocating physical gold bar serials from DMCC custodian vault registry and generating dispatch tracking.
            </p>
          </div>

          {/* 4-step progress tracker */}
          <div className="max-w-md mx-auto space-y-3 text-left">
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                processingPhase >= 1
                  ? 'bg-[#141b27] border-emerald-500/50 text-white'
                  : 'bg-[#101722] border-[#223047] text-slate-500'
              }`}
            >
              <span>1. Validating Vault Ownership & Serial Registry</span>
              {processingPhase >= 1 ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              )}
            </div>

            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                processingPhase >= 2
                  ? 'bg-[#141b27] border-emerald-500/50 text-white'
                  : 'bg-[#101722] border-[#223047] text-slate-500'
              }`}
            >
              <span>2. Deducting User Gold Tokens & Balances</span>
              {processingPhase >= 2 ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px]">Pending</span>
              )}
            </div>

            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                processingPhase >= 3
                  ? 'bg-[#141b27] border-emerald-500/50 text-white'
                  : 'bg-[#101722] border-[#223047] text-slate-500'
              }`}
            >
              <span>3. De-Allocating DMCC Vault Bar Custody</span>
              {processingPhase >= 3 ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px]">Pending</span>
              )}
            </div>

            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                processingPhase >= 4
                  ? 'bg-[#141b27] border-emerald-500/50 text-white'
                  : 'bg-[#101722] border-[#223047] text-slate-500'
              }`}
            >
              <span>4. Physical Reconciliation & Armored Dispatch</span>
              {processingPhase >= 4 ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px]">Pending</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: COMPLETED */}
      {step === 'COMPLETED' && redemptionRequest && (
        <div className="bg-[#0e141f] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Physical Gold Dispatched</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Request ID: <span className="font-mono text-white">{redemptionRequest.id}</span>
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold w-max flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>In Armored Transit</span>
            </span>
          </div>

          {/* Tracking & Details Card */}
          <div className="bg-[#141b27] border border-[#223047] rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e141f] p-4 rounded-xl border border-[#223047]">
              <div>
                <span className="text-[11px] text-slate-400 block">Courier Tracking Code</span>
                <span className="text-base font-black text-white font-mono">{redemptionRequest.trackingCode}</span>
              </div>
              <button
                onClick={() => handleCopy(redemptionRequest.trackingCode, 'tracking')}
                className="px-3 py-1.5 rounded-lg bg-[#1a2333] hover:bg-[#223047] text-slate-200 text-xs font-semibold flex items-center gap-2 w-max cursor-pointer"
              >
                {copiedId === 'tracking' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'tracking' ? 'Copied' : 'Copy Tracking'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-slate-400 block">Redeemed Bullion Quantity</span>
                <span className="text-white font-bold font-mono text-sm">{redemptionRequest.quantityGrams}g (24K)</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 block">Reconciliation Certificate</span>
                <span className="text-slate-200 font-mono">{redemptionRequest.reconciliationId}</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 block">Vault Custodian</span>
                <span className="text-slate-200">{redemptionRequest.vaultLocation}</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 block">Armored Courier</span>
                <span className="text-slate-200">{redemptionRequest.courier}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1e293b]">
            <button
              onClick={onViewTransactions}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#141b27] hover:bg-[#1a2333] border border-[#223047] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>View in Transaction History</span>
            </button>

            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <span>Return to My Gold</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
