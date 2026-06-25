"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl, isEmailNotConfirmed } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import Link from "next/link";

type LoginFormProps = {
  next?: string;
  confirmed?: boolean;
  reason?: string;
};

export function LoginForm({ next, confirmed, reason }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsConfirmation(false);
    setResent(false);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      if (isEmailNotConfirmed(signInError.message)) {
        setNeedsConfirmation(true);
        setError(
          "Confirm your email before signing in. Check your inbox for the HSSS confirmation link."
        );
        return;
      }
      setError(signInError.message);
      return;
    }
    const destination =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/dashboard";
    router.push(destination);
    router.refresh();
  }

  async function resendConfirmation() {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setResending(true);
    setError(null);
    setResent(false);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: authCallbackUrl("/register/profile"),
      },
    });
    setResending(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setResent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-navy">sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          Access your dashboard, quotes, and orders.
        </p>
      </div>

      {confirmed && (
        <Notice variant="success" title="Email confirmed">
          <p>Your email is verified. sign in to complete your company profile.</p>
        </Notice>
      )}
      {reason === "sign-in" && !confirmed && (
        <Notice variant="info">sign in to continue to your dashboard.</Notice>
      )}
      {reason === "auth-error" && (
        <Notice variant="error">
          That link is invalid or has expired. sign in or register again.
        </Notice>
      )}
      {resent && (
        <Notice variant="info">Confirmation email sent. Check your inbox.</Notice>
      )}
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Notice variant={needsConfirmation ? "warning" : "error"}>{error}</Notice>}
      {needsConfirmation && (
        <Button
          type="button"
          variant="secondary"
          full
          disabled={resending}
          onClick={resendConfirmation}
        >
          {resending ? "Sending..." : "Resend confirmation email"}
        </Button>
      )}
      <Button type="submit" full disabled={loading}>
        {loading ? "Signing in..." : "sign in"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        <Link href="/auth/forgot-password" className="text-navy hover:text-cyan">
          Forgot password?
        </Link>
      </p>
      <p className="text-center text-sm text-slate-500">
        No account?{" "}
        <Link href="/register" className="font-medium text-navy hover:text-cyan">
          Register
        </Link>
      </p>
    </form>
  );
}
