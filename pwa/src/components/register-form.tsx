"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError(null);
    setResent(false);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: authCallbackUrl("/register/profile"),
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.push("/register/profile");
      router.refresh();
      return;
    }
    setAwaitingConfirmation(true);
  }

  async function resendConfirmation() {
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

  if (awaitingConfirmation) {
    return (
      <div className="space-y-4">
        <Notice variant="success" title="Account created">
          <p>
            We sent a confirmation link to <strong>{email}</strong>.
          </p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Open the email from HSSS and tap the confirmation link.</li>
            <li>Return here and sign in with your password.</li>
            <li>Complete your company profile to access the dashboard.</li>
          </ol>
        </Notice>
        {resent && (
          <Notice variant="info">Confirmation email sent again.</Notice>
        )}
        {error && <Notice variant="error">{error}</Notice>}
        <Button
          type="button"
          variant="secondary"
          full
          disabled={resending}
          onClick={resendConfirmation}
        >
          {resending ? "Sending..." : "Resend confirmation email"}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Already confirmed?{" "}
          <Link href="/login" className="font-medium text-navy hover:text-cyan">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error && <Notice variant="error">{error}</Notice>}
      <Button type="submit" full disabled={loading}>
        {loading ? "Creating account..." : "Continue"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-navy hover:text-cyan">
          Sign in
        </Link>
      </p>
    </form>
  );
}
