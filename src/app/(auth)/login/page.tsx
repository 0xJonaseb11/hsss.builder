import { LoginForm } from "@/components/login-form";

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
    <>
      <h1 className="mb-6 text-xl font-semibold text-navy">Sign in</h1>
      <LoginForm
        next={params.next}
        confirmed={params.confirmed === "1"}
        reason={params.reason}
      />
    </>
  );
}
