"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Builder } from "@/types/database";

export function DashboardHeader({ profile }: { profile: Builder }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-white/10 bg-navy-deep px-4 py-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">
            {profile.company_name}
          </p>
          <p className="text-sm text-slate-300">{profile.service_type}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/quotes"
            className="rounded-md px-3 py-2 text-sm font-medium text-cyan hover:bg-white/5"
          >
            Quotes
          </Link>
          <Link
            href="/orders"
            className="rounded-md px-3 py-2 text-sm font-medium text-cyan hover:bg-white/5"
          >
            Orders
          </Link>
          <Button variant="ghost" type="button" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
