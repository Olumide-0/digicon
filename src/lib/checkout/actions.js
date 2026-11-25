"use server";

import { redirect } from "next/navigation";
import { getSession } from "../auth/session";
import { findUserById } from "../auth/users";
import { validateDelivery } from "./validate";
import { computeTotals, resolveLines } from "./pricing";
import { saveOrder } from "./orders";

const field = (formData, name) => String(formData.get(name) ?? "");

// "Pay Now": re-checks everything on the server, prices the cart from the catalogue,
// saves the order as "awaiting payment" and sends the customer to its confirmation page.
export async function placeOrder(_prev, formData) {
  const session = await getSession();
  const user = session && (await findUserById(session.userId));
  if (!user) redirect("/signin?next=/checkout");

  const values = Object.fromEntries(
    ["country", "firstName", "lastName", "phone", "company", "address", "city", "state", "shipping"].map((k) => [k, field(formData, k).trim()])
  );
  const errors = validateDelivery(values);
  if (Object.keys(errors).length) return { errors, values };

  let items = [];
  try {
    items = JSON.parse(field(formData, "items"));
  } catch {
    /* treated as an empty cart below */
  }
  if (!Array.isArray(items) || items.length > 30) items = [];
  const lines = resolveLines(items);
  if (lines.length === 0) return { errors: { form: "Your cart is empty. Add something before paying." }, values };
  const soldOut = lines.find((l) => l.soldOut);
  if (soldOut) return { errors: { form: `${soldOut.name} is out of stock. Please remove it from your cart.` }, values };

  const totals = computeTotals(lines, values.shipping, field(formData, "discountCode"));

  const order = await saveOrder({
    userId: user.id,
    email: user.email,
    status: "awaiting_payment",
    items: lines.map(({ id, name, spec, color, unitPrice, qty, lineTotal }) => ({ id, name, spec, color, unitPrice, qty, lineTotal })),
    delivery: values,
    subtotal: totals.subtotal,
    discountCode: totals.discount?.code ?? null,
    discountAmount: totals.discountAmount,
    deliveryFee: totals.delivery,
    total: totals.total,
  });

  redirect(`/order/${order.id}`);
}
