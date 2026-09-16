/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SimulationBanner } from './components/SimulationBanner';
import { Navbar } from './components/Navbar';
import { InvestmentHome } from './components/InvestmentHome';
import { GoldLanding } from './components/GoldLanding';
import { BuyGold } from './components/BuyGold';
import { PaymentScreen } from './components/PaymentScreen';
import { OrderProcessing } from './components/OrderProcessing';
import { DocumentSignature } from './components/DocumentSignature';
import { OrderCompleted } from './components/OrderCompleted';
import { MyGold } from './components/MyGold';
import { Portfolio } from './components/Portfolio';
import { OrdersList } from './components/OrdersList';
import { OtcMarket } from './components/OtcMarket';
import { AdminOpsConsole } from './components/AdminOpsConsole';
import { AdminOperationsDashboard } from './components/admin/AdminOperationsDashboard';
import { GoldQuote, GoldOrder, PaymentMethodType, SimulationConfig } from './types/domain';

export type AppTab =
  | 'investment-home'
  | 'gold-landing'
  | 'buy-gold'
  | 'payment'
  | 'processing'
  | 'signature'
  | 'completed'
  | 'my-gold'
  | 'otc-market'
  | 'portfolio'
  | 'orders-list'
  | 'admin-dashboard';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('investment-home');
  const [spotPrice, setSpotPrice] = useState<string>('306.72');
  const [activeQuote, setActiveQuote] = useState<GoldQuote | null>(null);
  const [activeOrder, setActiveOrder] = useState<GoldOrder | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false);
  const [adminConsoleOpen, setAdminConsoleOpen] = useState<boolean>(false);
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig>({
    providerMode: 'MOCK_PAXG',
    liquidityDelayMs: 1200,
    allocationDelayMs: 1500,
    forcePaymentFailure: false,
    forceLiquidityRejection: false,
    forceInsufficientLiquidity: false,
    forceAllocationFailure: false,
  });

  // Fetch initial spot price and config
  const refreshGlobalState = async () => {
    try {
      const [priceRes, cfgRes] = await Promise.all([
        fetch('/api/quote/latest'),
        fetch('/api/admin/config'),
      ]);

      if (priceRes.ok) {
        const pData = await priceRes.json();
        setSpotPrice(pData.pricePerGramAed);
      }
      if (cfgRes.ok) {
        const cData = await cfgRes.json();
        setSimulationConfig(cData.config);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    refreshGlobalState();
    const interval = setInterval(refreshGlobalState, 10000);
    return () => clearInterval(interval);
  }, []);

  // Purchase flow handler: initiate payment and create order
  const handleInitiatePayment = async (paymentMethod: PaymentMethodType) => {
    if (!activeQuote) return;

    setIsPaymentProcessing(true);
    try {
      const idempotencyKey = `IDEMP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: activeQuote.quoteId,
          idempotencyKey,
          paymentMethod,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create order');
      }

      const order: GoldOrder = await res.json();
      setActiveOrder(order);
      setIsPaymentProcessing(false);
      setCurrentTab('processing');
    } catch (err: any) {
      setIsPaymentProcessing(false);
      alert(`Order initialization failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a0e] text-slate-100 flex flex-col font-sans selection:bg-[#22c55e] selection:text-black">
      {/* 1. Sandbox / Liquidity Provider Banner */}
      <SimulationBanner
        config={simulationConfig}
        onOpenAdmin={() => setAdminConsoleOpen(true)}
      />

      {/* 2. Top Navigation Bar */}
      <Navbar
        activeTab={currentTab as any}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenAdmin={() => setAdminConsoleOpen(true)}
      />

      {/* 3. Main Views Router */}
      <main className="flex-1">
        {/* Screen 1: Investment Home (Desktop-32.png) */}
        {currentTab === 'investment-home' && (
          <InvestmentHome
            onSelectGold={() => setCurrentTab('gold-landing')}
            onSelectRealEstate={() => setCurrentTab('portfolio')}
          />
        )}

        {/* Screen 2: OneX Gold Landing (Desktop-40.png & Desktop-41.png) */}
        {currentTab === 'gold-landing' && (
          <GoldLanding
            currentPrice={spotPrice}
            onInvestClick={() => setCurrentTab('buy-gold')}
          />
        )}

        {/* Screen 3: Buy Gold Calculator (Desktop-42.png) */}
        {currentTab === 'buy-gold' && (
          <BuyGold
            currentPrice={spotPrice}
            onContinueToPayment={(quote) => {
              setActiveQuote(quote);
              setCurrentTab('payment');
            }}
            onBack={() => setCurrentTab('gold-landing')}
          />
        )}

        {/* Screen 4: Payment Methods (Desktop-43.png & Desktop-44.png) */}
        {currentTab === 'payment' && activeQuote && (
          <PaymentScreen
            quote={activeQuote}
            onPaymentInitiated={handleInitiatePayment}
            onBack={() => setCurrentTab('buy-gold')}
            isProcessing={isPaymentProcessing}
          />
        )}

        {/* Screen 5: Order Processing (Desktop-45.png) */}
        {currentTab === 'processing' && activeOrder && (
          <OrderProcessing
            order={activeOrder}
            onProceedToSignature={(updatedOrder) => {
              setActiveOrder(updatedOrder);
              setCurrentTab('signature');
            }}
            onViewMyGold={() => setCurrentTab('my-gold')}
            onViewPortfolio={() => setCurrentTab('portfolio')}
            onBack={() => setCurrentTab('buy-gold')}
          />
        )}

        {/* Screen 6: Document E-Signature (Desktop-48.png) */}
        {currentTab === 'signature' && activeOrder && (
          <DocumentSignature
            order={activeOrder}
            onDocumentSigned={(completedOrder) => {
              setActiveOrder(completedOrder);
              setCurrentTab('completed');
            }}
            onBack={() => setCurrentTab('buy-gold')}
          />
        )}

        {/* Screen 7: Order Completed Celebration (Desktop-48-Copy.png) */}
        {currentTab === 'completed' && activeOrder && (
          <OrderCompleted
            order={activeOrder}
            onViewMyGold={() => setCurrentTab('my-gold')}
            onViewPortfolio={() => setCurrentTab('portfolio')}
            onViewOrders={() => setCurrentTab('orders-list')}
          />
        )}

        {/* Screen 8: My Gold Holdings & Live Charts (Desktop-39.png) */}
        {currentTab === 'my-gold' && (
          <MyGold
            currentPrice={spotPrice}
            onBuyMore={() => setCurrentTab('buy-gold')}
            onBack={() => setCurrentTab('investment-home')}
          />
        )}

        {/* OTC Secondary Market Order Book */}
        {currentTab === 'otc-market' && (
          <OtcMarket
            currentSpotPrice={spotPrice}
            onNavigateToGold={() => setCurrentTab('buy-gold')}
          />
        )}

        {/* Screen 9: Portfolio Dashboard (Portfolio.png & Portfolio-1.png) */}
        {currentTab === 'portfolio' && (
          <Portfolio onInvestInGold={() => setCurrentTab('buy-gold')} />
        )}

        {/* Screen 10: Orders Lifecycle History */}
        {currentTab === 'orders-list' && (
          <OrdersList
            onSelectOrder={(order) => {
              setActiveOrder(order);
              if (order.status === 'COMPLETED') {
                setCurrentTab('completed');
              } else if (order.status === 'DOCUMENT_PENDING') {
                setCurrentTab('signature');
              } else {
                setCurrentTab('processing');
              }
            }}
            onBack={() => setCurrentTab('investment-home')}
          />
        )}

        {/* Screen 11: Admin Liquidity & Order Operations Dashboard */}
        {currentTab === 'admin-dashboard' && (
          <AdminOperationsDashboard
            onBackToApp={() => setCurrentTab('investment-home')}
          />
        )}
      </main>

      {/* 4. Admin & Ops Liquidity Console Modal */}
      <AdminOpsConsole
        isOpen={adminConsoleOpen}
        onClose={() => {
          setAdminConsoleOpen(false);
          refreshGlobalState();
        }}
      />
    </div>
  );
}
