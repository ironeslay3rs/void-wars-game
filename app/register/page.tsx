"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";

export default function RegisterPage() {
  const { signUp, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const signedInImmediately = await signUp(email, password);

      if (!signedInImmediately) {
        setMessage("Account created. Sign in to enter the wasteland.");
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(39,83,59,0.28),_rgba(5,8,20,1)_58%)] px-6 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-300/70">
            Void Wars: Oblivion
          </p>
          <h1 className="text-3xl font-semibold tracking-[0.08em] text-white">
            Register
          </h1>
          <p className="text-sm text-white/60">
            Create your account and bind a persistent wasteland record to it.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-white/55">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40"
              autoComplete="email"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-white/55">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || status === "loading"}
            className="w-full rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/40 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-white/35"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/55">
          Already registered?{" "}
          <Link className="text-emerald-200 hover:text-emerald-100" href="/login">
            Sign in here
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
