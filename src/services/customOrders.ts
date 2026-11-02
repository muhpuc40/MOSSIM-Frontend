import type { Order } from "@/type/Order";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CustomOrderAddress {
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}

export interface CustomOrderItemPayload {
  gender: "male" | "female";
  body_type: "top" | "bottom";
  fitting_type: "loose" | "fit" | "tight";
  height_feet: number;
  height_inches: number;
  qty: number;
  measurement_unit: "cm" | "inch";
  measurements: Record<string, number>;
  reference_image?: File | null;
  reference_link?: string;
  additional_notes?: string;
}

export interface CustomOrderPayload {
  // Step 1 — one or more pieces
  items: CustomOrderItemPayload[];
  // Step 3
  preferred_delivery_date: string;
  shipping_fee: number;
  agree_terms: boolean;
}

/** Saved address (logged-in) OR contact + new address (guest / new address). */
export type CustomOrderTarget =
  | { kind: "saved"; token: string; shipping_address_id: string }
  | {
      kind: "new";
      token?: string | null;
      name: string;
      phone: string;
      email?: string;
      address: CustomOrderAddress;
    };

/** Error shape thrown on failure: { success:false, message, errors? } */
export interface ApiError {
  success?: false;
  message: string;
  errors?: Record<string, string[]>;
}

function buildForm(p: CustomOrderPayload, t: CustomOrderTarget): FormData {
  const fd = new FormData();
  p.items.forEach((it, i) => {
    const key = (f: string) => `items[${i}][${f}]`;
    fd.append(key("gender"), it.gender);
    fd.append(key("body_type"), it.body_type);
    fd.append(key("fitting_type"), it.fitting_type);
    fd.append(key("height_feet"), String(it.height_feet));
    fd.append(key("height_inches"), String(it.height_inches));
    fd.append(key("qty"), String(it.qty));
    fd.append(key("measurement_unit"), it.measurement_unit);
    Object.entries(it.measurements).forEach(([k, v]) => fd.append(key(k), String(v)));
    if (it.reference_image) fd.append(key("reference_image"), it.reference_image);
    if (it.reference_link) fd.append(key("reference_link"), it.reference_link);
    if (it.additional_notes) fd.append(key("additional_notes"), it.additional_notes);
  });
  fd.append("preferred_delivery_date", p.preferred_delivery_date);
  fd.append("shipping_fee", String(p.shipping_fee));
  fd.append("agree_terms", p.agree_terms ? "1" : "0");

  if (t.kind === "saved") {
    fd.append("shipping_address_id", t.shipping_address_id);
  } else {
    fd.append("name", t.name);
    fd.append("phone", t.phone);
    if (t.email) fd.append("email", t.email);
    Object.entries(t.address).forEach(([k, v]) => {
      if (v !== undefined && v !== "") fd.append(`address[${k}]`, String(v));
    });
  }
  return fd;
}

export const customOrdersService = {
  place: async (payload: CustomOrderPayload, target: CustomOrderTarget): Promise<Order> => {
    const url =
      target.kind === "saved" ? `${API_URL}/custom-orders` : `${API_URL}/custom-orders/guest`;
    const token = target.token;

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        // no Content-Type: the browser sets the multipart boundary
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: buildForm(payload, target),
      });
    } catch {
      throw { message: "Network error. Please check your connection and try again." } as ApiError;
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      throw {
        message: json.message || `Failed to place order (${res.status}).`,
        errors: json.errors,
      } as ApiError;
    }
    return json.data as Order;
  },
};
