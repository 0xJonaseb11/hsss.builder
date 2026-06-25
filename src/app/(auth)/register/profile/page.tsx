import { requireUser } from "@/lib/data";
import { ProfileForm } from "@/components/profile-form";
import { AppBrand } from "@/components/app-brand";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { Notice } from "@/components/ui/notice";

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
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <AppBrand variant="dark" />
        </div>
        <div className="rounded-xl bg-white p-6 shadow-xl">
          <OnboardingProgress
            steps={[
              { label: "Account", status: "done" },
              { label: "Profile", status: "current" },
              { label: "Dashboard", status: "upcoming" },
            ]}
          />

          <div className="mt-6 space-y-4">
            {justConfirmed ? (
              <Notice variant="success" title="Email confirmed">
                <p>
                  Your account is verified. Complete your company profile to
                  open your dashboard.
                </p>
              </Notice>
            ) : (
              <div>
                <h1 className="text-xl font-semibold text-navy">
                  Complete your profile
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Tell us about your business so we can process orders correctly.
                </p>
              </div>
            )}

            <ProfileForm userId={user.id} userEmail={user.email ?? ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
