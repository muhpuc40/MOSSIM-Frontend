"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { BOTTOM_FIELDS, MEASURE_LABEL, MeasureKey, TOP_FIELDS } from "./body/shape";
import {
  CustomOrderForm,
  Errors,
  IMAGE_TYPES,
  MAX_IMAGE_MB,
  MEASURE_HINT,
  Unit,
  inputClass,
} from "./constants";

// WebGL only runs in the browser
const BodyViewer = dynamic(() => import("./body/BodyViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-surface border border-line flex items-center justify-center caption1 text-secondary">
      Loading 3D model…
    </div>
  ),
});

interface Props {
  form: CustomOrderForm;
  set: <K extends keyof CustomOrderForm>(key: K, value: CustomOrderForm[K]) => void;
  setForm: React.Dispatch<React.SetStateAction<CustomOrderForm>>;
  image: File | null;
  setImage: (f: File | null) => void;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
  onNext: () => void;
}

/* ── Validation (mirrors the backend rules) ───────── */
export function validateDetails(form: CustomOrderForm, image: File | null): Errors {
  const e: Errors = {};
  const feet = Number(form.height_feet);
  if (!form.height_feet || !Number.isInteger(feet) || feet < 1 || feet > 8) e.height_feet = "Enter feet between 1 and 8.";
  if (form.height_inches !== "") {
    const inch = Number(form.height_inches);
    if (isNaN(inch) || inch < 0 || inch > 11.9) e.height_inches = "Inches must be 0 – 11.9.";
  }
  if (!form.fitting_type) e.fitting_type = "Please select a fitting type.";

  const fields = form.body_type === "top" ? TOP_FIELDS : BOTTOM_FIELDS;
  fields.forEach((k) => {
    const raw = form.m[k];
    const n = Number(raw);
    if (raw === "") e[k] = `${MEASURE_LABEL[k]} is required.`;
    else if (isNaN(n) || n <= 0) e[k] = "Enter a number greater than 0.";
    else if (n > 999) e[k] = "That value looks too large.";
  });

  if (form.reference_link.trim()) {
    try {
      const u = new URL(form.reference_link.trim());
      if (!/^https?:$/.test(u.protocol)) throw new Error();
    } catch {
      e.reference_link = "Enter a valid link starting with http:// or https://";
    }
  }
  if (image) {
    if (!IMAGE_TYPES.includes(image.type)) e.reference_image = "Use a JPG, PNG or WEBP image.";
    else if (image.size > MAX_IMAGE_MB * 1024 * 1024) e.reference_image = `Image must be ${MAX_IMAGE_MB} MB or smaller.`;
  }
  return e;
}

const Choice = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 px-4 py-3 rounded-lg border caption1 font-semibold duration-200 capitalize ${
      selected ? "border-black bg-black text-white" : "border-line bg-white hover:border-black"
    }`}>
    {children}
  </button>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="caption2 text-red mt-1">{msg}</p> : null;

export default function StepDetails({ form, set, setForm, image, setImage, errors, setErrors, onNext }: Props) {
  const [active, setActive] = useState<MeasureKey | null>(null);
  const [showModel, setShowModel] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fields = form.body_type === "top" ? TOP_FIELDS : BOTTOM_FIELDS;

  // clear the highlight when it no longer belongs to the body type
  useEffect(() => {
    if (active && !fields.includes(active)) setActive(null);
  }, [form.body_type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!image) return setPreview(null);
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  /* Convert entered values when switching cm ↔ inch */
  const switchUnit = (unit: Unit) => {
    if (unit === form.unit) return;
    setForm((f) => {
      const factor = unit === "cm" ? 2.54 : 1 / 2.54;
      const m = { ...f.m };
      (Object.keys(m) as MeasureKey[]).forEach((k) => {
        const n = Number(m[k]);
        if (m[k] !== "" && !isNaN(n) && n > 0) m[k] = String(Math.round(n * factor * 10) / 10);
      });
      return { ...f, unit, m };
    });
  };

  const pickImage = (file: File | null) => {
    clearError("reference_image");
    if (file && !IMAGE_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, reference_image: "Use a JPG, PNG or WEBP image." }));
      return;
    }
    if (file && file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((p) => ({ ...p, reference_image: `Image must be ${MAX_IMAGE_MB} MB or smaller.` }));
      return;
    }
    setImage(file);
  };

  const handleNext = () => {
    const e = validateDetails(form, image);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`co-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      if ((fields as string[]).includes(first)) setActive(first as MeasureKey);
      return;
    }
    onNext();
  };

  const unitShort = form.unit === "inch" ? "in" : "cm";

  return (
    <div className="flex max-lg:flex-col-reverse gap-y-6 gap-x-10">
      {/* ── Left: form ───────────────────────── */}
      <div className="lg:w-1/2 w-full">
        {/* Section 1 — Basic information */}
        <div className="heading5 mb-1">Basic Information</div>
        <p className="caption1 text-secondary mb-5">Tell us who we are tailoring for.</p>

        <div className="space-y-5 mb-10">
          <div>
            <div className="caption1 font-semibold mb-2">Gender</div>
            <div className="flex gap-3">
              {(["male", "female"] as const).map((g) => (
                <Choice key={g} selected={form.gender === g} onClick={() => set("gender", g)}>
                  {g}
                </Choice>
              ))}
            </div>
          </div>

          <div>
            <div className="caption1 font-semibold mb-2">Body Type</div>
            <div className="flex gap-3">
              {(["top", "bottom"] as const).map((b) => (
                <Choice key={b} selected={form.body_type === b} onClick={() => set("body_type", b)}>
                  {b}
                </Choice>
              ))}
            </div>
          </div>

          <div id="co-height_feet">
            <div className="caption1 font-semibold mb-2">Height</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  className={`${inputClass} pr-14 ${errors.height_feet ? "!border-red" : ""}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={8}
                  placeholder="Feet *"
                  value={form.height_feet}
                  onChange={(e) => { set("height_feet", e.target.value); clearError("height_feet"); }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 caption1 text-secondary">ft</span>
              </div>
              <div className="relative">
                <input
                  className={`${inputClass} pr-14 ${errors.height_inches ? "!border-red" : ""}`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={11.9}
                  step={0.5}
                  placeholder="Inches"
                  value={form.height_inches}
                  onChange={(e) => { set("height_inches", e.target.value); clearError("height_inches"); }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 caption1 text-secondary">in</span>
              </div>
            </div>
            <FieldError msg={errors.height_feet || errors.height_inches} />
          </div>

          <div id="co-fitting_type">
            <div className="caption1 font-semibold mb-2">Fitting Type</div>
            <div className="flex gap-3">
              {(["loose", "fit", "tight"] as const).map((f) => (
                <Choice
                  key={f}
                  selected={form.fitting_type === f}
                  onClick={() => { set("fitting_type", f); clearError("fitting_type"); }}>
                  {f}
                </Choice>
              ))}
            </div>
            <FieldError msg={errors.fitting_type} />
          </div>
        </div>

        {/* Section 2 — Measurements */}
        <div className="flex items-end justify-between gap-3 mb-1">
          <div className="heading5">Body Measurements</div>
          <div className="flex rounded-lg border border-line overflow-hidden flex-shrink-0">
            {(["inch", "cm"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => switchUnit(u)}
                className={`px-4 py-1.5 caption1 font-semibold duration-200 ${
                  form.unit === u ? "bg-black text-white" : "bg-white hover:bg-surface"
                }`}>
                {u === "inch" ? "Inches" : "CM"}
              </button>
            ))}
          </div>
        </div>
        <p className="caption1 text-secondary mb-5">
          Tap a field to see where to measure on the model.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {fields.map((k) => (
            <div key={k} id={`co-${k}`}>
              <label className="caption1 font-semibold mb-1.5 block" htmlFor={`m-${k}`}>
                {MEASURE_LABEL[k]} <span className="text-red">*</span>
              </label>
              <div className="relative">
                <input
                  id={`m-${k}`}
                  className={`${inputClass} pr-12 duration-200 ${
                    active === k ? "!border-black ring-2 ring-yellow/60" : ""
                  } ${errors[k] ? "!border-red" : ""}`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  placeholder="0.0"
                  value={form.m[k]}
                  onFocus={() => setActive(k)}
                  onClick={() => setActive(k)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((f) => ({ ...f, m: { ...f.m, [k]: val } }));
                    clearError(k);
                  }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 caption1 text-secondary">{unitShort}</span>
              </div>
              {errors[k] ? (
                <FieldError msg={errors[k]} />
              ) : (
                <p className={`caption2 mt-1 duration-200 ${active === k ? "text-black" : "text-secondary2"}`}>
                  {MEASURE_HINT[k]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Section 3 — Reference details */}
        <div className="heading5 mb-1">
          Reference Details <span className="caption1 text-secondary font-normal">(optional)</span>
        </div>
        <p className="caption1 text-secondary mb-5">Share a design you like so we can match it.</p>

        <div className="space-y-4 mb-10">
          <div id="co-reference_image">
            <div className="caption1 font-semibold mb-1.5">Reference Image</div>
            <input
              ref={fileRef}
              type="file"
              accept={IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={(e) => pickImage(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              <div className="flex items-center gap-4 p-3 border border-line rounded-xl bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Reference" className="w-16 h-20 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="caption1 font-semibold line-clamp-1">{image?.name}</div>
                  <div className="caption2 text-secondary">{((image?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button
                  type="button"
                  className="caption1 text-red font-semibold px-3 py-1.5"
                  onClick={() => { setImage(null); if (fileRef.current) fileRef.current.value = ""; }}>
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`w-full p-5 border border-dashed rounded-xl flex flex-col items-center gap-1 duration-200 hover:border-black hover:bg-surface ${
                  errors.reference_image ? "border-red" : "border-line"
                }`}>
                <Icon.UploadSimple size={22} />
                <span className="caption1 font-semibold">Upload an image</span>
                <span className="caption2 text-secondary">JPG, PNG or WEBP · up to {MAX_IMAGE_MB} MB</span>
              </button>
            )}
            <FieldError msg={errors.reference_image} />
          </div>

          <div id="co-reference_link">
            <div className="caption1 font-semibold mb-1.5">Reference Link</div>
            <input
              className={`${inputClass} ${errors.reference_link ? "!border-red" : ""}`}
              type="url"
              placeholder="https://"
              value={form.reference_link}
              onChange={(e) => { set("reference_link", e.target.value); clearError("reference_link"); }}
            />
            <FieldError msg={errors.reference_link} />
          </div>

          <div>
            <div className="caption1 font-semibold mb-1.5">Additional Notes</div>
            <textarea
              rows={4}
              maxLength={2000}
              placeholder="Fabric, colour, collar style, anything we should know…"
              className={`${inputClass} resize-none`}
              value={form.additional_notes}
              onChange={(e) => set("additional_notes", e.target.value)}
            />
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-red/5 border border-red/20 rounded-lg caption1 text-red mb-4">
            Please fix the highlighted fields before continuing.
          </div>
        )}

        <button type="button" className="button-main bg-black w-full text-center" onClick={handleNext}>
          Next: Customer Information
        </button>
      </div>

      {/* ── Right: 3D model ─────────────────── */}
      {/* on mobile the column itself is sticky (its parent is the tall flex container) */}
      <div className="lg:w-1/2 w-full max-lg:sticky max-lg:top-[56px] max-lg:z-20 max-lg:bg-white max-lg:pt-2 max-lg:pb-3 max-lg:-mx-4 max-lg:px-4 max-lg:shadow-[0_8px_16px_-12px_rgba(0,0,0,0.25)]">
        <div className="lg:sticky lg:top-24">
          <div className="lg:hidden flex items-center justify-between mb-2">
            <span className="caption1 font-semibold">Measurement guide</span>
            <button type="button" className="caption1 underline text-secondary" onClick={() => setShowModel((s) => !s)}>
              {showModel ? "Hide model" : "Show model"}
            </button>
          </div>
          {showModel && (
            <div className="lg:h-[640px] h-[min(38vh,320px)]">
              <BodyViewer gender={form.gender} bodyType={form.body_type} active={active} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
