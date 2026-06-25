import { createClient } from "@/lib/supabase/server";
import type { Builder, Order, Quote } from "@/types/database";
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

export async function getQuotes(builderId: string): Promise<Quote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("builder_id", builderId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Quote[];
}

export async function getQuote(
  builderId: string,
  quoteId: string
): Promise<Quote | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .eq("builder_id", builderId)
    .maybeSingle();

  if (error) throw error;
  return data as Quote | null;
}

export type DashboardSummary = {
  orderTotal: number;
  ordersSubmitted: number;
  quotesOpen: number;
  recentOrders: Order[];
  recentQuotes: Quote[];
};

export async function getDashboardSummary(
  builderId: string
): Promise<DashboardSummary> {
  const [orders, quotes] = await Promise.all([
    getOrders(builderId),
    getQuotes(builderId),
  ]);
  const openQuotes = quotes.filter((q) => q.status === "saved");
  return {
    orderTotal: orders.length,
    ordersSubmitted: orders.filter((o) => o.status === "submitted").length,
    quotesOpen: openQuotes.length,
    recentOrders: orders.slice(0, 5),
    recentQuotes: openQuotes.slice(0, 5),
  };
}
