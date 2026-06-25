export type CustomOrderPayload = {
  kind: "custom";
  address: string;
  suburb: string;
  state: string;
  details: string;
  measureDate: string;
  contactName: string | null;
  contactPhone: string | null;
};

export function isCustomOrderPayload(
  payload: Record<string, unknown>
): payload is CustomOrderPayload {
  return payload.kind === "custom";
}

export function makeCustomReference() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `CUSTOM-${n}`;
}
