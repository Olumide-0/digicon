// Cart -> priced lines and totals. Used by the checkout page to DISPLAY the order and by the
// server to CALCULATE it for real: prices always come from the catalogue, never from the browser.
import { products } from "@/data/products";
import { productDetails } from "@/data/productDetails";
import { shippingMethods } from "@/data/shipping";
import { findDiscount } from "@/data/discounts";

export const MAX_QTY = 10;

// items: [{ id, color, qty }]. Unknown products are dropped; quantities are clamped to 1..MAX_QTY
// (and to the units in stock when the product has a stock number).
export function resolveLines(items) {
  const lines = [];
  for (const it of Array.isArray(items) ? items : []) {
    const product = products.find((p) => p.id === it?.id);
    if (!product) continue;
    const limit = typeof product.stock === "number" ? Math.max(0, Math.min(MAX_QTY, product.stock)) : MAX_QTY;
    const qty = Math.max(1, Math.min(limit || 1, Math.floor(Number(it.qty)) || 1));
    const variant = productDetails[product.id]?.variants?.find((v) => v.color === it.color);
    lines.push({
      id: product.id,
      name: product.name,
      spec: product.spec,
      color: variant?.color ?? it.color ?? product.color,
      image: variant?.images?.[0] ?? product.image,
      unitPrice: product.price,
      qty,
      lineTotal: product.price * qty,
      soldOut: product.stock === 0,
    });
  }
  return lines;
}

export function computeTotals(lines, shippingKey, discountCode) {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const discount = findDiscount(discountCode);
  const discountAmount = discount ? Math.round((subtotal * discount.percent) / 100) : 0;
  const delivery = shippingMethods[shippingKey]?.fee ?? 0;
  return { subtotal, discount, discountAmount, delivery, total: subtotal - discountAmount + delivery };
}
