/**
 * Utility functions for transaction date filtering and grouping
 */

export type DatePreset = "daily" | "weekly" | "monthly" | "custom";

/**
 * Calculate date range for daily preset (today)
 */
export function getDailyDateRange(): { startDate: Date; endDate: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: today,
    endDate: endDate,
  };
}

/**
 * Calculate date range for weekly preset (current week)
 */
export function getWeeklyDateRange(): { startDate: Date; endDate: Date } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  const startDate = new Date(today.setDate(diff));
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
  };
}

/**
 * Calculate date range for monthly preset (current month)
 */
export function getMonthlyDateRange(): { startDate: Date; endDate: Date } {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
  };
}

/**
 * Get date range based on preset type
 */
export function getDateRangeByPreset(
  preset: DatePreset,
  customStartDate?: Date | string,
  customEndDate?: Date | string
): { startDate: Date; endDate: Date } | null {
  switch (preset) {
    case "daily":
      return getDailyDateRange();
    case "weekly":
      return getWeeklyDateRange();
    case "monthly":
      return getMonthlyDateRange();
    case "custom":
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return { startDate: start, endDate: end };
      }
      return null;
    default:
      return null;
  }
}

/**
 * Group transactions by date for chart display
 */
export function groupTransactionsByDate(
  transactions: Array<{
    date: Date | string;
    amount: number;
    transactionType: "CREDIT" | "DEBIT";
  }>,
  groupBy: "day" | "week" | "month"
): Array<{ date: string; income: number; expense: number }> {
  const grouped = new Map<string, { income: number; expense: number }>();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    let key: string;

    switch (groupBy) {
      case "day":
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
        break;
      case "week":
        const weekStart = new Date(date);
        const dayOfWeek = weekStart.getDay();
        const diff =
          weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        const month = date.getMonth() + 1;
        key = `${date.getFullYear()}-${month < 10 ? "0" : ""}${month}`; // YYYY-MM
        break;
      default:
        key = date.toISOString().split("T")[0];
    }

    if (!grouped.has(key)) {
      grouped.set(key, { income: 0, expense: 0 });
    }

    const group = grouped.get(key)!;
    if (transaction.transactionType === "CREDIT") {
      group.income += transaction.amount;
    } else {
      group.expense += transaction.amount;
    }
  });

  // Convert to array and sort by date
  return Array.from(grouped.entries())
    .map(([date, values]) => ({
      date,
      income: values.income,
      expense: values.expense,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Format date for display in charts
 */
export function formatDateForChart(
  date: string,
  groupBy: "day" | "week" | "month"
): string {
  const d = new Date(date);

  switch (groupBy) {
    case "day":
      return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    case "week":
      const weekEnd = new Date(d);
      weekEnd.setDate(d.getDate() + 6);
      return `${d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })} - ${weekEnd.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })}`;
    case "month":
      return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    default:
      return d.toLocaleDateString("en-IN");
  }
}
