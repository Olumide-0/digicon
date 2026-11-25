// Delivery form rules, shared by the browser (instant feedback) and the server (the real check).
import { countries, shippingMethods } from "@/data/shipping";

const letters = (s) => (s.match(/\p{L}/gu) ?? []).length;

// Returns { field: message } for every field that is wrong (empty object = valid).
export function validateDelivery(v) {
  const e = {};
  const s = (k) => String(v[k] ?? "").trim();

  if (!countries.includes(s("country"))) e.country = "Choose your country or region";

  if (!s("firstName")) e.firstName = "Enter your first name";
  else if (letters(s("firstName")) < 2) e.firstName = "Enter your real first name";
  else if (s("firstName").length > 60) e.firstName = "First name is too long";

  if (!s("lastName")) e.lastName = "Enter your last name";
  else if (letters(s("lastName")) < 2) e.lastName = "Enter your real last name";
  else if (s("lastName").length > 60) e.lastName = "Last name is too long";

  const digits = s("phone").replace(/\D/g, "");
  if (!s("phone")) e.phone = "Enter your phone number";
  else if (!/^\+?[0-9\s-]+$/.test(s("phone")) || digits.length < 10 || digits.length > 15)
    e.phone = "Enter a valid phone number, like 0815 445 2310";

  if (s("company").length > 100) e.company = "Company name is too long";

  if (!s("address")) e.address = "Enter your address";
  else if (s("address").length < 5) e.address = "Enter your full street address";
  else if (s("address").length > 200) e.address = "Address is too long";

  if (!s("city")) e.city = "Enter your city";
  else if (letters(s("city")) < 2) e.city = "Enter a valid city";
  else if (s("city").length > 80) e.city = "City name is too long";

  if (!s("state")) e.state = "Enter your state";
  else if (letters(s("state")) < 2) e.state = "Enter a valid state";
  else if (s("state").length > 80) e.state = "State name is too long";

  if (!shippingMethods[s("shipping")]) e.shipping = "Choose a shipping method";
  return e;
}

export const DELIVERY_FIELDS = ["country", "firstName", "lastName", "phone", "company", "address", "city", "state"];
