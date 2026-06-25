import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { HSSS_CONTACTS } from "@/lib/constants";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  return (
    <main className="app-main space-y-8">
      <PageHeader
        title="Contact HSSS"
        description="Reach sales or scheduling directly — call or email the right person."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {HSSS_CONTACTS.map((contact) => (
          <Card key={contact.email} className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-navy-muted text-base font-bold text-white">
                {contact.name[0]}
              </div>
              <div>
                <p className="text-lg font-semibold text-navy">{contact.name}</p>
                <p className="text-sm text-[var(--color-muted)]">{contact.role}</p>
              </div>
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="rounded-xl border border-[var(--color-border)] bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-navy transition hover:border-cyan/40 hover:bg-cyan-soft/40"
              >
                {contact.phone}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-center text-sm font-semibold text-navy transition hover:border-cyan/40 hover:bg-cyan-soft/40"
              >
                {contact.email}
              </a>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
