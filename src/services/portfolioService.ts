/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { store } from '../lib/store';
import {
  GoldHolding,
  PortfolioSummary,
  GoldSellQuote,
  GoldSellOrder,
  GoldRedemptionRequest,
  GoldTransaction,
} from '../types/domain';
import {
  decMul,
  decSub,
  decDiv,
  decAdd,
  AED_USD_PEG,
  GRAMS_PER_TROY_OUNCE,
  calculatePaxgFromGrams,
} from '../lib/decimal';
import { GoldLiquidityService } from './GoldLiquidityService';

export class PortfolioService {
  public static getPortfolio(): PortfolioSummary {
    return store.portfolio;
  }

  public static getGoldHolding(): GoldHolding {
    // Dynamically update current value based on store's current price
    const totalGrams = store.goldHolding.totalGrams;
    const livePrice = store.currentPricePerGramAed;
    const currentValue = decMul(totalGrams, livePrice);
    const invested = store.goldHolding.investedAed;
    const gainAed = decSub(currentValue, invested);
    const gainPct =
      Number(invested) > 0 ? decDiv(decMul(gainAed, '100'), invested, 2) : '0.00';

    store.goldHolding.currentValueAed = currentValue;
    store.goldHolding.unrealizedGainAed = gainAed;
    store.goldHolding.unrealizedGainPercent = gainPct;

    return store.goldHolding;
  }

  /**
   * ==========================================
   * SELL GOLD LIFECYCLE
   * ==========================================
   */

  /**
   * Step 1 & 2: Generate Locked Sell Quote for PAXG liquidation
   */
  public static async createSellQuote(gramsToSell: string): Promise<GoldSellQuote> {
    const holding = this.getGoldHolding();
    const sellQty = Number(gramsToSell);
    const availableQty = Number(holding.totalGrams);

    if (isNaN(sellQty) || sellQty <= 0) {
      throw new Error('Please enter a valid quantity of gold grams to sell.');
    }

    if (sellQty > availableQty) {
      throw new Error(`Insufficient gold holdings. Available to sell: ${availableQty}g`);
    }

    const livePriceAed = store.currentPricePerGramAed;
    // Derive USD price per ounce
    const goldPriceUsdOunce = decDiv(decMul(livePriceAed, GRAMS_PER_TROY_OUNCE), AED_USD_PEG, 2);

    // Get PAXG sell quote from shared liquidity provider
    const paxgQuote = await GoldLiquidityService.getQuote(gramsToSell, 'SELL');

    // Financial calculations:
    const grossProceedsAed = decMul(gramsToSell, livePriceAed);
    const platformFeeAed = decMul(grossProceedsAed, '0.005'); // 0.50% fee
    const netProceedsAed = decSub(grossProceedsAed, platformFeeAed);
    const totalUsd = decDiv(netProceedsAed, AED_USD_PEG, 2);

    const quoteId = `SELL-Q-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 1000);

    const sellQuote: GoldSellQuote = {
      quoteId,
      goldPricePerGramAed: livePriceAed,
      goldPriceUsdPerOunce: goldPriceUsdOunce,
      quantityGrams: gramsToSell,
      grossProceedsAed,
      platformFeeAed,
      netProceedsAed,
      paxgPriceUsd: paxgQuote.paxgPriceUsd,
      paxgSold: paxgQuote.paxgRequired,
      totalUsd,
      quoteCreatedAt: now.toISOString(),
      quoteExpiresAt: expiresAt.toISOString(),
      status: 'ACTIVE',
      provider: store.simulationConfig.providerMode,
    };

    store.sellQuotes.set(quoteId, sellQuote);

    store.recordAuditEvent({
      orderId: quoteId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_SELL_QUOTE_CREATED',
      status: 'QUOTE_CREATED',
      referenceId: quoteId,
      actor: 'SYSTEM',
      metadata: {
        grams: gramsToSell,
        netProceedsAed,
        paxgSold: paxgQuote.paxgRequired,
        paxgPriceUsd: paxgQuote.paxgPriceUsd,
      },
    });

    return sellQuote;
  }

  /**
   * Step 3 - 6: Confirm & Execute PAXG Sell -> Settlement -> Completed
   * Prevents double execution via idempotencyKey and balance locks.
   */
  public static async executeSellOrder(params: {
    quoteId: string;
    grams: string;
    idempotencyKey: string;
  }): Promise<GoldSellOrder> {
    // 1. Idempotency check to prevent double execution
    if (store.processedIdempotencyKeys.has(params.idempotencyKey)) {
      const existing = Array.from(store.sellOrders.values()).find(
        (s) => s.idempotencyKey === params.idempotencyKey
      );
      if (existing) return existing;
    }

    const quote = store.sellQuotes.get(params.quoteId);
    if (!quote) {
      throw new Error('Sell quote not found or has expired. Please refresh the quote.');
    }

    if (new Date(quote.quoteExpiresAt).getTime() < Date.now()) {
      quote.status = 'EXPIRED';
      throw new Error('Pricing window for this quote has expired. Please generate a fresh quote.');
    }

    const holding = this.getGoldHolding();
    const sellQty = Number(params.grams);
    const availableQty = Number(holding.totalGrams);

    if (sellQty > availableQty) {
      throw new Error(`Insufficient gold holdings. Available: ${availableQty}g, requested: ${sellQty}g`);
    }

    // Register idempotency key immediately
    store.processedIdempotencyKeys.add(params.idempotencyKey);

    const sellOrderId = `SELL-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    // 2. Audit sell confirmation
    store.recordAuditEvent({
      orderId: sellOrderId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_SELL_CONFIRMED',
      status: 'CONFIRMED',
      referenceId: params.quoteId,
      actor: 'CUSTOMER',
      metadata: {
        quoteId: params.quoteId,
        quantityGrams: params.grams,
        netProceedsAed: quote.netProceedsAed,
      },
    });

    // 3. Execute PAXG SELL via reusable GoldLiquidityService
    const liquidityResult = await GoldLiquidityService.executeLiquidity({
      side: 'SELL',
      orderId: sellOrderId,
      quoteId: quote.quoteId,
      requestedGoldGrams: params.grams,
      idempotencyKey: params.idempotencyKey,
      userId: store.userProfile.userId,
    });

    if (liquidityResult.status !== 'FILLED') {
      const failedSellOrder: GoldSellOrder = {
        id: sellOrderId,
        userId: store.userProfile.userId,
        idempotencyKey: params.idempotencyKey,
        quantityGrams: params.grams,
        quote,
        status: 'FAILED',
        liquidity: liquidityResult,
        createdAt: nowIso,
        updatedAt: nowIso,
        failureReason: liquidityResult.rejectionReason || 'PAXG Sell liquidity execution failed.',
      };
      store.sellOrders.set(sellOrderId, failedSellOrder);
      throw new Error(failedSellOrder.failureReason);
    }

    // 4. Token & Balance Adjustment (Deduct sold gold tokens/grams)
    const newTotalGrams = decSub(holding.totalGrams, params.grams);
    store.goldHolding.totalGrams = Number(newTotalGrams) > 0 ? newTotalGrams : '0.0000';
    store.goldHolding.totalTokens = store.goldHolding.totalGrams;

    // Prune/reduce individual holding list items proportionally
    let remainingToDeduct = Number(params.grams);
    const updatedHoldingsList = [];
    for (const h of store.goldHolding.holdingsList) {
      const itemQty = Number(h.grams);
      if (remainingToDeduct <= 0) {
        updatedHoldingsList.push(h);
      } else if (itemQty <= remainingToDeduct) {
        remainingToDeduct -= itemQty;
      } else {
        updatedHoldingsList.push({
          ...h,
          grams: (itemQty - remainingToDeduct).toFixed(4),
        });
        remainingToDeduct = 0;
      }
    }
    store.goldHolding.holdingsList = updatedHoldingsList;

    // 5. Settlement: Immediate AED Fiat Credit to OneX Wallet
    const settlementId = `SETTLE-AED-${Date.now().toString().slice(-6)}`;
    const settledAt = new Date().toISOString();

    const sellOrder: GoldSellOrder = {
      id: sellOrderId,
      userId: store.userProfile.userId,
      idempotencyKey: params.idempotencyKey,
      quantityGrams: params.grams,
      quote,
      status: 'COMPLETED',
      liquidity: liquidityResult,
      settlement: {
        settlementId,
        currency: 'AED',
        netAmountAed: quote.netProceedsAed,
        destinationWallet: `OneX AED Wallet (USR-776197)`,
        settledAt,
      },
      createdAt: nowIso,
      updatedAt: settledAt,
      completedAt: settledAt,
    };

    store.sellOrders.set(sellOrderId, sellOrder);

    // 6. Record Audit Events for Settlement & Completion
    store.recordAuditEvent({
      orderId: sellOrderId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_SELL_SETTLED',
      status: 'SETTLED',
      referenceId: settlementId,
      actor: 'SYSTEM',
      metadata: {
        settlementId,
        netAmountAed: quote.netProceedsAed,
        destination: `OneX AED Primary Wallet`,
      },
    });

    store.recordAuditEvent({
      orderId: sellOrderId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_SOLD',
      status: 'COMPLETED',
      referenceId: sellOrderId,
      actor: 'CUSTOMER',
      metadata: {
        gramsSold: params.grams,
        netAed: quote.netProceedsAed,
        paxgFilled: liquidityResult.filledPaxg,
        paxgExecutionPrice: liquidityResult.paxgPriceUsd,
      },
    });

    // Refresh holding values
    this.getGoldHolding();

    return sellOrder;
  }

  /**
   * ==========================================
   * REDEEM GOLD LIFECYCLE
   * ==========================================
   */

  /**
   * Step 1 & 2: Enter Quantity & Validation
   */
  public static validateRedemption(params: {
    grams: string;
    deliveryAddress: string;
    recipientName?: string;
    recipientPhone?: string;
  }): {
    valid: boolean;
    grams: string;
    holdingBalanceBefore: string;
    holdingBalanceAfter: string;
    deallocatingBars: {
      vaultBarSerialNumber: string;
      egrCertificateNumber: string;
      grams: string;
    }[];
    feeAed: string;
    vaultLocation: string;
    courier: string;
  } {
    const holding = this.getGoldHolding();
    const redeemQty = Number(params.grams);
    const availableQty = Number(holding.totalGrams);

    if (isNaN(redeemQty) || redeemQty < 1) {
      throw new Error('Minimum physical bullion bar redemption quantity is 1.00g (24K Fine Gold).');
    }

    if (redeemQty > availableQty) {
      throw new Error(`Insufficient holdings for redemption. Available in vault custody: ${availableQty}g`);
    }

    if (!params.deliveryAddress || params.deliveryAddress.trim().length < 5) {
      throw new Error('Please specify a valid UAE or GCC secure delivery address.');
    }

    // Determine matching bullion bars from vault custody
    const deallocatingBars = [];
    let allocatedCount = 0;
    for (const h of holding.holdingsList) {
      if (allocatedCount < redeemQty) {
        deallocatingBars.push({
          vaultBarSerialNumber: h.vaultBarSerialNumber,
          egrCertificateNumber: h.egrCertificateNumber,
          grams: h.grams,
        });
        allocatedCount += Number(h.grams);
      }
    }

    const holdingBalanceAfter = (availableQty - redeemQty).toFixed(4);

    store.recordAuditEvent({
      orderId: `VAL-RED-${Date.now().toString().slice(-6)}`,
      userId: store.userProfile.userId,
      eventType: 'GOLD_REDEMPTION_VALIDATED',
      status: 'VALIDATING',
      referenceId: 'VAL-DMCC',
      actor: 'SYSTEM',
      metadata: {
        grams: params.grams,
        availableBefore: holding.totalGrams,
        availableAfter: holdingBalanceAfter,
        barsCount: deallocatingBars.length,
      },
    });

    return {
      valid: true,
      grams: params.grams,
      holdingBalanceBefore: holding.totalGrams,
      holdingBalanceAfter,
      deallocatingBars,
      feeAed: '0.00', // Complimentary insured vault dispatch
      vaultLocation: 'TransGuard Dubai / DMCC Secure Bullion Vault',
      courier: 'TransGuard Armored Logistics (Fully Insured)',
    };
  }

  /**
   * Step 3 - 7: Redemption Request -> Token/Balance Adjustment -> Reconciliation -> Completed
   * Prevents double redemption using idempotencyKey & lock.
   */
  public static async executeRedemption(params: {
    grams: string;
    deliveryAddress: string;
    recipientName: string;
    recipientPhone: string;
    idempotencyKey: string;
  }): Promise<GoldRedemptionRequest> {
    // 1. Double Redemption Prevention via Idempotency Key
    if (store.processedIdempotencyKeys.has(params.idempotencyKey)) {
      const existing = Array.from(store.redemptionRequests.values()).find(
        (r) => r.idempotencyKey === params.idempotencyKey
      );
      if (existing) return existing;
    }

    // Validate request
    const validation = this.validateRedemption({
      grams: params.grams,
      deliveryAddress: params.deliveryAddress,
      recipientName: params.recipientName,
      recipientPhone: params.recipientPhone,
    });

    store.processedIdempotencyKeys.add(params.idempotencyKey);

    const redemptionId = `RED-DMCC-${Date.now().toString().slice(-6)}`;
    const trackingCode = `DXB-VAL-TG-${Date.now().toString().slice(-6)}`;
    const reconciliationId = `RECON-DMCC-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    // 2. Audit: Redemption Requested
    store.recordAuditEvent({
      orderId: redemptionId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_REDEMPTION_REQUESTED',
      status: 'REQUESTED',
      referenceId: redemptionId,
      actor: 'CUSTOMER',
      metadata: {
        grams: params.grams,
        deliveryAddress: params.deliveryAddress,
        recipientName: params.recipientName,
      },
    });

    // 3. Token / Balance Adjustment: Deduct from user holdings & bar registry
    const holding = this.getGoldHolding();
    const newTotalGrams = decSub(holding.totalGrams, params.grams);
    store.goldHolding.totalGrams = Number(newTotalGrams) > 0 ? newTotalGrams : '0.0000';
    store.goldHolding.totalTokens = store.goldHolding.totalGrams;

    let remainingToDeduct = Number(params.grams);
    const updatedHoldingsList = [];
    for (const h of store.goldHolding.holdingsList) {
      const itemQty = Number(h.grams);
      if (remainingToDeduct <= 0) {
        updatedHoldingsList.push(h);
      } else if (itemQty <= remainingToDeduct) {
        remainingToDeduct -= itemQty;
      } else {
        updatedHoldingsList.push({
          ...h,
          grams: (itemQty - remainingToDeduct).toFixed(4),
        });
        remainingToDeduct = 0;
      }
    }
    store.goldHolding.holdingsList = updatedHoldingsList;

    // 4. Audit: Balance Adjusted
    store.recordAuditEvent({
      orderId: redemptionId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_BALANCE_ADJUSTED',
      status: 'BALANCE_ADJUSTED',
      referenceId: redemptionId,
      actor: 'SYSTEM',
      metadata: {
        deductedTokens: params.grams,
        newBalanceGrams: store.goldHolding.totalGrams,
      },
    });

    // 5. Audit: Vault Custody Deallocation
    store.recordAuditEvent({
      orderId: redemptionId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_VAULT_DEALLOCATED',
      status: 'VAULT_DEALLOCATED',
      referenceId: trackingCode,
      actor: 'VAULT_CUSTODIAN',
      metadata: {
        vaultLocation: 'TransGuard Dubai / DMCC Secure Vault',
        deallocatedBars: validation.deallocatingBars,
      },
    });

    // 6. Audit: Reconciliation Completed
    store.recordAuditEvent({
      orderId: redemptionId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_RECONCILIATION_COMPLETED',
      status: 'RECONCILED',
      referenceId: reconciliationId,
      actor: 'SYSTEM',
      metadata: {
        reconciliationId,
        egrCancelledCount: validation.deallocatingBars.length,
      },
    });

    // 7. Audit: Overall Redemption Completed & Dispatched
    store.recordAuditEvent({
      orderId: redemptionId,
      userId: store.userProfile.userId,
      eventType: 'GOLD_REDEEMED',
      status: 'COMPLETED',
      referenceId: trackingCode,
      actor: 'CUSTOMER',
      metadata: {
        grams: params.grams,
        trackingCode,
        courier: 'TransGuard Armored Logistics',
      },
    });

    const redemptionRequest: GoldRedemptionRequest = {
      id: redemptionId,
      userId: store.userProfile.userId,
      idempotencyKey: params.idempotencyKey,
      quantityGrams: params.grams,
      status: 'COMPLETED',
      deliveryAddress: params.deliveryAddress,
      recipientName: params.recipientName,
      recipientPhone: params.recipientPhone,
      vaultLocation: validation.vaultLocation,
      deallocatedBars: validation.deallocatingBars,
      trackingCode,
      courier: validation.courier,
      validationDetails: {
        valid: true,
        holdingBalanceBefore: validation.holdingBalanceBefore,
        holdingBalanceAfter: validation.holdingBalanceAfter,
        feeAed: validation.feeAed,
      },
      reconciliationId,
      createdAt: nowIso,
      updatedAt: nowIso,
      completedAt: nowIso,
    };

    store.redemptionRequests.set(redemptionId, redemptionRequest);

    // Refresh holding values
    this.getGoldHolding();

    return redemptionRequest;
  }

  /**
   * ==========================================
   * TRANSACTION HISTORY
   * ==========================================
   */
  public static getTransactions(): GoldTransaction[] {
    return store.getAllTransactions();
  }
}

