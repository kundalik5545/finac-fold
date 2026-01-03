/**
 * Mask account number to show only last 4 digits
 * Example: "1234567890" -> "XXXX 7890"
 */
export function maskAccountNumber(
  accountNumber: string | null | undefined
): string {
  if (!accountNumber) return "N/A";

  // Remove all spaces and non-digit characters
  const cleaned = accountNumber.replace(/\D/g, "");

  if (cleaned.length <= 4) {
    return "XXXX " + cleaned;
  }

  // Show last 4 digits
  const lastFour = cleaned.slice(-4);
  return "XXXX " + lastFour;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}
