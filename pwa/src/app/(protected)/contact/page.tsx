import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card } from "@/components/ui/card";
import { HSSS_CONTACTS } from "@/lib/constants";
import { requireBuilderProfile } from "@/lib/data";

export default async function ContactPage() {
  const profile = await requireBuilderProfile();

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-navy">
            Dashboard
          </Link>
          <h1 className="text-xl font-semibold text-navy">Contact HSSS</h1>
          <p className="mt-1 text-sm text-slate-500">
            Get in touch with the HSSS team
          </p>
        </div>

        <div className="space-y-4">
          {HSSS_CONTACTS.map((contact) => (
            <Card key={contact.email} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy text-sm font-bold text-white">
                  {contact.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-navy">{contact.name}</p>
                  <p className="text-sm text-slate-500">{contact.role}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-sm font-medium text-navy hover:border-cyan/40"
                >
                  {contact.phone}
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-sm font-medium text-navy hover:border-cyan/40"
                >
                  {contact.email}
                </a>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
