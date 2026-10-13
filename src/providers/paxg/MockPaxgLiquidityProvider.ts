/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PaxgLiquidityProvider,
  PaxgQuoteResult,
  PaxgOrderResult,
  PaxgBalanceResult,
} from '../../types/providers';
import { calculatePaxgFromGrams, calculateGramsFromPaxg, decMul, AED_USD_PEG, GRAMS_PER_TROY_OUNCE } from '../../lib/decimal';
import Decimal from 'decimal.js';

export class MockPaxgLiquidityProvider implements PaxgLiquidityProvider {
  public readonly providerName = 'MOCK_PAXG_LIQUIDITY_ENGINE';

  private availablePaxg: Decimal = new Decimal('100.000000');
  private lockedPaxg: Decimal = new Decimal('0.000000');
  private basePaxgPriceUsd: Decimal = new Decimal('3350.00');
  private isProviderOffline: boolean = false;

  private orders: Map<string, PaxgOrderResult> = new Map();
  private idempotencyCache: Map<string, PaxgOrderResult> = new Map();

  /**
   * Adds mock PAXG liquidity to the simulated account.
   */
  public addMockLiquidity(amount: string | number): {
    previousBalance: string;
    added: string;
    newBalance: string;
  } {
    const prev = this.availablePaxg.toFixed(6);
    const addDec = new Decimal(amount);
    this.availablePaxg = this.availablePaxg.plus(addDec);
    return {
      previousBalance: prev,
      added: addDec.toFixed(6),
      newBalance: this.availablePaxg.toFixed(6),
    };
  }

  /**
   * Adjusts the simulated PAXG/USD spot price.
   */
  public setMockPrice(priceUsd: string | number): void {
    this.basePaxgPriceUsd = new Decimal(priceUsd);
  }

  /**
   * Resets mock liquidity to initial 100.000000 PAXG state.
   */
  public resetLiquidity(): void {
    this.availablePaxg = new Decimal('100.000000');
    this.lockedPaxg = new Decimal('0.000000');
    this.isProviderOffline = false;
  }

  /**
   * Toggles simulated provider offline state.
   */
  public toggleOffline(): boolean {
    this.isProviderOffline = !this.isProviderOffline;
    return this.isProviderOffline;
  }

  public setOffline(offline: boolean): void {
    this.isProviderOffline = offline;
  }

  public getMockStats() {
    return {
      availablePaxg: this.availablePaxg.toFixed(6),
      usedPaxg: this.lockedPaxg.toFixed(6),
      remainingPaxg: this.availablePaxg.toFixed(6),
      paxgPriceUsd: this.basePaxgPriceUsd.toFixed(2),
      status: this.isProviderOffline ? 'OFFLINE' : 'HEALTHY',
    };
  }

  /**
   * Generates a fresh market quote for PAXG.
   * 1 PAXG = 31.1034768 grams
   */
  public async getQuote(requestedGoldGrams: string, side: 'BUY' | 'SELL' = 'BUY'): Promise<PaxgQuoteResult> {
    if (this.isProviderOffline) {
      throw new Error('MOCK_PAXG_OFFLINE: Mock PAXG liquidity desk is currently offline.');
    }

    const paxgRequired = calculatePaxgFromGrams(requestedGoldGrams);
    const quoteId = `PAXG-Q-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Live market fluctuation ±0.05%
    const fluctuation = new Decimal((Math.random() - 0.5) * 0.001);
    const currentPrice = this.basePaxgPriceUsd.times(new Decimal(1).plus(fluctuation)).toFixed(2);

    return {
      quoteId,
      market: 'PAXGUSD',
      side,
      paxgPriceUsd: currentPrice,
      requestedGoldGrams,
      paxgRequired,
      expiresInSeconds: 30,
      provider: 'MOCK_PAXG',
    };
  }

  /**
   * Executes a buy order on the mock PAXG liquidity pool.
   * Safe and idempotent: Never executes twice for the same idempotency key or OneX order.
   */
  public async executeBuy(params: {
    orderId: string;
    quoteId: string;
    requestedGoldGrams: string;
    idempotencyKey: string;
    failureMode?: string;
    forceFailure?: boolean;
    forceInsufficientLiquidity?: boolean;
  }): Promise<PaxgOrderResult> {
    // 1. Idempotency Check: return existing execution without double-debiting
    if (this.idempotencyCache.has(params.idempotencyKey)) {
      return this.idempotencyCache.get(params.idempotencyKey)!;
    }

    const paxgRequired = calculatePaxgFromGrams(params.requestedGoldGrams);
    const requiredDecimal = new Decimal(paxgRequired);
    const providerOrderId = `PAXG-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 2. Handle Failure States:
    const failureMode = params.failureMode || 'NONE';

    if (this.isProviderOffline || failureMode === 'PROVIDER_OFFLINE') {
      const failedOrder: PaxgOrderResult = {
        providerOrderId,
        quoteId: params.quoteId,
        market: 'PAXGUSD',
        side: 'BUY',
        type: 'MARKET',
        requestedPaxg: paxgRequired,
        filledPaxg: '0.000000',
        status: 'REJECTED',
        executionPrice: this.basePaxgPriceUsd.toFixed(2),
        totalUsd: '0.00',
        rejectionReason: 'PAXG_PROVIDER_OFFLINE: Upstream mock liquidity desk is disconnected or offline.',
      };
      this.orders.set(providerOrderId, failedOrder);
      this.idempotencyCache.set(params.idempotencyKey, failedOrder);
      return failedOrder;
    }

    // A. QUOTE_EXPIRED
    if (failureMode === 'QUOTE_EXPIRED') {
      const failedOrder: PaxgOrderResult = {
        providerOrderId,
        quoteId: params.quoteId,
        market: 'PAXGUSD',
        side: 'BUY',
        type: 'MARKET',
        requestedPaxg: paxgRequired,
        filledPaxg: '0.000000',
        status: 'REJECTED',
        executionPrice: this.basePaxgPriceUsd.toFixed(2),
        totalUsd: '0.00',
        rejectionReason: 'QUOTE_EXPIRED: The 30s pricing window has lapsed. Please renew quote.',
      };
      this.orders.set(providerOrderId, failedOrder);
      this.idempotencyCache.set(params.idempotencyKey, failedOrder);
      return failedOrder;
    }

    // B. INSUFFICIENT_LIQUIDITY
    if (
      failureMode === 'INSUFFICIENT_LIQUIDITY' ||
      params.forceInsufficientLiquidity ||
      requiredDecimal.greaterThan(this.availablePaxg)
    ) {
      const failedOrder: PaxgOrderResult = {
        providerOrderId,
        quoteId: params.quoteId,
        market: 'PAXGUSD',
        side: 'BUY',
        type: 'MARKET',
        requestedPaxg: paxgRequired,
        filledPaxg: '0.000000',
        status: 'REJECTED',
        executionPrice: this.basePaxgPriceUsd.toFixed(2),
        totalUsd: '0.00',
        rejectionReason: 'INSUFFICIENT_LIQUIDITY: Order size exceeds current PAXG available pool.',
      };
      this.orders.set(providerOrderId, failedOrder);
      this.idempotencyCache.set(params.idempotencyKey, failedOrder);
      return failedOrder;
    }

    // C. EXECUTION_REJECTED
    if (failureMode === 'EXECUTION_REJECTED' || params.forceFailure) {
      const failedOrder: PaxgOrderResult = {
        providerOrderId,
        quoteId: params.quoteId,
        market: 'PAXGUSD',
        side: 'BUY',
        type: 'MARKET',
        requestedPaxg: paxgRequired,
        filledPaxg: '0.000000',
        status: 'REJECTED',
        executionPrice: this.basePaxgPriceUsd.toFixed(2),
        totalUsd: '0.00',
        rejectionReason: 'EXECUTION_REJECTED: Upstream PAXG market maker rejected buy order due to slippage tolerance.',
      };
      this.orders.set(providerOrderId, failedOrder);
      this.idempotencyCache.set(params.idempotencyKey, failedOrder);
      return failedOrder;
    }

    // D. PARTIAL_FILL (simulate 60% fill)
    if (failureMode === 'PARTIAL_FILL') {
      const partialFilled = requiredDecimal.times('0.60').toFixed(6);
      const totalUsd = decMul(partialFilled, this.basePaxgPriceUsd.toFixed(2));
      const partialOrder: PaxgOrderResult = {
        providerOrderId,
        quoteId: params.quoteId,
        market: 'PAXGUSD',
        side: 'BUY',
        type: 'MARKET',
        requestedPaxg: paxgRequired,
        filledPaxg: partialFilled,
        status: 'PARTIALLY_FILLED',
        executionPrice: this.basePaxgPriceUsd.toFixed(2),
        totalUsd: new Decimal(totalUsd).toFixed(2),
        rejectionReason: 'PARTIAL_FILL: Only 60% of requested PAXG quantity filled in order book.',
      };
      this.orders.set(providerOrderId, partialOrder);
      this.idempotencyCache.set(params.idempotencyKey, partialOrder);
      return partialOrder;
    }

    // E. EXECUTION_TIMEOUT
    if (failureMode === 'EXECUTION_TIMEOUT') {
      const timeoutOrder: PaxgOrderResult = {
        providerOrderId,
        quoteId: params.quoteId,
        market: 'PAXGUSD',
        side: 'BUY',
        type: 'MARKET',
        requestedPaxg: paxgRequired,
        filledPaxg: '0.000000',
        status: 'TIMEOUT',
        executionPrice: this.basePaxgPriceUsd.toFixed(2),
        totalUsd: '0.00',
        rejectionReason: 'EXECUTION_TIMEOUT: Upstream Paxos liquidity provider connection timed out.',
      };
      this.orders.set(providerOrderId, timeoutOrder);
      this.idempotencyCache.set(params.idempotencyKey, timeoutOrder);
      return timeoutOrder;
    }

    // 3. Successful Full Fill: Debit available PAXG pool
    this.availablePaxg = this.availablePaxg.minus(requiredDecimal);
    this.lockedPaxg = this.lockedPaxg.plus(requiredDecimal);

    const totalUsd = decMul(paxgRequired, this.basePaxgPriceUsd.toFixed(2));

    const orderResult: PaxgOrderResult = {
      providerOrderId,
      quoteId: params.quoteId,
      market: 'PAXGUSD',
      side: 'BUY',
      type: 'MARKET',
      requestedPaxg: paxgRequired,
      filledPaxg: paxgRequired,
      status: 'FILLED',
      executionPrice: this.basePaxgPriceUsd.toFixed(2),
      totalUsd: new Decimal(totalUsd).toFixed(2),
    };

    this.orders.set(providerOrderId, orderResult);
    this.idempotencyCache.set(params.idempotencyKey, orderResult);
    return orderResult;
  }

  /**
   * Executes a sell order on the mock PAXG liquidity pool.
   * Reuses the same liquidity pool abstraction with reverse side and idempotency.
   */
  public async executeSell(params: {
    orderId: string;
    quoteId: string;
    requestedGoldGrams: string;
    idempotencyKey: string;
    failureMode?: string;
    forceFailure?: boolean;
    forceInsufficientLiquidity?: boolean;
  }): Promise<PaxgOrderResult> {
    // 1. Idempotency Check: return existing execution without double-crediting
    if (this.idempotencyCache.has(params.idempotencyKey)) {
      return this.idempotencyCache.get(params.idempotencyKey)!;
    }

    const paxgToSell = calculatePaxgFromGrams(params.requestedGoldGrams);
    const sellDecimal = new Decimal(paxgToSell);
    const providerOrderId = `PAXG-SELL-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const failureMode = params.failureMode || 'NONE';

    if (failureMode === 'EXECUTION_REJECTED' || params.forceFailure) {
      const failedOrder: PaxgOrderResult = {
        providerOrderId,
        quoteId: params.quoteId,
        market: 'PAXGUSD',
        side: 'SELL',
        type: 'MARKET',
        requestedPaxg: paxgToSell,
        filledPaxg: '0.000000',
        status: 'REJECTED',
        executionPrice: this.basePaxgPriceUsd.toFixed(2),
        totalUsd: '0.00',
        rejectionReason: 'EXECUTION_REJECTED: PAXG sell liquidity desk temporarily unavailable.',
      };
      this.orders.set(providerOrderId, failedOrder);
      this.idempotencyCache.set(params.idempotencyKey, failedOrder);
      return failedOrder;
    }

    // Return sold PAXG back into available pool
    this.availablePaxg = this.availablePaxg.plus(sellDecimal);
    const totalUsd = decMul(paxgToSell, this.basePaxgPriceUsd.toFixed(2));

    const orderResult: PaxgOrderResult = {
      providerOrderId,
      quoteId: params.quoteId,
      market: 'PAXGUSD',
      side: 'SELL',
      type: 'MARKET',
      requestedPaxg: paxgToSell,
      filledPaxg: paxgToSell,
      status: 'FILLED',
      executionPrice: this.basePaxgPriceUsd.toFixed(2),
      totalUsd: new Decimal(totalUsd).toFixed(2),
    };

    this.orders.set(providerOrderId, orderResult);
    this.idempotencyCache.set(params.idempotencyKey, orderResult);
    return orderResult;
  }

  public async getOrder(providerOrderId: string): Promise<PaxgOrderResult> {
    const order = this.orders.get(providerOrderId);
    if (!order) {
      throw new Error(`Paxg order ${providerOrderId} not found.`);
    }
    return order;
  }

  public async cancelOrder(providerOrderId: string): Promise<{ success: boolean }> {
    const order = this.orders.get(providerOrderId);
    if (order && order.status === 'OPEN') {
      order.status = 'CANCELLED';
      return { success: true };
    }
    return { success: false };
  }

  public async getBalance(): Promise<PaxgBalanceResult> {
    const totalPaxg = this.availablePaxg.plus(this.lockedPaxg);
    return {
      availablePaxg: this.availablePaxg.toFixed(6),
      lockedPaxg: this.lockedPaxg.toFixed(6),
      totalPaxg: totalPaxg.toFixed(6),
      equivalentGoldGrams: calculateGramsFromPaxg(this.availablePaxg),
      status: 'HEALTHY',
    };
  }
}

export const mockPaxgProvider = new MockPaxgLiquidityProvider();
