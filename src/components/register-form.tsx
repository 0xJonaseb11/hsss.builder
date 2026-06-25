"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import Link from "next/link";

const nextSteps = [
  {
    title: "Check your inbox",
    detail: "Open the email from HSSS and tap the confirmation link.",
  },
  {
    title: "Sign in",
    detail: "Return here and sign in with the email and password you chose.",
  },
  {
    title: "Complete your profile",
    detail: "Add your company details to unlock the dashboard.",
  },
];

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
      <div className="space-y-5">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan/15">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-navy"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-navy">Check your email</h2>
          <p className="mt-2 text-sm text-slate-600">
            We sent a confirmation link to
          </p>
          <p className="mt-1 text-sm font-medium text-navy">{email}</p>
        </div>

        <ol className="space-y-3">
          {nextSteps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">{step.title}</p>
                <p className="mt-0.5 text-sm text-slate-600">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        {resent && (
          <Notice variant="success">Confirmation email sent again.</Notice>
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
        <Button type="button" full onClick={() => router.push("/login")}>
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-navy">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Register to quote and order with HSSS.
        </p>
      </div>
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
