"use client";

import Link from "next/link";
import { useActionState, useState, useSyncExternalStore } from "react";
import { useCart } from "../cart/CartProvider";
import AuthField from "../auth/AuthField";
import SelectField from "../ui/SelectField";
import ProductImage from "../ui/ProductImage";
import LoadingOverlay from "../ui/LoadingOverlay";
import { placeOrder } from "@/lib/checkout/actions";
import { validateDelivery } from "@/lib/checkout/validate";
import { computeTotals, resolveLines } from "@/lib/checkout/pricing";
import { countries, shippingMethods } from "@/data/shipping";
import { findDiscount } from "@/data/discounts";
import { formatNaira } from "@/data/products";

const SAVED_KEY = "digicon-delivery"; // last delivery details, for "Auto fill"
const ORDER = ["country", "firstName", "lastName", "phone", "company", "address", "city", "state", "shipping"];
const EMPTY = { country: "", firstName: "", lastName: "", phone: "", company: "", address: "", city: "", state: "", shipping: "pickup" };

const noopSubscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "null");
  } catch {
    return null;
  }
}

export default function CheckoutView({ account }) {
  const { items } = useCart();
  const isClient = useIsClient();
  const [state, action, pending] = useActionState(placeOrder, undefined);

  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [autofillNote, setAutofillNote] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [discount, setDiscount] = useState(null);
  const [codeError, setCodeError] = useState("");

  const lines = resolveLines(items);
  const totals = computeTotals(lines, values.shipping, discount?.code);

  const clientErrors = validateDelivery(values);
  const serverErrors = state?.errors ?? {};
  const shown = (f) => (touched[f] ? clientErrors[f] : serverErrors[f]);

  const set = (f) => (e) => setValues((v) => ({ ...v, [f]: e.target.value }));
  const blur = (f) => () => setTouched((t) => ({ ...t, [f]: true }));

  const autofill = () => {
    const a = account.address;
    const fromAccount = {
      firstName: account.firstName,
      lastName: account.lastName,
      phone: account.phone,
      ...(a ? { country: a.country, address: a.line1, state: a.state, ...(a.city ? { city: a.city } : {}) } : {}),
    };
    const saved = a ? null : readSaved(); // the account address wins over the last order's
    setValues((v) => ({ ...v, ...fromAccount, ...(saved ?? {}) }));
    setTouched((t) => ({ ...t, firstName: true, lastName: true, phone: true, ...(a || saved ? Object.fromEntries(ORDER.map((f) => [f, true])) : {}) }));
    setAutofillNote(
      a
        ? "Filled in with the details saved on your account."
        : saved
          ? "Filled in with the details from your last order."
          : "Filled in your name and phone from your account. Add an address on your Account page to fill it in too."
    );
  };


  const applyCode = () => {
    const d = findDiscount(codeInput);
    if (!codeInput.trim()) {
      return; // the code is optional: nothing to apply
    } else if (!d) {
      setCodeError("That code isn't valid");
    } else {
      setDiscount(d);
      setCodeError("");
      setCodeInput("");
    }
  };

  const onSubmit = (e) => {
    const bad = ORDER.filter((f) => clientErrors[f]);
    if (bad.length) {
      e.preventDefault();
      setTouched(Object.fromEntries(ORDER.map((f) => [f, true])));
      document.getElementById(`field-${bad[0]}`)?.focus();
      return;
    }
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(values)); // for next time's "Auto fill"
    } catch {
      /* storage unavailable */
    }
  };

  if (!isClient) return <div className="mt-10 min-h-96" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto mt-20 max-w-md pb-24 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <p className="mt-2 text-sm text-neutral-600">Add something to your cart before checking out.</p>
        <Link href="/categories/phones-and-tablets" className="mt-6 inline-block rounded-md bg-brand px-4 py-2.5 text-xs font-medium text-white hover:bg-brand-hover">
          Start Shopping
        </Link>
      </div>
    );
  }

  const field = (name, label, extra = {}) => (
    <AuthField name={name} label={label} value={values[name]} onChange={set(name)} onBlur={blur(name)} error={shown(name)} {...extra} />
  );

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 pb-16 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
      {pending && <LoadingOverlay message={"Your order’s being processed."} />}

      {/* Delivery form */}
      <form action={action} onSubmit={onSubmit} noValidate aria-busy={pending} className="rounded-xl bg-[#f4f4f6] px-5 py-8 sm:px-7 sm:py-8">
        <input type="hidden" name="items" value={JSON.stringify(items)} />
        <input type="hidden" name="discountCode" value={discount?.code ?? ""} />

        <h2 className="text-sm font-semibold text-neutral-600">Delivery Information</h2>
        <div className="mt-4 space-y-3">
          <SelectField
            name="country"
            label="Country / Region"
            placeholder="Country / Region"
            value={values.country}
            onChange={set("country")}
            onBlur={blur("country")}
            error={shown("country")}
            options={countries.map((c) => ({ value: c, label: c }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {field("firstName", "First Name", { autoComplete: "given-name", maxLength: 60 })}
            {field("lastName", "Last Name", { autoComplete: "family-name", maxLength: 60 })}
          </div>
          {field("phone", "Phone Number", { type: "tel", inputMode: "tel", autoComplete: "tel", maxLength: 20 })}
          {field("company", "Company (Optional)", { autoComplete: "organization", maxLength: 100 })}
          {field("address", "Address", { autoComplete: "street-address", maxLength: 200 })}
          <div className="grid gap-3 sm:grid-cols-2">
            {field("city", "City", { autoComplete: "address-level2", maxLength: 80 })}
            {field("state", "State", { autoComplete: "address-level1", maxLength: 80 })}
          </div>
        </div>

        <button type="button" onClick={autofill} className="mt-4 text-[11px] text-brand hover:underline">
          Auto fill with my existing shipping information
        </button>
        <p aria-live="polite" className="mt-1 min-h-4 text-[11px] text-neutral-500">
          {autofillNote}
        </p>

        <h2 className="mt-6 text-sm font-semibold text-neutral-600">Shipping Method</h2>
        <div className="mt-4">
          <SelectField
            name="shipping"
            label="Shipping Method"
            value={values.shipping}
            onChange={set("shipping")}
            onBlur={blur("shipping")}
            error={shown("shipping")}
            options={Object.entries(shippingMethods).map(([k, m]) => ({
              value: k,
              label: m.label,
              meta: m.fee ? formatNaira(m.fee) : "Free",
              description: m.note,
            }))}
          />
          <p className="mt-2 text-[11px] text-neutral-500">{shippingMethods[values.shipping]?.note}</p>
        </div>

        {serverErrors.form && (
          <p role="alert" className="mt-6 rounded-md bg-red-50 px-4 py-3 text-xs text-red-700">
            {serverErrors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-8 h-10 w-full rounded-md bg-brand text-xs font-semibold text-white transition hover:bg-brand-hover disabled:opacity-70"
        >
          {pending ? "Placing your order…" : `Pay Now · ${formatNaira(totals.total)}`}
        </button>
      </form>

      {/* Order summary */}
      <aside aria-label="Order summary" className="order-first h-fit rounded-xl bg-[#f4f4f6] px-5 py-8 lg:order-none">
        <ul className="space-y-5">
          {lines.map((l) => (
            <li key={`${l.id}-${l.color}`} className="flex items-center gap-3">
              <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded">
                <ProductImage src={l.image} name={l.name} alt={`${l.name} in ${l.color}`} sizes="40px" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">{l.name}</span>
                <span className="mt-1 block truncate text-[11px] text-neutral-500">
                  {l.color}
                  {l.qty > 1 && ` · Qty ${l.qty}`}
                </span>
              </span>
              <span className="shrink-0 text-xs">{formatNaira(l.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          {discount ? (
            <p className="flex items-center justify-between rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
              <span>
                <span className="font-semibold">{discount.code}</span> applied ({discount.label})
              </span>
              <button type="button" onClick={() => setDiscount(null)} className="text-emerald-900 underline">
                Remove
              </button>
            </p>
          ) : (
            <>
              <AuthField
                name="discount"
                label="Discount code (Optional)"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  setCodeError("");
                }}
                error={codeError}
                autoComplete="off"
                maxLength={30}
              />
              <button
                type="button"
                onClick={applyCode}
                disabled={!codeInput.trim()}
                className="mt-3 h-10 w-full rounded-md bg-brand text-xs font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand"
              >
                Apply Discount
              </button>
            </>
          )}
        </div>

        <dl className="mt-8 space-y-3 border-t border-neutral-300 pt-6 text-xs">
          <div className="flex justify-between">
            <dt className="text-neutral-600">Subtotal</dt>
            <dd>{formatNaira(totals.subtotal)}</dd>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Discount</dt>
              <dd>−{formatNaira(totals.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-neutral-600">{shippingMethods[values.shipping]?.label}</dt>
            <dd>{totals.delivery ? formatNaira(totals.delivery) : "Free"}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-300 pt-3 text-sm font-semibold">
            <dt>Total</dt>
            <dd>{formatNaira(totals.total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
