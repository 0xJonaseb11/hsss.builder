import { requireUser } from "@/lib/data";
import { ProfileForm } from "@/components/profile-form";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { Notice } from "@/components/ui/notice";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Complete profile",
};

type SearchParams = Promise<{ confirmed?: string }>;

export default async function RegisterProfilePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { user } = await requireUser();
  const params = await searchParams;
  const justConfirmed = params.confirmed === "1";

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <OnboardingProgress
          steps={[
            { label: "Account", status: "done" },
            { label: "Profile", status: "current" },
            { label: "Dashboard", status: "upcoming" },
          ]}
        />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            Complete your profile
          </h1>
          <p className="max-w-2xl text-base text-[var(--color-muted)]">
            Tell us about your business so we can process orders and quotes correctly.
          </p>
        </div>
      </div>

      {justConfirmed && (
        <Notice variant="success" title="Email confirmed">
          <p>
            Your account is verified. Fill in your company details below to open
            your dashboard.
          </p>
        </Notice>
      )}

      <Card padding="lg">
        <ProfileForm userId={user.id} userEmail={user.email ?? ""} />
      </Card>
    </div>
  );
}
