import {
  IconContact,
  IconCustom,
  IconHistory,
  IconOrder,
  IconQuote,
} from "@/components/icons";
import { ActionTile } from "@/components/ui/action-tile";

const actions = [
  {
    href: "/quotes/quick",
    title: "Quick quote",
    description: "Price a screen in under a minute, no full job required.",
    icon: <IconQuote />,
    featured: true,
  },
  {
    href: "/orders/new",
    title: "New order",
    description: "Submit a complete job with screens, delivery, and pricing.",
    icon: <IconOrder />,
    featured: true,
  },
  {
    href: "/orders/custom",
    title: "Custom order",
    description: "Non-standard screens, site measure, or special requirements.",
    icon: <IconCustom />,
  },
  {
    href: "/quotes",
    title: "My quotes",
    description: "Review saved estimates and order drafts.",
    icon: <IconQuote />,
  },
  {
    href: "/orders",
    title: "Order history",
    description: "Track submitted orders and their current status.",
    icon: <IconHistory />,
  },
  {
    href: "/contact",
    title: "Contact HSSS",
    description: "Speak with sales or scheduling when you need help.",
    icon: <IconContact />,
  },
];

export function DashboardActions() {
  const featured = actions.filter((a) => a.featured);
  const rest = actions.filter((a) => !a.featured);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-navy">Quick actions</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Start a quote or order, or jump to your saved work.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {featured.map((action) => (
          <ActionTile key={action.href} {...action} />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((action) => (
          <ActionTile key={action.href} {...action} />
        ))}
      </div>
    </section>
  );
}
