import Link from "next/link";

const primaryActions = [
  {
    href: "/quotes/quick",
    title: "Quick quote",
    description: "Price a screen in under a minute",
    accent: "border-cyan/30 bg-cyan/5",
  },
  {
    href: "/orders/new",
    title: "New order",
    description: "Submit a full job with screens",
    accent: "border-navy/20 bg-navy/5",
  },
];

const secondaryActions = [
  {
    href: "/orders/custom",
    title: "Custom order",
    description: "Non-standard screens, site measure",
  },
  {
    href: "/quotes",
    title: "My quotes",
    description: "Saved estimates and drafts",
  },
  {
    href: "/orders",
    title: "Order history",
    description: "Submitted orders and status",
  },
  {
    href: "/contact",
    title: "Contact HSSS",
    description: "Support and enquiries",
  },
];

export function DashboardActions() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Start here
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {primaryActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`rounded-xl border-2 p-5 transition hover:shadow-md ${action.accent}`}
            >
              <p className="text-base font-semibold text-navy">{action.title}</p>
              <p className="mt-1 text-sm text-slate-600">{action.description}</p>
              <span className="mt-3 inline-block text-sm font-medium text-cyan">
                Open
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          More actions
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {secondaryActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan/40 hover:shadow-sm"
            >
              <p className="font-semibold text-navy">{action.title}</p>
              <p className="mt-1 text-xs text-slate-500">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
