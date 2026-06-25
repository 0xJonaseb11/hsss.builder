import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Builder } from "@/types/database";
import {
  makeQuoteReference,
  quoteLabel,
  type QuotePayload,
} from "@/lib/quotes";

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

  let body: {
    quoteKind: "quick" | "order";
    label?: string;
    total: number;
    payload: QuotePayload;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.payload || !body.quoteKind) {
    return NextResponse.json({ error: "Quote payload required." }, { status: 400 });
  }

  const reference = makeQuoteReference();
  const label =
    body.label?.trim() ||
    quoteLabel(body.payload, reference);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      builder_id: profile.id,
      reference,
      label,
      quote_kind: body.quoteKind,
      status: "saved",
      total: body.total,
      payload: body.payload,
      updated_at: new Date().toISOString(),
    })
    .select("id, reference")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, reference: data.reference });
}
