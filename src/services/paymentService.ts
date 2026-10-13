/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MockPaymentProvider } from '../providers/payment/MockPaymentProvider';
import { PaymentDetails, PaymentMethodType } from '../types/domain';
import { store } from '../lib/store';

const paymentProvider = new MockPaymentProvider();

export class PaymentService {
  public static async initiatePayment(params: {
    orderId: string;
    amount: string;
    currency: 'AED' | 'USDT' | 'USDC' | 'INR';
    method: PaymentMethodType;
    idempotencyKey: string;
  }): Promise<PaymentDetails> {
    const payment = await paymentProvider.initiatePayment(params);

    store.recordAuditEvent({
      orderId: params.orderId,
      userId: store.userProfile.userId,
      eventType: 'PAYMENT_INITIATED',
      status: 'PAYMENT_PENDING',
      referenceId: payment.paymentId,
      actor: 'CUSTOMER',
      metadata: { method: params.method, amount: params.amount, currency: params.currency },
    });

    return payment;
  }

  public static async confirmPayment(paymentId: string, orderId: string): Promise<PaymentDetails> {
    const shouldFail = store.simulationConfig.forcePaymentFailure;
    const payment = await paymentProvider.confirmPayment(paymentId, shouldFail);

    if (payment.status === 'SUCCESS') {
      store.recordAuditEvent({
        orderId,
        userId: store.userProfile.userId,
        eventType: 'PAYMENT_CONFIRMED',
        status: 'PAYMENT_CONFIRMED',
        referenceId: payment.paymentId,
        actor: 'SYSTEM',
        metadata: { transactionReference: payment.transactionReference, paidAt: payment.paidAt },
      });
    } else {
      store.recordAuditEvent({
        orderId,
        userId: store.userProfile.userId,
        eventType: 'PAYMENT_FAILED',
        status: 'FAILED',
        referenceId: payment.paymentId,
        actor: 'SYSTEM',
        metadata: { failureReason: payment.failureReason },
      });
    }

    return payment;
  }
}
