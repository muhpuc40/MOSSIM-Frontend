"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth";
import type { CustomerAddress } from "@/type/Auth";
import {
  CustomOrderForm,
  Errors,
  FREE_SHIP_AT,
  SHIP_INSIDE,
  SHIP_OUTSIDE,
  inputClass,
  money,
} from "./constants";

interface Props {
  form: CustomOrderForm;
  set: <K extends keyof CustomOrderForm>(key: K, value: CustomOrderForm[K]) => void;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
  onBack: () => void;
  onNext: () => void;
}

/** Same required fields as the regular guest checkout. */
export function validateCustomer(form: CustomOrderForm, loggedIn: boolean, hasSaved: boolean): Errors {
  const e: Errors = {};
  const usingSaved = loggedIn && hasSaved && form.addrMode === "saved";

  if (!loggedIn) {
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.phone.trim()) e.phone = "Please enter your phone number.";
    else if (!/^[+0-9\s-]{6,20}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
  }

  if (usingSaved) {
    if (!form.savedAddressId) e.savedAddressId = "Please select a shipping address.";
  } else {
    if (!form.line1.trim()) e.line1 = "Street address is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.country.trim()) e.country = "Country is required.";
  }
  return e;
}

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="caption2 text-red mt-1">{msg}</p> : null;

export default function StepCustomer({ form, set, errors, setErrors, onBack, onNext }: Props) {
  const { user, token, isLoggedIn } = useAuth();

  /* ── Saved addresses (logged in) — same as LoggedInCheckout ── */
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setAddrLoading(true);
    authService
      .getAddresses(token)
      .then((data) => {
        setAddresses(data);
        if (data.length === 0) {
          set("addrMode", "new");
        } else if (!form.savedAddressId || !data.some((a) => a.id === form.savedAddressId)) {
          const def = data.find((a) => a.is_default) ?? data[0];
          set("savedAddressId", def.id);
        }
      })
      .catch(() => set("addrMode", "new"))
      .finally(() => setAddrLoading(false));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const field = (key: keyof CustomOrderForm, placeholder: string, opts: { type?: string; span?: boolean } = {}) => (
    <div className={opts.span ? "sm:col-span-2" : ""} id={`co-${key}`}>
      <input
        className={`${inputClass} ${errors[key] ? "!border-red" : ""}`}
        type={opts.type ?? "text"}
        placeholder={placeholder}
        value={form[key] as string}
        onChange={(e) => { set(key, e.target.value as never); clearError(key); }}
      />
      <FieldError msg={errors[key]} />
    </div>
  );

  const handleNext = () => {
    const e = validateCustomer(form, isLoggedIn, addresses.length > 0);
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`co-${Object.keys(e)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onNext();
  };

  const showNewForm = !isLoggedIn || addresses.length === 0 || form.addrMode === "new";

  return (
    <div>
      {/* Section 1 — Your information */}
      {isLoggedIn && user ? (
        <>
          <div className="heading5 mb-3">Your Information</div>
          <div className="bg-surface p-4 rounded-xl caption1 mb-8">
            <div className="font-semibold text-title">{user.name}</div>
            <div className="text-secondary mt-1">
              {user.email} · {user.phone}
            </div>
            <Link href="/my-account" className="caption2 underline text-secondary hover:text-black mt-2 inline-block">
              Update profile
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="login bg-surface py-3 px-4 flex items-center justify-between rounded-lg mb-8">
            <span className="caption1 text-secondary">Already have an account?</span>
            <Link href="/login" className="text-button hover-underline">Login</Link>
          </div>
          <div className="heading5 mb-3">Your Information</div>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {field("name", "Full Name *")}
            {field("phone", "Phone Number *", { type: "tel" })}
            {field("email", "Email (for order confirmation)", { type: "email", span: true })}
          </div>
        </>
      )}

      {/* Section 2 — Shipping address */}
      <div className="heading5 mb-3">Shipping Address</div>

      {isLoggedIn && addrLoading && <div className="caption1 text-secondary mb-8">Loading addresses...</div>}

      {isLoggedIn && !addrLoading && addresses.length > 0 && (
        <div className="space-y-3 mb-4" id="co-savedAddressId">
          {addresses.map((addr) => {
            const selected = form.addrMode === "saved" && form.savedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                className={`p-4 border rounded-xl cursor-pointer duration-200 ${selected ? "border-black bg-surface" : "border-line hover:border-black"}`}
                onClick={() => { set("addrMode", "saved"); set("savedAddressId", addr.id); clearError("savedAddressId"); }}>
                <div className="flex items-start gap-3">
                  <input type="radio" checked={selected} readOnly className="mt-1 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-button">{addr.recipient_name}</span>
                      {addr.is_default && <span className="caption2 bg-black text-white px-2 py-0.5 rounded">Default</span>}
                    </div>
                    <div className="caption1 text-secondary mt-1">{addr.phone}</div>
                    <div className="caption1 mt-1">
                      {addr.address_line_1}
                      {addr.address_line_2 && `, ${addr.address_line_2}`}
                    </div>
                    <div className="caption1">
                      {addr.city}
                      {addr.state ? `, ${addr.state}` : ""} {addr.postal_code}, {addr.country}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div
            className={`p-4 border rounded-xl cursor-pointer duration-200 ${form.addrMode === "new" ? "border-black bg-surface" : "border-line hover:border-black"}`}
            onClick={() => set("addrMode", "new")}>
            <div className="flex items-center gap-3">
              <input type="radio" checked={form.addrMode === "new"} readOnly className="flex-shrink-0" />
              <span className="text-button">Ship to a different address</span>
            </div>
          </div>
          <FieldError msg={errors.savedAddressId} />
        </div>
      )}

      {showNewForm && !(isLoggedIn && addrLoading) && (
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {field("line1", "Street Address *", { span: true })}
          {field("line2", "Apartment, suite, etc. (optional)", { span: true })}
          {field("city", "Town/City *")}
          {field("state", "State/Division (optional)")}
          {field("postal", "Postal Code (optional)")}
          {field("country", "Country *")}
        </div>
      )}

      {/* Delivery location — same fees as checkout */}
      <div className="heading6 mt-8 mb-3">Home Delivery Location</div>
      <div className="grid sm:grid-cols-2 gap-3 mb-2">
        {([
          ["inside", "Inside Chittagong", SHIP_INSIDE],
          ["outside", "Outside Chittagong", SHIP_OUTSIDE],
        ] as const).map(([value, label, fee]) => (
          <label
            key={value}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer duration-200 ${form.shipType === value ? "border-black bg-surface" : "border-line hover:border-black"}`}>
            <div className="flex items-center gap-2">
              <input type="radio" name="co-ship" checked={form.shipType === value} onChange={() => set("shipType", value)} />
              <span className="caption1">{label}</span>
            </div>
            <span className="caption1 font-semibold">{money(fee)}</span>
          </label>
        ))}
      </div>
      <p className="caption2 text-secondary mb-8">
        Free delivery applies automatically if the agreed price is {money(FREE_SHIP_AT)} or more.
      </p>

      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red/5 border border-red/20 rounded-lg caption1 text-red mb-4">
          Please fix the highlighted fields before continuing.
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" className="button-main bg-white text-black border border-black w-1/3 text-center hover:bg-black hover:text-white" onClick={onBack}>
          Back
        </button>
        <button type="button" className="button-main bg-black flex-1 text-center" onClick={handleNext}>
          Next: Confirmation
        </button>
      </div>
    </div>
  );
}
