/**
 * Utility function to determine best text color based on background color
 * Returns "text-gray-900 dark:text-gray-100" (for light bgs) or "text-white"
 * For custom HEX colors in light mode, calculates luminance.
 */
function getContrastTextColor(bgColor: string): string {
  // Color parsing helpers
  function hexToRgb(hex: string) {
    const sanitized = hex.replace("#", "");
    if (sanitized.length === 3) {
      return [
        parseInt(sanitized[0] + sanitized[0], 16),
        parseInt(sanitized[1] + sanitized[1], 16),
        parseInt(sanitized[2] + sanitized[2], 16),
      ];
    }
    if (sanitized.length === 6) {
      return [
        parseInt(sanitized.substring(0, 2), 16),
        parseInt(sanitized.substring(2, 4), 16),
        parseInt(sanitized.substring(4, 6), 16),
      ];
    }
    return null;
  }
  // Default "very light gray"
  if (!bgColor || bgColor === "#f3f4f6") {
    return "text-gray-900 dark:text-gray-100";
  }
  // Check for explicit color tokens
  if (
    bgColor.startsWith("bg-") ||
    bgColor === "white" ||
    bgColor === "#fff" ||
    bgColor === "#ffffff"
  ) {
    return "text-gray-900 dark:text-gray-100";
  }
  // Otherwise, try hex. If brightness high, use dark text,
  // else white text (for dark backgrounds)
  if (bgColor[0] === "#") {
    const rgb = hexToRgb(bgColor);
    if (rgb) {
      // formula from luminance https://www.w3.org/TR/AERT/#color-contrast
      const [r, g, b] = rgb;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 150
        ? "text-gray-900 dark:text-gray-100"
        : "text-white";
    }
  }
  // Fallback to white text for custom backgrounds
  return "text-white";
}

export default getContrastTextColor;
