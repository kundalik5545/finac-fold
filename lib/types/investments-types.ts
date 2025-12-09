// Investment Types for Investment Management

export type Investment = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: InvestmentType;
  symbol: string | null;
  icon: string | null;
  color: string | null;
  currentPrice: number;
  investedAmount: number;
  currentValue: number;
  quantity: number;
  purchaseDate: Date;
  description: string | null;
  userId: string;
  investmentTransactions?: InvestmentTransaction[];
  investmentPriceHistory?: InvestmentPriceHistory[];
};

export type InvestmentTransaction = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  date: Date;
  transactionType: InvestmentTransactionType;
  notes: string | null;
  investmentId: string;
  userId: string;
};

export type InvestmentPriceHistory = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  price: number;
  date: Date;
  source: PriceSource;
  investmentId: string;
  userId: string;
};

// Investment with transactions included
export type InvestmentWithTransactions = Investment & {
  investmentTransactions: InvestmentTransaction[];
  investmentPriceHistory: InvestmentPriceHistory[];
};

// Investment Type Enum
export enum InvestmentType {
  STOCKS = "STOCKS",
  MUTUAL_FUNDS = "MUTUAL_FUNDS",
  GOLD = "GOLD",
  FIXED_DEPOSIT = "FIXED_DEPOSIT",
  NPS = "NPS",
  PF = "PF",
}

// Investment Transaction Type Enum
export enum InvestmentTransactionType {
  INVEST = "INVEST",
  WITHDRAW = "WITHDRAW",
}

// Price Source Enum
export enum PriceSource {
  MANUAL = "MANUAL",
  API = "API",
}

// Form input type for creating/editing investments
export type InvestmentFormInput = {
  name: string;
  type: InvestmentType;
  symbol?: string | null;
  icon?: string | null;
  color?: string | null;
  currentPrice?: number;
  investedAmount: number;
  quantity: number;
  purchaseDate: Date | string;
  description?: string | null;
};

// Form input type for creating/editing investment transactions
export type InvestmentTransactionFormInput = {
  amount: number;
  date: Date | string;
  transactionType: InvestmentTransactionType;
  notes?: string | null;
};

// Investment stats by type
export type InvestmentStats = {
  type: InvestmentType;
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  investmentCount: number;
  transactionsCount: number;
};

// Investment stats for all investments
export type AllInvestmentStats = {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  totalInvestments: number;
  statsByType: InvestmentStats[];
};
