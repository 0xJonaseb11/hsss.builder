import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Builder } from "@/types/database";
import {
  isOrderQuotePayload,
  isQuickQuotePayload,
} from "@/lib/quotes";
import { makeJobRef, makeReference, orderTotal } from "@/lib/orders";

async function getProfileForApi(): Promise<Builder | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("builders")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data?.company_name) {
    return NextResponse.json({ error: "Profile required" }, { status: 403 });
  }
  return data as Builder;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getProfileForApi();
  if (profile instanceof NextResponse) return profile;

  const { id } = await params;
  const supabase = await createClient();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("builder_id", profile.id)
    .maybeSingle();

  if (quoteError || !quote) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  if (quote.status === "converted") {
    return NextResponse.json(
      { error: "Quote already converted.", orderId: quote.order_id },
      { status: 400 }
    );
  }

  const payload = quote.payload as Record<string, unknown>;

  if (isQuickQuotePayload(payload)) {
    return NextResponse.json({
      redirect: `/orders/new?fromQuote=${quote.id}`,
    });
  }

  if (!isOrderQuotePayload(payload)) {
    return NextResponse.json({ error: "Invalid quote payload." }, { status: 400 });
  }

  if (!payload.delivery?.address || !payload.screens?.length) {
    return NextResponse.json(
      { error: "Complete job details and screens before converting." },
      { status: 400 }
    );
  }

  const reference = makeReference();
  const jobRef = payload.jobRef?.trim() || quote.label || makeJobRef();
  const total = orderTotal(payload.screens);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      builder_id: profile.id,
      reference,
      job_ref: jobRef,
      status: "submitted",
      total,
      payload: { ...payload, convertedFromQuote: quote.reference },
    })
    .select("id, reference")
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("quotes")
    .update({
      status: "converted",
      order_id: order.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quote.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({
    orderId: order.id,
    orderReference: order.reference,
    redirect: `/orders/${order.id}`,
  });
}
