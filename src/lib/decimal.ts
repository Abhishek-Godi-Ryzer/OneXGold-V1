/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Decimal from 'decimal.js';

// Configure Decimal precision for financial calculations
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export const GRAMS_PER_TROY_OUNCE = new Decimal('31.1034768');
export const AED_USD_PEG = new Decimal('3.6725');
export const PLATFORM_FEE_RATE = new Decimal('0.005'); // 0.50%

/**
 * Calculates PAXG quantity required for a given gold weight in grams.
 * 1 PAXG = 1 Fine Troy Ounce = 31.1034768 grams
 */
export function calculatePaxgFromGrams(grams: string | number | Decimal): string {
  const dGrams = new Decimal(grams);
  if (dGrams.isNegative() || dGrams.isZero()) {
    return '0.000000';
  }
  return dGrams.dividedBy(GRAMS_PER_TROY_OUNCE).toFixed(6);
}

/**
 * Calculates gold grams from PAXG troy ounces.
 */
export function calculateGramsFromPaxg(paxg: string | number | Decimal): string {
  const dPaxg = new Decimal(paxg);
  return dPaxg.times(GRAMS_PER_TROY_OUNCE).toFixed(4);
}

/**
 * Performs full financial quote breakdown with high-precision decimal math.
 */
export function calculateQuoteBreakdown(params: {
  quantityGrams: string | number;
  goldPricePerGramAed: string | number;
  paymentFeeRate?: string | number;
}) {
  const grams = new Decimal(params.quantityGrams);
  const pricePerGramAed = new Decimal(params.goldPricePerGramAed);
  const paymentFeeRate = new Decimal(params.paymentFeeRate || '0');

  const grossGoldValueAed = grams.times(pricePerGramAed);
  const platformFeeAed = grossGoldValueAed.times(PLATFORM_FEE_RATE);
  const paymentFeeAed = grossGoldValueAed.times(paymentFeeRate);
  const totalPayableAed = grossGoldValueAed.plus(platformFeeAed).plus(paymentFeeAed);

  // Derive USD & Crypto USDT/USDC equivalent
  const totalPayableUsd = totalPayableAed.dividedBy(AED_USD_PEG);
  const paxgRequired = calculatePaxgFromGrams(grams);

  // Gold price per Troy Ounce USD = pricePerGramAed * 31.1034768 / 3.6725
  const goldPriceUsdPerOunce = pricePerGramAed
    .times(GRAMS_PER_TROY_OUNCE)
    .dividedBy(AED_USD_PEG);

  return {
    quantityGrams: grams.toFixed(4),
    goldPricePerGramAed: pricePerGramAed.toFixed(2),
    grossGoldValueAed: grossGoldValueAed.toFixed(2),
    platformFeeAed: platformFeeAed.toFixed(2),
    paymentFeeAed: paymentFeeAed.toFixed(2),
    totalPayableAed: totalPayableAed.toFixed(2),
    cryptoEquivalentUsdt: totalPayableUsd.toFixed(2),
    cryptoEquivalentUsdc: totalPayableUsd.toFixed(2),
    goldPriceUsdPerOunce: goldPriceUsdPerOunce.toFixed(2),
    paxgPriceUsd: goldPriceUsdPerOunce.toFixed(2),
    paxgRequired,
  };
}

/**
 * Safe addition
 */
export function decAdd(a: string | number | Decimal, b: string | number | Decimal): string {
  return new Decimal(a).plus(new Decimal(b)).toString();
}

/**
 * Safe subtraction
 */
export function decSub(a: string | number | Decimal, b: string | number | Decimal): string {
  return new Decimal(a).minus(new Decimal(b)).toString();
}

/**
 * Safe multiplication
 */
export function decMul(a: string | number | Decimal, b: string | number | Decimal): string {
  return new Decimal(a).times(new Decimal(b)).toString();
}

/**
 * Safe division
 */
export function decDiv(
  a: string | number | Decimal,
  b: string | number | Decimal,
  decimals = 2
): string {
  const divisor = new Decimal(b);
  if (divisor.isZero()) return '0.00';
  return new Decimal(a).dividedBy(divisor).toFixed(decimals);
}

/**
 * Format currency with commas (e.g. 3,450,000.00)
 */
export function formatCurrencyAed(amount: string | number, showDecimals = true): string {
  try {
    const dec = new Decimal(amount);
    const parts = dec.toFixed(showDecimals ? 2 : 0).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `AED ${parts.join('.')}`;
  } catch {
    return `AED ${amount}`;
  }
}

/**
 * Format number with commas
 */
export function formatNumber(amount: string | number, decimals = 2): string {
  try {
    const dec = new Decimal(amount);
    const parts = dec.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  } catch {
    return String(amount);
  }
}
