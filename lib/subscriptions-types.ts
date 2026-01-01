export type SubscriptionFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type Subscription = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  amount: number;
  frequency: SubscriptionFrequency;
  startDate: Date;
  nextDueDate: Date;
  icon: string | null;
  color: string | null;
  description: string | null;
  isActive: boolean;
  cancelledAt: Date | null;
  userId: string;
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatFrequency(frequency: SubscriptionFrequency): string {
  switch (frequency) {
    case "DAILY":
      return "Daily";
    case "WEEKLY":
      return "Weekly";
    case "MONTHLY":
      return "Monthly";
    case "YEARLY":
      return "Yearly";
    default:
      return frequency;
  }
}

export function calculateMonthlyEquivalent(
  amount: number,
  frequency: SubscriptionFrequency
): number {
  switch (frequency) {
    case "DAILY":
      return amount * 30;
    case "WEEKLY":
      return amount * 4.33; // Average weeks per month
    case "MONTHLY":
      return amount;
    case "YEARLY":
      return amount / 12;
    default:
      return amount;
  }
}

export function calculateMonthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions.reduce((total, sub) => {
    return total + calculateMonthlyEquivalent(sub.amount, sub.frequency);
  }, 0);
}
