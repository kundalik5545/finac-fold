/**
 * Alpha Vantage API utility functions for fetching investment prices
 */

import { InvestmentType } from "@/lib/types/investments-types";

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "";
const ALPHA_VANTAGE_BASE_URL =
  process.env.ALPHA_VANTAGE_BASE_URL || "https://www.alphavantage.co/query";

/**
 * Fetch stock price from Alpha Vantage
 */
export async function fetchStockPrice(symbol: string): Promise<number | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn("Alpha Vantage API key not configured");
    return null;
  }
  console.log("ALPHA_VANTAGE_API_KEY", ALPHA_VANTAGE_API_KEY);
  console.log("ALPHA_VANTAGE_BASE_URL", ALPHA_VANTAGE_BASE_URL);
  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}.BSE&outputsize=compact&datatype=json&apikey=${ALPHA_VANTAGE_API_KEY}`;

    console.log("alpha vantage url", url);

    const response = await fetch(url);
    const data = await response.json();
    // console.log("alpha vantage response", data);

    // Extract latest closing price
    const timeSeries = data["Time Series (Daily)"];

    // console.log("time series", timeSeries);

    if (!timeSeries) {
      throw new Error("No time series data found");
    }

    const dates = Object.keys(timeSeries).sort().reverse();
    const latestDate = dates[0];
    const latestData = timeSeries[latestDate];

    if (!latestData || !latestData["4. close"]) {
      throw new Error("No closing price found");
    }

    return parseFloat(latestData["4. close"]);
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch mutual fund NAV (Note: Alpha Vantage doesn't support MF NAV directly)
 * This is a placeholder - you may need to use a different API or manual entry
 */
export async function fetchMutualFundNAV(
  symbol: string
): Promise<number | null> {
  // Alpha Vantage doesn't have direct MF NAV support
  // You may need to use a different API like:
  // - AMFI API for Indian Mutual Funds
  // - Morningstar API
  // - Or manual entry
  console.warn("Mutual Fund NAV fetching not implemented with Alpha Vantage");
  return null;
}

/**
 * Fetch price based on investment type
 * Note: Gold prices are fetched separately via GOLD_PRICE_API_URI
 */
export async function fetchInvestmentPrice(
  type: InvestmentType,
  symbol: string | null
): Promise<number | null> {
  switch (type) {
    case InvestmentType.STOCKS:
      if (!symbol) {
        throw new Error("Symbol is required for stocks");
      }
      return fetchStockPrice(symbol);
    case InvestmentType.MUTUAL_FUNDS:
      if (!symbol) {
        throw new Error("Symbol is required for mutual funds");
      }
      return fetchMutualFundNAV(symbol);
    default:
      throw new Error(`Price fetching not supported for type: ${type}`);
  }
}
