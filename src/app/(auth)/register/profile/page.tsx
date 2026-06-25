import { requireUser } from "@/lib/data";
import { ProfileForm } from "@/components/profile-form";

export default async function RegisterProfilePage() {
  const { user } = await requireUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-4 py-10">
    <div className="w-full max-w-lg">
      <div className="mb-8 text-center">
        <p className="text-3xl font-bold tracking-tight text-cyan">HSSS</p>
        <p className="mt-1 text-sm text-slate-300">Company profile</p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-xl font-semibold text-navy">Your details</h1>
        <ProfileForm userId={user.id} userEmail={user.email ?? ""} />
      </div>
    </div>
  </div>
  );
}
