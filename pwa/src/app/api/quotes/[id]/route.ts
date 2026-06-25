import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Builder } from "@/types/database";

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getProfileForApi();
  if (profile instanceof NextResponse) return profile;

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .eq("builder_id", profile.id)
    .eq("status", "saved");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
