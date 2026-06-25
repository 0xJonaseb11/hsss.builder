import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Builder } from "@/types/database";
import { makeCustomReference, type CustomOrderPayload } from "@/lib/custom-orders";
import { makeJobRef } from "@/lib/orders";

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

export async function POST(request: Request) {
  const profile = await getProfileForApi();
  if (profile instanceof NextResponse) return profile;

  let body: CustomOrderPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.address?.trim() || !body.suburb?.trim() || !body.details?.trim()) {
    return NextResponse.json(
      { error: "Address, suburb, and description are required." },
      { status: 400 }
    );
  }
  if (!body.measureDate) {
    return NextResponse.json(
      { error: "Preferred measure date is required." },
      { status: 400 }
    );
  }

  const payload: CustomOrderPayload = {
    kind: "custom",
    address: body.address.trim(),
    suburb: body.suburb.trim(),
    state: body.state?.trim() || "QLD",
    details: body.details.trim(),
    measureDate: body.measureDate,
    contactName: body.contactName?.trim() || null,
    contactPhone: body.contactPhone?.trim() || null,
  };

  const supabase = await createClient();
  const reference = makeCustomReference();
  const jobRef = makeJobRef();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      builder_id: profile.id,
      reference,
      job_ref: jobRef,
      status: "submitted",
      total: 0,
      payload,
    })
    .select("id, reference")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, reference: data.reference });
}
