// Shipping options on the checkout page and the delivery fee on the cart page (₦).
// Set these to your real fees, or replace with a calculation (e.g. by state) later.
export const DELIVERY_FEE = 1530;

export const shippingMethods = {
  pickup: { label: "Pick up", fee: 0, note: "Collect from our Ikeja store" },
  delivery: { label: "Home delivery", fee: DELIVERY_FEE, note: "Delivered to your address" },
};

export const countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States"];
