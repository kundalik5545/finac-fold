import { Account, Session } from "@/app/generated/prisma/client";

export type AssetType =
  | "PROPERTY"
  | "VEHICLE"
  | "JEWELRY"
  | "ELECTRONICS"
  | "OTHER";

export type PaymentMethod = "CASH" | "UPI" | "CARD" | "ONLINE" | "OTHER";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export type Asset = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: AssetType;
  icon: string | null;
  color: string | null;
  currentValue: number;
  purchaseValue: number | null;
  purchaseDate: Date;
  purchaseReason: string | null;
  paymentMethod: PaymentMethod | null;
  sellDate: Date | null;
  sellPrice: number | null;
  profitLoss: number | null;
  sellReason: string | null;
  transactionStatus: TransactionStatus;
  description: string | null;
  userId: string;
  user: User;
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  sessions: Session[];
  accounts: Account[];
  assets: Asset[];
};
