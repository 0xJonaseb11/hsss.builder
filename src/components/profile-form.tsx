"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { REGIONS, SERVICE_TYPES } from "@/lib/constants";
import type { ServiceType } from "@/types/database";

export function ProfileForm({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [abn, setAbn] = useState("");
  const [contactName, setContactName] = useState("");
  const [mobile, setMobile] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("Supply & Install");
  const [region, setRegion] = useState<string>(REGIONS[0]);
  const [streetAddress, setStreetAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("QLD");
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("builders").upsert(
      {
        user_id: userId,
        company_name: companyName,
        abn: abn || null,
        contact_name: contactName,
        contact_email: userEmail || null,
        contact_phone: mobile,
        mobile,
        service_type: serviceType,
        region: serviceType === "Supply & Install" ? region : null,
        street_address: streetAddress || null,
        suburb: suburb || null,
        state: state || null,
        postcode: postcode || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <fieldset className="space-y-4">
          <legend className="mb-1 text-base font-semibold text-navy">Company</legend>
          <Input
            label="Company name"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input label="ABN" value={abn} onChange={(e) => setAbn(e.target.value)} />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-1 text-base font-semibold text-navy">Contact</legend>
          <Input
            label="Contact name"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <Input
            label="Mobile"
            required
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={userEmail}
            readOnly
            className="bg-slate-50 text-slate-600"
          />
        </fieldset>
      </div>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-semibold text-navy">Service</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Service type
            </span>
            <div className="flex gap-2">
              {SERVICE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setServiceType(type)}
                  className={`flex-1 rounded-md border px-3 py-2.5 text-sm font-medium ${
                    serviceType === type
                      ? "border-navy bg-cyan/20 text-navy"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {serviceType === "Supply & Install" && (
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-600">
                Region
              </span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3 text-sm shadow-sm outline-none focus:border-cyan focus:ring-4 focus:ring-cyan/15"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-semibold text-navy">
          Address <span className="font-normal text-slate-500">(optional)</span>
        </legend>
        <Input
          label="Street address"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Suburb"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
          />
          <Input
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
          <Input
            label="Postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
          />
        </div>
      </fieldset>

      {error && <Notice variant="error">{error}</Notice>}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          You can update these details later from your dashboard.
        </p>
        <Button type="submit" disabled={loading} className="sm:min-w-48">
          {loading ? "Saving..." : "Open my dashboard"}
        </Button>
      </div>
    </form>
  );
}
