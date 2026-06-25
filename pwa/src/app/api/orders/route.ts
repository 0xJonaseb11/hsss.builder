import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Builder } from "@/types/database";

function makeReference() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `HSSS-${n}`;
}

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

export async function POST() {
  const profile = await getProfileForApi();
  if (profile instanceof NextResponse) return profile;

  const supabase = await createClient();
  const reference = makeReference();
  const jobRef = `JOB-${Date.now().toString().slice(-6)}`;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      builder_id: profile.id,
      reference,
      job_ref: jobRef,
      status: "submitted",
      total: 1123.0,
      payload: {
        screens: [{ type: "Front & Return", front: 900, return: 900 }],
      },
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, reference });
}
