"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useAuth } from "@/context/AuthContext";
import { customOrdersService, ApiError, CustomOrderTarget } from "@/services/customOrders";
import type { Order } from "@/type/Order";
import { BOTTOM_FIELDS, MEASURE_LABEL, TOP_FIELDS } from "./body/shape";
import StepDetails from "./StepDetails";
import StepCustomer from "./StepCustomer";
import StepConfirm from "./StepConfirm";
import {
  CustomOrderForm,
  EMPTY_FORM,
  Errors,
  SHIP_INSIDE,
  SHIP_OUTSIDE,
  STORAGE_KEY,
  money,
} from "./constants";

const STEPS = ["Custom Details", "Customer Information", "Confirmation"];

/* server field → [step, local field key] */
const STEP2_KEYS = ["name", "phone", "email", "shipping_address_id"];
const STEP3_KEYS = ["preferred_delivery_date", "agree_terms", "shipping_fee"];
const ADDRESS_MAP: Record<string, string> = {
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
  height_inches: "height_inches",
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
                  current ? "bg-black text-white" : done ? "bg-black text-white" : "bg-surface text-secondary border border-line"
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
function Summary({ form, image, onEdit }: { form: CustomOrderForm; image: File | null; onEdit: () => void }) {
  const fields = form.body_type === "top" ? TOP_FIELDS : BOTTOM_FIELDS;
  const unit = form.unit === "inch" ? "in" : "cm";
  const ship = form.shipType === "inside" ? SHIP_INSIDE : SHIP_OUTSIDE;
  return (
    <div className="bg-surface p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="heading5">Your Custom Order</div>
        <button type="button" onClick={onEdit} className="caption1 underline text-secondary hover:text-black">Edit</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          ["Gender", form.gender],
          ["Body Type", form.body_type],
          ["Height", `${form.height_feet || "–"}' ${form.height_inches || 0}"`],
          ["Fitting", form.fitting_type || "–"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-lg p-3">
            <div className="caption2 text-secondary">{k}</div>
            <div className="caption1 font-semibold capitalize">{v}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg divide-y divide-line mb-4">
        {fields.map((k) => (
          <div key={k} className="flex justify-between px-3 py-2 caption1">
            <span className="text-secondary">{MEASURE_LABEL[k]}</span>
            <span className="font-semibold">{form.m[k] || "–"} <span className="text-secondary font-normal">{unit}</span></span>
          </div>
        ))}
      </div>
      {(image || form.reference_link || form.additional_notes) && (
        <div className="caption2 text-secondary space-y-1 mb-4">
          {image && <div>📎 {image.name}</div>}
          {form.reference_link && <div className="line-clamp-1">🔗 {form.reference_link}</div>}
          {form.additional_notes && <div className="line-clamp-2">📝 {form.additional_notes}</div>}
        </div>
      )}
      <div className="border-t border-line pt-3 space-y-2">
        <div className="flex justify-between caption1">
          <span className="text-secondary">Order amount</span>
          <span>After phone call</span>
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
  const d = order.custom_details;
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
        {d && (
          <>
            <div className="flex justify-between caption1">
              <span className="text-secondary">Item</span>
              <span className="font-semibold text-right">{d.summary}</span>
            </div>
            {d.preferred_delivery_date && (
              <div className="flex justify-between caption1">
                <span className="text-secondary">Preferred delivery</span>
                <span className="font-semibold">
                  {new Date(d.preferred_delivery_date).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
            )}
          </>
        )}
        <div className="flex justify-between caption1">
          <span className="text-secondary">Status</span>
          <span className="font-semibold">{order.status_label} · price to be confirmed</span>
        </div>
        {a && (
          <div className="flex justify-between gap-6 caption1">
            <span className="text-secondary flex-shrink-0">Ship to</span>
            <span className="text-right">
              {a.recipient_name}, {a.address_line_1}, {a.city}
            </span>
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
  const [image, setImage] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [restored, setRestored] = useState(false);

  /* keep progress if the page is refreshed (image excluded) */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm({ ...EMPTY_FORM, ...parsed.form, m: { ...EMPTY_FORM.m, ...(parsed.form?.m ?? {}) }, agree: false });
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

    const fields = form.body_type === "top" ? TOP_FIELDS : BOTTOM_FIELDS;
    const measurements: Record<string, number> = {};
    fields.forEach((k) => (measurements[k] = Number(form.m[k])));

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
          gender: form.gender,
          body_type: form.body_type,
          fitting_type: form.fitting_type as "loose" | "fit" | "tight",
          height_feet: Number(form.height_feet),
          height_inches: Number(form.height_inches || 0),
          measurement_unit: form.unit,
          measurements,
          reference_image: image,
          reference_link: form.reference_link.trim() || undefined,
          additional_notes: form.additional_notes.trim() || undefined,
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
      // Map server field errors back to the step that owns them
      if (e.errors && Object.keys(e.errors).length) {
        const mapped: Errors = {};
        let target = 3;
        Object.entries(e.errors).forEach(([k, msgs]) => {
          const local = ADDRESS_MAP[k] ?? k;
          mapped[local] = msgs[0];
          const s = k.startsWith("address.") || STEP2_KEYS.includes(k) ? 2 : STEP3_KEYS.includes(k) ? 3 : 1;
          target = Math.min(target, s);
        });
        setErrors(mapped);
        if (target !== 3) {
          setStep(target);
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
          set={set}
          setForm={setForm}
          image={image}
          setImage={setImage}
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
            <div className="lg:sticky lg:top-24">
              <Summary form={form} image={image} onEdit={() => go(1)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
