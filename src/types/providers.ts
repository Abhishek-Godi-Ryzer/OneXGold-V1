/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GoldQuote,
  PaxgExecutionRecord,
  PaymentDetails,
  PaymentMethodType,
  GoldAllocationRecord,
  LegalDocument,
  LiquidityExecutionStatus,
} from './domain';

export interface PaxgQuoteResult {
  quoteId: string;
  market: 'PAXGUSD';
  side: 'BUY' | 'SELL';
  paxgPriceUsd: string;
  requestedGoldGrams: string;
  paxgRequired: string;
  expiresInSeconds: number;
  provider: 'MOCK_PAXG' | 'PAXOS_SANDBOX';
}

export interface PaxgOrderResult {
  providerOrderId: string;
  quoteId: string;
  market: 'PAXGUSD';
  side: 'BUY' | 'SELL';
  type: 'MARKET';
  requestedPaxg: string;
  filledPaxg: string;
  status: LiquidityExecutionStatus;
  executionPrice: string;
  totalUsd: string;
  rejectionReason?: string;
}

export interface PaxgBalanceResult {
  availablePaxg: string;
  lockedPaxg: string;
  totalPaxg: string;
  equivalentGoldGrams: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
}

export interface PaxgLiquidityProvider {
  readonly providerName: string;
  getQuote(requestedGoldGrams: string, side?: 'BUY' | 'SELL'): Promise<PaxgQuoteResult>;
  executeBuy(params: {
    orderId: string;
    quoteId: string;
    requestedGoldGrams: string;
    idempotencyKey: string;
    failureMode?: string;
    forceFailure?: boolean;
    forceInsufficientLiquidity?: boolean;
  }): Promise<PaxgOrderResult>;
  executeSell(params: {
    orderId: string;
    quoteId: string;
    requestedGoldGrams: string;
    idempotencyKey: string;
    failureMode?: string;
    forceFailure?: boolean;
    forceInsufficientLiquidity?: boolean;
  }): Promise<PaxgOrderResult>;
  getOrder(providerOrderId: string): Promise<PaxgOrderResult>;
  cancelOrder(providerOrderId: string): Promise<{ success: boolean }>;
  getBalance(): Promise<PaxgBalanceResult>;
}

export interface PaymentProvider {
  readonly providerName: string;
  initiatePayment(params: {
    orderId: string;
    amount: string;
    currency: 'AED' | 'USDT' | 'USDC' | 'INR';
    method: PaymentMethodType;
    idempotencyKey: string;
  }): Promise<PaymentDetails>;
  confirmPayment(paymentId: string): Promise<PaymentDetails>;
  getPaymentStatus(paymentId: string): Promise<PaymentDetails>;
}

export interface GoldAllocationProvider {
  readonly providerName: string;
  allocateGold(params: {
    orderId: string;
    goldGrams: string;
    executionId: string;
  }): Promise<GoldAllocationRecord>;
  getAllocation(allocationId: string): Promise<GoldAllocationRecord | null>;
}

export interface DocumentProvider {
  readonly providerName: string;
  generateAgreement(params: {
    orderId: string;
    quote: GoldQuote;
    userName: string;
    userEmail: string;
  }): Promise<LegalDocument>;
  signAgreement(params: {
    documentId: string;
    signerName: string;
    signatureIp: string;
  }): Promise<LegalDocument>;
}
