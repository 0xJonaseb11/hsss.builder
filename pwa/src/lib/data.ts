import { createClient } from "@/lib/supabase/server";
import type { Builder, Order } from "@/types/database";
import { redirect } from "next/navigation";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getBuilderProfile(): Promise<Builder | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("builders")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data as Builder | null;
}

export async function requireBuilderProfile(): Promise<Builder> {
  const profile = await getBuilderProfile();
  if (!profile?.company_name) redirect("/register/profile");
  return profile;
}

export async function getOrders(builderId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("builder_id", builderId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getOrder(
  builderId: string,
  orderId: string
): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("builder_id", builderId)
    .maybeSingle();

  if (error) throw error;
  return data as Order | null;
}
