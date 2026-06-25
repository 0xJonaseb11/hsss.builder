import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?reason=auth-error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?reason=auth-error`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?reason=auth-error`);
  }

  const { data: builder } = await supabase
    .from("builders")
    .select("company_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (builder?.company_name) {
    const safeNext =
      next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  return NextResponse.redirect(`${origin}/register/profile?confirmed=1`);
}
