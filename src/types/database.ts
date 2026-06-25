export type ServiceType = "Supply & Install" | "Supply Only";

export type OrderStatus = "draft" | "submitted" | "confirmed";

export type QuoteKind = "quick" | "order";
export type QuoteStatus = "saved" | "converted";

export type Quote = {
  id: string;
  builder_id: string;
  reference: string;
  label: string | null;
  quote_kind: QuoteKind;
  status: QuoteStatus;
  total: number;
  payload: Record<string, unknown>;
  order_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Builder = {
  id: string;
  user_id: string;
  company_name: string | null;
  abn: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  mobile: string | null;
  service_type: ServiceType;
  region: string | null;
  street_address: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Order = {
  id: string;
  builder_id: string;
  reference: string;
  job_ref: string | null;
  status: OrderStatus;
  total: number;
  payload: Record<string, unknown>;
  created_at: string;
  email_sent_at: string | null;
};

export type ProfileInput = {
  company_name: string;
  abn: string;
  contact_name: string;
  mobile: string;
  service_type: ServiceType;
  region: string;
  street_address: string;
  suburb: string;
  state: string;
  postcode: string;
};
