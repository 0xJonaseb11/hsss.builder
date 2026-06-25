import { CustomOrderForm } from "@/components/custom-order-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireBuilderProfile } from "@/lib/data";

export const metadata = { title: "Custom order" };

export default async function CustomOrderPage() {
  const profile = await requireBuilderProfile();

  return (
    <main className="app-main space-y-8">
      <PageHeader
        title="Custom order"
        description="Request non-standard screens, site measures, or work outside the standard configurator."
      />
      <CustomOrderForm profile={profile} />
    </main>
  );
}
