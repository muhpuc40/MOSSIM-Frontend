"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useAuth } from "@/context/AuthContext";
import { customOrdersService, ApiError, CustomOrderTarget } from "@/services/customOrders";
import type { Order } from "@/type/Order";
import { BOTTOM_FIELDS, MEASURE_LABEL, TOP_FIELDS } from "./body/shape";
import StepDetails, { Images } from "./StepDetails";
import StepCustomer from "./StepCustomer";
import StepConfirm from "./StepConfirm";
import {
  CustomOrderForm,
  EMPTY_FORM,
  Errors,
  SHIP_INSIDE,
  SHIP_OUTSIDE,
  STORAGE_KEY,
  emptyItem,
  money,
} from "./constants";

const STEPS = ["Custom Details", "Customer Information", "Confirmation"];

/* server field → local field (step 2/3); items.* keys are used as-is (step 1) */
const STEP2_KEYS = ["name", "phone", "email", "shipping_address_id"];
const STEP3_KEYS = ["preferred_delivery_date", "agree_terms", "shipping_fee"];
const FIELD_MAP: Record<string, string> = {
  "address.address_line_1": "line1",
  "address.address_line_2": "line2",
  "address.city": "city",
  "address.state": "state",
  "address.postal_code": "postal",
  "address.country": "country",
  "address.recipient_name": "name",
  "address.phone": "phone",
  shipping_address_id: "savedAddressId",
  preferred_delivery_date: "delivery_date",
  agree_terms: "agree",
};

/* ══════════ Progress indicator ══════════ */
function Progress({ step, maxStep, onGo }: { step: number; maxStep: number; onGo: (s: number) => void }) {
  return (
    <div className="flex items-center mb-10 max-w-3xl mx-auto">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        const clickable = n <= maxStep && n !== step;
        return (
          <React.Fragment key={label}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onGo(n)}
              className={`flex items-center gap-2 flex-shrink-0 ${clickable ? "cursor-pointer" : "cursor-default"}`}>
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center text-button duration-300 ${
                  current || done ? "bg-black text-white" : "bg-surface text-secondary border border-line"
                }`}>
                {done ? <Icon.Check size={16} weight="bold" /> : n}
              </span>
              <span className={`caption1 font-semibold max-sm:hidden ${current || done ? "text-black" : "text-secondary"}`}>
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-3 bg-line relative overflow-hidden">
                <div className={`absolute inset-y-0 left-0 bg-black duration-500 ${n < step ? "w-full" : "w-0"}`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ══════════ Side summary (steps 2–3) ══════════ */
function Summary({ form, images, onEdit }: { form: CustomOrderForm; images: Images; onEdit: () => void }) {
  const ship = form.shipType === "inside" ? SHIP_INSIDE : SHIP_OUTSIDE;
  const pieces = form.items.reduce((n, it) => n + (Number(it.qty) || 1), 0);
  return (
    <div className="bg-surface p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="heading5">Your Custom Order</div>
        <button type="button" onClick={onEdit} className="caption1 underline text-secondary hover:text-black">Edit</button>
      </div>

      <div className="space-y-3 mb-4 max-h-[460px] overflow-y-auto pr-1">
        {form.items.map((it, i) => {
          const fields = it.body_type === "top" ? TOP_FIELDS : BOTTOM_FIELDS;
          const unit = it.unit === "inch" ? "in" : "cm";
          return (
            <div key={it.uid} className="bg-white rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white caption2 font-semibold flex items-center justify-center">{i + 1}</span>
                  <span className="text-button capitalize">{it.gender} · {it.body_type} · {it.fitting_type}</span>
                </div>
                <span className="caption1 text-secondary flex-shrink-0">× {it.qty || 1}</span>
              </div>
              <div className="caption2 text-secondary">
                Height {it.height_feet || "–"}&apos; {it.height_inches || 0}&quot; ·{" "}
                {fields.map((f) => `${MEASURE_LABEL[f]} ${it.m[f] || "–"}`).join(", ")} {unit}
              </div>
              {(images[it.uid] || it.reference_link || it.additional_notes) && (
                <div className="caption2 text-secondary mt-1 line-clamp-1">
                  {[images[it.uid] && `📎 ${images[it.uid]!.name}`, it.reference_link && "🔗 Link", it.additional_notes && `📝 ${it.additional_notes}`]
                    .filter(Boolean)
                    .join("  ")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-line pt-3 space-y-2">
        <div className="flex justify-between caption1">
          <span className="text-secondary">{form.items.length} {form.items.length === 1 ? "item" : "items"} · {pieces} {pieces === 1 ? "piece" : "pieces"}</span>
          <span>Price after phone call</span>
        </div>
        <div className="flex justify-between caption1">
          <span className="text-secondary">Delivery ({form.shipType === "inside" ? "Inside" : "Outside"} Chittagong)</span>
          <span>{money(ship)}</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Success ══════════ */
function Success({ order, loggedIn, email }: { order: Order; loggedIn: boolean; email: string }) {
  const items = order.custom_items ?? [];
  const a = order.shipping_address;
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-5">
        <Icon.CheckCircle size={40} weight="fill" />
      </div>
      <div className="heading3 mb-2">Thank you! Your custom order is placed.</div>
      <p className="body1 text-secondary mb-8">
        Our team will contact you soon to confirm your measurements and the final price.
      </p>

      <div className="bg-surface rounded-2xl p-6 text-left space-y-3 mb-8">
        <div className="flex justify-between caption1">
          <span className="text-secondary">Order number</span>
          <span className="text-button">{order.order_number}</span>
        </div>
        <div className="caption1">
          <div className="text-secondary mb-2">Items</div>
          <div className="space-y-1.5">
            {items.map((it, i) => (
              <div key={it.id} className="flex justify-between gap-4">
                <span className="font-semibold">{i + 1}. {it.summary}</span>
                <span className="text-secondary flex-shrink-0">× {it.qty}</span>
              </div>
            ))}
          </div>
        </div>
        {order.preferred_delivery_date && (
          <div className="flex justify-between caption1">
            <span className="text-secondary">Preferred delivery</span>
            <span className="font-semibold">
              {new Date(order.preferred_delivery_date).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        )}
        <div className="flex justify-between caption1">
          <span className="text-secondary">Status</span>
          <span className="font-semibold">{order.status_label} · price to be confirmed</span>
        </div>
        {a && (
          <div className="flex justify-between gap-6 caption1">
            <span className="text-secondary flex-shrink-0">Ship to</span>
            <span className="text-right">{a.recipient_name}, {a.address_line_1}, {a.city}</span>
          </div>
        )}
        {email && (
          <div className="caption2 text-secondary pt-3 border-t border-line">
            A confirmation email has been sent to <strong className="text-black">{email}</strong>.
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        {loggedIn ? (
          <a href="/my-account#orders" className="button-main bg-black">View My Orders</a>
        ) : (
          <Link href="/order-tracking" className="button-main bg-black">Track Order</Link>
        )}
        <Link href="/shop" className="button-main bg-white text-black border border-black hover:bg-black hover:text-white">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

/* ══════════ Wizard ══════════ */
export default function CustomOrderWizard() {
  const { user, token, isLoggedIn } = useAuth();

  const [form, setForm] = useState<CustomOrderForm>(EMPTY_FORM);
  const [images, setImages] = useState<Images>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [restored, setRestored] = useState(false);

  /* keep progress if the page is refreshed (images excluded) */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved)?.form;
        if (parsed && Array.isArray(parsed.items) && parsed.items.length) {
          const base = emptyItem();
          setForm({
            ...EMPTY_FORM,
            ...parsed,
            items: parsed.items.map((it: any) => ({ ...base, ...it, m: { ...base.m, ...(it.m ?? {}) } })),
            agree: false,
          });
        }
      }
    } catch {}
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored || placed) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ form }));
    } catch {}
  }, [form, restored, placed]);

  const set = useCallback(<K extends keyof CustomOrderForm>(key: K, value: CustomOrderForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const go = (s: number) => {
    setErrors({});
    setSubmitError("");
    setStep(s);
    setMaxStep((m) => Math.max(m, s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");

    const useSaved = isLoggedIn && !!token && form.addrMode === "saved" && !!form.savedAddressId;
    const contactName = isLoggedIn && user ? user.name : form.name.trim();
    const contactPhone = isLoggedIn && user ? user.phone : form.phone.trim();
    const contactEmail = isLoggedIn && user ? user.email : form.email.trim();

    const target: CustomOrderTarget = useSaved
      ? { kind: "saved", token: token!, shipping_address_id: form.savedAddressId }
      : {
          kind: "new",
          token,
          name: contactName,
          phone: contactPhone,
          email: contactEmail || undefined,
          address: {
            recipient_name: contactName,
            phone: contactPhone,
            address_line_1: form.line1.trim(),
            address_line_2: form.line2.trim() || undefined,
            city: form.city.trim(),
            state: form.state.trim() || undefined,
            postal_code: form.postal.trim() || undefined,
            country: form.country.trim(),
          },
        };

    try {
      const order = await customOrdersService.place(
        {
          items: form.items.map((it) => {
            const fields = it.body_type === "top" ? TOP_FIELDS : BOTTOM_FIELDS;
            const measurements: Record<string, number> = {};
            fields.forEach((k) => (measurements[k] = Number(it.m[k])));
            return {
              gender: it.gender,
              body_type: it.body_type,
              fitting_type: it.fitting_type as "loose" | "fit" | "tight",
              height_feet: Number(it.height_feet),
              height_inches: Number(it.height_inches || 0),
              qty: Number(it.qty) || 1,
              measurement_unit: it.unit,
              measurements,
              reference_image: images[it.uid] ?? null,
              reference_link: it.reference_link.trim() || undefined,
              additional_notes: it.additional_notes.trim() || undefined,
            };
          }),
          preferred_delivery_date: form.delivery_date,
          shipping_fee: form.shipType === "inside" ? SHIP_INSIDE : SHIP_OUTSIDE,
          agree_terms: form.agree,
        },
        target,
      );
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
      setPlaced(order);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const e = err as ApiError;
      // Map server field errors back to the step (and item) that owns them
      if (e.errors && Object.keys(e.errors).length) {
        const mapped: Errors = {};
        let targetStep = 3;
        let firstItem: number | null = null;
        Object.entries(e.errors).forEach(([k, msgs]) => {
          mapped[FIELD_MAP[k] ?? k] = msgs[0];
          const s = k.startsWith("items") ? 1 : k.startsWith("address.") || STEP2_KEYS.includes(k) ? 2 : STEP3_KEYS.includes(k) ? 3 : 1;
          targetStep = Math.min(targetStep, s);
          const m = k.match(/^items\.(\d+)\./);
          if (m && firstItem === null) firstItem = Number(m[1]);
        });
        setErrors(mapped);
        if (firstItem !== null) setActiveIdx(firstItem);
        if (targetStep !== 3) {
          setStep(targetStep);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        setSubmitError(e.message);
      } else {
        setSubmitError(e.message || "Failed to place order. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return <Success order={placed} loggedIn={isLoggedIn} email={isLoggedIn && user ? user.email : form.email.trim()} />;
  }

  return (
    <div>
      <Progress step={step} maxStep={maxStep} onGo={go} />

      {submitError && step !== 3 && (
        <div className="p-3 bg-red/5 border border-red/20 rounded-lg caption1 text-red mb-6">{submitError}</div>
      )}

      {step === 1 && (
        <StepDetails
          form={form}
          setForm={setForm}
          images={images}
          setImages={setImages}
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          errors={errors}
          setErrors={setErrors}
          onNext={() => go(2)}
        />
      )}

      {step > 1 && (
        <div className="flex justify-between max-lg:flex-col gap-y-8 gap-x-10">
          <div className="lg:w-3/5 w-full">
            {step === 2 && (
              <StepCustomer form={form} set={set} errors={errors} setErrors={setErrors} onBack={() => go(1)} onNext={() => go(3)} />
            )}
            {step === 3 && (
              <StepConfirm
                form={form}
                set={set}
                errors={errors}
                setErrors={setErrors}
                submitting={submitting}
                submitError={submitError}
                onBack={() => go(2)}
                onSubmit={submit}
              />
            )}
          </div>
          <div className="lg:w-2/5 w-full">
            <div className="lg:sticky lg:top-[calc(var(--header-offset)_+_24px)] follow-header">
              <Summary form={form} images={images} onEdit={() => go(1)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
