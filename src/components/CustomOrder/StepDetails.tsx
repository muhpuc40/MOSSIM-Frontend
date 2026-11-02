"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { BOTTOM_FIELDS, MEASURE_LABEL, MeasureKey, TOP_FIELDS } from "./body/shape";
import {
  CustomOrderForm,
  Errors,
  IMAGE_TYPES,
  ItemForm,
  MAX_IMAGE_MB,
  MAX_ITEMS,
  MEASURE_HINT,
  Unit,
  emptyItem,
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

export type Images = Record<string, File | null>;

interface Props {
  form: CustomOrderForm;
  setForm: React.Dispatch<React.SetStateAction<CustomOrderForm>>;
  images: Images;
  setImages: React.Dispatch<React.SetStateAction<Images>>;
  activeIdx: number;
  setActiveIdx: (i: number) => void;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
  onNext: () => void;
}

/* ── Validation (mirrors the backend rules) ─────────
   Error keys use the backend shape: items.<index>.<field> */
export function validateItem(item: ItemForm, image: File | null | undefined, i: number): Errors {
  const e: Errors = {};
  const k = (f: string) => `items.${i}.${f}`;
  const feet = Number(item.height_feet);
  if (!item.height_feet || !Number.isInteger(feet) || feet < 1 || feet > 8) e[k("height_feet")] = "Enter feet between 1 and 8.";
  if (item.height_inches !== "") {
    const inch = Number(item.height_inches);
    if (isNaN(inch) || inch < 0 || inch > 11.9) e[k("height_inches")] = "Inches must be 0 – 11.9.";
  }
  if (!item.fitting_type) e[k("fitting_type")] = "Please select a fitting type.";
  const qty = Number(item.qty);
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) e[k("qty")] = "Quantity must be 1 – 20.";

  const fields = item.body_type === "top" ? TOP_FIELDS : BOTTOM_FIELDS;
  fields.forEach((f) => {
    const raw = item.m[f];
    const n = Number(raw);
    if (raw === "") e[k(f)] = `${MEASURE_LABEL[f]} is required.`;
    else if (isNaN(n) || n <= 0) e[k(f)] = "Enter a number greater than 0.";
    else if (n > 999) e[k(f)] = "That value looks too large.";
  });

  if (item.reference_link.trim()) {
    try {
      const u = new URL(item.reference_link.trim());
      if (!/^https?:$/.test(u.protocol)) throw new Error();
    } catch {
      e[k("reference_link")] = "Enter a valid link starting with http:// or https://";
    }
  }
  if (image) {
    if (!IMAGE_TYPES.includes(image.type)) e[k("reference_image")] = "Use a JPG, PNG or WEBP image.";
    else if (image.size > MAX_IMAGE_MB * 1024 * 1024) e[k("reference_image")] = `Image must be ${MAX_IMAGE_MB} MB or smaller.`;
  }
  return e;
}

export function validateItems(form: CustomOrderForm, images: Images): Errors {
  return form.items.reduce<Errors>((all, item, i) => ({ ...all, ...validateItem(item, images[item.uid], i) }), {});
}

const itemHasErrors = (errors: Errors, i: number) => Object.keys(errors).some((k) => k.startsWith(`items.${i}.`));

const Choice = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 px-4 py-3 rounded-lg border caption1 font-semibold duration-200 capitalize ${
      selected ? "border-black bg-black text-white" : "border-line bg-white hover:border-black"
    }`}>
    {children}
  </button>
);

const FieldError = ({ msg }: { msg?: string }) => (msg ? <p className="caption2 text-red mt-1">{msg}</p> : null);

/* ══════════ Collapsed item ══════════ */
function ItemSummary({
  item,
  index,
  hasImage,
  invalid,
  canRemove,
  onEdit,
  onRemove,
}: {
  item: ItemForm;
  index: number;
  hasImage: boolean;
  invalid: boolean;
  canRemove: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const fields = item.body_type === "top" ? TOP_FIELDS : BOTTOM_FIELDS;
  const unit = item.unit === "inch" ? "in" : "cm";
  return (
    <div className={`border rounded-xl p-4 bg-white duration-200 ${invalid ? "border-red" : "border-line"}`}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} className="flex items-start gap-3 text-left min-w-0 flex-1">
          <span className="w-8 h-8 rounded-full bg-black text-white caption1 font-semibold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <div className="min-w-0">
            <div className="text-button capitalize">
              {item.gender} · {item.body_type} · {item.fitting_type || "—"}
              {Number(item.qty) > 1 && <span className="text-secondary font-normal"> × {item.qty}</span>}
            </div>
            <div className="caption2 text-secondary mt-0.5 line-clamp-1">
              {fields.map((f) => `${MEASURE_LABEL[f]} ${item.m[f] || "–"}`).join(" · ")} {unit}
            </div>
            {(hasImage || item.reference_link || item.additional_notes) && (
              <div className="caption2 text-secondary mt-0.5">
                {[hasImage && "Image", item.reference_link && "Link", item.additional_notes && "Notes"].filter(Boolean).join(" · ")}
              </div>
            )}
            {invalid && <div className="caption2 text-red mt-1">Some details are missing — tap to fix.</div>}
          </div>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button type="button" onClick={onEdit} className="caption1 font-semibold px-3 py-1.5 rounded-lg hover:bg-surface">
            Edit
          </button>
          {canRemove && (
            <button type="button" onClick={onRemove} aria-label="Remove item" className="p-2 rounded-lg text-secondary hover:text-red hover:bg-surface">
              <Icon.Trash size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════ Expanded item editor ══════════ */
function ItemEditor({
  item,
  index,
  total,
  image,
  setImage,
  update,
  errors,
  clearError,
  setError,
  active,
  setActive,
  canRemove,
  onRemove,
}: {
  item: ItemForm;
  index: number;
  total: number;
  image: File | null;
  setImage: (f: File | null) => void;
  update: (patch: Partial<ItemForm> | ((it: ItemForm) => Partial<ItemForm>)) => void;
  errors: Errors;
  clearError: (field: string) => void;
  setError: (field: string, msg: string) => void;
  active: MeasureKey | null;
  setActive: (k: MeasureKey | null) => void;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const err = (f: string) => errors[`items.${index}.${f}`];
  const fields = item.body_type === "top" ? TOP_FIELDS : BOTTOM_FIELDS;
  const unitShort = item.unit === "inch" ? "in" : "cm";

  useEffect(() => {
    if (!image) return setPreview(null);
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  /* Convert entered values when switching cm ↔ inch */
  const switchUnit = (unit: Unit) => {
    if (unit === item.unit) return;
    update((it) => {
      const factor = unit === "cm" ? 2.54 : 1 / 2.54;
      const m = { ...it.m };
      (Object.keys(m) as MeasureKey[]).forEach((k) => {
        const n = Number(m[k]);
        if (m[k] !== "" && !isNaN(n) && n > 0) m[k] = String(Math.round(n * factor * 10) / 10);
      });
      return { unit, m };
    });
  };

  const pickImage = (file: File | null) => {
    clearError("reference_image");
    if (file && !IMAGE_TYPES.includes(file.type)) return setError("reference_image", "Use a JPG, PNG or WEBP image.");
    if (file && file.size > MAX_IMAGE_MB * 1024 * 1024) return setError("reference_image", `Image must be ${MAX_IMAGE_MB} MB or smaller.`);
    setImage(file);
  };

  return (
    <div id={`co-item-${index}`} className="border border-black rounded-2xl p-5 sm:p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-black text-white caption1 font-semibold flex items-center justify-center">{index + 1}</span>
          <div className="heading6">{total > 1 ? `Item ${index + 1}` : "Your Item"}</div>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} className="caption1 text-secondary hover:text-red flex items-center gap-1">
            <Icon.Trash size={16} /> Remove
          </button>
        )}
      </div>

      {/* Section 1 — Basic information */}
      <div className="heading5 mb-1">Basic Information</div>
      <p className="caption1 text-secondary mb-5">Tell us who we are tailoring this piece for.</p>

      <div className="space-y-5 mb-10">
        <div>
          <div className="caption1 font-semibold mb-2">Gender</div>
          <div className="flex gap-3">
            {(["male", "female"] as const).map((g) => (
              <Choice key={g} selected={item.gender === g} onClick={() => update({ gender: g })}>{g}</Choice>
            ))}
          </div>
        </div>

        <div>
          <div className="caption1 font-semibold mb-2">Body Type</div>
          <div className="flex gap-3">
            {(["top", "bottom"] as const).map((b) => (
              <Choice key={b} selected={item.body_type === b} onClick={() => update({ body_type: b })}>{b}</Choice>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2" id={`co-items.${index}.height_feet`}>
            <div className="caption1 font-semibold mb-2">Height</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  className={`${inputClass} pr-10 ${err("height_feet") ? "!border-red" : ""}`}
                  type="number" inputMode="numeric" min={1} max={8} placeholder="Feet *"
                  value={item.height_feet}
                  onChange={(e) => { update({ height_feet: e.target.value }); clearError("height_feet"); }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 caption1 text-secondary">ft</span>
              </div>
              <div className="relative">
                <input
                  className={`${inputClass} pr-10 ${err("height_inches") ? "!border-red" : ""}`}
                  type="number" inputMode="decimal" min={0} max={11.9} step={0.5} placeholder="Inches"
                  value={item.height_inches}
                  onChange={(e) => { update({ height_inches: e.target.value }); clearError("height_inches"); }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 caption1 text-secondary">in</span>
              </div>
            </div>
            <FieldError msg={err("height_feet") || err("height_inches")} />
          </div>
          <div id={`co-items.${index}.qty`}>
            <div className="caption1 font-semibold mb-2">Quantity</div>
            <div className={`flex items-center border rounded-lg bg-white h-[50px] ${err("qty") ? "border-red" : "border-line"}`}>
              <button type="button" aria-label="Decrease" className="px-3 h-full text-secondary hover:text-black"
                onClick={() => { update((it) => ({ qty: String(Math.max(1, (Number(it.qty) || 1) - 1)) })); clearError("qty"); }}>
                <Icon.Minus size={14} />
              </button>
              <input
                className="w-full text-center caption1 font-semibold border-0 bg-transparent"
                type="number" inputMode="numeric" min={1} max={20}
                value={item.qty}
                onChange={(e) => { update({ qty: e.target.value }); clearError("qty"); }}
              />
              <button type="button" aria-label="Increase" className="px-3 h-full text-secondary hover:text-black"
                onClick={() => { update((it) => ({ qty: String(Math.min(20, (Number(it.qty) || 0) + 1)) })); clearError("qty"); }}>
                <Icon.Plus size={14} />
              </button>
            </div>
            <FieldError msg={err("qty")} />
          </div>
        </div>

        <div id={`co-items.${index}.fitting_type`}>
          <div className="caption1 font-semibold mb-2">Fitting Type</div>
          <div className="flex gap-3">
            {(["loose", "fit", "tight"] as const).map((f) => (
              <Choice key={f} selected={item.fitting_type === f} onClick={() => { update({ fitting_type: f }); clearError("fitting_type"); }}>
                {f}
              </Choice>
            ))}
          </div>
          <FieldError msg={err("fitting_type")} />
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
              className={`px-4 py-1.5 caption1 font-semibold duration-200 ${item.unit === u ? "bg-black text-white" : "bg-white hover:bg-surface"}`}>
              {u === "inch" ? "Inches" : "CM"}
            </button>
          ))}
        </div>
      </div>
      <p className="caption1 text-secondary mb-5">Tap a field to see where to measure on the model.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {fields.map((k) => (
          <div key={k} id={`co-items.${index}.${k}`}>
            <label className="caption1 font-semibold mb-1.5 block" htmlFor={`m-${index}-${k}`}>
              {MEASURE_LABEL[k]} <span className="text-red">*</span>
            </label>
            <div className="relative">
              <input
                id={`m-${index}-${k}`}
                data-measure={k}
                className={`${inputClass} pr-12 duration-200 ${active === k ? "!border-black ring-2 ring-yellow/60" : ""} ${err(k) ? "!border-red" : ""}`}
                type="number" inputMode="decimal" min={0} step={0.1} placeholder="0.0"
                value={item.m[k]}
                onFocus={() => setActive(k)}
                onClick={() => setActive(k)}
                onChange={(e) => {
                  const val = e.target.value;
                  update((it) => ({ m: { ...it.m, [k]: val } }));
                  clearError(k);
                }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 caption1 text-secondary">{unitShort}</span>
            </div>
            {err(k) ? (
              <FieldError msg={err(k)} />
            ) : (
              <p className={`caption2 mt-1 duration-200 ${active === k ? "text-black" : "text-secondary2"}`}>{MEASURE_HINT[k]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Section 3 — Reference details */}
      <div className="heading5 mb-1">
        Reference Details <span className="caption1 text-secondary font-normal">(optional)</span>
      </div>
      <p className="caption1 text-secondary mb-5">Share a design you like so we can match it.</p>

      <div className="space-y-4">
        <div id={`co-items.${index}.reference_image`}>
          <div className="caption1 font-semibold mb-1.5">Reference Image</div>
          <input ref={fileRef} type="file" accept={IMAGE_TYPES.join(",")} className="hidden" onChange={(e) => pickImage(e.target.files?.[0] ?? null)} />
          {preview ? (
            <div className="flex items-center gap-4 p-3 border border-line rounded-xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Reference" className="w-16 h-20 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="caption1 font-semibold line-clamp-1">{image?.name}</div>
                <div className="caption2 text-secondary">{((image?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button type="button" className="caption1 text-red font-semibold px-3 py-1.5"
                onClick={() => { setImage(null); if (fileRef.current) fileRef.current.value = ""; }}>
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`w-full p-5 border border-dashed rounded-xl flex flex-col items-center gap-1 duration-200 hover:border-black hover:bg-surface ${err("reference_image") ? "border-red" : "border-line"}`}>
              <Icon.UploadSimple size={22} />
              <span className="caption1 font-semibold">Upload an image</span>
              <span className="caption2 text-secondary">JPG, PNG or WEBP · up to {MAX_IMAGE_MB} MB</span>
            </button>
          )}
          <FieldError msg={err("reference_image")} />
        </div>

        <div id={`co-items.${index}.reference_link`}>
          <div className="caption1 font-semibold mb-1.5">Reference Link</div>
          <input
            className={`${inputClass} ${err("reference_link") ? "!border-red" : ""}`}
            type="url" placeholder="https://"
            value={item.reference_link}
            onChange={(e) => { update({ reference_link: e.target.value }); clearError("reference_link"); }}
          />
          <FieldError msg={err("reference_link")} />
        </div>

        <div>
          <div className="caption1 font-semibold mb-1.5">Additional Notes</div>
          <textarea
            rows={3} maxLength={2000}
            placeholder="Fabric, colour, collar style, anything we should know…"
            className={`${inputClass} resize-none`}
            value={item.additional_notes}
            onChange={(e) => update({ additional_notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════ Step 1 ══════════ */
export default function StepDetails({ form, setForm, images, setImages, activeIdx, setActiveIdx, errors, setErrors, onNext }: Props) {
  const [active, setActive] = useState<MeasureKey | null>(null);
  const [showModel, setShowModel] = useState(true);

  const items = form.items;
  const idx = Math.min(activeIdx, items.length - 1);
  const current = items[idx];
  const fields = current.body_type === "top" ? TOP_FIELDS : BOTTOM_FIELDS;

  // clear the highlight when it no longer belongs to this item's body type
  useEffect(() => {
    if (active && !fields.includes(active)) setActive(null);
  }, [current.body_type, idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (i: number) => (patch: Partial<ItemForm> | ((it: ItemForm) => Partial<ItemForm>)) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, j) => (j === i ? { ...it, ...(typeof patch === "function" ? patch(it) : patch) } : it)),
    }));

  const clearError = (i: number) => (field: string) =>
    setErrors((prev) => {
      const key = `items.${i}.${field}`;
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  const setError = (i: number) => (field: string, msg: string) => setErrors((p) => ({ ...p, [`items.${i}.${field}`]: msg }));

  const scrollTo = (id: string) =>
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);

  const focusFirstError = (e: Errors) => {
    const first = Object.keys(e)[0];
    const i = Number(first.split(".")[1]);
    setActiveIdx(i);
    setTimeout(() => document.getElementById(`co-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    const field = first.split(".")[2] as MeasureKey;
    if ((TOP_FIELDS as string[]).concat(BOTTOM_FIELDS).includes(field)) setActive(field);
  };

  /* Add More: check the open item, collapse it, open a new one */
  const addMore = () => {
    const e = validateItem(current, images[current.uid], idx);
    if (Object.keys(e).length) {
      setErrors((p) => ({ ...p, ...e }));
      focusFirstError(e);
      return;
    }
    const next = emptyItem(current);
    setForm((f) => ({ ...f, items: [...f.items, next] }));
    setActiveIdx(items.length);
    setActive(null);
    scrollTo(`co-item-${items.length}`);
  };

  const remove = (i: number) => {
    if (items.length <= 1) return;
    if (!confirm(`Remove item ${i + 1}?`)) return;
    const uid = items[i].uid;
    setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }));
    setImages((imgs) => {
      const next = { ...imgs };
      delete next[uid];
      return next;
    });
    // indexes shift — drop item errors, they are re-checked on Next
    setErrors((p) => Object.fromEntries(Object.entries(p).filter(([k]) => !k.startsWith("items."))));
    setActiveIdx(i < idx ? idx - 1 : Math.min(idx, items.length - 2));
  };

  const edit = (i: number) => {
    setActiveIdx(i);
    setActive(null);
    scrollTo(`co-item-${i}`);
  };

  const handleNext = () => {
    const e = validateItems(form, images);
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError(e);
    onNext();
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="flex max-lg:flex-col-reverse gap-y-6 gap-x-10">
      {/* ── Left: items ──────────────────────── */}
      <div className="lg:w-1/2 w-full">
        <div className="space-y-4">
          {items.map((item, i) =>
            i === idx ? (
              <ItemEditor
                key={item.uid}
                item={item}
                index={i}
                total={items.length}
                image={images[item.uid] ?? null}
                setImage={(f) => setImages((imgs) => ({ ...imgs, [item.uid]: f }))}
                update={update(i)}
                errors={errors}
                clearError={clearError(i)}
                setError={setError(i)}
                active={active}
                setActive={setActive}
                canRemove={items.length > 1}
                onRemove={() => remove(i)}
              />
            ) : (
              <div key={item.uid} id={`co-item-${i}`}>
                <ItemSummary
                  item={item}
                  index={i}
                  hasImage={!!images[item.uid]}
                  invalid={itemHasErrors(errors, i)}
                  canRemove={items.length > 1}
                  onEdit={() => edit(i)}
                  onRemove={() => remove(i)}
                />
              </div>
            ),
          )}
        </div>

        {items.length < MAX_ITEMS ? (
          <button
            type="button"
            onClick={addMore}
            className="w-full mt-4 p-4 border border-dashed border-black rounded-xl flex items-center justify-center gap-2 text-button duration-200 hover:bg-surface">
            <Icon.Plus size={18} weight="bold" /> Add More
          </button>
        ) : (
          <p className="caption1 text-secondary text-center mt-4">You can add up to {MAX_ITEMS} items in one order.</p>
        )}
        <p className="caption2 text-secondary text-center mt-2">
          Ordering for someone else, or another style? Add each piece as a separate item.
        </p>

        {hasErrors && (
          <div className="p-3 bg-red/5 border border-red/20 rounded-lg caption1 text-red mt-6">
            Please fix the highlighted fields before continuing.
          </div>
        )}

        <button type="button" className="button-main bg-black w-full text-center mt-6" onClick={handleNext}>
          Next: Customer Information
        </button>
      </div>

      {/* ── Right: 3D model (follows the open item) ── */}
      {/* on mobile the column itself is sticky (its parent is the tall flex container) */}
      <div className="lg:w-1/2 w-full max-lg:sticky max-lg:top-[56px] max-lg:z-20 max-lg:bg-white max-lg:pt-2 max-lg:pb-3 max-lg:-mx-4 max-lg:px-4 max-lg:shadow-[0_8px_16px_-12px_rgba(0,0,0,0.25)]">
        <div className="lg:sticky lg:top-24">
          <div className="lg:hidden flex items-center justify-between mb-2">
            <span className="caption1 font-semibold">
              Measurement guide{items.length > 1 ? ` · Item ${idx + 1}` : ""}
            </span>
            <button type="button" className="caption1 underline text-secondary" onClick={() => setShowModel((s) => !s)}>
              {showModel ? "Hide model" : "Show model"}
            </button>
          </div>
          {showModel && (
            <div className="lg:h-[640px] h-[min(38vh,320px)]">
              <BodyViewer gender={current.gender} bodyType={current.body_type} active={active} label={items.length > 1 ? `Item ${idx + 1}` : undefined} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
