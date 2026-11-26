"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import SelectField from "@/components/ui/SelectField";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { createProductAction, updateProductAction, uploadProductImageAction } from "@/lib/catalog/actions";
import ColorPickerModal from "./ColorPickerModal";
import { CreateCategoryButton } from "./CategoryWizard";

const MAX_IMAGES = 8;
const MAX_BYTES = 5 * 1024 * 1024;
const STEP_TITLES = ["Step 1: General Product Information", "Step 2: Add Specification", "Step 3: Product Stock Information"];

const inputCls = (err) =>
  `w-full rounded-md border bg-white px-4 text-sm text-ink placeholder:text-xs placeholder:text-neutral-400 outline-none transition focus:ring-2 ${
    err ? "border-red-500 focus:ring-red-200" : "border-neutral-200 focus:border-brand focus:ring-brand/20"
  }`;
const outline = "h-10 rounded-md border border-neutral-300 bg-white px-3.5 text-[13px] text-neutral-600 transition hover:border-ink hover:text-ink disabled:opacity-50";
const primary = "h-10 rounded-md bg-brand px-4 text-[13px] font-medium text-white transition hover:bg-brand-hover disabled:opacity-60";
const addBtn = "inline-flex h-9 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-xs text-neutral-600 transition hover:border-ink hover:text-ink";

function Err({ id, children }) {
  return children ? (
    <p id={id} className="mt-2 text-xs text-red-600">
      {children}
    </p>
  ) : null;
}

function Field({ id, label, error, children, hint }) {
  return (
    <div>
      <label htmlFor={id} className="mb-3 block text-sm font-medium text-black">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-2 text-xs text-neutral-500">{hint}</p>}
      <Err id={`${id}-error`}>{error}</Err>
    </div>
  );
}

function Plus() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

// Drag-and-drop / click-to-browse photo uploader. Photos upload as soon as they're chosen.
function ImageUploader({ images, setImages, error, setError }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(0);

  const addFiles = async (fileList) => {
    const files = [...fileList];
    const room = MAX_IMAGES - images.length;
    const problems = [];
    if (files.length > room) problems.push(`Only ${MAX_IMAGES} photos per product — ${files.length - Math.max(room, 0)} skipped.`);
    const ok = files.slice(0, Math.max(room, 0)).filter((f) => {
      if (!["image/jpeg", "image/png"].includes(f.type)) return problems.push(`${f.name} isn't a JPG or PNG.`) && false;
      if (f.size > MAX_BYTES) return problems.push(`${f.name} is over 5MB.`) && false;
      return true;
    });
    setError(problems.join(" ") || null);
    for (const f of ok) {
      setUploading((n) => n + 1);
      const fd = new FormData();
      fd.append("file", f);
      const res = await uploadProductImageAction(fd);
      setUploading((n) => n - 1);
      if (res.url) setImages((list) => [...list, res.url]);
      else setError((e) => [e, res.error].filter(Boolean).join(" "));
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-34 cursor-pointer flex-col items-center justify-center rounded-md border px-4 py-8 text-center transition ${
          drag ? "border-brand bg-brand/5" : error ? "border-red-500" : "border-neutral-200 hover:border-neutral-400"
        }`}
      >
        <svg viewBox="0 0 24 24" className="size-6 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M12 15V8M9 11l3-3 3 3M8 16.5h8" />
        </svg>
        <p className="mt-3 text-[11px] text-neutral-500">Drag and drop files here, or click to browse</p>
        <p className="mt-1 text-[11px] text-neutral-500">Supported formats: JPG, PNG (Max 5MB)</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="mt-3 rounded bg-neutral-300 px-3 py-1.5 text-[11px] font-medium text-ink transition hover:bg-neutral-400"
        >
          Upload Image
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Upload product images"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {(images.length > 0 || uploading > 0) && (
        <ul className="mt-4 flex flex-wrap gap-3" aria-label="Uploaded photos">
          {images.map((src, i) => (
            <li key={src} className="relative size-24 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
              {/* eslint-disable-next-line @next/next/no-img-element -- just-uploaded preview */}
              <img src={src} alt={`Photo ${i + 1}`} className="size-full object-contain" />
              {i === 0 ? (
                <span className="absolute bottom-1 left-1 rounded bg-brand px-1.5 py-0.5 text-[9px] font-semibold text-white">Main</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setImages((l) => [src, ...l.filter((x) => x !== src)])}
                  className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-medium text-white hover:bg-black"
                >
                  Make main
                </button>
              )}
              <button
                type="button"
                onClick={() => setImages((l) => l.filter((x) => x !== src))}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
              >
                <XIcon />
              </button>
            </li>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <li key={`up-${i}`} className="grid size-24 place-items-center rounded-md border border-dashed border-neutral-300 text-[10px] text-neutral-500">
              Uploading…
            </li>
          ))}
        </ul>
      )}
      <Err id="images-error">{error}</Err>
    </div>
  );
}

const emptyGroup = () => ({ key: Math.random().toString(36).slice(2), name: "", rows: [{ key: "r0", type: "", value: "" }] });

// tree: category tree. presets: [{ name, hex }] for the colour picker.
// Editing: pass productId + initial ({ values, color, images, specs }) — the same form, prefilled.
export default function ProductForm({ tree, presets, productId = null, productName = "", initial = null }) {
  const editing = Boolean(productId);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, startSaving] = useTransition();
  const [colorOpen, setColorOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const topRef = useRef(null);

  const [v, setV] = useState(initial?.values ?? {
    name: "",
    brand: "",
    description: "",
    price: "",
    categoryId: "",
    subcategoryId: "",
    subSubcategoryId: "",
    stock: "",
    sku: "",
    visibility: "active",
    warranty: "",
    sizeWeight: "",
  });
  const [color, setColor] = useState(initial?.color ?? null);
  const [images, setImagesRaw] = useState(initial?.images ?? []);
  const [imageError, setImageError] = useState(null);
  const [specs, setSpecs] = useState(() =>
    initial?.specs?.length
      ? initial.specs.map((g) => ({ key: Math.random().toString(36).slice(2), name: g.name, rows: g.rows.map((r, i) => ({ key: `r${i}`, ...r })) }))
      : [emptyGroup()]
  );

  const set = (k) => (e) => {
    const value = e.target.value;
    setV((p) => ({ ...p, [k]: value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
    setDirty(true);
  };
  const setImages = (fn) => {
    setImagesRaw(fn);
    setErrors((p) => ({ ...p, images: undefined }));
    setDirty(true);
  };

  // Warn before leaving with unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const main = tree.find((c) => c.id === v.categoryId);
  const sub = main?.children.find((s) => s.id === v.subcategoryId);

  // Quick checks before moving on (the server checks everything again on save).
  const check = (s) => {
    const e = {};
    if (s === 1) {
      if (!v.name.trim()) e.name = "Enter the product name";
      const price = Number(v.price.replace(/[,\s₦]/g, ""));
      if (!v.price.trim()) e.price = "Enter the price";
      else if (!Number.isFinite(price) || price <= 0) e.price = "Enter a price above ₦0";
      if (!v.categoryId) e.categoryId = "Choose a category";
      if (!images.length) e.images = "Upload at least one photo of the product";
    }
    if (s === 2) {
      specs.forEach((g, gi) => {
        const filled = g.rows.filter((r) => r.type.trim() || r.value.trim());
        if (!g.name.trim() && !filled.length) return;
        if (!g.name.trim()) e[`spec-${gi}-name`] = "Name this specification (e.g. Display)";
        else if (!filled.length) e[`spec-${gi}-row-0-type`] = "Add at least one type and value";
        g.rows.forEach((r, ri) => {
          if (!r.type.trim() && !r.value.trim()) return;
          if (!r.type.trim()) e[`spec-${gi}-row-${ri}-type`] = "Enter the specification type";
          if (!r.value.trim()) e[`spec-${gi}-row-${ri}-value`] = "Enter the value";
        });
      });
    }
    if (s === 3) {
      if (!v.stock.trim()) e.stock = "Enter how many you have in stock";
      else if (!/^\d+$/.test(v.stock.trim())) e.stock = "Enter a whole number, 0 or more";
      if (v.sku && !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(v.sku.trim())) e.sku = "Use letters, numbers, - or _ only";
    }
    return e;
  };

  const goTo = (n) => {
    setStep(n);
    setFormError(null);
    topRef.current?.scrollIntoView({ block: "start" });
    window.scrollTo({ top: 0 });
  };
  const next = () => {
    const e = check(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    goTo(step + 1);
  };

  const publish = () => {
    // Check every step; jump to the first one with a problem.
    for (const s of [1, 2, 3]) {
      const e = check(s);
      if (Object.keys(e).length) {
        setErrors(e);
        return goTo(s);
      }
    }
    startSaving(async () => {
      const data = {
        ...v,
        color,
        images,
        specs: specs.map((g) => ({ name: g.name, rows: g.rows.map(({ type, value }) => ({ type, value })) })),
      };
      const res = editing ? await updateProductAction(productId, data) : await createProductAction(data);
      if (res.errors) {
        setErrors(res.errors);
        setFormError(res.errors.form ?? "Please fix the highlighted fields.");
        return goTo(res.step ?? 1);
      }
      setDirty(false);
      router.push(editing ? `/admin/products/${encodeURIComponent(res.id)}?notice=saved` : `/admin/products?added=${encodeURIComponent(res.id)}`);
    });
  };

  // ── Spec editing helpers
  const updateGroup = (gi, patch) => {
    setSpecs((g) => g.map((x, i) => (i === gi ? { ...x, ...patch } : x)));
    setDirty(true);
  };
  const updateRow = (gi, ri, patch) => {
    setSpecs((g) => g.map((x, i) => (i === gi ? { ...x, rows: x.rows.map((r, j) => (j === ri ? { ...r, ...patch } : r)) } : x)));
    setErrors((p) => ({ ...p, [`spec-${gi}-row-${ri}-type`]: undefined, [`spec-${gi}-row-${ri}-value`]: undefined }));
    setDirty(true);
  };

  const categoryOptions = tree.map((c) => ({ value: c.id, label: c.name }));
  const subOptions = (main?.children ?? []).map((s) => ({ value: s.id, label: s.name }));
  const subSubOptions = (sub?.children ?? []).map((s) => ({ value: s.id, label: s.name }));

  return (
    <div ref={topRef} className="flex flex-1 flex-col">
      {saving && <LoadingOverlay message={editing ? "Saving changes..." : "Saving product..."} />}

      {/* Breadcrumb + step buttons */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6 lg:px-9">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link href="/admin/products" className="font-medium text-neutral-700 hover:text-ink hover:underline">
            Product Management
          </Link>
          <svg viewBox="0 0 24 24" className="size-3.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m9 6 6 6-6 6" />
          </svg>
          {editing && (
            <>
              <Link href={`/admin/products/${productId}`} className="max-w-48 truncate font-medium text-neutral-700 hover:text-ink hover:underline" title={productName}>
                {productName || "Product Information"}
              </Link>
              <svg viewBox="0 0 24 24" className="size-3.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="m9 6 6 6-6 6" />
              </svg>
            </>
          )}
          <span aria-current="page" className="font-medium text-brand">
            {editing ? "Edit Product" : "Add New Product"}
          </span>
        </nav>
        <div className="flex flex-wrap justify-end gap-2">
          {step < 3 && (
            <button type="button" onClick={publish} disabled={saving} className={outline}>
              {editing ? "Save Changes" : "Save and Publish"}
            </button>
          )}
          {step > 1 && (
            <button type="button" onClick={() => goTo(step - 1)} className={outline}>
              Previous Step
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={next} className={primary}>
              Next Step
            </button>
          ) : (
            <button type="button" onClick={publish} disabled={saving} className={primary}>
              {editing ? "Save Changes" : "Save and Publish"}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-7 pb-16 sm:px-6 lg:px-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-black">{STEP_TITLES[step - 1]}</h2>
          {step === 2 && (
            <button type="button" onClick={() => (setSpecs((g) => [...g, emptyGroup()]), setDirty(true))} className={addBtn}>
              <Plus />
              Add new specification
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-neutral-500">Step {step} of 3</p>

        {formError && (
          <p role="alert" className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        {step === 1 && (
          <div className="mt-7 space-y-7">
            <Field id="p-name" label="Product Name*" error={errors.name}>
              <input id="p-name" value={v.name} onChange={set("name")} maxLength={120} placeholder="e.g. iPhone 16 Pro, MacBook Air 13″" className={`${inputCls(errors.name)} h-12`} />
            </Field>

            <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
              <Field id="p-brand" label="Brand" error={errors.brand}>
                <input id="p-brand" value={v.brand} onChange={set("brand")} maxLength={60} placeholder="Enter brand name" className={`${inputCls(errors.brand)} h-12`} />
              </Field>
              <Field id="p-color" label="Color" error={errors.color}>
                <button
                  id="p-color"
                  type="button"
                  onClick={() => setColorOpen(true)}
                  className={`${inputCls(errors.color)} flex h-12 items-center gap-3 text-left`}
                >
                  {color ? (
                    <>
                      <span className="size-5 shrink-0 rounded-full border border-neutral-300" style={{ background: color.hex }} aria-hidden />
                      <span className="truncate">{color.name}</span>
                      <span className="ml-auto text-xs text-neutral-400">{color.hex.toUpperCase()}</span>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-400">Tap to select a color</span>
                  )}
                </button>
              </Field>
            </div>

            <Field id="p-desc" label="Description" error={errors.description}>
              <textarea
                id="p-desc"
                value={v.description}
                onChange={set("description")}
                maxLength={2000}
                rows={4}
                placeholder="Give a short description of this product."
                className={`${inputCls(errors.description)} min-h-28 resize-y py-3 placeholder:text-center`}
              />
            </Field>

            <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
              <Field id="p-price" label="Price*" error={errors.price}>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-neutral-500">₦</span>
                  <input
                    id="p-price"
                    value={v.price}
                    onChange={(e) => set("price")({ target: { value: e.target.value.replace(/[^\d,]/g, "") } })}
                    onBlur={() => {
                      const n = Number(v.price.replace(/,/g, ""));
                      if (n > 0) setV((p) => ({ ...p, price: n.toLocaleString("en-NG") }));
                    }}
                    inputMode="numeric"
                    placeholder="How much does this product cost?"
                    className={`${inputCls(errors.price)} h-12 pl-8`}
                  />
                </div>
              </Field>
              <div>
                <p className="mb-3 text-sm font-medium text-black">Category*</p>
                <SelectField
                  name="p-category"
                  label="Category"
                  value={v.categoryId}
                  onChange={(e) => {
                    setV((p) => ({ ...p, categoryId: e.target.value, subcategoryId: "", subSubcategoryId: "" }));
                    setErrors((p) => ({ ...p, categoryId: undefined }));
                    setDirty(true);
                  }}
                  options={categoryOptions}
                  placeholder="What category does this product belong to?"
                  error={errors.categoryId}
                />
                <CreateCategoryButton tree={tree} className="mt-2 text-xs font-medium text-brand hover:underline">
                  Can&apos;t find it? Create a new category
                </CreateCategoryButton>
              </div>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
              <div>
                <p className="mb-3 text-sm font-medium text-black">Sub-category</p>
                <SelectField
                  name="p-subcategory"
                  label="Sub-category"
                  value={v.subcategoryId}
                  onChange={(e) => {
                    setV((p) => ({ ...p, subcategoryId: e.target.value, subSubcategoryId: "" }));
                    setDirty(true);
                  }}
                  options={subOptions}
                  placeholder={!main ? "Choose a category first" : subOptions.length ? "What Sub-category does this product belong to?" : "No sub-categories in this category yet"}
                  error={errors.subcategoryId}
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-black">Sub-subcategory</p>
                <SelectField
                  name="p-subsubcategory"
                  label="Sub-subcategory"
                  value={v.subSubcategoryId}
                  onChange={(e) => {
                    setV((p) => ({ ...p, subSubcategoryId: e.target.value }));
                    setDirty(true);
                  }}
                  options={subSubOptions}
                  placeholder={!sub ? "Choose a sub-category first" : subSubOptions.length ? "What Sub-subcategory does this product belong to?" : "None in this sub-category yet"}
                  error={errors.subSubcategoryId}
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-black">Upload Images*</p>
              <ImageUploader
                images={images}
                setImages={setImages}
                error={imageError ?? errors.images}
                setError={(e) => {
                  setImageError(e);
                  setErrors((p) => ({ ...p, images: undefined }));
                }}
              />
              <p className="mt-2 text-xs text-neutral-500">The first photo is the main one shown in the shop. Up to {MAX_IMAGES} photos.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-7 space-y-10">
            <p className="text-xs text-neutral-500">
              Optional. Each specification is a heading on the product page (e.g. <b>Display</b>) with its details underneath (e.g. <b>Size</b> → <b>6.1″</b>).
            </p>
            {specs.map((g, gi) => (
              <fieldset key={g.key} className={`space-y-7 ${gi > 0 ? "border-t border-neutral-200 pt-10" : ""}`}>
                <legend className="sr-only">Specification {gi + 1}</legend>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label htmlFor={`spec-${gi}-name`} className="text-sm font-medium text-black">
                      Specification *
                    </label>
                    {specs.length > 1 && (
                      <button type="button" onClick={() => (setSpecs((l) => l.filter((_, i) => i !== gi)), setDirty(true))} className="text-xs text-red-600 hover:underline">
                        Remove specification
                      </button>
                    )}
                  </div>
                  <input
                    id={`spec-${gi}-name`}
                    value={g.name}
                    onChange={(e) => {
                      updateGroup(gi, { name: e.target.value });
                      setErrors((p) => ({ ...p, [`spec-${gi}-name`]: undefined }));
                    }}
                    maxLength={60}
                    placeholder="What is this attribute or feature called? (e.g. Display)"
                    className={`${inputCls(errors[`spec-${gi}-name`])} h-12`}
                  />
                  <Err>{errors[`spec-${gi}-name`]}</Err>
                </div>
                {g.rows.map((r, ri) => (
                  <div key={r.key} className={`space-y-7 ${ri > 0 ? "rounded-md bg-neutral-50 p-4" : ""}`}>
                    {ri > 0 && (
                      <div className="-mb-3 flex justify-end">
                        <button type="button" onClick={() => updateGroup(gi, { rows: g.rows.filter((_, j) => j !== ri) })} className="text-xs text-red-600 hover:underline">
                          Remove
                        </button>
                      </div>
                    )}
                    <Field id={`spec-${gi}-row-${ri}-type`} label="Specification Type *" error={errors[`spec-${gi}-row-${ri}-type`]}>
                      <input
                        id={`spec-${gi}-row-${ri}-type`}
                        value={r.type}
                        onChange={(e) => updateRow(gi, ri, { type: e.target.value })}
                        maxLength={60}
                        placeholder="What name is specification type? (e.g. Size)"
                        className={`${inputCls(errors[`spec-${gi}-row-${ri}-type`])} h-12`}
                      />
                    </Field>
                    <Field id={`spec-${gi}-row-${ri}-value`} label="Specification Value *" error={errors[`spec-${gi}-row-${ri}-value`]}>
                      <textarea
                        id={`spec-${gi}-row-${ri}-value`}
                        value={r.value}
                        onChange={(e) => updateRow(gi, ri, { value: e.target.value })}
                        maxLength={1000}
                        rows={Math.min(6, Math.max(1, r.value.split("\n").length))}
                        placeholder="What are the possible values for this attribute or feature? (e.g. 6.1″ OLED)"
                        className={`${inputCls(errors[`spec-${gi}-row-${ri}-value`])} min-h-12 resize-y py-3 leading-snug`}
                      />
                    </Field>
                  </div>
                ))}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => updateGroup(gi, { rows: [...g.rows, { key: Math.random().toString(36).slice(2), type: "", value: "" }] })}
                    className={addBtn}
                  >
                    <Plus />
                    Add new specification type &amp; value
                  </button>
                </div>
              </fieldset>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="mt-7 space-y-7">
            <Field id="p-stock" label="Stock Quantity*" error={errors.stock}>
              <input
                id="p-stock"
                value={v.stock}
                onChange={(e) => set("stock")({ target: { value: e.target.value.replace(/\D/g, "") } })}
                inputMode="numeric"
                maxLength={6}
                placeholder="How many of this product do you have?"
                className={`${inputCls(errors.stock)} h-12`}
              />
            </Field>
            <Field id="p-sku" label="SKU (Optional)" error={errors.sku} hint="Leave empty and one is made for you (e.g. IP16P-003).">
              <input id="p-sku" value={v.sku} onChange={set("sku")} maxLength={30} placeholder="Enter the product code (if any)" className={`${inputCls(errors.sku)} h-12 uppercase placeholder:normal-case`} />
            </Field>
            <div>
              <p className="mb-3 text-sm font-medium text-black">Visibility*</p>
              <SelectField
                name="p-visibility"
                label="Visibility"
                value={v.visibility}
                onChange={set("visibility")}
                options={[
                  { value: "active", label: "Visible", description: "Shows in the shop straight away" },
                  { value: "draft", label: "Hidden", description: "Saved as a draft; publish it later" },
                ]}
                placeholder="Visible / Hidden"
                error={errors.visibility}
              />
            </div>
            <Field id="p-warranty" label="Warranty" error={errors.warranty}>
              <input id="p-warranty" value={v.warranty} onChange={set("warranty")} maxLength={80} placeholder="Enter warranty info (e.g., 1 year)." className={`${inputCls(errors.warranty)} h-12`} />
            </Field>
            <Field id="p-size" label="Size/Weight" error={errors.sizeWeight}>
              <input id="p-size" value={v.sizeWeight} onChange={set("sizeWeight")} maxLength={120} placeholder="What are the dimensions of this product?" className={`${inputCls(errors.sizeWeight)} h-12`} />
            </Field>
          </div>
        )}
      </div>

      {colorOpen && (
        <ColorPickerModal
          value={color}
          presets={presets}
          onClose={() => setColorOpen(false)}
          onSave={(c) => {
            setColor(c);
            setColorOpen(false);
            setErrors((p) => ({ ...p, color: undefined }));
            setDirty(true);
          }}
        />
      )}
    </div>
  );
}
