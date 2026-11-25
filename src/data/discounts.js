// ⚠️ SAMPLE discount codes for testing — replace with your real promotions (or load them from
// your database) before launch. percent = % off the items subtotal (delivery isn't discounted).
export const discountCodes = {
  DIGICON10: { percent: 10, label: "10% off" },
  WELCOME5: { percent: 5, label: "5% off" },
};

// Returns { code, percent, label } for a valid code (case-insensitive), or null.
export function findDiscount(input) {
  const code = String(input ?? "").trim().toUpperCase();
  const d = discountCodes[code];
  return d ? { code, ...d } : null;
}
