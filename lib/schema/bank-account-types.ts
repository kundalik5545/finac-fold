import {
  AccountType,
  TransactionType,
  CardType,
  PaymentStatus,
  CategoryType,
  Currency,
  TransactionStatus,
  PaymentMethod,
} from "@/app/generated/prisma/client";

// Bank Account Type
export type BankAccount = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  accountNumber: string | null;
  bankName: string | null;
  accountType: AccountType | null;
  ifscCode: string | null;
  branch: string | null;
  startingBalance: number;
  icon: string | null;
  color: string | null;
  description: string | null;
  isActive: boolean;
  accountOpeningDate: Date | null;
  isInsuranceActive: boolean | null;
  insuranceAmount: number | null;
  userId: string;
  bankTransactions?: BankTransaction[];
  bankCards?: BankCard[];
  transactions?: Transaction[];
};

// Bank Transaction Type
export type BankTransaction = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  totalDeposit: number;
  totalWithdrawal: number;
  currentBalance: number;
  transactionDate: Date;
  transactionType: TransactionType;
  description: string | null;
  bankAccountId: string;
  userId: string;
};

// Bank Card Type
export type BankCard = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  cardNumber: string | null;
  cardType: CardType;
  cardIssuer: string | null;
  cvv: string | null;
  expiryDate: Date | null;
  limit: number | null;
  lastBillAmount: number | null;
  paymentDueDay: number | null;
  paymentMethod: string | null;
  cardPin: string | null;
  paymentStatus: PaymentStatus | null;
  paymentAmount: number | null;
  paymentDate: Date | null;
  color: string | null;
  icon: string | null;
  notes: string | null;
  isActive: boolean;
  userId: string;
  bankAccountId: string;
};

// Category Type
export type Category = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  userId: string;
  subCategories?: SubCategory[];
  transactions?: Transaction[];
};

// SubCategory Type
export type SubCategory = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  color: string | null;
  icon: string | null;
  userId: string | null;
  categoryId: string;
  transactions?: Transaction[];
};

// Transaction Type (separate from BankTransaction)
export type Transaction = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  date: Date;
  description: string | null;
  currency: Currency;
  isActive: boolean;
  userId: string;
  bankAccountId: string | null;
  categoryId: string | null;
  subCategoryId: string | null;
  paymentMethod: PaymentMethod | null;
  category?: Category | null;
  subCategory?: SubCategory | null;
  bankAccount?: BankAccount | null;
};

// Transaction with relations
export type TransactionWithRelations = Transaction & {
  category: Category | null;
  subCategory: SubCategory | null;
  bankAccount: BankAccount | null;
};

// Bank Account with relations
export type BankAccountWithRelations = BankAccount & {
  bankTransactions: BankTransaction[];
  bankCards: BankCard[];
  transactions: Transaction[];
};

// Form input types
export type BankAccountFormInput = {
  name: string;
  accountNumber?: string | null;
  bankName?: string | null;
  accountType?: AccountType | null;
  ifscCode?: string | null;
  branch?: string | null;
  startingBalance?: number;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  isActive?: boolean;
  accountOpeningDate?: Date | string | null;
  isInsuranceActive?: boolean | null;
  insuranceAmount?: number | null;
};

export type BankTransactionFormInput = {
  amount: number;
  transactionDate: Date | string;
  transactionType: TransactionType;
  description?: string | null;
};

export type BankCardFormInput = {
  name: string;
  cardNumber?: string | null;
  cardType: CardType;
  cardIssuer?: string | null;
  cvv?: string | null;
  expiryDate?: Date | string | null;
  limit?: number | null;
  lastBillAmount?: number | null;
  paymentDueDay?: number | null;
  paymentMethod?: string | null;
  cardPin?: string | null;
  paymentStatus?: PaymentStatus | null;
  paymentAmount?: number | null;
  paymentDate?: Date | string | null;
  color?: string | null;
  icon?: string | null;
  notes?: string | null;
  isActive?: boolean;
};

export type CategoryFormInput = {
  name: string;
  type: CategoryType;
  color?: string | null;
  icon?: string | null;
};

export type SubCategoryFormInput = {
  name: string;
  categoryId: string;
  color?: string | null;
  icon?: string | null;
};

export type TransactionFormInput = {
  amount: number;
  transactionType: TransactionType;
  status?: TransactionStatus;
  date: Date | string;
  description?: string | null;
  currency?: Currency;
  isActive?: boolean;
  bankAccountId?: string | null;
  categoryId?: string | null;
  subCategoryId?: string | null;
  paymentMethod?: PaymentMethod | null;
};

// Export enums for convenience
export {
  AccountType,
  TransactionType,
  CardType,
  PaymentStatus,
  CategoryType,
  Currency,
  TransactionStatus,
  PaymentMethod,
};
