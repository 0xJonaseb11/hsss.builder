import Link from "next/link";

const actions = [
  {
    href: "/quotes/quick",
    title: "Quick quote",
    description: "Fast price estimate, no job required",
  },
  {
    href: "/orders/new",
    title: "New order",
    description: "Submit a full job with screens",
  },
  {
    href: "/orders/custom",
    title: "Custom order",
    description: "Non-standard screens, site measure",
  },
  {
    href: "/quotes",
    title: "My quotes",
    description: "Saved estimates and order drafts",
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
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
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
  );
}
