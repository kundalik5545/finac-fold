import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getTransactions } from "@/action/bank-account";
import { StatusScode } from "@/helpers/status-code";
import type { NextRequest } from "next/server";

/**
 * GET /api/transactions/export
 * Export transactions as CSV
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusScode.UNAUTHORIZED }
      );
    }

    const { searchParams } = new URL(request.url);
    const bankAccountId = searchParams.get("bankAccountId");
    const categoryId = searchParams.get("categoryId");
    const subCategoryId = searchParams.get("subCategoryId");
    const transactionType = searchParams.get("transactionType") as
      | "CREDIT"
      | "DEBIT"
      | null;
    const paymentMethod = searchParams.get("paymentMethod") as
      | "CASH"
      | "UPI"
      | "CARD"
      | "ONLINE"
      | "OTHER"
      | null;
    const status = searchParams.get("status") as
      | "PENDING"
      | "COMPLETED"
      | "FAILED"
      | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") as "date" | "amount" | null;
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | null;

    const filters = {
      ...(bankAccountId && { bankAccountId }),
      ...(categoryId && { categoryId }),
      ...(subCategoryId && { subCategoryId }),
      ...(transactionType && { transactionType }),
      ...(paymentMethod && { paymentMethod }),
      ...(status && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(search && { search }),
      ...(sortBy && { sortBy: sortBy as "date" | "amount" }),
      ...(sortOrder && { sortOrder: sortOrder as "asc" | "desc" }),
      // Export all matching records (no pagination)
      take: 10000,
    };

    console.log("Export filters:", filters);
    console.log("Export user ID:", session.user.id);

    let result;
    try {
      result = await getTransactions(session.user.id, filters);
      console.log(
        "Export result - transactions count:",
        result?.transactions?.length || 0
      );
    } catch (dbError) {
      console.error("Database error in export:", dbError);
      return NextResponse.json(
        {
          error:
            dbError instanceof Error
              ? dbError.message
              : "Failed to fetch transactions",
        },
        { status: StatusScode.INTERNAL_SERVER_ERROR }
      );
    }

    // Helper function to escape CSV values properly
    const escapeCSV = (value: unknown): string => {
      if (value === null || value === undefined) {
        return "";
      }
      const stringValue = String(value);
      // Escape quotes by doubling them, and wrap in quotes if contains comma, quote, or newline
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n") ||
        stringValue.includes("\r")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Helper function to format date consistently (YYYY-MM-DD)
    const formatDate = (date: Date | string): string => {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) {
        return "";
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Helper function to format amount with proper decimal places
    const formatAmount = (amount: number): string => {
      return amount.toFixed(2);
    };

    // Generate CSV headers
    const csvHeaders = [
      "Date",
      "Description",
      "Category",
      "Sub Category",
      "Type",
      "Amount",
      "Payment Method",
      "Status",
      "Bank Account",
    ];

    // Handle empty transactions - return CSV with headers only
    const transactions = result?.transactions || [];
    const rows = transactions.map((t) => [
      formatDate(t.date),
      t.description || "",
      t.category?.name || "",
      t.subCategory?.name || "",
      t.transactionType,
      formatAmount(t.amount),
      t.paymentMethod || "",
      t.status,
      t.bankAccount?.name || "",
    ]);

    // Build CSV content with proper escaping
    const csvRows = [
      csvHeaders.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ];

    const csvContent = csvRows.join("\n");

    // Add UTF-8 BOM for Excel compatibility with special characters
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csvContent;

    console.log("CSV content length:", csvContent.length);
    console.log("CSV rows count:", rows.length);

    return new NextResponse(csvWithBOM, {
      status: StatusScode.OK,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transactions-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting transactions:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to export transactions";
    return NextResponse.json(
      { error: errorMessage },
      { status: StatusScode.INTERNAL_SERVER_ERROR }
    );
  }
}
