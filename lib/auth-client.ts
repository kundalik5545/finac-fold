/**
 *  lib/auth-client.js
 * This file sets up the authentication client for the application
 */

import { createAuthClient } from "better-auth/react";

const baseURL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

// Warn in production if NEXT_PUBLIC_BASE_URL is not set
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_BASE_URL
) {
  console.warn(
    "⚠️  NEXT_PUBLIC_BASE_URL is not set. Authentication may not work correctly in production."
  );
}

export const authClient = createAuthClient({
  baseURL,
});
