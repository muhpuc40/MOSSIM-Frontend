"use client";

import React, { useState } from "react";
import Link from "next/link";
import ModalPaymentInfo from "@/components/Modal/ModalPaymentInfo";
import {
  ADVANCE_PCT,
  CustomOrderForm,
  Errors,
  MAX_LEAD_DAYS,
  MIN_LEAD_DAYS,
  POLICIES,
  SHIP_INSIDE,
  SHIP_OUTSIDE,
  addDays,
  inputClass,
  isoDate,
  money,
} from "./constants";

interface Props {
  form: CustomOrderForm;
  set: <K extends keyof CustomOrderForm>(key: K, value: CustomOrderForm[K]) => void;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
  submitting: boolean;
  submitError: string;
  onBack: () => void;
  onSubmit: () => void;
}

export function validateConfirm(form: CustomOrderForm): Errors {
  const e: Errors = {};
  const min = isoDate(addDays(MIN_LEAD_DAYS));
  const max = isoDate(addDays(MAX_LEAD_DAYS));
  if (!form.delivery_date) e.delivery_date = "Please select your preferred delivery date.";
  else if (form.delivery_date < min) e.delivery_date = `Earliest available date is ${min} (${MIN_LEAD_DAYS} days for tailoring).`;
  else if (form.delivery_date > max) e.delivery_date = `Please choose a date within ${MAX_LEAD_DAYS} days.`;
  if (!form.agree) e.agree = "You must agree to the terms and policies.";
  return e;
}

export default function StepConfirm({ form, set, errors, setErrors, submitting, submitError, onBack, onSubmit }: Props) {
  const [payInfoOpen, setPayInfoOpen] = useState(false);
  const shipFee = form.shipType === "inside" ? SHIP_INSIDE : SHIP_OUTSIDE;
  const minDate = isoDate(addDays(MIN_LEAD_DAYS));
  const maxDate = isoDate(addDays(MAX_LEAD_DAYS));

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const handleSubmit = () => {
    const e = validateConfirm(form);
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`co-${Object.keys(e)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSubmit();
  };

  // illustrative split so the 65% rule is easy to understand
  const example = 5000;

  return (
    <div>
      {/* Section 1 — Delivery date */}
      <div className="heading5 mb-1">Preferred Delivery Date</div>
      <p className="caption1 text-secondary mb-4">
        Tailoring takes at least {MIN_LEAD_DAYS} days. We will confirm the final date on the call.
      </p>
      <div className="mb-10" id="co-delivery_date">
        <input
          type="date"
          className={`${inputClass} sm:max-w-xs ${errors.delivery_date ? "!border-red" : ""}`}
          min={minDate}
          max={maxDate}
          value={form.delivery_date}
          onChange={(e) => { set("delivery_date", e.target.value); clearError("delivery_date"); }}
        />
        {errors.delivery_date && <p className="caption2 text-red mt-1">{errors.delivery_date}</p>}
      </div>

      {/* Section 2 — Advance payment */}
      <div className="heading5 mb-1">Advance Payment</div>
      <p className="caption1 text-secondary mb-4">
        The price is agreed with you on a phone call after we review your measurements.
      </p>
      <div className="bg-surface p-5 rounded-2xl mb-3 space-y-3">
        <div className="flex justify-between caption1">
          <span className="text-secondary">Order amount</span>
          <span className="font-semibold">Confirmed by phone call</span>
        </div>
        <div className="flex justify-between caption1">
          <span className="text-secondary">Delivery charge</span>
          <span>{money(shipFee)}</span>
        </div>
        <div className="flex justify-between caption1 pt-3 border-t border-line">
          <span className="text-secondary">Advance payment</span>
          <span className="font-semibold">{ADVANCE_PCT}% of agreed amount</span>
        </div>
        <div className="flex justify-between caption1">
          <span className="text-secondary">Remaining balance</span>
          <span>{100 - ADVANCE_PCT}% before / on delivery</span>
        </div>
        <div className="caption2 text-secondary pt-3 border-t border-line">
          Example: for an agreed price of {money(example)}, the advance is{" "}
          <strong className="text-black">{money(Math.round((example * ADVANCE_PCT) / 100))}</strong> and the remaining{" "}
          {money(example - Math.round((example * ADVANCE_PCT) / 100))} is paid later.
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPayInfoOpen(true)}
        className="w-full p-4 border border-line rounded-xl text-left duration-200 hover:border-black hover:bg-surface mb-10">
        <div className="text-button">View Payment Info</div>
        <div className="caption1 text-secondary mt-1">See bKash, Nagad, QR code, and bank transfer details.</div>
      </button>

      {/* Section 3 — Policies */}
      <div className="heading5 mb-3">Policies</div>
      <div className="border border-line rounded-2xl divide-y divide-line mb-4">
        {POLICIES.map((p) => (
          <div key={p.title} className="p-4">
            <div className="text-button mb-1">{p.title}</div>
            <p className="caption1 text-secondary">{p.body}</p>
          </div>
        ))}
      </div>
      <p className="caption2 text-secondary mb-4">
        See also our{" "}
        <Link href="/terms-of-use" target="_blank" className="underline hover:text-black">Terms of Use</Link> and{" "}
        <Link href="/return-refund" target="_blank" className="underline hover:text-black">Return &amp; Refund Policy</Link>.
      </p>

      <label id="co-agree" className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer duration-200 mb-8 ${errors.agree ? "border-red" : form.agree ? "border-black bg-surface" : "border-line"}`}>
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 accent-black flex-shrink-0"
          checked={form.agree}
          onChange={(e) => { set("agree", e.target.checked); clearError("agree"); }}
        />
        <span className="caption1">
          I agree to the terms and policies. <span className="text-red">*</span>
          {errors.agree && <span className="block caption2 text-red mt-1">{errors.agree}</span>}
        </span>
      </label>

      {submitError && (
        <div className="p-3 bg-red/5 border border-red/20 rounded-lg caption1 text-red mb-4">{submitError}</div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          className="button-main bg-white text-black border border-black w-1/3 text-center hover:bg-black hover:text-white"
          onClick={onBack}
          disabled={submitting}>
          Back
        </button>
        <button type="button" className="button-main bg-black flex-1 text-center disabled:opacity-60" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting Order..." : "Submit Order"}
        </button>
      </div>

      <ModalPaymentInfo isOpen={payInfoOpen} onClose={() => setPayInfoOpen(false)} />
    </div>
  );
}
