import {
  AssetType,
  PaymentMethod,
  TransactionStatus,
} from "@/app/generated/prisma/client";

// Asset Type for Assets Tracking
export type Asset = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: AssetType;
  icon: string | null;
  color: string | null;
  currentValue: number;
  purchaseValue: number;
  purchaseDate: Date;
  purchaseReason: string | null;
  paymentMethod: PaymentMethod | null;
  sellDate: Date | null;
  sellPrice: number | null;
  profitLoss: number | null;
  sellReason: string | null;
  transactionStatus: TransactionStatus | null;
  description: string | null;
  userId: string;
  assetsTransactions?: AssetsTransaction[];
};

// AssetsTransaction Type for historical price tracking
export type AssetsTransaction = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  value: number;
  date: Date;
  notes: string | null;
  assetId: string;
  userId: string;
};

// Asset with transactions included
export type AssetWithTransactions = Asset & {
  assetsTransactions: AssetsTransaction[];
};

// Form input type for creating/editing assets
export type AssetFormInput = {
  name: string;
  type: AssetType;
  icon?: string | null;
  color?: string | null;
  currentValue: number;
  purchaseValue: number;
  purchaseDate: Date | string;
  purchaseReason?: string | null;
  paymentMethod?: PaymentMethod | null;
  sellDate?: Date | string | null;
  sellPrice?: number | null;
  profitLoss?: number | null;
  sellReason?: string | null;
  transactionStatus?: TransactionStatus | null;
  description?: string | null;
};

// Form input type for creating/editing transactions
export type TransactionFormInput = {
  value: number;
  date: Date | string;
  notes?: string | null;
};

// Export enums for convenience
export { AssetType, PaymentMethod, TransactionStatus };
