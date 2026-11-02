import type { MeasureKey } from "./body/shape";

/* Same delivery fees as the regular checkout */
export const SHIP_INSIDE = 80;
export const SHIP_OUTSIDE = 120;
export const FREE_SHIP_AT = 10000;

/** Advance shown to the customer — informational only, not sent to the backend. */
export const ADVANCE_PCT = 65;

/** Earliest selectable delivery date = today + MIN_LEAD_DAYS (tailoring time). */
export const MIN_LEAD_DAYS = 7;
/** Latest selectable delivery date = today + MAX_LEAD_DAYS. */
export const MAX_LEAD_DAYS = 120;

export const MAX_IMAGE_MB = 5;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const STORAGE_KEY = "mossim_custom_order";

export const MEASURE_HINT: Record<MeasureKey, string> = {
  chest: "Around the fullest part of the chest, under the arms.",
  shoulder: "Across the back, from one shoulder tip to the other.",
  waist: "Around the natural waistline, keeping the tape comfortable.",
  sleeve_length: "From the shoulder tip down the arm to the wrist.",
  arm_hole: "Around the arm where it joins the shoulder.",
  hip: "Around the fullest part of the hips.",
  thigh: "Around the fullest part of one thigh.",
  front_rise: "From the front waistband down to the crotch seam.",
  back_rise: "From the back waistband down to the crotch seam.",
};

export const POLICIES: { title: string; body: string }[] = [
  {
    title: "Order & measurements",
    body: "Custom pieces are made to the measurements you provide. Please double-check every value — our team will call you to confirm the details before production starts.",
  },
  {
    title: "Price & advance payment",
    body: `The final price is agreed on the confirmation call. Production starts after an advance of ${ADVANCE_PCT}% of the agreed amount is received. The remaining balance is paid before or on delivery.`,
  },
  {
    title: "Delivery",
    body: "Your preferred delivery date is a request; the final date is confirmed on the call based on the design and workload. Delivery charges follow our standard rates.",
  },
  {
    title: "Changes, cancellation & returns",
    body: "Changes are possible until production starts. Because custom items are made only for you, they can't be returned for size or style preference — but we will fix any tailoring fault on our side.",
  },
];

export type Unit = "cm" | "inch";

export interface CustomOrderForm {
  // Step 1
  gender: "male" | "female";
  body_type: "top" | "bottom";
  height_feet: string;
  height_inches: string;
  fitting_type: "" | "loose" | "fit" | "tight";
  unit: Unit;
  m: Record<MeasureKey, string>;
  reference_link: string;
  additional_notes: string;
  // Step 2
  name: string;
  phone: string;
  email: string;
  addrMode: "saved" | "new";
  savedAddressId: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  shipType: "inside" | "outside";
  // Step 3
  delivery_date: string;
  agree: boolean;
}

export const EMPTY_FORM: CustomOrderForm = {
  gender: "male",
  body_type: "top",
  height_feet: "",
  height_inches: "",
  fitting_type: "",
  unit: "inch",
  m: {
    chest: "", shoulder: "", waist: "", sleeve_length: "", arm_hole: "",
    hip: "", thigh: "", front_rise: "", back_rise: "",
  },
  reference_link: "",
  additional_notes: "",
  name: "",
  phone: "",
  email: "",
  addrMode: "saved",
  savedAddressId: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal: "",
  country: "Bangladesh",
  shipType: "inside",
  delivery_date: "",
  agree: false,
};

export type Errors = Partial<Record<string, string>>;

export const inputClass = "border border-line px-4 py-3 w-full rounded-lg caption1 bg-white";

/** yyyy-mm-dd in local time */
export function isoDate(d: Date): string {
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function addDays(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

export const money = (n: number) => `৳${n.toLocaleString()}`;
