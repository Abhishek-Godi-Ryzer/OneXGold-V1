/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaymentProvider } from '../../types/providers';
import { PaymentDetails, PaymentMethodType, PaymentStatus } from '../../types/domain';

export class MockPaymentProvider implements PaymentProvider {
  public readonly providerName = 'MOCK_PAYMENT_GATEWAY_SERVICE';

  private payments: Map<string, PaymentDetails> = new Map();
  private idempotencyCache: Map<string, PaymentDetails> = new Map();

  public async initiatePayment(params: {
    orderId: string;
    amount: string;
    currency: 'AED' | 'USDT' | 'USDC' | 'INR';
    method: PaymentMethodType;
    idempotencyKey: string;
  }): Promise<PaymentDetails> {
    if (this.idempotencyCache.has(params.idempotencyKey)) {
      return this.idempotencyCache.get(params.idempotencyKey)!;
    }

    const paymentId = `PAY-ONEX-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const transactionReference = `TXN-REF-${params.method}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const payment: PaymentDetails = {
      paymentId,
      orderId: params.orderId,
      method: params.method,
      currency: params.currency,
      amount: params.amount,
      status: 'PENDING',
      transactionReference,
    };

    this.payments.set(paymentId, payment);
    this.idempotencyCache.set(params.idempotencyKey, payment);
    return payment;
  }

  public async confirmPayment(paymentId: string, forceFailure = false): Promise<PaymentDetails> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found.`);
    }

    if (forceFailure) {
      payment.status = 'FAILED';
      payment.failureReason = 'CARD_DECLINED_OR_INSUFFICIENT_FUNDS';
      return payment;
    }

    payment.status = 'SUCCESS';
    payment.paidAt = new Date().toISOString();
    return payment;
  }

  public async getPaymentStatus(paymentId: string): Promise<PaymentDetails> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found.`);
    }
    return payment;
  }
}
