// Goal Type for Goals Tracking
export type Goal = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  description: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  userId: string;
  goalTransactions?: GoalTransaction[];
};

// GoalTransaction Type for historical progress tracking
export type GoalTransaction = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  date: Date;
  notes: string | null;
  goalId: string;
  userId: string;
};

// Goal with transactions included
export type GoalWithTransactions = Goal & {
  goalTransactions: GoalTransaction[];
};

// Form input type for creating/editing goals
export type GoalFormInput = {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: Date | string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
};

// Form input type for creating/editing transactions
export type GoalTransactionFormInput = {
  amount: number;
  date: Date | string;
  notes?: string | null;
};

