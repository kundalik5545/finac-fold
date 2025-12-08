/**
 * Utility functions for investment calculations and formatting
 */

import {
  Investment,
  InvestmentType,
  InvestmentStats,
  AllInvestmentStats,
} from "@/lib/types/investments-types";

/**
 * Calculate profit/loss amount
 */
export function calculateProfitLoss(
  investedAmount: number,
  currentValue: number
): number {
  return currentValue - investedAmount;
}

/**
 * Calculate profit/loss percentage
 */
export function calculateProfitLossPercent(
  investedAmount: number,
  currentValue: number
): number {
  if (investedAmount === 0) return 0;
  return ((currentValue - investedAmount) / investedAmount) * 100;
}

/**
 * Format investment type for display
 */
export function formatInvestmentType(type: InvestmentType): string {
  const typeMap: Record<InvestmentType, string> = {
    STOCKS: "Stocks",
    MUTUAL_FUNDS: "Mutual Funds",
    GOLD: "Gold",
    FIXED_DEPOSIT: "Fixed Deposit",
    NPS: "NPS",
    PF: "PF",
  };
  return typeMap[type] || type;
}

/**
 * Get default icon for investment type
 */
export function getInvestmentIcon(type: InvestmentType): string {
  const iconMap: Record<InvestmentType, string> = {
    STOCKS: "📈",
    MUTUAL_FUNDS: "💼",
    GOLD: "🥇",
    FIXED_DEPOSIT: "🏦",
    NPS: "🎯",
    PF: "💰",
  };
  return iconMap[type] || "💵";
}

/**
 * Group investments by type
 */
export function groupInvestmentsByType(
  investments: Investment[]
): Map<InvestmentType, Investment[]> {
  const grouped = new Map<InvestmentType, Investment[]>();

  investments.forEach((investment) => {
    const existing = grouped.get(investment.type) || [];
    grouped.set(investment.type, [...existing, investment]);
  });

  return grouped;
}

/**
 * Calculate stats for investments of a specific type
 */
export function calculateInvestmentStatsByType(
  investments: Investment[],
  type: InvestmentType
): InvestmentStats {
  const typeInvestments = investments.filter((inv) => inv.type === type);

  const totalInvested = typeInvestments.reduce(
    (sum, inv) => sum + inv.investedAmount,
    0
  );
  const totalCurrentValue = typeInvestments.reduce(
    (sum, inv) => sum + inv.currentValue,
    0
  );
  const totalProfitLoss = calculateProfitLoss(totalInvested, totalCurrentValue);
  const totalProfitLossPercent = calculateProfitLossPercent(
    totalInvested,
    totalCurrentValue
  );

  const transactionsCount = typeInvestments.reduce(
    (sum, inv) => sum + (inv.investmentTransactions?.length || 0),
    0
  );

  return {
    type,
    totalInvested,
    totalCurrentValue,
    totalProfitLoss,
    totalProfitLossPercent,
    investmentCount: typeInvestments.length,
    transactionsCount,
  };
}

/**
 * Calculate stats for all investments
 */
export function calculateAllInvestmentStats(
  investments: Investment[]
): AllInvestmentStats {
  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.investedAmount,
    0
  );
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + inv.currentValue,
    0
  );
  const totalProfitLoss = calculateProfitLoss(totalInvested, totalCurrentValue);
  const totalProfitLossPercent = calculateProfitLossPercent(
    totalInvested,
    totalCurrentValue
  );

  // Calculate stats for each type
  const statsByType: InvestmentStats[] = [
    InvestmentType.STOCKS,
    InvestmentType.MUTUAL_FUNDS,
    InvestmentType.GOLD,
    InvestmentType.FIXED_DEPOSIT,
    InvestmentType.NPS,
    InvestmentType.PF,
  ].map((type) => calculateInvestmentStatsByType(investments, type));

  return {
    totalInvested,
    totalCurrentValue,
    totalProfitLoss,
    totalProfitLossPercent,
    totalInvestments: investments.length,
    statsByType,
  };
}

/**
 * Check if investment type supports API price fetching via Alpha Vantage
 * Note: Gold prices are fetched separately via GOLD_PRICE_API_URI
 */
export function supportsPriceFetching(type: InvestmentType): boolean {
  return type === InvestmentType.STOCKS || type === InvestmentType.MUTUAL_FUNDS;
}

/**
 * Check if investment type requires manual transactions
 */
export function requiresManualTransactions(type: InvestmentType): boolean {
  return (
    type === InvestmentType.FIXED_DEPOSIT ||
    type === InvestmentType.NPS ||
    type === InvestmentType.PF
  );
}
