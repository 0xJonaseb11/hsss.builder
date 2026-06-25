import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Builder } from "@/types/database";
import {
  makeJobRef,
  makeReference,
  orderTotal,
  type CreateOrderBody,
  type OrderPayload,
} from "@/lib/orders";

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

function validatePayload(payload: OrderPayload): string | null {
  if (!payload.delivery?.address?.trim()) return "Delivery address is required.";
  if (!payload.delivery?.suburb?.trim()) return "Suburb is required.";
  if (!payload.screens?.length) return "At least one screen is required.";
  if (payload.serviceType === "Supply & Install") {
    if (!payload.deliveryDates?.hobDate || !payload.deliveryDates?.glassDate) {
      return "Hob and glass dates are required.";
    }
  } else if (!payload.deliveryDates?.deliveryDate) {
    return "Delivery date is required.";
  }
  return null;
}

export async function POST(request: Request) {
  const profile = await getProfileForApi();
  if (profile instanceof NextResponse) return profile;

  const supabase = await createClient();
  const reference = makeReference();
  let body: CreateOrderBody = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (body.sample) {
    const jobRef = makeJobRef();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        builder_id: profile.id,
        reference,
        job_ref: jobRef,
        status: "submitted",
        total: 1123.0,
        payload: {
          sample: true,
          screens: [{ type: "Front & Return", front: 900, return: 900 }],
        },
      })
      .select("id, reference")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ id: data.id, reference: data.reference });
  }

  const payload = body.payload;
  if (!payload) {
    return NextResponse.json({ error: "Order payload required." }, { status: 400 });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const jobRef = body.jobRef?.trim() || makeJobRef();
  const total = orderTotal(payload.screens);

  const { data, error } = await supabase
    .from("orders")
    .insert({
      builder_id: profile.id,
      reference,
      job_ref: jobRef,
      status: "submitted",
      total,
      payload,
    })
    .select("id, reference")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, reference: data.reference });
}
