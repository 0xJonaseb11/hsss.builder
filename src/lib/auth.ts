export function authCallbackUrl(next = "/register/profile") {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const path = `/auth/callback?next=${encodeURIComponent(next)}`;
  return `${origin}${path}`;
}

export function isEmailNotConfirmed(message: string) {
  return /email not confirmed/i.test(message);
}
