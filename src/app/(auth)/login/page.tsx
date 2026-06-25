import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Sign in",
};

type SearchParams = Promise<{
  next?: string;
  confirmed?: string;
  reason?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <LoginForm
      next={params.next}
      confirmed={params.confirmed === "1"}
      reason={params.reason}
    />
  );
}
