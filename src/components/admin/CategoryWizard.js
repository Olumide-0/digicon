"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SelectField from "@/components/ui/SelectField";
import { slugify } from "@/data/categories";
import { createMainCategoryAction, createSubcategoriesAction, createSubSubcategoriesAction } from "@/lib/catalog/categoryActions";

const STEPS = [
  { tab: "Add Main - Category", title: "Adding Main-category" },
  { tab: "Add Sub-category", title: "Adding Sub-category" },
  { tab: "Add Sub-subcategory", title: "Adding Sub-subcategory" },
];
const input =
  "h-12 w-full rounded-md border border-neutral-200 bg-white px-4 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
const outline = "h-10 rounded-md border border-neutral-300 px-4 text-[13px] text-neutral-600 transition hover:border-ink hover:text-ink disabled:opacity-50";
const primary = "h-10 rounded-md bg-brand px-4 text-[13px] font-medium text-white transition hover:bg-brand-hover disabled:opacity-60";

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-3 block text-sm font-medium text-black">
      {children}
    </label>
  );
}

// Text box with a green "Add to list" button inside, plus removable chips underneath.
function ListInput({ id, value, onChange, list, setList, placeholder, onError }) {
  const add = () => {
    const name = value.replace(/\s+/g, " ").trim();
    if (!name) return;
    if (list.some((x) => slugify(x) === slugify(name))) return onError(`“${name}” is already in the list.`);
    setList([...list, name]);
    onChange("");
    onError(null);
  };
  return (
    <>
      <div className="flex h-12 items-center gap-2 rounded-md border border-neutral-200 bg-white pr-2 pl-4 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          maxLength={60}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-neutral-400 outline-none"
        />
        <button type="button" onClick={add} className="h-8 shrink-0 rounded-md bg-green-600 px-3 text-xs font-medium text-white transition hover:bg-green-700">
          Add to list
        </button>
      </div>
      {list.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Added">
          {list.map((name) => (
            <li key={name} className="flex items-center gap-2 rounded bg-neutral-400 py-1.5 pr-2 pl-3 text-xs text-white">
              {name}
              <button type="button" onClick={() => setList(list.filter((x) => x !== name))} aria-label={`Remove ${name}`} className="grid size-4 place-items-center rounded-sm hover:bg-white/20">
                <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// "Create New Category": 1) main category, 2) subcategories, 3) sub-subcategories.
// Each step saves straight away; "…and Proceed" carries the new category into the next step.
// tree: from getCategoryTree(). onClose(message?) — message is shown as a toast.
export default function CategoryWizard({ tree: initialTree, onClose, initialStep = 1 }) {
  const [tree, setTree] = useState(initialTree);
  const [step, setStep] = useState(initialStep);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const firstField = useRef(null);

  const [mainName, setMainName] = useState("");
  const [parentId, setParentId] = useState("");
  const [subInput, setSubInput] = useState("");
  const [subList, setSubList] = useState([]);
  const [subId, setSubId] = useState("");
  const [ssInput, setSsInput] = useState("");
  const [ssList, setSsList] = useState([]);

  const parent = tree.find((c) => c.id === parentId);
  const sub = parent?.children.find((s) => s.id === subId);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  useEffect(() => {
    firstField.current?.focus();
  }, [step]);

  const goTo = (n) => {
    setStep(n);
    setError(null);
  };

  const run = (action, after) =>
    startTransition(async () => {
      const res = await action();
      if (res.error) return setError(res.error);
      setError(null);
      setTree(res.tree);
      after(res);
    });

  // Names to save: the list, or what's typed if nothing was added to the list yet.
  const pendingNames = (list, typed) => (list.length ? list : typed.trim() ? [typed] : []);

  const saveMain = (proceed) =>
    run(
      () => createMainCategoryAction(mainName),
      (res) => {
        if (!proceed) return onClose(`“${mainName.trim()}” category created.`);
        setParentId(res.id);
        setMainName("");
        goTo(2);
      }
    );

  const saveSubs = (proceed) => {
    if (!parentId) return setError("Choose a parent category.");
    const names = pendingNames(subList, subInput);
    if (!names.length) return setError("Add at least one subcategory.");
    run(
      () => createSubcategoriesAction(parentId, names),
      (res) => {
        if (!proceed) return onClose(`${names.length} ${names.length === 1 ? "subcategory" : "subcategories"} added to ${parent.name}.`);
        setSubId(res.ids[0]);
        setSubList([]);
        setSubInput("");
        goTo(3);
      }
    );
  };

  const saveSubSubs = () => {
    if (!parentId) return setError("Choose a parent category.");
    if (!subId) return setError("Choose a subcategory.");
    const names = pendingNames(ssList, ssInput);
    if (!names.length) return setError("Add at least one sub-subcategory.");
    run(
      () => createSubSubcategoriesAction(parentId, subId, names),
      () => onClose(`${names.length} ${names.length === 1 ? "sub-subcategory" : "sub-subcategories"} added to ${sub.name}.`)
    );
  };

  const parentOptions = tree.map((c) => ({ value: c.id, label: c.name }));
  const subOptions = (parent?.children ?? []).map((s) => ({ value: s.id, label: s.name }));
  const slugPreview = parent ? `/categories/${parent.slug}/${slugify(subInput || subList.at(-1) || "") || "…"}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/55 backdrop-blur-[2px] sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
        className="flex h-full w-full flex-col overflow-y-auto bg-white px-5 pt-8 pb-6 text-left text-ink sm:h-auto sm:max-h-full sm:min-h-[36rem] sm:max-w-[47.5rem] sm:rounded-sm sm:px-8 sm:pt-10 sm:pb-8"
      >
        <div className="flex items-start justify-between gap-6">
          <h2 id="wizard-title" className="text-lg font-semibold text-black">
            Create New Category
          </h2>
          <button type="button" onClick={() => onClose()} aria-label="Close" className="-mt-1 p-1 text-black transition hover:text-brand">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          </button>
        </div>

        <p className="mt-7 text-sm font-semibold text-neutral-700">
          Step {step} :<span className="ml-2 text-xs">{STEPS[step - 1].title}</span>
        </p>
        <div role="tablist" aria-label="Steps" className="mt-4 flex w-fit max-w-full flex-wrap gap-1 rounded-lg border border-neutral-300 p-1">
          {STEPS.map((s, i) => (
            <button
              key={s.tab}
              type="button"
              role="tab"
              aria-selected={step === i + 1}
              onClick={() => goTo(i + 1)}
              className={`h-7 rounded-md px-3 text-[11px] transition sm:px-4 ${step === i + 1 ? "bg-black text-white" : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"}`}
            >
              {s.tab}
            </button>
          ))}
        </div>

        <div className="mt-8 flex-1 space-y-7">
          {step === 1 && (
            <div>
              <Label htmlFor="cat-main">Category Name*</Label>
              <input
                ref={firstField}
                id="cat-main"
                value={mainName}
                onChange={(e) => setMainName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), saveMain(true))}
                maxLength={60}
                placeholder="e.g. Phones and Gadgets"
                className={input}
              />
            </div>
          )}

          {step >= 2 && (
            <div>
              <p className="mb-3 text-sm font-medium text-black">Parent Category*</p>
              <SelectField
                name="parent"
                label="Parent Category"
                value={parentId}
                onChange={(e) => {
                  setParentId(e.target.value);
                  setSubId("");
                  setError(null);
                }}
                options={parentOptions}
                placeholder="e.g Phones and Gadgets"
              />
            </div>
          )}

          {step === 2 && (
            <>
              <div>
                <Label htmlFor="cat-sub">Subcategory Name</Label>
                <ListInput id="cat-sub" value={subInput} onChange={setSubInput} list={subList} setList={setSubList} placeholder="e.g. Mobile phone — add one or more" onError={setError} />
              </div>
              <div>
                <Label htmlFor="cat-slug">URL Slug (Auto-Generated)</Label>
                <input id="cat-slug" readOnly value={slugPreview} placeholder="/categories/electronics/mobile-phones" className={`${input} bg-neutral-50 text-neutral-500`} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <p className="mb-3 text-sm font-medium text-black">Subcategory Name</p>
                <SelectField
                  name="sub"
                  label="Subcategory"
                  value={subId}
                  onChange={(e) => {
                    setSubId(e.target.value);
                    setError(null);
                  }}
                  options={subOptions}
                  placeholder={parent ? (subOptions.length ? "Select what sub-category to link sub-subcategory" : "This category has no subcategories yet") : "Choose a parent category first"}
                />
              </div>
              <div>
                <Label htmlFor="cat-subsub">Sub-subcategory Name</Label>
                <ListInput id="cat-subsub" value={ssInput} onChange={setSsInput} list={ssList} setList={setSsList} placeholder="e.g. Smart phones — add one or more" onError={setError} />
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          {step > 1 ? (
            <button type="button" onClick={() => goTo(step - 1)} className={`${outline} w-18`}>
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap justify-end gap-3">
            {step === 1 && (
              <>
                <button type="button" disabled={pending} onClick={() => saveMain(false)} className={outline}>
                  Save Category Only
                </button>
                <button type="button" disabled={pending} onClick={() => saveMain(true)} className={primary}>
                  {pending ? "Saving…" : "Save and Proceed to Next Step"}
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <button type="button" disabled={pending} onClick={() => saveSubs(false)} className={outline}>
                  Save Sub-Category Only
                </button>
                <button type="button" disabled={pending} onClick={() => saveSubs(true)} className={primary}>
                  {pending ? "Saving…" : "Save and Proceed to Next Step"}
                </button>
              </>
            )}
            {step === 3 && (
              <button type="button" disabled={pending} onClick={saveSubSubs} className={primary}>
                {pending ? "Saving…" : "Save New Category Information"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Button that opens the wizard in place, then shows a toast and refreshes the page.
export function CreateCategoryButton({ tree, className, children }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <CategoryWizard
          tree={tree}
          onClose={(message) => {
            setOpen(false);
            if (message) setToast(message);
            router.refresh();
          }}
        />
      )}
      {toast && (
        <p role="status" className="fixed right-4 bottom-4 z-50 max-w-xs rounded-lg bg-ink px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </p>
      )}
    </>
  );
}
