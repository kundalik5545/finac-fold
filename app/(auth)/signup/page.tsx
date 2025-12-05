"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ButtonGroup } from "@/components/ui/button-group"
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Failed to sign up");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-8 shadow-lg dark:bg-zinc-900 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Sign Up
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Create a new account to track all your expenses and income.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <div className="mt-1 flex">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-l-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-zinc-300 bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {showPassword ? "Password is visible" : "Password is hidden"}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
          </span>
          <Link
            href="/signin"
            className="font-medium text-zinc-900 hover:underline dark:text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
