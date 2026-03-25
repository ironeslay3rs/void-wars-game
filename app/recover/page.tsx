"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordRecovery } from "@/features/auth/authClient";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await requestPasswordRecovery(email);
      setMessage(
        "Recovery instructions were sent. Check your inbox and spam folder for the reset link.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start password recovery.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="safe-min-h-screen safe-page-padding flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(39,83,59,0.28),_rgba(5,8,20,1)_58%)] py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-300/70">
            Void Wars: Oblivion
          </p>
          <h1 className="text-3xl font-semibold tracking-[0.08em] text-white">
            Recover Password
          </h1>
          <p className="text-sm text-white/60">
            Enter your account email to receive a secure recovery link.
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
            disabled={isSubmitting}
            className="w-full rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/40 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-white/35"
          >
            {isSubmitting ? "Sending Recovery Link..." : "Send Recovery Link"}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/55">
          Remembered your password?{" "}
          <Link className="text-emerald-200 hover:text-emerald-100" href="/login">
            Back to sign in
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
