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

export interface CustomOrderPayload {
  // Step 1
  gender: "male" | "female";
  body_type: "top" | "bottom";
  fitting_type: "loose" | "fit" | "tight";
  height_feet: number;
  height_inches: number;
  measurement_unit: "cm" | "inch";
  measurements: Record<string, number>;
  reference_image?: File | null;
  reference_link?: string;
  additional_notes?: string;
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
  fd.append("gender", p.gender);
  fd.append("body_type", p.body_type);
  fd.append("fitting_type", p.fitting_type);
  fd.append("height_feet", String(p.height_feet));
  fd.append("height_inches", String(p.height_inches));
  fd.append("measurement_unit", p.measurement_unit);
  Object.entries(p.measurements).forEach(([k, v]) => fd.append(k, String(v)));
  if (p.reference_image) fd.append("reference_image", p.reference_image);
  if (p.reference_link) fd.append("reference_link", p.reference_link);
  if (p.additional_notes) fd.append("additional_notes", p.additional_notes);
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
