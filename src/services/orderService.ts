/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoldOrder, OrderStatus, PaymentMethodType } from '../types/domain';
import { store } from '../lib/store';
import { QuoteService } from './quoteService';
import { PaymentService } from './paymentService';
import { GoldLiquidityService, LiquidityService } from './GoldLiquidityService';
import { AllocationService } from './allocationService';
import { DocumentService } from './documentService';

export class OrderService {
  /**
   * Creates a new gold order from an active quote.
   */
  public static async createOrder(params: {
    quoteId: string;
    idempotencyKey: string;
    paymentMethod: PaymentMethodType;
  }): Promise<GoldOrder> {
    // Check for existing order with same idempotency key
    for (const existingOrder of store.orders.values()) {
      if (existingOrder.idempotencyKey === params.idempotencyKey) {
        return existingOrder;
      }
    }

    const quote = QuoteService.getQuote(params.quoteId);
    if (!quote) {
      throw new Error(`Quote ${params.quoteId} not found.`);
    }

    if (quote.status === 'EXPIRED') {
      throw new Error('Quote has expired. Please refresh your quote to proceed.');
    }

    quote.status = 'ACCEPTED';

    const orderId = `ORD-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const order: GoldOrder = {
      id: orderId,
      userId: store.userProfile.userId,
      idempotencyKey: params.idempotencyKey,
      quantityGrams: quote.quantityGrams,
      unitTokenCount: Number(quote.quantityGrams).toFixed(0),
      quote,
      status: 'PAYMENT_PENDING',
      createdAt: now,
      updatedAt: now,
    };

    // Initialize payment
    const paymentCurrency =
      params.paymentMethod === 'USDT'
        ? 'USDT'
        : params.paymentMethod === 'USDC'
          ? 'USDC'
          : params.paymentMethod === 'UPI'
            ? 'INR'
            : 'AED';

    const paymentAmount =
      params.paymentMethod === 'USDT'
        ? quote.cryptoEquivalentUsdt
        : params.paymentMethod === 'USDC'
          ? quote.cryptoEquivalentUsdc
          : quote.totalPayableAed;

    const payment = await PaymentService.initiatePayment({
      orderId,
      amount: paymentAmount,
      currency: paymentCurrency,
      method: params.paymentMethod,
      idempotencyKey: `PAY-IDEMP-${params.idempotencyKey}`,
    });

    order.payment = payment;

    store.orders.set(orderId, order);

    store.recordAuditEvent({
      orderId,
      userId: store.userProfile.userId,
      eventType: 'ORDER_CREATED',
      status: 'PAYMENT_PENDING',
      previousStatus: 'DRAFT',
      referenceId: orderId,
      actor: 'CUSTOMER',
      metadata: {
        quantityGrams: order.quantityGrams,
        totalPayableAed: quote.totalPayableAed,
        paymentMethod: params.paymentMethod,
      },
    });

    return order;
  }

  /**
   * Confirms payment and triggers the downstream pipeline:
   * Payment Confirmed -> PAXG Liquidity Buy -> Gold Allocation -> Document Generation
   */
  public static async processPaymentAndLiquidity(orderId: string): Promise<GoldOrder> {
    const order = store.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    if (!order.payment) {
      throw new Error(`Payment details missing for order ${orderId}.`);
    }

    // 1. Confirm Payment
    const paymentResult = await PaymentService.confirmPayment(order.payment.paymentId, orderId);
    order.payment = paymentResult;
    order.updatedAt = new Date().toISOString();

    if (paymentResult.status !== 'SUCCESS') {
      order.status = 'FAILED';
      order.failureReason = paymentResult.failureReason || 'Payment failed.';
      store.recordAuditEvent({
        orderId,
        userId: store.userProfile.userId,
        eventType: 'ORDER_FAILED',
        status: 'FAILED',
        referenceId: orderId,
        actor: 'SYSTEM',
        metadata: { stage: 'PAYMENT', reason: order.failureReason },
      });
      return order;
    }

    order.status = 'PAYMENT_CONFIRMED';

    // 2. Execute PAXG Liquidity Buy
    order.status = 'LIQUIDITY_PENDING';
    const liquidityResult = await LiquidityService.executePaxgBuy({
      orderId,
      quoteId: order.quote.quoteId,
      requestedGoldGrams: order.quantityGrams,
      idempotencyKey: `LIQ-IDEMP-${order.idempotencyKey}`,
    });

    order.liquidity = liquidityResult;

    if (liquidityResult.status !== 'FILLED') {
      order.status = 'FAILED';
      order.failureReason = liquidityResult.rejectionReason || 'PAXG liquidity execution rejected.';
      store.recordAuditEvent({
        orderId,
        userId: store.userProfile.userId,
        eventType: 'ORDER_FAILED',
        status: 'FAILED',
        referenceId: orderId,
        actor: 'SYSTEM',
        metadata: { stage: 'LIQUIDITY', reason: order.failureReason },
      });
      return order;
    }

    order.status = 'LIQUIDITY_FILLED';

    // 3. Physical Gold Allocation & Certificate Issuance
    order.status = 'GOLD_ALLOCATING';
    try {
      const allocationResult = await AllocationService.allocatePhysicalGold({
        orderId,
        goldGrams: order.quantityGrams,
        executionId: liquidityResult.executionId,
      });
      order.allocation = allocationResult;
      order.status = 'GOLD_ALLOCATED';
    } catch (err: any) {
      order.status = 'FAILED';
      order.failureReason = err?.message || 'Physical vault allocation error.';
      store.recordAuditEvent({
        orderId,
        userId: store.userProfile.userId,
        eventType: 'ORDER_FAILED',
        status: 'FAILED',
        referenceId: orderId,
        actor: 'SYSTEM',
        metadata: { stage: 'ALLOCATION', reason: order.failureReason },
      });
      return order;
    }

    // 4. Generate Legal Agreement TEMPLATE01 for Signature
    order.status = 'DOCUMENT_PENDING';
    const document = await DocumentService.generateDocument(orderId, order.quote);
    order.document = document;

    order.updatedAt = new Date().toISOString();
    return order;
  }

  /**
   * Retries the liquidity execution step for a failed or halted order.
   * Safe and idempotent.
   */
  public static async retryLiquidityExecution(orderId: string): Promise<GoldOrder> {
    const order = store.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    if (!order.payment || order.payment.status !== 'SUCCESS') {
      throw new Error('Cannot retry liquidity execution without confirmed payment.');
    }

    store.recordAuditEvent({
      orderId,
      userId: store.userProfile.userId,
      eventType: 'PAXG_ORDER_FAILED',
      status: 'LIQUIDITY_EXECUTING',
      referenceId: orderId,
      actor: 'SYSTEM',
      metadata: { retryAttempt: true },
    });

    order.status = 'LIQUIDITY_EXECUTING';
    order.failureReason = undefined;

    // Retry PAXG execution with a refreshed idempotency key for this retry attempt
    const retryKey = `LIQ-RETRY-${order.idempotencyKey}-${Date.now()}`;
    const liquidityResult = await LiquidityService.executePaxgBuy({
      orderId,
      quoteId: order.quote.quoteId,
      requestedGoldGrams: order.quantityGrams,
      idempotencyKey: retryKey,
    });

    order.liquidity = liquidityResult;

    if (liquidityResult.status !== 'FILLED') {
      order.status = 'FAILED';
      order.failureReason = liquidityResult.rejectionReason || 'PAXG liquidity execution rejected on retry.';
      store.recordAuditEvent({
        orderId,
        userId: store.userProfile.userId,
        eventType: 'ORDER_FAILED',
        status: 'FAILED',
        referenceId: orderId,
        actor: 'SYSTEM',
        metadata: { stage: 'LIQUIDITY_RETRY', reason: order.failureReason },
      });
      return order;
    }

    order.status = 'LIQUIDITY_FILLED';

    // Physical gold allocation
    order.status = 'GOLD_ALLOCATING';
    try {
      const allocationResult = await AllocationService.allocatePhysicalGold({
        orderId,
        goldGrams: order.quantityGrams,
        executionId: liquidityResult.executionId,
      });
      order.allocation = allocationResult;
      order.status = 'GOLD_ALLOCATED';
    } catch (err: any) {
      order.status = 'FAILED';
      order.failureReason = err?.message || 'Physical vault allocation error.';
      return order;
    }

    // Document preparation
    order.status = 'DOCUMENT_PENDING';
    const document = await DocumentService.generateDocument(orderId, order.quote);
    order.document = document;
    order.updatedAt = new Date().toISOString();

    return order;
  }

  /**
   * Signs the agreement document and transitions order to COMPLETED
   */
  public static async signDocumentAndCompleteOrder(params: {
    orderId: string;
    signerName: string;
    signatureIp: string;
  }): Promise<GoldOrder> {
    const order = store.orders.get(params.orderId);
    if (!order) {
      throw new Error(`Order ${params.orderId} not found.`);
    }

    if (!order.document) {
      throw new Error(`Document not generated for order ${params.orderId}.`);
    }

    const signedDoc = await DocumentService.signDocument(
      order.document.documentId,
      params.orderId,
      params.signerName,
      params.signatureIp,
    );

    order.document = signedDoc;
    order.status = 'DOCUMENT_SIGNED';

    // Final completion transition
    const completedAt = new Date().toISOString();
    order.status = 'COMPLETED';
    order.completedAt = completedAt;
    order.updatedAt = completedAt;

    // Update holdings and portfolio ONLY after completion
    store.recalculateHoldingsAndPortfolio(order);

    store.recordAuditEvent({
      orderId: params.orderId,
      userId: store.userProfile.userId,
      eventType: 'ORDER_COMPLETED',
      status: 'COMPLETED',
      previousStatus: 'DOCUMENT_SIGNED',
      referenceId: order.id,
      actor: 'SYSTEM',
      metadata: {
        totalGrams: order.quantityGrams,
        egrCertificateNumber: order.allocation?.egrCertificateNumber,
        vaultBar: order.allocation?.vaultBarSerialNumber,
      },
    });

    return order;
  }

  public static getOrder(orderId: string): GoldOrder | null {
    return store.orders.get(orderId) || null;
  }

  public static async retryFailedOrder(orderId: string): Promise<GoldOrder> {
    const order = store.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    if (order.status === 'COMPLETED') {
      return order;
    }

    // Reset failure state
    order.failureReason = undefined;

    if (!order.payment || order.payment.status !== 'SUCCESS') {
      // Confirm payment
      const payment = await PaymentService.confirmPayment(order.payment?.paymentId || `PAY-${orderId}`, orderId);
      order.payment = payment;
      if (payment.status !== 'SUCCESS') {
        order.status = 'FAILED';
        order.failureReason = 'Payment confirmation failed during retry.';
        return order;
      }
      order.status = 'PAYMENT_CONFIRMED';
    }

    if (!order.liquidity || order.liquidity.status !== 'FILLED') {
      // Re-run liquidity execution via GoldLiquidityService
      const retryKey = `LIQ-RETRY-${order.idempotencyKey}-${Date.now()}`;
      const liq = await GoldLiquidityService.executeLiquidity({
        side: 'BUY',
        orderId,
        quoteId: order.quote.quoteId,
        requestedGoldGrams: order.quantityGrams,
        idempotencyKey: retryKey,
      });
      order.liquidity = liq;
      if (liq.status !== 'FILLED') {
        order.status = 'FAILED';
        order.failureReason = liq.rejectionReason || 'PAXG liquidity execution rejected on retry.';
        return order;
      }
      order.status = 'LIQUIDITY_FILLED';
    }

    if (!order.allocation) {
      // Re-run allocation
      const alloc = await AllocationService.allocatePhysicalGold({
        orderId,
        goldGrams: order.quantityGrams,
        executionId: order.liquidity.executionId,
      });
      order.allocation = alloc;
      order.status = 'GOLD_ALLOCATED';
    }

    if (!order.document || order.document.status !== 'SIGNED') {
      // Generate document if not present
      if (!order.document) {
        order.document = await DocumentService.generateDocument(orderId, order.quote);
      }
      return this.signDocumentAndCompleteOrder({
        orderId,
        signerName: order.document.signerName || 'Client Signatory',
        signatureIp: '127.0.0.1 (Operator Overwrite)',
      });
    }

    // Final completion transition if already signed
    const completedAt = new Date().toISOString();
    order.status = 'COMPLETED';
    order.completedAt = completedAt;
    order.updatedAt = completedAt;
    store.recalculateHoldingsAndPortfolio(order);
    return order;
  }

  public static listOrders(): GoldOrder[] {
    return Array.from(store.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
