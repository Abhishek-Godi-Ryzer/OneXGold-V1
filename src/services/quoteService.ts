/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoldQuote } from '../types/domain';
import { calculateQuoteBreakdown } from '../lib/decimal';
import { store } from '../lib/store';
import { MockPaxgLiquidityProvider } from '../providers/paxg/MockPaxgLiquidityProvider';
import { PaxosSandboxPaxgProvider } from '../providers/paxg/PaxosSandboxPaxgProvider';

const mockPaxgProvider = new MockPaxgLiquidityProvider();
const paxosSandboxProvider = new PaxosSandboxPaxgProvider();

export class QuoteService {
  public static getActiveProvider() {
    return store.simulationConfig.providerMode === 'PAXOS_SANDBOX'
      ? paxosSandboxProvider
      : mockPaxgProvider;
  }

  public static async createQuote(quantityGrams: string | number): Promise<GoldQuote> {
    const provider = this.getActiveProvider();
    const gramsStr = Number(quantityGrams).toFixed(4);

    // Fetch live market quote from liquidity provider
    const paxgQuote = await provider.getQuote(gramsStr);

    const breakdown = calculateQuoteBreakdown({
      quantityGrams: gramsStr,
      goldPricePerGramAed: store.currentPricePerGramAed,
    });

    const quoteId = `QUOTE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 1000); // 30 seconds validity per requirements

    const quote: GoldQuote = {
      quoteId,
      goldPricePerGramAed: breakdown.goldPricePerGramAed,
      goldPriceUsdPerOunce: breakdown.goldPriceUsdPerOunce,
      quantityGrams: breakdown.quantityGrams,
      grossGoldValueAed: breakdown.grossGoldValueAed,
      platformFeeAed: breakdown.platformFeeAed,
      paymentFeeAed: breakdown.paymentFeeAed,
      totalPayableAed: breakdown.totalPayableAed,
      cryptoEquivalentUsdt: breakdown.cryptoEquivalentUsdt,
      cryptoEquivalentUsdc: breakdown.cryptoEquivalentUsdc,
      paxgPriceUsd: breakdown.paxgPriceUsd,
      paxgRequired: breakdown.paxgRequired,
      quoteCreatedAt: now.toISOString(),
      quoteExpiresAt: expiresAt.toISOString(),
      status: 'ACTIVE',
      provider: store.simulationConfig.providerMode,
    };

    store.quotes.set(quoteId, quote);

    store.recordAuditEvent({
      orderId: 'N/A',
      userId: store.userProfile.userId,
      eventType: 'QUOTE_CREATED',
      status: 'DRAFT',
      referenceId: quoteId,
      actor: 'SYSTEM',
      metadata: {
        quantityGrams: quote.quantityGrams,
        totalAed: quote.totalPayableAed,
        paxgRequired: quote.paxgRequired,
        paxgPriceUsd: quote.paxgPriceUsd,
      },
    });

    return quote;
  }

  public static getQuote(quoteId: string): GoldQuote | null {
    const quote = store.quotes.get(quoteId);
    if (!quote) return null;

    // Check expiry
    if (quote.status === 'ACTIVE' && new Date() > new Date(quote.quoteExpiresAt)) {
      quote.status = 'EXPIRED';
      store.recordAuditEvent({
        orderId: 'N/A',
        userId: store.userProfile.userId,
        eventType: 'QUOTE_EXPIRED',
        status: 'DRAFT',
        referenceId: quoteId,
        actor: 'SYSTEM',
        metadata: { quoteId },
      });
    }

    return quote;
  }
}
