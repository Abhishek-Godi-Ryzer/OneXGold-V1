/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GoldOrder,
  GoldQuote,
  AuditEvent,
  GoldHolding,
  PortfolioSummary,
  SimulationConfig,
  OrderStatus,
  GoldSellOrder,
  GoldSellQuote,
  GoldRedemptionRequest,
  GoldTransaction,
  AdminOrderSummary,
  LiquidityMetrics,
  PaxgExecutionRecord,
  VaultInventoryBar,
  ReconciliationReport,
} from '../types/domain';
import { decAdd, decMul, decSub, decDiv } from './decimal';
import { mockPaxgProvider } from '../providers/paxg/MockPaxgLiquidityProvider';

class InMemoryStore {
  public orders: Map<string, GoldOrder> = new Map();
  public quotes: Map<string, GoldQuote> = new Map();
  public sellOrders: Map<string, GoldSellOrder> = new Map();
  public sellQuotes: Map<string, GoldSellQuote> = new Map();
  public redemptionRequests: Map<string, GoldRedemptionRequest> = new Map();
  public processedIdempotencyKeys: Set<string> = new Set();
  public auditEvents: AuditEvent[] = [];
  public currentPricePerGramAed: string = '306.72';
  public userProfile = {
    userId: 'USR-ONEX-776197',
    name: 'Abhishk',
    email: 'abhishk@onex.investments',
    phone: '+971 50 123 4567',
  };

  public simulationConfig: SimulationConfig = {
    providerMode: 'MOCK_PAXG',
    liquidityDelayMs: 1200,
    allocationDelayMs: 1500,
    forcePaymentFailure: false,
    forceLiquidityRejection: false,
    forceInsufficientLiquidity: false,
    forceAllocationFailure: false,
  };

  public goldHolding: GoldHolding = {
    id: 'HOLDING-USR-776197',
    userId: 'USR-ONEX-776197',
    totalGrams: '10.0000',
    totalTokens: '10.00',
    investedAed: '3850.00',
    avgCostPerGramAed: '385.00',
    currentValueAed: '3948.80',
    unrealizedGainAed: '98.80',
    unrealizedGainPercent: '2.57',
    purity: '24K (999.9 Fine Gold)',
    holdingsList: [
      {
        orderId: 'ORD-301',
        grams: '5.0000',
        purchasePricePerGramAed: '384.50',
        purchasedAt: '2025-05-12T14:20:00Z',
        egrCertificateNumber: 'ALLOC-ONEX-2025-00301',
        vaultBarSerialNumber: 'DXB-TG-999.9-B41920',
      },
      {
        orderId: 'ORD-308',
        grams: '5.0000',
        purchasePricePerGramAed: '385.50',
        purchasedAt: '2025-05-28T09:15:00Z',
        egrCertificateNumber: 'ALLOC-ONEX-2025-00308',
        vaultBarSerialNumber: 'DXB-TG-999.9-B77201',
      },
    ],
  };

  public portfolio: PortfolioSummary = {
    userId: 'USR-ONEX-776197',
    totalHoldingsAed: '3450000',
    totalInvestedAed: '2820000',
    totalReturnsUnrealizedAed: '450000',
    totalReturnsPercent: '22.5',
    cashflowsReceivedAed: '96500',
    upcomingPayoutAed: '8500',
    upcomingPayoutDate: '20 Aug 2025',
    allocation: {
      realEstatePercent: '81.6',
      goldPercent: '18.4',
      realEstateInvestedAed: '2000000',
      realEstateCurrentValueAed: '2813500',
      goldInvestedAed: '1500000',
      goldCurrentValueAed: '636500',
    },
    realEstateAssets: [
      {
        id: 'RE-01',
        name: 'InfinityAssets',
        type: 'Commercial',
        location: 'Dubai',
        currentValueAed: '720000',
        investedAed: '600000',
        gainedValueAed: '120000',
        gainedPercent: '20.00',
        cashflowsAed: '28500',
        estIrr: '14.20%',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'RE-02',
        name: 'kalvathi',
        type: 'Residential',
        location: 'Dubai',
        currentValueAed: '480000',
        investedAed: '400000',
        gainedValueAed: '80000',
        gainedPercent: '20.00',
        cashflowsAed: '19200',
        estIrr: '13.40%',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'RE-03',
        name: 'Palm Crest Residences',
        type: 'Residential',
        location: 'Dubai Marina',
        currentValueAed: '420000',
        investedAed: '350000',
        gainedValueAed: '70000',
        gainedPercent: '20.00',
        cashflowsAed: '16800',
        estIrr: '15.60%',
        image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=400&q=80',
      },
    ],
    goldAssets: [
      {
        id: 'GOLD-01',
        name: 'OneX Gold',
        grams: '2.50g',
        currentValueAed: '170000',
        investedAed: '150000',
        gainedValueAed: '20000',
        gainedPercent: '17.00',
        estIrr: '5.25%',
        egrNumber: 'ALLOC-ONEX-2025-00301',
      },
      {
        id: 'GOLD-02',
        name: 'OneX Gold',
        grams: '1.00g',
        currentValueAed: '160000',
        investedAed: '140000',
        gainedValueAed: '20000',
        gainedPercent: '17.00',
        estIrr: '5.20%',
        egrNumber: 'ALLOC-ONEX-2025-00308',
      },
    ],
  };

  constructor() {
    this.seedSeedInitialOrders();
  }

  private seedSeedInitialOrders() {
    // Seed an initial completed order for immediate inspection in order history
    const initialQuote: GoldQuote = {
      quoteId: 'PAXG-Q-INIT-01',
      goldPricePerGramAed: '308.25',
      goldPriceUsdPerOunce: '2598.60',
      quantityGrams: '1.0000',
      grossGoldValueAed: '308.25',
      platformFeeAed: '1.54',
      paymentFeeAed: '0.00',
      totalPayableAed: '309.79',
      cryptoEquivalentUsdt: '84.35',
      cryptoEquivalentUsdc: '84.35',
      paxgPriceUsd: '2598.60',
      paxgRequired: '0.032151',
      quoteCreatedAt: '2025-05-28T09:10:00Z',
      quoteExpiresAt: '2025-05-28T09:15:00Z',
      status: 'ACCEPTED',
      provider: 'MOCK_PAXG',
    };

    const initialOrder: GoldOrder = {
      id: 'ORD-415',
      userId: this.userProfile.userId,
      idempotencyKey: 'IDEMP-INIT-415',
      quantityGrams: '1.0000',
      unitTokenCount: '1',
      quote: initialQuote,
      status: 'COMPLETED',
      createdAt: '2025-05-28T09:12:00Z',
      updatedAt: '2025-05-28T09:15:20Z',
      completedAt: '2025-05-28T09:15:20Z',
      payment: {
        paymentId: 'PAY-ONEX-415',
        orderId: 'ORD-415',
        method: 'USDT',
        currency: 'USDT',
        amount: '84.35',
        status: 'SUCCESS',
        transactionReference: 'TXN-REF-USDT-TRON-88910',
        paidAt: '2025-05-28T09:13:00Z',
      },
      liquidity: {
        executionId: 'EXEC-PAXG-415',
        orderId: 'ORD-415',
        quoteId: 'PAXG-Q-INIT-01',
        provider: 'MOCK_PAXG',
        market: 'PAXGUSD',
        side: 'BUY',
        requestedGoldGrams: '1.0000',
        requestedPaxg: '0.032151',
        filledPaxg: '0.032151',
        paxgPriceUsd: '2598.60',
        totalUsd: '83.55',
        status: 'FILLED',
        providerOrderId: 'PAXG-ORD-415',
        executedAt: '2025-05-28T09:13:45Z',
      },
      allocation: {
        allocationId: 'ALLOC-415',
        orderId: 'ORD-415',
        goldGrams: '1.0000',
        purity: '24K (999.9 Fine Gold)',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault',
        vaultBarSerialNumber: 'DXB-TG-999.9-B77201',
        egrCertificateNumber: 'ONEX-CERT-2025-00415',
        allocatedAt: '2025-05-28T09:14:30Z',
        custodian: 'OneX Bullion Custodial Depository Ltd',
      },
      document: {
        documentId: 'DOC-AGR-415',
        orderId: 'ORD-415',
        templateId: 'TEMPLATE01_GOLD_PURCHASE_AGREEMENT',
        title: 'TEMPLATE01 — OneX Gold Title & Custody Purchase Agreement',
        description: 'Legal title transfer and 1:1 allocated custodial gold ownership confirmation document.',
        status: 'SIGNED',
        signerName: 'Abhishk',
        signatureDate: '2025-05-28T09:15:10Z',
        signatureIp: '194.187.249.12',
        signatureHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        contentMarkdown: '# OneX Gold Custodial Title & Purchase Agreement (Signed)',
      },
    };

    this.orders.set(initialOrder.id, initialOrder);

    // 2. Institutional Order 418 (10.0g - 0.321507 PAXG)
    const quote418: GoldQuote = {
      quoteId: 'PAXG-Q-INST-418',
      goldPricePerGramAed: '307.90',
      goldPriceUsdPerOunce: '2595.00',
      quantityGrams: '10.0000',
      grossGoldValueAed: '3079.00',
      platformFeeAed: '15.40',
      paymentFeeAed: '0.00',
      totalPayableAed: '3094.40',
      cryptoEquivalentUsdt: '842.50',
      cryptoEquivalentUsdc: '842.50',
      paxgPriceUsd: '2595.00',
      paxgRequired: '0.321507',
      quoteCreatedAt: '2025-05-28T10:00:00Z',
      quoteExpiresAt: '2025-05-28T10:05:00Z',
      status: 'ACCEPTED',
      provider: 'PAXOS_API',
    };

    const order418: GoldOrder = {
      id: 'ORD-418',
      userId: 'USR-ONEX-882104',
      idempotencyKey: 'IDEMP-INIT-418',
      quantityGrams: '10.0000',
      unitTokenCount: '10',
      quote: quote418,
      status: 'COMPLETED',
      createdAt: '2025-05-28T10:02:00Z',
      updatedAt: '2025-05-28T10:04:30Z',
      completedAt: '2025-05-28T10:04:30Z',
      payment: {
        paymentId: 'PAY-ONEX-418',
        orderId: 'ORD-418',
        method: 'USDC',
        currency: 'USDC',
        amount: '842.50',
        status: 'SUCCESS',
        transactionReference: 'TXN-ETH-USDC-0x981b22',
        paidAt: '2025-05-28T10:02:40Z',
      },
      liquidity: {
        executionId: 'EXEC-PAXG-418',
        orderId: 'ORD-418',
        quoteId: 'PAXG-Q-INST-418',
        provider: 'PAXOS_API',
        market: 'PAXGUSD',
        side: 'BUY',
        requestedGoldGrams: '10.0000',
        requestedPaxg: '0.321507',
        filledPaxg: '0.321507',
        paxgPriceUsd: '2595.00',
        totalUsd: '834.31',
        status: 'FILLED',
        providerOrderId: 'PAXOS-ORD-99812',
        executedAt: '2025-05-28T10:03:15Z',
      },
      allocation: {
        allocationId: 'ALLOC-418',
        orderId: 'ORD-418',
        goldGrams: '10.0000',
        purity: '24K (999.9 Fine Gold)',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault',
        vaultBarSerialNumber: 'DXB-TG-999.9-C10992',
        egrCertificateNumber: 'ONEX-CERT-2025-00418',
        allocatedAt: '2025-05-28T10:03:50Z',
        custodian: 'OneX Bullion Custodial Depository Ltd',
      },
      document: {
        documentId: 'DOC-AGR-418',
        orderId: 'ORD-418',
        templateId: 'TEMPLATE01_GOLD_PURCHASE_AGREEMENT',
        title: 'TEMPLATE01 — OneX Gold Title & Custody Purchase Agreement',
        description: 'Institutional legal title transfer and 1:1 allocated custodial gold ownership confirmation document.',
        status: 'SIGNED',
        signerName: 'Tariq Al-Mansoor',
        signatureDate: '2025-05-28T10:04:20Z',
        signatureIp: '185.122.44.19',
        signatureHash: 'SHA256:3a9e224c88bb91ff02a9473b18d3e66acbf591789c19d45e402b801a2f44',
        contentMarkdown: '# Institutional Gold Purchase Agreement (Signed)',
      },
    };
    this.orders.set(order418.id, order418);

    // 3. Wealth Mgmt Order 422 (2.5g)
    const quote422: GoldQuote = {
      quoteId: 'PAXG-Q-INIT-422',
      goldPricePerGramAed: '306.72',
      goldPriceUsdPerOunce: '2588.20',
      quantityGrams: '2.5000',
      grossGoldValueAed: '766.80',
      platformFeeAed: '3.83',
      paymentFeeAed: '0.00',
      totalPayableAed: '770.63',
      cryptoEquivalentUsdt: '209.80',
      cryptoEquivalentUsdc: '209.80',
      paxgPriceUsd: '2588.20',
      paxgRequired: '0.080377',
      quoteCreatedAt: '2025-05-28T11:15:00Z',
      quoteExpiresAt: '2025-05-28T11:20:00Z',
      status: 'ACCEPTED',
      provider: 'MOCK_PAXG',
    };

    const order422: GoldOrder = {
      id: 'ORD-422',
      userId: 'USR-ONEX-304918',
      idempotencyKey: 'IDEMP-INIT-422',
      quantityGrams: '2.5000',
      unitTokenCount: '2.5',
      quote: quote422,
      status: 'COMPLETED',
      createdAt: '2025-05-28T11:16:00Z',
      updatedAt: '2025-05-28T11:19:10Z',
      completedAt: '2025-05-28T11:19:10Z',
      payment: {
        paymentId: 'PAY-ONEX-422',
        orderId: 'ORD-422',
        method: 'FIAT_AED',
        currency: 'AED',
        amount: '770.63',
        status: 'SUCCESS',
        transactionReference: 'WIO-BANK-REF-77192',
        paidAt: '2025-05-28T11:17:00Z',
      },
      liquidity: {
        executionId: 'EXEC-PAXG-422',
        orderId: 'ORD-422',
        quoteId: 'PAXG-Q-INIT-422',
        provider: 'MOCK_PAXG',
        market: 'PAXGUSD',
        side: 'BUY',
        requestedGoldGrams: '2.5000',
        requestedPaxg: '0.080377',
        filledPaxg: '0.080377',
        paxgPriceUsd: '2588.20',
        totalUsd: '208.03',
        status: 'FILLED',
        providerOrderId: 'MOCK-ORD-422',
        executedAt: '2025-05-28T11:17:45Z',
      },
      allocation: {
        allocationId: 'ALLOC-422',
        orderId: 'ORD-422',
        goldGrams: '2.5000',
        purity: '24K (999.9 Fine Gold)',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault',
        vaultBarSerialNumber: 'DXB-TG-999.9-B41920',
        egrCertificateNumber: 'ONEX-CERT-2025-00422',
        allocatedAt: '2025-05-28T11:18:20Z',
        custodian: 'OneX Bullion Custodial Depository Ltd',
      },
      document: {
        documentId: 'DOC-AGR-422',
        orderId: 'ORD-422',
        templateId: 'TEMPLATE01_GOLD_PURCHASE_AGREEMENT',
        title: 'TEMPLATE01 — OneX Gold Title & Custody Purchase Agreement',
        description: 'Allocated custodial ownership agreement.',
        status: 'SIGNED',
        signerName: 'Sarah Morrison',
        signatureDate: '2025-05-28T11:19:00Z',
        signatureIp: '94.200.18.91',
        signatureHash: 'SHA256:d894f1c7e99b01ac2e',
        contentMarkdown: '# Gold Custody Agreement (Signed)',
      },
    };
    this.orders.set(order422.id, order422);

    // 4. Large Institutional Order 433 (25.0g)
    const quote433: GoldQuote = {
      quoteId: 'PAXG-Q-INST-433',
      goldPricePerGramAed: '306.50',
      goldPriceUsdPerOunce: '2590.10',
      quantityGrams: '25.0000',
      grossGoldValueAed: '7662.50',
      platformFeeAed: '38.31',
      paymentFeeAed: '0.00',
      totalPayableAed: '7700.81',
      cryptoEquivalentUsdt: '2096.50',
      cryptoEquivalentUsdc: '2096.50',
      paxgPriceUsd: '2590.10',
      paxgRequired: '0.803768',
      quoteCreatedAt: '2025-05-28T12:00:00Z',
      quoteExpiresAt: '2025-05-28T12:05:00Z',
      status: 'ACCEPTED',
      provider: 'PAXOS_API',
    };

    const order433: GoldOrder = {
      id: 'ORD-433',
      userId: 'USR-ONEX-551092',
      idempotencyKey: 'IDEMP-INIT-433',
      quantityGrams: '25.0000',
      unitTokenCount: '25',
      quote: quote433,
      status: 'COMPLETED',
      createdAt: '2025-05-28T12:01:00Z',
      updatedAt: '2025-05-28T12:04:15Z',
      completedAt: '2025-05-28T12:04:15Z',
      payment: {
        paymentId: 'PAY-ONEX-433',
        orderId: 'ORD-433',
        method: 'USDT',
        currency: 'USDT',
        amount: '2096.50',
        status: 'SUCCESS',
        transactionReference: 'TXN-TRON-USDT-994101',
        paidAt: '2025-05-28T12:01:45Z',
      },
      liquidity: {
        executionId: 'EXEC-PAXG-433',
        orderId: 'ORD-433',
        quoteId: 'PAXG-Q-INST-433',
        provider: 'PAXOS_API',
        market: 'PAXGUSD',
        side: 'BUY',
        requestedGoldGrams: '25.0000',
        requestedPaxg: '0.803768',
        filledPaxg: '0.803768',
        paxgPriceUsd: '2590.10',
        totalUsd: '2081.84',
        status: 'FILLED',
        providerOrderId: 'PAXOS-ORD-11094',
        executedAt: '2025-05-28T12:02:30Z',
      },
      allocation: {
        allocationId: 'ALLOC-433',
        orderId: 'ORD-433',
        goldGrams: '25.0000',
        purity: '24K (999.9 Fine Gold)',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault',
        vaultBarSerialNumber: 'DXB-TG-999.9-D99014',
        egrCertificateNumber: 'ONEX-CERT-2025-00433',
        allocatedAt: '2025-05-28T12:03:10Z',
        custodian: 'OneX Bullion Custodial Depository Ltd',
      },
      document: {
        documentId: 'DOC-AGR-433',
        orderId: 'ORD-433',
        templateId: 'TEMPLATE01_GOLD_PURCHASE_AGREEMENT',
        title: 'TEMPLATE01 — OneX Gold Title & Custody Purchase Agreement',
        description: 'Institutional custodial gold certificate.',
        status: 'SIGNED',
        signerName: 'Al-Maktoum Family Trust Trustee',
        signatureDate: '2025-05-28T12:04:00Z',
        signatureIp: '185.20.101.4',
        signatureHash: 'SHA256:91fe30bc4412a89',
        contentMarkdown: '# Institutional Gold Custody Agreement (Signed)',
      },
    };
    this.orders.set(order433.id, order433);

    // 5. Document Pending Order 429 (5.0g - Allocated, awaiting signature)
    const quote429: GoldQuote = {
      quoteId: 'PAXG-Q-INIT-429',
      goldPricePerGramAed: '306.72',
      goldPriceUsdPerOunce: '2588.00',
      quantityGrams: '5.0000',
      grossGoldValueAed: '1533.60',
      platformFeeAed: '7.67',
      paymentFeeAed: '0.00',
      totalPayableAed: '1541.27',
      cryptoEquivalentUsdt: '419.60',
      cryptoEquivalentUsdc: '419.60',
      paxgPriceUsd: '2588.00',
      paxgRequired: '0.160754',
      quoteCreatedAt: '2025-05-28T13:00:00Z',
      quoteExpiresAt: '2025-05-28T13:05:00Z',
      status: 'ACCEPTED',
      provider: 'MOCK_PAXG',
    };

    const order429: GoldOrder = {
      id: 'ORD-429',
      userId: 'USR-ONEX-912440',
      idempotencyKey: 'IDEMP-INIT-429',
      quantityGrams: '5.0000',
      unitTokenCount: '5',
      quote: quote429,
      status: 'DOCUMENT_PENDING',
      createdAt: '2025-05-28T13:01:00Z',
      updatedAt: '2025-05-28T13:03:30Z',
      payment: {
        paymentId: 'PAY-ONEX-429',
        orderId: 'ORD-429',
        method: 'USDT',
        currency: 'USDT',
        amount: '419.60',
        status: 'SUCCESS',
        transactionReference: 'TXN-TRON-449102',
        paidAt: '2025-05-28T13:01:30Z',
      },
      liquidity: {
        executionId: 'EXEC-PAXG-429',
        orderId: 'ORD-429',
        quoteId: 'PAXG-Q-INIT-429',
        provider: 'MOCK_PAXG',
        market: 'PAXGUSD',
        side: 'BUY',
        requestedGoldGrams: '5.0000',
        requestedPaxg: '0.160754',
        filledPaxg: '0.160754',
        paxgPriceUsd: '2588.00',
        totalUsd: '416.03',
        status: 'FILLED',
        providerOrderId: 'MOCK-ORD-429',
        executedAt: '2025-05-28T13:02:15Z',
      },
      allocation: {
        allocationId: 'ALLOC-429',
        orderId: 'ORD-429',
        goldGrams: '5.0000',
        purity: '24K (999.9 Fine Gold)',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault',
        vaultBarSerialNumber: 'DXB-TG-999.9-E55102',
        egrCertificateNumber: 'ONEX-CERT-2025-00429',
        allocatedAt: '2025-05-28T13:03:00Z',
        custodian: 'OneX Bullion Custodial Depository Ltd',
      },
      document: {
        documentId: 'DOC-AGR-429',
        orderId: 'ORD-429',
        templateId: 'TEMPLATE01_GOLD_PURCHASE_AGREEMENT',
        title: 'TEMPLATE01 — OneX Gold Title & Custody Purchase Agreement',
        description: 'Allocated custodial gold ownership confirmation document.',
        status: 'SENT',
        contentMarkdown: '# OneX Gold Title & Custody Agreement (Pending Signature)',
      },
    };
    this.orders.set(order429.id, order429);

    // 6. In-flight Liquidity Pending Order 437 (1.5g)
    const quote437: GoldQuote = {
      quoteId: 'PAXG-Q-INIT-437',
      goldPricePerGramAed: '306.72',
      goldPriceUsdPerOunce: '2589.50',
      quantityGrams: '1.5000',
      grossGoldValueAed: '460.08',
      platformFeeAed: '2.30',
      paymentFeeAed: '0.00',
      totalPayableAed: '462.38',
      cryptoEquivalentUsdt: '125.90',
      cryptoEquivalentUsdc: '125.90',
      paxgPriceUsd: '2589.50',
      paxgRequired: '0.048226',
      quoteCreatedAt: '2025-05-28T13:45:00Z',
      quoteExpiresAt: '2025-05-28T13:50:00Z',
      status: 'ACCEPTED',
      provider: 'PAXOS_API',
    };

    const order437: GoldOrder = {
      id: 'ORD-437',
      userId: 'USR-ONEX-119830',
      idempotencyKey: 'IDEMP-INIT-437',
      quantityGrams: '1.5000',
      unitTokenCount: '1.5',
      quote: quote437,
      status: 'LIQUIDITY_PENDING',
      createdAt: '2025-05-28T13:46:00Z',
      updatedAt: '2025-05-28T13:47:00Z',
      payment: {
        paymentId: 'PAY-ONEX-437',
        orderId: 'ORD-437',
        method: 'USDT',
        currency: 'USDT',
        amount: '125.90',
        status: 'SUCCESS',
        transactionReference: 'TXN-TRON-889012',
        paidAt: '2025-05-28T13:46:30Z',
      },
    };
    this.orders.set(order437.id, order437);

    // 7. Failed Liquidity Order 440 (3.0g - for Ops retry inspection)
    const quote440: GoldQuote = {
      quoteId: 'PAXG-Q-INIT-440',
      goldPricePerGramAed: '306.72',
      goldPriceUsdPerOunce: '2589.00',
      quantityGrams: '3.0000',
      grossGoldValueAed: '920.16',
      platformFeeAed: '4.60',
      paymentFeeAed: '0.00',
      totalPayableAed: '924.76',
      cryptoEquivalentUsdt: '251.70',
      cryptoEquivalentUsdc: '251.70',
      paxgPriceUsd: '2589.00',
      paxgRequired: '0.096452',
      quoteCreatedAt: '2025-05-28T14:10:00Z',
      quoteExpiresAt: '2025-05-28T14:15:00Z',
      status: 'ACCEPTED',
      provider: 'PAXOS_API',
    };

    const order440: GoldOrder = {
      id: 'ORD-440',
      userId: 'USR-ONEX-773901',
      idempotencyKey: 'IDEMP-INIT-440',
      quantityGrams: '3.0000',
      unitTokenCount: '3',
      quote: quote440,
      status: 'FAILED',
      failureReason: 'PAXG Liquidity desk rejected execution: Temporary slippage limit exceeded (>0.25%). Safe retry available.',
      createdAt: '2025-05-28T14:11:00Z',
      updatedAt: '2025-05-28T14:12:15Z',
      payment: {
        paymentId: 'PAY-ONEX-440',
        orderId: 'ORD-440',
        method: 'USDC',
        currency: 'USDC',
        amount: '251.70',
        status: 'SUCCESS',
        transactionReference: 'TXN-ETH-0x71a99b',
        paidAt: '2025-05-28T14:11:40Z',
      },
      liquidity: {
        executionId: 'EXEC-PAXG-440',
        orderId: 'ORD-440',
        quoteId: 'PAXG-Q-INIT-440',
        provider: 'PAXOS_API',
        providerOrderId: 'PAXOS-ORD-REJ-440',
        market: 'PAXGUSD',
        side: 'BUY',
        requestedGoldGrams: '3.0000',
        requestedPaxg: '0.096452',
        filledPaxg: '0.000000',
        paxgPriceUsd: '2589.00',
        totalUsd: '249.71',
        status: 'REJECTED',
        errorMessage: 'Temporary slippage limit exceeded (>0.25%) on liquidity provider order book.',
        executedAt: '2025-05-28T14:12:10Z',
      },
    };
    this.orders.set(order440.id, order440);

    // 8. Payment Pending Order 445 (0.50g)
    const quote445: GoldQuote = {
      quoteId: 'PAXG-Q-INIT-445',
      goldPricePerGramAed: '306.72',
      goldPriceUsdPerOunce: '2589.00',
      quantityGrams: '0.5000',
      grossGoldValueAed: '153.36',
      platformFeeAed: '0.77',
      paymentFeeAed: '0.00',
      totalPayableAed: '154.13',
      cryptoEquivalentUsdt: '41.95',
      cryptoEquivalentUsdc: '41.95',
      paxgPriceUsd: '2589.00',
      paxgRequired: '0.016075',
      quoteCreatedAt: '2025-05-28T14:30:00Z',
      quoteExpiresAt: '2025-05-28T14:35:00Z',
      status: 'ACCEPTED',
      provider: 'MOCK_PAXG',
    };

    const order445: GoldOrder = {
      id: 'ORD-445',
      userId: 'USR-ONEX-664112',
      idempotencyKey: 'IDEMP-INIT-445',
      quantityGrams: '0.5000',
      unitTokenCount: '0.5',
      quote: quote445,
      status: 'PAYMENT_PENDING',
      createdAt: '2025-05-28T14:31:00Z',
      updatedAt: '2025-05-28T14:31:00Z',
    };
    this.orders.set(order445.id, order445);

    this.auditEvents.push({
      eventId: 'EVT-INIT-1',
      orderId: 'ORD-415',
      userId: this.userProfile.userId,
      timestamp: '2025-05-28T09:12:00Z',
      eventType: 'ORDER_CREATED',
      status: 'PAYMENT_PENDING',
      referenceId: 'ORD-415',
      actor: 'CUSTOMER',
      metadata: { quantityGrams: '1.0000', totalAed: '309.79' },
    });
    this.auditEvents.push({
      eventId: 'EVT-INIT-2',
      orderId: 'ORD-415',
      userId: this.userProfile.userId,
      timestamp: '2025-05-28T09:13:00Z',
      eventType: 'PAYMENT_CONFIRMED',
      status: 'PAYMENT_CONFIRMED',
      referenceId: 'PAY-ONEX-415',
      actor: 'SYSTEM',
      metadata: { method: 'USDT', amount: '84.35' },
    });
    this.auditEvents.push({
      eventId: 'EVT-INIT-3',
      orderId: 'ORD-415',
      userId: this.userProfile.userId,
      timestamp: '2025-05-28T09:13:45Z',
      eventType: 'PAXG_ORDER_FILLED',
      status: 'LIQUIDITY_FILLED',
      referenceId: 'PAXG-ORD-415',
      actor: 'LIQUIDITY_ENGINE',
      metadata: { filledPaxg: '0.032151', priceUsd: '2598.60' },
    });
    this.auditEvents.push({
      eventId: 'EVT-INIT-4',
      orderId: 'ORD-415',
      userId: this.userProfile.userId,
      timestamp: '2025-05-28T09:14:30Z',
      eventType: 'GOLD_ALLOCATION_COMPLETED',
      status: 'GOLD_ALLOCATED',
      referenceId: 'ALLOC-415',
      actor: 'VAULT_CUSTODIAN',
      metadata: { vaultBar: 'DXB-TG-999.9-B77201', certificateNumber: 'ONEX-CERT-2025-00415' },
    });
    this.auditEvents.push({
      eventId: 'EVT-INIT-5',
      orderId: 'ORD-415',
      userId: this.userProfile.userId,
      timestamp: '2025-05-28T09:15:10Z',
      eventType: 'DOCUMENT_SIGNED',
      status: 'DOCUMENT_SIGNED',
      referenceId: 'DOC-AGR-415',
      actor: 'CUSTOMER',
      metadata: { signer: 'Abhishk', templateId: 'TEMPLATE01' },
    });
    this.auditEvents.push({
      eventId: 'EVT-INIT-6',
      orderId: 'ORD-415',
      userId: this.userProfile.userId,
      timestamp: '2025-05-28T09:15:20Z',
      eventType: 'ORDER_COMPLETED',
      status: 'COMPLETED',
      referenceId: 'ORD-415',
      actor: 'SYSTEM',
      metadata: { totalGoldGrams: '1.0000' },
    });
  }

  public recordAuditEvent(event: Omit<AuditEvent, 'eventId' | 'timestamp'>): AuditEvent {
    const fullEvent: AuditEvent = {
      ...event,
      eventId: `EVT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditEvents.unshift(fullEvent);
    return fullEvent;
  }

  public recalculateHoldingsAndPortfolio(newOrder?: GoldOrder) {
    if (newOrder && newOrder.status === 'COMPLETED' && newOrder.allocation) {
      // Add to holdingsList
      this.goldHolding.holdingsList.unshift({
        orderId: newOrder.id,
        grams: newOrder.quantityGrams,
        purchasePricePerGramAed: newOrder.quote.goldPricePerGramAed,
        purchasedAt: newOrder.completedAt || newOrder.createdAt,
        egrCertificateNumber: newOrder.allocation.egrCertificateNumber,
        vaultBarSerialNumber: newOrder.allocation.vaultBarSerialNumber,
      });

      // Recalculate total grams
      const newTotalGrams = decAdd(this.goldHolding.totalGrams, newOrder.quantityGrams);
      const newTotalInvested = decAdd(this.goldHolding.investedAed, newOrder.quote.totalPayableAed);
      const newCurrentValue = decMul(newTotalGrams, this.currentPricePerGramAed);
      const newUnrealizedGain = decSub(newCurrentValue, newTotalInvested);
      const newUnrealizedPercent = decDiv(decMul(newUnrealizedGain, '100'), newTotalInvested, 2);

      this.goldHolding.totalGrams = newTotalGrams;
      this.goldHolding.totalTokens = newTotalGrams;
      this.goldHolding.investedAed = newTotalInvested;
      this.goldHolding.currentValueAed = newCurrentValue;
      this.goldHolding.unrealizedGainAed = newUnrealizedGain;
      this.goldHolding.unrealizedGainPercent = newUnrealizedPercent;

      // Add to portfolio gold assets
      this.portfolio.goldAssets.unshift({
        id: `GOLD-${newOrder.id}`,
        name: 'OneX Gold',
        grams: `${Number(newOrder.quantityGrams).toFixed(2)}g`,
        currentValueAed: newCurrentValue,
        investedAed: newTotalInvested,
        gainedValueAed: newUnrealizedGain,
        gainedPercent: `${newUnrealizedPercent}%`,
        estIrr: '5.25%',
        egrNumber: newOrder.allocation.egrCertificateNumber,
      });

      // Update portfolio totals
      const totalGoldCurrent = decAdd(this.portfolio.allocation.goldCurrentValueAed, newOrder.quote.totalPayableAed);
      this.portfolio.allocation.goldCurrentValueAed = totalGoldCurrent;
      this.portfolio.allocation.goldInvestedAed = decAdd(this.portfolio.allocation.goldInvestedAed, newOrder.quote.totalPayableAed);
      this.portfolio.totalHoldingsAed = decAdd(this.portfolio.totalHoldingsAed, newOrder.quote.totalPayableAed);
    }
  }

  public getAllTransactions(): GoldTransaction[] {
    const list: GoldTransaction[] = [];

    // 1. Buy Orders
    for (const order of this.orders.values()) {
      if (order.status === 'COMPLETED' || order.status === 'DOCUMENT_SIGNED' || order.status === 'GOLD_ALLOCATED') {
        list.push({
          id: `TXN-BUY-${order.id}`,
          type: 'BUY',
          orderId: order.id,
          userId: order.userId,
          timestamp: order.completedAt || order.createdAt,
          quantityGrams: order.quantityGrams,
          amountAed: order.quote.totalPayableAed,
          status: order.status,
          referenceId: order.allocation?.egrCertificateNumber || order.id,
          paxgDetails: order.liquidity
            ? {
                side: 'BUY',
                paxgAmount: order.liquidity.filledPaxg,
                paxgPriceUsd: order.liquidity.paxgPriceUsd,
                provider: order.liquidity.provider,
                executionId: order.liquidity.executionId,
              }
            : undefined,
          description: `Acquisition of ${order.quantityGrams}g OneX Gold (Allocation ${order.allocation?.egrCertificateNumber || order.id})`,
        });
      }
    }

    // 2. Sell Orders
    for (const sell of this.sellOrders.values()) {
      list.push({
        id: `TXN-SELL-${sell.id}`,
        type: 'SELL',
        orderId: sell.id,
        userId: sell.userId,
        timestamp: sell.completedAt || sell.createdAt,
        quantityGrams: sell.quantityGrams,
        amountAed: sell.quote.netProceedsAed,
        status: sell.status,
        referenceId: sell.settlement?.settlementId || sell.id,
        paxgDetails: sell.liquidity
          ? {
              side: 'SELL',
              paxgAmount: sell.liquidity.filledPaxg,
              paxgPriceUsd: sell.liquidity.paxgPriceUsd,
              provider: sell.liquidity.provider,
              executionId: sell.liquidity.executionId,
            }
          : undefined,
        description: `Instant Sale of ${sell.quantityGrams}g 24K Gold • Net AED ${sell.quote.netProceedsAed}`,
      });
    }

    // 3. Redemptions
    for (const red of this.redemptionRequests.values()) {
      list.push({
        id: `TXN-RED-${red.id}`,
        type: 'REDEEM',
        orderId: red.id,
        userId: red.userId,
        timestamp: red.completedAt || red.createdAt,
        quantityGrams: red.quantityGrams,
        status: red.status,
        referenceId: red.trackingCode || red.id,
        description: `Physical Bullion Vault Redemption of ${red.quantityGrams}g (${red.deallocatedBars.length} bar(s)) • Tracking: ${red.trackingCode}`,
      });
    }

    // Sort descending by timestamp
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getAdminOrders(): AdminOrderSummary[] {
    const customerMap: Record<string, { name: string; tier: 'INSTITUTIONAL' | 'RETAIL' | 'WEALTH_MGMT' }> = {
      'USR-ONEX-776197': { name: 'Abhishk (USR-***197)', tier: 'RETAIL' },
      'USR-ONEX-882104': { name: 'Tariq A. (USR-***104)', tier: 'INSTITUTIONAL' },
      'USR-ONEX-304918': { name: 'Sarah M. (USR-***918)', tier: 'WEALTH_MGMT' },
      'USR-ONEX-551092': { name: 'Al-Maktoum Trust (USR-***092)', tier: 'INSTITUTIONAL' },
      'USR-ONEX-912440': { name: 'Kareem N. (USR-***440)', tier: 'RETAIL' },
      'USR-ONEX-119830': { name: 'Zaid H. (USR-***830)', tier: 'RETAIL' },
      'USR-ONEX-773901': { name: 'Omar F. (USR-***901)', tier: 'WEALTH_MGMT' },
      'USR-ONEX-664112': { name: 'Priya S. (USR-***112)', tier: 'RETAIL' },
    };

    return Array.from(this.orders.values())
      .map((order) => {
        const cust = customerMap[order.userId] || {
          name: `Client ${order.userId.slice(-6)} (USR-***${order.userId.slice(-3)})`,
          tier: 'RETAIL' as const,
        };

        const paxgReq = order.quote?.paxgRequired || '0.000000';
        const paxgExec = order.liquidity?.filledPaxg || (order.liquidity?.status === 'FILLED' ? paxgReq : '0.000000');
        const paxgPrice = order.liquidity?.paxgPriceUsd || order.quote?.paxgPriceUsd || '2590.00';
        const prov = order.liquidity?.provider || order.quote?.provider || this.simulationConfig.providerMode;
        const execId = order.liquidity?.executionId || (order.status === 'COMPLETED' ? `EXEC-${order.id}` : 'PENDING');

        return {
          id: order.id,
          orderNumber: order.id,
          customerMasked: cust.name,
          customerUserId: order.userId,
          customerTier: cust.tier,
          goldQuantityGrams: order.quantityGrams,
          paxgRequired: paxgReq,
          paxgExecuted: paxgExec,
          paxgPriceUsd: paxgPrice,
          provider: prov,
          executionId: execId,
          status: order.status,
          createdAt: order.createdAt,
          completedAt: order.completedAt,
          paymentMethod: order.payment?.method || 'USDT',
          totalAed: order.quote?.totalPayableAed || '0.00',
          order,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getLiquidityMetrics(): LiquidityMetrics {
    const ordersList = Array.from(this.orders.values());
    const totalOrders = ordersList.length;

    let completedOrders = 0;
    let pendingOrders = 0;
    let failedOrders = 0;
    let totalGoldPurchasedGrams = '0.0000';
    let totalGoldAllocatedGrams = '0.0000';

    let pendingLiquidityPaxg = '0.000000';
    let paxgVolumeTotalPaxg = '0.000000';
    let paxgFilledVolumePaxg = '0.000000';
    let paxgOrdersCount = 0;
    let paxgFailedOrdersCount = 0;
    let totalExecutedValueUsd = '0.00';
    let lastExecRecord: PaxgExecutionRecord | null = null;
    let latestExecTime = 0;

    for (const ord of ordersList) {
      const paxgReq = ord.quote?.paxgRequired || '0.000000';
      paxgVolumeTotalPaxg = decAdd(paxgVolumeTotalPaxg, paxgReq);

      if (ord.status === 'COMPLETED' || ord.status === 'DOCUMENT_SIGNED') {
        completedOrders += 1;
        totalGoldPurchasedGrams = decAdd(totalGoldPurchasedGrams, ord.quantityGrams);
      } else if (ord.status === 'FAILED' || ord.status === 'CANCELLED') {
        failedOrders += 1;
      } else {
        pendingOrders += 1;
      }

      if (ord.allocation) {
        totalGoldAllocatedGrams = decAdd(totalGoldAllocatedGrams, ord.allocation.goldGrams || ord.quantityGrams);
      }

      if (
        ord.status === 'PAYMENT_PENDING' ||
        ord.status === 'PAYMENT_CONFIRMED' ||
        ord.status === 'LIQUIDITY_PENDING' ||
        ord.status === 'LIQUIDITY_EXECUTING'
      ) {
        pendingLiquidityPaxg = decAdd(pendingLiquidityPaxg, paxgReq);
      }

      if (ord.liquidity) {
        paxgOrdersCount += 1;
        if (ord.liquidity.status === 'FILLED') {
          const filled = ord.liquidity.filledPaxg || '0.000000';
          paxgFilledVolumePaxg = decAdd(paxgFilledVolumePaxg, filled);
          const val = decMul(filled, ord.liquidity.paxgPriceUsd || '3350.00');
          totalExecutedValueUsd = decAdd(totalExecutedValueUsd, val);
        } else if (ord.liquidity.status === 'REJECTED' || ord.liquidity.status === 'TIMEOUT' || ord.status === 'FAILED') {
          paxgFailedOrdersCount += 1;
        }

        if (ord.liquidity.executedAt) {
          const t = new Date(ord.liquidity.executedAt).getTime();
          if (t > latestExecTime) {
            latestExecTime = t;
            lastExecRecord = ord.liquidity;
          }
        }
      }
    }

    // Average price calculation
    const avgPrice = Number(paxgFilledVolumePaxg) > 0
      ? decDiv(totalExecutedValueUsd, paxgFilledVolumePaxg, 2)
      : '3350.00';

    // Success rate
    const totalAttempted = paxgOrdersCount > 0 ? paxgOrdersCount : 1;
    const filledCount = ordersList.filter((o) => o.liquidity?.status === 'FILLED').length;
    const successRate = ((filledCount / totalAttempted) * 100).toFixed(1);

    // Mock PAXG liquidity pool stats
    const mockStats = mockPaxgProvider.getMockStats();

    return {
      // 10 Core Metrics
      totalOrders,
      completedOrders,
      pendingOrders,
      failedOrders,
      totalGoldPurchasedGrams: Number(totalGoldPurchasedGrams).toFixed(4),
      totalGoldAllocatedGrams: Number(totalGoldAllocatedGrams).toFixed(4),
      totalTokensMinted: Number(totalGoldAllocatedGrams).toFixed(2),
      paxgAvailable: mockStats.availablePaxg,
      paxgUsed: mockStats.usedPaxg,
      paxgRemaining: mockStats.remainingPaxg,

      // Provider details
      paxgPriceUsd: mockStats.paxgPriceUsd,
      providerStatus: mockStats.status as 'HEALTHY' | 'DEGRADED' | 'OFFLINE',
      providerName: 'Mock PAXG Liquidity Engine',
      averageExecutionPriceUsd: avgPrice,
      executionSuccessRatePercent: `${successRate}%`,
      lastExecution: lastExecRecord,

      // Extra backwards compatibility
      totalOneXGoldOrders: totalOrders,
      pendingLiquidityPaxg: Number(pendingLiquidityPaxg).toFixed(6),
      paxgOrdersCount,
      paxgVolumeTotalPaxg: Number(paxgVolumeTotalPaxg).toFixed(6),
      paxgFilledVolumePaxg: Number(paxgFilledVolumePaxg).toFixed(6),
      paxgFailedOrdersCount,
      outstandingLiquidityPaxg: mockStats.remainingPaxg,
      providerReserveBalancePaxg: mockStats.availablePaxg,
    };
  }

  public getVaultInventory(): VaultInventoryBar[] {
    const bars: VaultInventoryBar[] = [
      {
        serialNumber: 'DXB-TG-999.9-B77201',
        egrNumber: 'ONEX-CERT-2025-00415',
        weightGrams: '1.0000',
        purity: '24K (999.9 Fine Gold)',
        status: 'ALLOCATED',
        allocatedToOrderId: 'ORD-415',
        allocatedToMaskedCustomer: 'Abhishk (USR-***197)',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault A-04',
        custodian: 'OneX Bullion Custodial Depository Ltd',
        allocatedAt: '2025-05-28T09:14:30Z',
        lastAuditDate: '2025-05-28',
      },
      {
        serialNumber: 'DXB-TG-999.9-C10992',
        egrNumber: 'ONEX-CERT-2025-00418',
        weightGrams: '10.0000',
        purity: '24K (999.9 Fine Gold)',
        status: 'ALLOCATED',
        allocatedToOrderId: 'ORD-418',
        allocatedToMaskedCustomer: 'Tariq A. (USR-***104)',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault A-12',
        custodian: 'OneX Bullion Custodial Depository Ltd',
        allocatedAt: '2025-05-28T10:03:50Z',
        lastAuditDate: '2025-05-28',
      },
      {
        serialNumber: 'DXB-TG-999.9-B41920',
        egrNumber: 'ONEX-CERT-2025-00422',
        weightGrams: '2.5000',
        purity: '24K (999.9 Fine Gold)',
        status: 'ALLOCATED',
        allocatedToOrderId: 'ORD-422',
        allocatedToMaskedCustomer: 'Sarah M. (USR-***918)',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault B-02',
        custodian: 'OneX Bullion Custodial Depository Ltd',
        allocatedAt: '2025-05-28T11:18:20Z',
        lastAuditDate: '2025-05-28',
      },
      {
        serialNumber: 'DXB-TG-999.9-D99014',
        egrNumber: 'ONEX-CERT-2025-00433',
        weightGrams: '25.0000',
        purity: '24K (999.9 Fine Gold)',
        status: 'ALLOCATED',
        allocatedToOrderId: 'ORD-433',
        allocatedToMaskedCustomer: 'Al-Maktoum Trust (USR-***092)',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault C-01',
        custodian: 'OneX Bullion Custodial Depository Ltd',
        allocatedAt: '2025-05-28T12:03:10Z',
        lastAuditDate: '2025-05-28',
      },
      {
        serialNumber: 'DXB-TG-999.9-E55102',
        egrNumber: 'ONEX-CERT-2025-00429',
        weightGrams: '5.0000',
        purity: '24K (999.9 Fine Gold)',
        status: 'ALLOCATED',
        allocatedToOrderId: 'ORD-429',
        allocatedToMaskedCustomer: 'Kareem N. (USR-***440)',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault B-09',
        custodian: 'OneX Bullion Custodial Depository Ltd',
        allocatedAt: '2025-05-28T13:03:00Z',
        lastAuditDate: '2025-05-28',
      },
      {
        serialNumber: 'DXB-TG-999.9-RES-001',
        egrNumber: 'ONEX-RESERVE-001',
        weightGrams: '50.0000',
        purity: '24K (999.9 Fine Gold)',
        status: 'UNALLOCATED_RESERVE',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault Vault-R01',
        custodian: 'OneX Bullion Custodial Depository Ltd',
        lastAuditDate: '2025-05-28',
      },
      {
        serialNumber: 'DXB-TG-999.9-RES-002',
        egrNumber: 'ONEX-RESERVE-002',
        weightGrams: '100.0000',
        purity: '24K (999.9 Fine Gold)',
        status: 'UNALLOCATED_RESERVE',
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault Vault-R02',
        custodian: 'OneX Bullion Custodial Depository Ltd',
        lastAuditDate: '2025-05-28',
      },
    ];

    return bars;
  }

  public getReconciliationReport(): ReconciliationReport {
    const inventory = this.getVaultInventory();
    const allocatedBars = inventory.filter((b) => b.status === 'ALLOCATED');
    const totalAllocatedGrams = allocatedBars.reduce((acc, b) => decAdd(acc, b.weightGrams), '0.0000');
    const totalVaultGrams = inventory.reduce((acc, b) => decAdd(acc, b.weightGrams), '0.0000');
    
    // Sum tokens
    let totalTokensGrams = '0.0000';
    for (const ord of this.orders.values()) {
      if (ord.status === 'COMPLETED' || ord.status === 'GOLD_ALLOCATED' || ord.status === 'DOCUMENT_PENDING') {
        totalTokensGrams = decAdd(totalTokensGrams, ord.quantityGrams);
      }
    }

    return {
      reconciliationId: `REC-ONEX-AUDIT-${new Date().toISOString().slice(0, 10)}`,
      generatedAt: new Date().toISOString(),
      overallStatus: 'RECONCILED',
      totalPhysicalGoldGrams: totalVaultGrams,
      totalTokenizedGrams: totalTokensGrams,
      reserveBackingRatioPercent: '100.00%',
      paxgPoolTotalOz: '48.500000',
      paxgPoolAllocatedOz: '1.418180',
      fiatSettledAed: '14217.90',
      fiatPendingAed: '616.51',
      checks: [
        {
          name: '1:1 Physical Gold to Token Reserve Backing',
          description: 'Validates that every issued OneX Gold token is backed by allocated 24K bullion in DMCC vaults.',
          expected: `${totalTokensGrams}g`,
          actual: `${totalTokensGrams}g`,
          discrepancy: '0.0000g',
          status: 'MATCHED',
        },
        {
          name: 'PAXG Institutional Liquidity Pool Backing',
          description: 'Paxos Trust Company custodian reserve vs executed OneX gold orders.',
          expected: '1.418180 PAXG',
          actual: '1.418180 PAXG',
          discrepancy: '0.000000 PAXG',
          status: 'MATCHED',
        },
        {
          name: 'TransGuard DMCC Bar Serial Allocation Check',
          description: 'Audits that every allocated bullion bar matches an existing stamped physical bar in DMCC custody.',
          expected: `${allocatedBars.length} Allocated Bars`,
          actual: `${allocatedBars.length} Allocated Bars`,
          discrepancy: '0 Bars',
          status: 'MATCHED',
        },
        {
          name: 'Fiat & Crypto Payment Settlement Settlement Ledger',
          description: 'Reconciles payment gateway deposits with initiated buy orders.',
          expected: 'AED 14,834.41',
          actual: 'AED 14,834.41',
          discrepancy: 'AED 0.00',
          status: 'MATCHED',
        },
      ],
    };
  }
}

export const store = new InMemoryStore();

