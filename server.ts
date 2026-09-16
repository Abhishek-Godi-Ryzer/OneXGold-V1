/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { store } from './src/lib/store';
import { QuoteService } from './src/services/quoteService';
import { OrderService } from './src/services/orderService';
import { LiquidityService } from './src/services/liquidityService';
import { PortfolioService } from './src/services/portfolioService';
import { mockPaxgProvider } from './src/providers/paxg/MockPaxgLiquidityProvider';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ===================== API ROUTES FIRST =====================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. Current Price & Quote Endpoints
  app.get('/api/quote/latest', (req, res) => {
    res.json({
      pricePerGramAed: store.currentPricePerGramAed,
      providerMode: store.simulationConfig.providerMode,
      troyOunceConversion: '1 PAXG = 31.1034768 grams',
      lastUpdated: new Date().toISOString(),
    });
  });

  app.post('/api/quote/create', async (req, res) => {
    try {
      const { quantityGrams } = req.body;
      if (!quantityGrams || Number(quantityGrams) <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than 0.' });
      }
      const quote = await QuoteService.createQuote(quantityGrams);
      res.json(quote);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create quote.' });
    }
  });

  app.get('/api/quote/:id', (req, res) => {
    const quote = QuoteService.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found.' });
    }
    res.json(quote);
  });

  // 2. Order Lifecycle Endpoints
  app.post('/api/orders/create', async (req, res) => {
    try {
      const { quoteId, idempotencyKey, paymentMethod } = req.body;
      if (!quoteId || !idempotencyKey || !paymentMethod) {
        return res.status(400).json({ error: 'quoteId, idempotencyKey and paymentMethod are required.' });
      }

      const order = await OrderService.createOrder({
        quoteId,
        idempotencyKey,
        paymentMethod,
      });

      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Order creation failed.' });
    }
  });

  app.get('/api/orders', (req, res) => {
    const orders = OrderService.listOrders();
    res.json(orders);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = OrderService.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  });

  // Order-specific Audit Events
  app.get('/api/orders/:id/audit', (req, res) => {
    const orderId = req.params.id;
    const events = store.auditEvents
      .filter((e) => e.orderId === orderId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    res.json(events);
  });

  // Payment Confirmation & Automated Pipeline Execution
  app.post('/api/orders/:id/process-payment', async (req, res) => {
    try {
      // Optional simulated delays configured in simulationConfig
      if (store.simulationConfig.liquidityDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, store.simulationConfig.liquidityDelayMs));
      }

      const order = await OrderService.processPaymentAndLiquidity(req.params.id);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Order processing failed.' });
    }
  });

  // Safe and idempotent liquidity retry
  app.post('/api/orders/:id/retry-liquidity', async (req, res) => {
    try {
      if (store.simulationConfig.liquidityDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, store.simulationConfig.liquidityDelayMs));
      }

      const order = await OrderService.retryLiquidityExecution(req.params.id);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Liquidity retry failed.' });
    }
  });

  // Document E-signature
  app.post('/api/orders/:id/sign-document', async (req, res) => {
    try {
      const { signerName, signatureIp } = req.body;
      const order = await OrderService.signDocumentAndCompleteOrder({
        orderId: req.params.id,
        signerName: signerName || store.userProfile.name,
        signatureIp: signatureIp || req.ip || '127.0.0.1',
      });
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Document signing failed.' });
    }
  });

  // 3. Portfolio & Holdings Endpoints
  app.get('/api/portfolio', (req, res) => {
    res.json(PortfolioService.getPortfolio());
  });

  app.get('/api/gold/holdings', (req, res) => {
    res.json(PortfolioService.getGoldHolding());
  });

  // Sell Lifecycle Endpoints
  app.post('/api/gold/sell/quote', async (req, res) => {
    try {
      const { grams } = req.body;
      const quote = await PortfolioService.createSellQuote(String(grams));
      res.json(quote);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create sell quote.' });
    }
  });

  app.post('/api/gold/sell/execute', async (req, res) => {
    try {
      const { quoteId, grams, idempotencyKey } = req.body;
      const sellOrder = await PortfolioService.executeSellOrder({
        quoteId,
        grams: String(grams),
        idempotencyKey: idempotencyKey || `IDEM-SELL-${Date.now()}`,
      });
      res.json(sellOrder);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to execute gold sell.' });
    }
  });

  app.get('/api/gold/sell/:id', (req, res) => {
    const sellOrder = store.sellOrders.get(req.params.id);
    if (!sellOrder) {
      return res.status(404).json({ error: 'Sell order not found.' });
    }
    const audits = store.auditEvents.filter((a) => a.orderId === req.params.id);
    res.json({ ...sellOrder, auditEvents: audits });
  });

  // Redeem Lifecycle Endpoints
  app.post('/api/gold/redeem/validate', (req, res) => {
    try {
      const { grams, deliveryAddress, recipientName, recipientPhone } = req.body;
      const validation = PortfolioService.validateRedemption({
        grams: String(grams),
        deliveryAddress: deliveryAddress || 'Villa 14, Palm Jumeirah, Dubai, UAE',
        recipientName: recipientName || store.userProfile.name,
        recipientPhone: recipientPhone || store.userProfile.phone,
      });
      res.json(validation);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Redemption validation failed.' });
    }
  });

  app.post('/api/gold/redeem/execute', async (req, res) => {
    try {
      const { grams, deliveryAddress, recipientName, recipientPhone, idempotencyKey } = req.body;
      const redemption = await PortfolioService.executeRedemption({
        grams: String(grams),
        deliveryAddress: deliveryAddress || 'Villa 14, Palm Jumeirah, Dubai, UAE',
        recipientName: recipientName || store.userProfile.name,
        recipientPhone: recipientPhone || store.userProfile.phone,
        idempotencyKey: idempotencyKey || `IDEM-RED-${Date.now()}`,
      });
      res.json(redemption);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to execute gold redemption.' });
    }
  });

  app.get('/api/gold/redeem/:id', (req, res) => {
    const red = store.redemptionRequests.get(req.params.id);
    if (!red) {
      return res.status(404).json({ error: 'Redemption request not found.' });
    }
    const audits = store.auditEvents.filter((a) => a.orderId === req.params.id);
    res.json({ ...red, auditEvents: audits });
  });

  // Consolidated Transaction History
  app.get('/api/gold/transactions', (req, res) => {
    res.json(PortfolioService.getTransactions());
  });

  // Legacy quick action endpoints (maintained for backwards compatibility)
  app.post('/api/gold/sell', async (req, res) => {
    try {
      const { grams } = req.body;
      const quote = await PortfolioService.createSellQuote(String(grams));
      const sellOrder = await PortfolioService.executeSellOrder({
        quoteId: quote.quoteId,
        grams: String(grams),
        idempotencyKey: `IDEM-SELL-LEGACY-${Date.now()}`,
      });
      res.json({
        success: true,
        message: `Successfully sold ${grams}g 24K Gold for AED ${sellOrder.quote.netProceedsAed}.`,
        holding: PortfolioService.getGoldHolding(),
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to sell gold.' });
    }
  });

  app.post('/api/gold/redeem', async (req, res) => {
    try {
      const { grams, address } = req.body;
      const red = await PortfolioService.executeRedemption({
        grams: String(grams),
        deliveryAddress: address || 'Villa 14, Palm Jumeirah, Dubai, UAE',
        recipientName: store.userProfile.name,
        recipientPhone: store.userProfile.phone,
        idempotencyKey: `IDEM-RED-LEGACY-${Date.now()}`,
      });
      res.json({
        success: true,
        message: `Redemption request for ${grams}g physical bullion dispatched. Tracking: ${red.trackingCode}`,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to redeem gold.' });
    }
  });

  // 4. Admin / Operations & Liquidity Observability
  app.get('/api/admin/audit-logs', (req, res) => {
    res.json(store.auditEvents);
  });

  app.get('/api/admin/orders', (req, res) => {
    res.json(store.getAdminOrders());
  });

  app.get('/api/admin/liquidity-metrics', (req, res) => {
    res.json(store.getLiquidityMetrics());
  });

  app.get('/api/admin/vault-inventory', (req, res) => {
    res.json(store.getVaultInventory());
  });

  app.get('/api/admin/reconciliation', (req, res) => {
    res.json(store.getReconciliationReport());
  });

  app.post('/api/admin/retry-order/:id', async (req, res) => {
    const orderId = req.params.id;
    const order = store.orders.get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found for operator retry.' });
    }

    try {
      // Re-run the order through OrderService from its current state
      const processed = await OrderService.retryFailedOrder(orderId);
      res.json({ success: true, message: `Order ${orderId} retry executed successfully.`, order: processed });
    } catch (err: any) {
      res.status(400).json({ error: err.message || `Failed to retry order ${orderId}` });
    }
  });

  app.get('/api/admin/liquidity-status', async (req, res) => {
    try {
      const activeProvider = LiquidityService.getActiveProvider();
      const balance = await activeProvider.getBalance();
      const hasPaxosCredentials = Boolean(
        (process.env.PAXOS_CLIENT_ID && process.env.PAXOS_CLIENT_SECRET) ||
          process.env.PAXOS_ACCESS_TOKEN
      );
      const configuredEnvProvider = (process.env.LIQUIDITY_PROVIDER || 'mock').trim().toLowerCase();

      res.json({
        provider: store.simulationConfig.providerMode,
        envProvider: configuredEnvProvider,
        paxosConfigured: hasPaxosCredentials,
        paxosStatusNotice: hasPaxosCredentials
          ? 'Paxos Sandbox API connected.'
          : 'Sandbox liquidity provider not configured.',
        balance,
        recentOrders: Array.from(store.orders.values())
          .filter((o) => o.liquidity)
          .map((o) => o.liquidity),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Liquidity Operations Controls
  app.post('/api/admin/liquidity/add', (req, res) => {
    try {
      const { amount } = req.body;
      const addAmount = Number(amount) > 0 ? amount : '100.000000';
      const result = mockPaxgProvider.addMockLiquidity(addAmount);
      store.recordAuditEvent({
        orderId: 'SYS-OPS-LIQUIDITY',
        userId: 'OPS-ADMIN',
        eventType: 'PAXG_ORDER_FILLED',
        status: 'LIQUIDITY_ADJUSTED',
        referenceId: `ADJ-${Date.now()}`,
        actor: 'ADMIN',
        metadata: {
          action: 'ADD_MOCK_PAXG',
          ...result,
        },
      });
      res.json({
        success: true,
        message: `Successfully added ${result.added} Mock PAXG. New balance: ${result.newBalance} PAXG`,
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to add mock liquidity.' });
    }
  });

  app.post('/api/admin/liquidity/price', (req, res) => {
    try {
      const { priceUsd, pricePerGramAed } = req.body;
      if (priceUsd && Number(priceUsd) > 0) {
        mockPaxgProvider.setMockPrice(priceUsd);
        const calculatedAed = (Number(priceUsd) / 31.1034768 * 3.6725).toFixed(2);
        store.currentPricePerGramAed = calculatedAed;
      } else if (pricePerGramAed && Number(pricePerGramAed) > 0) {
        store.currentPricePerGramAed = Number(pricePerGramAed).toFixed(2);
        const calculatedUsd = (Number(pricePerGramAed) / 3.6725 * 31.1034768).toFixed(2);
        mockPaxgProvider.setMockPrice(calculatedUsd);
      }
      res.json({
        success: true,
        priceUsd: mockPaxgProvider.getMockStats().paxgPriceUsd,
        pricePerGramAed: store.currentPricePerGramAed,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update mock price.' });
    }
  });

  app.post('/api/admin/liquidity/reset', (req, res) => {
    try {
      mockPaxgProvider.resetLiquidity();
      store.recordAuditEvent({
        orderId: 'SYS-OPS-LIQUIDITY',
        userId: 'OPS-ADMIN',
        eventType: 'PAXG_ORDER_FILLED',
        status: 'LIQUIDITY_RESET',
        referenceId: `RST-${Date.now()}`,
        actor: 'ADMIN',
        metadata: { action: 'RESET_MOCK_LIQUIDITY', newBalance: '100.000000' },
      });
      res.json({ success: true, message: 'Mock PAXG Liquidity reset to default 100.000000 PAXG pool.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/admin/liquidity/toggle-offline', (req, res) => {
    try {
      const isOffline = mockPaxgProvider.toggleOffline();
      res.json({ success: true, isOffline, status: isOffline ? 'OFFLINE' : 'HEALTHY' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/admin/holdings-summary', (req, res) => {
    const customerHolding = {
      customer: 'Abhishk (User 001)',
      userId: store.userProfile.userId,
      tier: 'Institutional / HNWI',
      goldBalanceGrams: store.goldHolding.totalGrams,
      tokenBalance: store.goldHolding.totalTokens,
      status: '100% Backed / Allocated in DMCC Vault',
      investedAed: store.goldHolding.investedAed,
      currentValueAed: store.goldHolding.currentValueAed,
      allocatedBarsCount: store.goldHolding.holdingsList.length,
    };
    res.json([customerHolding]);
  });

  app.get('/api/admin/tokens-summary', (req, res) => {
    res.json({
      tokenName: 'OneX Gold Token',
      tokenSymbol: 'ONEXG',
      conversionRate: '1 OneX Gold Token = 1.0000 gram 24K Physical Gold',
      circulatingSupply: store.goldHolding.totalTokens,
      totalPhysicalGoldGrams: store.goldHolding.totalGrams,
      backingRatio: '100.00%',
      custodian: 'TransGuard DMCC Dubai Vault',
      purity: '24K (999.9 Fine Gold)',
      ledgerRecords: store.goldHolding.holdingsList.map((h, i) => ({
        tokenId: `TKN-${h.orderId}`,
        holder: 'Abhishk (User 001)',
        tokenQuantity: h.grams,
        equivalentGoldGrams: h.grams,
        vaultBarSerialNumber: h.vaultBarSerialNumber,
        allocationCertificate: h.egrCertificateNumber,
        allocatedDate: h.purchasedAt,
        status: 'ACTIVE_BACKED',
      })),
    });
  });

  app.get('/api/admin/config', (req, res) => {
    res.json({
      config: store.simulationConfig,
      userProfile: store.userProfile,
      currentPricePerGramAed: store.currentPricePerGramAed,
    });
  });

  app.post('/api/admin/config', (req, res) => {
    const {
      providerMode,
      liquidityDelayMs,
      forcePaymentFailure,
      forceLiquidityRejection,
      forceInsufficientLiquidity,
      forceAllocationFailure,
      paxgFailureMode,
      currentPricePerGramAed,
    } = req.body;

    if (providerMode) store.simulationConfig.providerMode = providerMode;
    if (liquidityDelayMs !== undefined) store.simulationConfig.liquidityDelayMs = Number(liquidityDelayMs);
    if (forcePaymentFailure !== undefined) store.simulationConfig.forcePaymentFailure = Boolean(forcePaymentFailure);
    if (forceLiquidityRejection !== undefined) store.simulationConfig.forceLiquidityRejection = Boolean(forceLiquidityRejection);
    if (forceInsufficientLiquidity !== undefined) store.simulationConfig.forceInsufficientLiquidity = Boolean(forceInsufficientLiquidity);
    if (forceAllocationFailure !== undefined) store.simulationConfig.forceAllocationFailure = Boolean(forceAllocationFailure);
    if (paxgFailureMode !== undefined) store.simulationConfig.paxgFailureMode = paxgFailureMode;
    if (currentPricePerGramAed) store.currentPricePerGramAed = String(currentPricePerGramAed);

    res.json({ success: true, config: store.simulationConfig, currentPricePerGramAed: store.currentPricePerGramAed });
  });

  // ===================== VITE MIDDLEWARE =====================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OneX Gold Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
