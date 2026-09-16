/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OrderStatus =
  | 'DRAFT'
  | 'QUOTE_CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'LIQUIDITY_PENDING'
  | 'LIQUIDITY_EXECUTING'
  | 'LIQUIDITY_FILLED'
  | 'GOLD_ALLOCATING'
  | 'GOLD_ALLOCATED'
  | 'DOCUMENT_PENDING'
  | 'DOCUMENT_SIGNED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type QuoteStatus = 'ACTIVE' | 'EXPIRED' | 'ACCEPTED' | 'CANCELLED';

export type PaymentMethodType = 'FIAT_AED' | 'UPI' | 'NET_BANKING' | 'USDT' | 'USDC';

export type PaymentStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaxgFailureMode =
  | 'NONE'
  | 'QUOTE_EXPIRED'
  | 'INSUFFICIENT_LIQUIDITY'
  | 'EXECUTION_REJECTED'
  | 'PROVIDER_OFFLINE'
  | 'PARTIAL_FILL'
  | 'EXECUTION_TIMEOUT'
  | 'ALLOCATION_FAILED'
  | 'SETTLEMENT_DELAYED';

export type LiquidityExecutionStatus =
  | 'PENDING'
  | 'QUOTE_LOCKED'
  | 'SUBMITTED'
  | 'OPEN'
  | 'FILLED'
  | 'PARTIALLY_FILLED'
  | 'REJECTED'
  | 'TIMEOUT'
  | 'CANCELLED';

export type DocumentStatus =
  | 'PENDING'
  | 'GENERATED'
  | 'SENT'
  | 'VIEWED'
  | 'SIGNED'
  | 'FAILED'
  | 'EXPIRED';

export type AuditEventType =
  | 'QUOTE_CREATED'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_EXPIRED'
  | 'ORDER_CREATED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'PAXG_QUOTE_REQUESTED'
  | 'PAXG_QUOTE_LOCKED'
  | 'PAXG_ORDER_CREATED'
  | 'PAXG_ORDER_FILLED'
  | 'PAXG_ORDER_FAILED'
  | 'GOLD_ALLOCATION_STARTED'
  | 'GOLD_ALLOCATION_COMPLETED'
  | 'GOLD_ALLOCATION_FAILED'
  | 'DOCUMENT_GENERATED'
  | 'DOCUMENT_VIEWED'
  | 'DOCUMENT_SIGNED'
  | 'ORDER_COMPLETED'
  | 'ORDER_FAILED'
  | 'ORDER_CANCELLED'
  | 'GOLD_SELL_QUOTE_CREATED'
  | 'GOLD_SELL_CONFIRMED'
  | 'PAXG_SELL_EXECUTED'
  | 'GOLD_SELL_SETTLED'
  | 'GOLD_SOLD'
  | 'GOLD_REDEMPTION_VALIDATED'
  | 'GOLD_REDEMPTION_REQUESTED'
  | 'GOLD_BALANCE_ADJUSTED'
  | 'GOLD_VAULT_DEALLOCATED'
  | 'GOLD_RECONCILIATION_COMPLETED'
  | 'GOLD_REDEEMED';

export interface GoldQuote {
  quoteId: string;
  goldPricePerGramAed: string; // e.g. "306.72"
  goldPriceUsdPerOunce: string; // e.g. "2580.50"
  quantityGrams: string; // e.g. "1.0000"
  grossGoldValueAed: string; // e.g. "306.72"
  platformFeeAed: string; // e.g. "1.53" (0.50%)
  paymentFeeAed: string; // e.g. "0.00"
  totalPayableAed: string; // e.g. "308.25"
  cryptoEquivalentUsdt: string; // e.g. "83.94"
  cryptoEquivalentUsdc: string; // e.g. "83.94"
  paxgPriceUsd: string; // e.g. "2580.50"
  paxgRequired: string; // e.g. "0.0321507" grams / 31.1034768
  quoteCreatedAt: string;
  quoteExpiresAt: string;
  status: QuoteStatus;
  provider: 'MOCK_PAXG' | 'PAXOS_SANDBOX' | 'PAXOS_API' | 'BINANCE_INSTITUTIONAL' | string;
}

export interface PaymentDetails {
  paymentId: string;
  orderId: string;
  method: PaymentMethodType;
  currency: 'AED' | 'USDT' | 'USDC' | 'INR';
  amount: string;
  status: PaymentStatus;
  transactionReference: string;
  paidAt?: string;
  failureReason?: string;
}

export interface PaxgExecutionRecord {
  executionId: string;
  orderId: string;
  quoteId: string;
  provider: 'MOCK_PAXG' | 'PAXOS_SANDBOX' | 'PAXOS_API' | 'BINANCE_INSTITUTIONAL' | string;
  market: 'PAXGUSD' | string;
  side: 'BUY' | 'SELL';
  requestedGoldGrams: string;
  requestedPaxg: string;
  filledPaxg: string;
  paxgPriceUsd: string;
  totalUsd: string;
  status: LiquidityExecutionStatus;
  providerOrderId: string;
  executedAt: string;
  rejectionReason?: string;
  errorMessage?: string;
}

export interface GoldAllocationRecord {
  allocationId: string;
  orderId: string;
  goldGrams: string;
  purity: '24K (999.9 Fine Gold)' | string;
  vaultLocation: string; // e.g. "TransGuard Dubai / DMCC Secure Vault"
  vaultBarSerialNumber: string; // e.g. "TG-999-DXB-88321"
  egrCertificateNumber: string; // e.g. "ONEX-CERT-2025-00415"
  allocatedAt: string;
  custodian: string; // e.g. "OneX Custody & Vault Services Ltd"
}

export interface LegalDocument {
  documentId: string;
  orderId: string;
  templateId: 'TEMPLATE01_GOLD_PURCHASE_AGREEMENT' | string;
  title: string;
  description: string;
  status: DocumentStatus;
  signerName?: string;
  signatureDate?: string;
  signatureIp?: string;
  signatureHash?: string;
  contentMarkdown: string;
}

export interface GoldOrder {
  id: string; // e.g. "ORD-415"
  userId: string;
  idempotencyKey: string;
  quantityGrams: string; // e.g. "1.0000"
  unitTokenCount: string; // e.g. "1" (1 token = 1g)
  quote: GoldQuote;
  status: OrderStatus;
  payment?: PaymentDetails;
  liquidity?: PaxgExecutionRecord;
  allocation?: GoldAllocationRecord;
  document?: LegalDocument;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface AuditEvent {
  eventId: string;
  orderId: string;
  userId: string;
  timestamp: string;
  eventType: AuditEventType;
  status: OrderStatus | SellOrderStatus | RedemptionStatus | string;
  previousStatus?: OrderStatus | SellOrderStatus | RedemptionStatus | string;
  referenceId: string;
  actor: 'CUSTOMER' | 'SYSTEM' | 'LIQUIDITY_ENGINE' | 'VAULT_CUSTODIAN' | 'ADMIN';
  metadata: Record<string, unknown>;
}

export interface GoldHolding {
  id: string;
  userId: string;
  totalGrams: string; // e.g. "2.5000"
  totalTokens: string; // 1 token = 1g
  investedAed: string; // e.g. "768.12"
  avgCostPerGramAed: string; // e.g. "307.25"
  currentValueAed: string; // totalGrams * livePrice
  unrealizedGainAed: string;
  unrealizedGainPercent: string;
  purity: '24K (999.9 Fine Gold)';
  holdingsList: {
    orderId: string;
    grams: string;
    purchasePricePerGramAed: string;
    purchasedAt: string;
    egrCertificateNumber: string;
    vaultBarSerialNumber: string;
  }[];
}

export interface PortfolioSummary {
  userId: string;
  totalHoldingsAed: string;
  totalInvestedAed: string;
  totalReturnsUnrealizedAed: string;
  totalReturnsPercent: string;
  cashflowsReceivedAed: string;
  upcomingPayoutAed: string;
  upcomingPayoutDate: string;
  allocation: {
    realEstatePercent: string;
    goldPercent: string;
    realEstateInvestedAed: string;
    realEstateCurrentValueAed: string;
    goldInvestedAed: string;
    goldCurrentValueAed: string;
  };
  realEstateAssets: {
    id: string;
    name: string;
    type: 'Commercial' | 'Residential';
    location: string;
    currentValueAed: string;
    investedAed: string;
    gainedValueAed: string;
    gainedPercent: string;
    cashflowsAed: string;
    estIrr: string;
    image: string;
  }[];
  goldAssets: {
    id: string;
    name: string;
    grams: string;
    currentValueAed: string;
    investedAed: string;
    gainedValueAed: string;
    gainedPercent: string;
    estIrr: string;
    egrNumber: string;
  }[];
}

export interface SimulationConfig {
  providerMode: 'MOCK_PAXG' | 'PAXOS_SANDBOX';
  liquidityDelayMs: number;
  allocationDelayMs: number;
  forcePaymentFailure: boolean;
  forceLiquidityRejection: boolean;
  forceInsufficientLiquidity: boolean;
  forceAllocationFailure: boolean;
  paxgFailureMode?: PaxgFailureMode;
}

export interface GoldSellQuote {
  quoteId: string;
  goldPricePerGramAed: string; // e.g. "306.72"
  goldPriceUsdPerOunce: string; // e.g. "2580.50"
  quantityGrams: string; // e.g. "1.0000"
  grossProceedsAed: string; // e.g. "306.72"
  platformFeeAed: string; // e.g. "1.53" (0.50%)
  netProceedsAed: string; // e.g. "305.19"
  paxgPriceUsd: string; // e.g. "2580.50"
  paxgSold: string; // e.g. "0.0321507"
  totalUsd: string;
  quoteCreatedAt: string;
  quoteExpiresAt: string;
  status: QuoteStatus;
  provider: 'MOCK_PAXG' | 'PAXOS_SANDBOX';
}

export type SellOrderStatus =
  | 'QUOTE_CREATED'
  | 'CONFIRMED'
  | 'LIQUIDITY_EXECUTING'
  | 'LIQUIDITY_FILLED'
  | 'SETTLED'
  | 'COMPLETED'
  | 'FAILED';

export interface GoldSellOrder {
  id: string; // e.g. "SELL-101"
  userId: string;
  idempotencyKey: string;
  quantityGrams: string;
  quote: GoldSellQuote;
  status: SellOrderStatus;
  liquidity?: PaxgExecutionRecord;
  settlement?: {
    settlementId: string;
    currency: 'AED';
    netAmountAed: string;
    destinationWallet: string;
    settledAt: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

export type RedemptionStatus =
  | 'VALIDATING'
  | 'REQUESTED'
  | 'BALANCE_ADJUSTED'
  | 'VAULT_DEALLOCATED'
  | 'RECONCILED'
  | 'DISPATCH_READY'
  | 'COMPLETED'
  | 'FAILED';

export interface GoldRedemptionRequest {
  id: string; // e.g. "RED-501"
  userId: string;
  idempotencyKey: string;
  quantityGrams: string;
  status: RedemptionStatus;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  vaultLocation: string;
  deallocatedBars: {
    vaultBarSerialNumber: string;
    egrCertificateNumber: string;
    grams: string;
  }[];
  trackingCode: string;
  courier: string;
  validationDetails: {
    valid: boolean;
    holdingBalanceBefore: string;
    holdingBalanceAfter: string;
    feeAed: string;
  };
  reconciliationId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

export type TransactionType = 'BUY' | 'SELL' | 'REDEEM';

export interface GoldTransaction {
  id: string;
  type: TransactionType;
  orderId: string;
  userId: string;
  timestamp: string;
  quantityGrams: string;
  amountAed?: string;
  status: string;
  referenceId: string;
  paxgDetails?: {
    side: 'BUY' | 'SELL';
    paxgAmount: string;
    paxgPriceUsd: string;
    provider: string;
    executionId?: string;
  };
  description: string;
}

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  customerMasked: string;
  customerUserId: string;
  customerTier: 'INSTITUTIONAL' | 'RETAIL' | 'WEALTH_MGMT';
  goldQuantityGrams: string;
  paxgRequired: string;
  paxgExecuted: string;
  paxgPriceUsd: string;
  provider: string;
  executionId: string;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
  paymentMethod: PaymentMethodType;
  totalAed: string;
  order: GoldOrder;
}

export interface LiquidityMetrics {
  // 10 Core Dashboard & Operations Metrics
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalGoldPurchasedGrams: string;
  totalGoldAllocatedGrams: string;
  totalTokensMinted: string;
  paxgAvailable: string;
  paxgUsed: string;
  paxgRemaining: string;

  // Technical Breakdown & Provider Stats
  paxgPriceUsd: string;
  providerStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  providerName: string;
  averageExecutionPriceUsd: string;
  executionSuccessRatePercent: string;
  lastExecution: PaxgExecutionRecord | null;
  totalOneXGoldOrders?: number;
  pendingLiquidityPaxg?: string;
  paxgOrdersCount?: number;
  paxgVolumeTotalPaxg?: string;
  paxgFilledVolumePaxg?: string;
  paxgFailedOrdersCount?: number;
  outstandingLiquidityPaxg?: string;
  providerReserveBalancePaxg?: string;
}

export interface VaultInventoryBar {
  serialNumber: string;
  egrNumber: string;
  weightGrams: string;
  purity: string;
  status: 'ALLOCATED' | 'UNALLOCATED_RESERVE' | 'IN_TRANSIT_REDEMPTION' | 'DELIVERED';
  allocatedToOrderId?: string;
  allocatedToMaskedCustomer?: string;
  vaultLocation: string;
  custodian: string;
  allocatedAt?: string;
  lastAuditDate: string;
}

export interface ReconciliationReport {
  reconciliationId: string;
  generatedAt: string;
  overallStatus: 'RECONCILED' | 'ATTENTION_REQUIRED' | 'DISCREPANCY_DETECTED';
  totalPhysicalGoldGrams: string;
  totalTokenizedGrams: string;
  reserveBackingRatioPercent: string;
  paxgPoolTotalOz: string;
  paxgPoolAllocatedOz: string;
  fiatSettledAed: string;
  fiatPendingAed: string;
  checks: {
    name: string;
    description: string;
    expected: string;
    actual: string;
    discrepancy: string;
    status: 'MATCHED' | 'WARNING' | 'MISMATCH';
  }[];
}

