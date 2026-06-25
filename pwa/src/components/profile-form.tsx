"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REGIONS, SERVICE_TYPES } from "@/lib/constants";
import type { ServiceType } from "@/types/database";

export function ProfileForm({ userId }: { userId: string }) {
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
        abn,
        contact_name: contactName,
        mobile,
        service_type: serviceType,
        region,
        street_address: streetAddress,
        suburb,
        state,
        postcode,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Company name"
        required
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />
      <Input
        label="ABN"
        value={abn}
        onChange={(e) => setAbn(e.target.value)}
      />
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
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                serviceType === type
                  ? "border-navy bg-cyan/20 text-navy"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="mb-1 block text-sm font-medium text-slate-600">
          Region
        </span>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Street address"
        value={streetAddress}
        onChange={(e) => setStreetAddress(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Suburb"
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
        />
        <Input
          label="Postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
        />
      </div>
      <Input
        label="State"
        value={state}
        onChange={(e) => setState(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" full disabled={loading}>
        {loading ? "Saving..." : "Complete registration"}
      </Button>
    </form>
  );
}
