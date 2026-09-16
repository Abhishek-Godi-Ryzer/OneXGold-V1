/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MockPaxgLiquidityProvider, mockPaxgProvider } from '../providers/paxg/MockPaxgLiquidityProvider';
import { PaxosPaxgLiquidityProvider, paxosPaxgProvider } from '../providers/paxg/PaxosPaxgLiquidityProvider';
import { PaxgExecutionRecord, AuditEventType } from '../types/domain';
import { PaxgLiquidityProvider, PaxgQuoteResult, PaxgOrderResult } from '../types/providers';
import { store } from '../lib/store';

export interface ExecuteLiquidityParams {
  side: 'BUY' | 'SELL';
  orderId: string;
  quoteId: string;
  requestedGoldGrams: string;
  idempotencyKey: string;
  userId?: string;
}

/**
 * Reusable GoldLiquidityService:
 * Unified institutional liquidity engine supporting both BUY (accumulation) and SELL (liquidation)
 * directions via the shared PAXG provider abstraction.
 */
export class GoldLiquidityService {
  /**
   * Resolves active liquidity provider based on configuration:
   * 1. Check runtime simulation toggle
   * 2. Fall back to process.env.LIQUIDITY_PROVIDER ('mock' | 'paxos', default 'mock')
   */
  public static getActiveProvider(): PaxgLiquidityProvider {
    const envProvider = (process.env.LIQUIDITY_PROVIDER || 'mock').trim().toLowerCase();
    const isPaxosMode =
      store.simulationConfig.providerMode === 'PAXOS_SANDBOX' || envProvider === 'paxos';

    if (isPaxosMode) {
      return paxosPaxgProvider;
    }
    return mockPaxgProvider;
  }

  /**
   * Request institutional spot quote for PAXG BUY or SELL.
   */
  public static async getQuote(
    requestedGoldGrams: string,
    side: 'BUY' | 'SELL' = 'BUY'
  ): Promise<PaxgQuoteResult> {
    const provider = this.getActiveProvider();
    return provider.getQuote(requestedGoldGrams, side);
  }

  /**
   * Unified execution method for BUY or SELL directions.
   * Enforces double-execution prevention and logs audit trail events.
   */
  public static async executeLiquidity(params: ExecuteLiquidityParams): Promise<PaxgExecutionRecord> {
    const provider = this.getActiveProvider();
    const userId = params.userId || store.userProfile.userId;
    const isSell = params.side === 'SELL';

    // 1. Audit Quote Lock / Execution Initiation
    store.recordAuditEvent({
      orderId: params.orderId,
      userId,
      eventType: isSell ? 'PAXG_ORDER_CREATED' : 'PAXG_QUOTE_REQUESTED',
      status: isSell ? 'LIQUIDITY_EXECUTING' : 'LIQUIDITY_EXECUTING',
      referenceId: params.quoteId,
      actor: 'LIQUIDITY_ENGINE',
      metadata: {
        provider: store.simulationConfig.providerMode,
        side: params.side,
        requestedGoldGrams: params.requestedGoldGrams,
        idempotencyKey: params.idempotencyKey,
      },
    });

    // 2. Dispatch to shared provider abstraction
    let result: PaxgOrderResult;
    if (isSell) {
      result = await provider.executeSell({
        orderId: params.orderId,
        quoteId: params.quoteId,
        requestedGoldGrams: params.requestedGoldGrams,
        idempotencyKey: params.idempotencyKey,
        failureMode: store.simulationConfig.paxgFailureMode || 'NONE',
        forceFailure: store.simulationConfig.forceLiquidityRejection,
        forceInsufficientLiquidity: store.simulationConfig.forceInsufficientLiquidity,
      });
    } else {
      result = await provider.executeBuy({
        orderId: params.orderId,
        quoteId: params.quoteId,
        requestedGoldGrams: params.requestedGoldGrams,
        idempotencyKey: params.idempotencyKey,
        failureMode: store.simulationConfig.paxgFailureMode || 'NONE',
        forceFailure: store.simulationConfig.forceLiquidityRejection,
        forceInsufficientLiquidity: store.simulationConfig.forceInsufficientLiquidity,
      });
    }

    // 3. Construct Normalized Execution Record
    const executionRecord: PaxgExecutionRecord = {
      executionId: `EXEC-${params.side}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      orderId: params.orderId,
      quoteId: params.quoteId,
      provider: store.simulationConfig.providerMode,
      market: result.market,
      side: result.side,
      requestedGoldGrams: params.requestedGoldGrams,
      requestedPaxg: result.requestedPaxg,
      filledPaxg: result.filledPaxg,
      paxgPriceUsd: result.executionPrice,
      totalUsd: result.totalUsd,
      status: result.status,
      providerOrderId: result.providerOrderId,
      executedAt: new Date().toISOString(),
      rejectionReason: result.rejectionReason,
    };

    // 4. Audit Execution Outcome
    if (result.status === 'FILLED') {
      const eventType: AuditEventType = isSell ? 'PAXG_SELL_EXECUTED' : 'PAXG_ORDER_FILLED';
      store.recordAuditEvent({
        orderId: params.orderId,
        userId,
        eventType,
        status: isSell ? 'LIQUIDITY_FILLED' : 'LIQUIDITY_FILLED',
        referenceId: result.providerOrderId,
        actor: 'LIQUIDITY_ENGINE',
        metadata: {
          executionId: executionRecord.executionId,
          side: params.side,
          filledPaxg: result.filledPaxg,
          priceUsd: result.executionPrice,
          totalUsd: result.totalUsd,
          market: result.market,
        },
      });
    } else {
      store.recordAuditEvent({
        orderId: params.orderId,
        userId,
        eventType: 'PAXG_ORDER_FAILED',
        status: 'FAILED',
        referenceId: result.providerOrderId,
        actor: 'LIQUIDITY_ENGINE',
        metadata: {
          side: params.side,
          status: result.status,
          reason: result.rejectionReason,
        },
      });
    }

    return executionRecord;
  }

  /**
   * Helper specifically for Buy operations
   */
  public static async executePaxgBuy(params: {
    orderId: string;
    quoteId: string;
    requestedGoldGrams: string;
    idempotencyKey: string;
  }): Promise<PaxgExecutionRecord> {
    return this.executeLiquidity({
      ...params,
      side: 'BUY',
    });
  }

  /**
   * Helper specifically for Sell operations
   */
  public static async executePaxgSell(params: {
    orderId: string;
    quoteId: string;
    requestedGoldGrams: string;
    idempotencyKey: string;
  }): Promise<PaxgExecutionRecord> {
    return this.executeLiquidity({
      ...params,
      side: 'SELL',
    });
  }

  public static async getOrder(providerOrderId: string) {
    const provider = this.getActiveProvider();
    return provider.getOrder(providerOrderId);
  }

  public static async cancelOrder(providerOrderId: string) {
    const provider = this.getActiveProvider();
    return provider.cancelOrder(providerOrderId);
  }

  public static async getProviderBalance() {
    const provider = this.getActiveProvider();
    return provider.getBalance();
  }
}

export const LiquidityService = GoldLiquidityService;

