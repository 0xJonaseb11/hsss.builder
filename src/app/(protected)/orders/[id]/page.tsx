import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { getOrder, requireBuilderProfile } from "@/lib/data";
import { formatMoney } from "@/lib/pricing";
import { isCustomOrderPayload } from "@/lib/custom-orders";
import { EMPTY_CELL } from "@/lib/site";
import type { OrderPayload, OrderScreenPayload } from "@/lib/orders";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOrderPayload(payload: Record<string, unknown>): payload is OrderPayload {
  return Array.isArray(payload.screens) && "delivery" in payload;
}

function ScreenList({ screens }: { screens: OrderScreenPayload[] }) {
  return (
    <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
      {screens.map((screen, i) => (
        <li key={`${screen.summary}-${i}`} className="px-4 py-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900">{screen.type}</p>
              <p className="text-slate-600">{screen.summary}</p>
              {screen.locationLabel && (
                <p className="text-slate-500">{screen.locationLabel}</p>
              )}
            </div>
            <p className="shrink-0 font-medium text-slate-900">
              {formatMoney(screen.priceIncGst)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireBuilderProfile();
  const order = await getOrder(profile.id, id);
  if (!order) notFound();

  const payload = order.payload;
  const isCustom = isCustomOrderPayload(payload);
  const isRealOrder = isOrderPayload(payload);
  const isSample = payload.sample === true;

  return (
    <main className="app-main space-y-8">
      <PageHeader
        title={order.reference}
        description={
          isCustom
            ? "Custom order request"
            : isSample
              ? "Sample order"
              : order.job_ref ?? undefined
        }
        actions={
          <>
            {isCustom && <Badge variant="info">Custom</Badge>}
            {isSample && <Badge variant="warning">Sample</Badge>}
            <Badge variant={order.status === "submitted" ? "success" : "default"}>
              {order.status}
            </Badge>
          </>
        }
      />
        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Status</p>
              <p className="font-medium text-slate-900">
                {order.status}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Total</p>
              <p className="font-medium text-slate-900">
                {isCustom ? "Site measure" : formatMoney(order.total)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Job reference</p>
              <p className="font-medium text-slate-900">
                {order.job_ref ?? EMPTY_CELL}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Submitted</p>
              <p className="font-medium text-slate-900">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </Card>

        {isCustom && (
          <Card className="space-y-3 text-sm text-slate-700">
            <h2 className="font-semibold text-navy">Job</h2>
            <p>
              {payload.address}, {payload.suburb} {payload.state}
            </p>
            <div>
              <p className="font-medium text-slate-900">Description</p>
              <p className="mt-1 whitespace-pre-wrap">{payload.details}</p>
            </div>
            {payload.contactName && (
              <p>
                Site contact: {payload.contactName}
                {payload.contactPhone ? `, ${payload.contactPhone}` : ""}
              </p>
            )}
            <p>
              Preferred measure date:{" "}
              {new Date(payload.measureDate).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </Card>
        )}

        {isRealOrder && (
          <>
            <Card className="space-y-3 text-sm">
              <h2 className="font-semibold text-navy">Delivery</h2>
              <p className="text-slate-700">
                {payload.delivery.address}, {payload.delivery.suburb}{" "}
                {payload.delivery.state}
              </p>
              {payload.siteContact && (
                <p className="text-slate-600">
                  Site contact: {payload.siteContact.name},{" "}
                  {payload.siteContact.phone}
                </p>
              )}
              {payload.serviceType === "Supply & Install" ? (
                <p className="text-slate-600">
                  Hob: {payload.deliveryDates.hobDate}, Glass:{" "}
                  {payload.deliveryDates.glassDate}
                </p>
              ) : (
                <p className="text-slate-600">
                  Delivery: {payload.deliveryDates.deliveryDate}
                </p>
              )}
              {payload.notes && (
                <p className="text-slate-600">Notes: {payload.notes}</p>
              )}
            </Card>
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-navy">Screens</h2>
              <ScreenList screens={payload.screens} />
            </div>
          </>
        )}

        {isSample && (
          <Card className="text-sm text-slate-600">
            This is a placeholder order for testing. Use{" "}
            <Link href="/orders/new" className="font-medium text-navy hover:text-cyan">
              New order
            </Link>{" "}
            to submit real job data.
          </Card>
        )}
      </main>
  );
}
