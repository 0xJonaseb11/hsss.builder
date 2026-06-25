import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { OrderForm } from "@/components/order-form";
import { getQuote, requireBuilderProfile } from "@/lib/data";
import {
  isOrderQuotePayload,
  isQuickQuotePayload,
  screenFromQuickQuote,
} from "@/lib/quotes";
import {
  screenPayloadToDraft,
  type InitialOrderData,
} from "@/lib/orders";
import { Notice } from "@/components/ui/notice";

type SearchParams = Promise<{ fromQuote?: string }>;

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const profile = await requireBuilderProfile();
  let initial: InitialOrderData | undefined;
  let fromQuoteLabel: string | null = null;

  if (params.fromQuote) {
    const quote = await getQuote(profile.id, params.fromQuote);
    if (quote?.status === "saved") {
      const payload = quote.payload;
      fromQuoteLabel = quote.reference;
      if (isQuickQuotePayload(payload)) {
        initial = {
          screens: [screenPayloadToDraft(screenFromQuickQuote(payload))],
        };
      } else if (isOrderQuotePayload(payload)) {
        initial = {
          jobRef: payload.jobRef,
          address: payload.delivery?.address,
          suburb: payload.delivery?.suburb,
          state: payload.delivery?.state,
          notes: payload.notes ?? undefined,
          siteContactName: payload.siteContact?.name,
          siteContactPhone: payload.siteContact?.phone,
          hobDate: payload.deliveryDates?.hobDate,
          glassDate: payload.deliveryDates?.glassDate,
          deliveryDate: payload.deliveryDates?.deliveryDate,
          screens: payload.screens.map(screenPayloadToDraft),
        };
      }
    }
  }

  return (
    <>
      <DashboardHeader profile={profile} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div>
          <Link
            href="/orders"
            className="text-sm text-slate-500 hover:text-navy"
          >
            Orders
          </Link>
          <h1 className="text-xl font-semibold text-navy">New order</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter job details and screen sizes. Pricing uses the same rules as
            the live builder app.
          </p>
        </div>
        {fromQuoteLabel && (
          <Notice variant="info">
            Pre-filled from quote {fromQuoteLabel}. Complete job details and
            submit when ready.
          </Notice>
        )}
        <OrderForm profile={profile} initial={initial} />
      </main>
    </>
  );
}
