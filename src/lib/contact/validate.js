// Contact form rules, shared by the browser (instant feedback) and the server (the real check).
export const LIMITS = { nameMin: 2, nameMax: 80, emailMax: 254, messageMin: 10, messageMax: 3000 };

// name@domain.tld — no spaces, no empty domain parts, TLD of at least 2 characters.
const EMAIL_RE = /^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/;

// Returns { name?, email?, message? } with a message for every field that is wrong.
export function validateContact({ name = "", email = "", message = "" }) {
  const errors = {};
  const n = name.trim();
  const e = email.trim();
  const m = message.trim();

  if (!n) errors.name = "Enter your name";
  else if ((n.match(/\p{L}/gu) ?? []).length < LIMITS.nameMin) errors.name = "Enter your real name (at least 2 letters)";
  else if (n.length > LIMITS.nameMax) errors.name = `Name is too long (${LIMITS.nameMax} characters maximum)`;

  if (!e) errors.email = "Enter your email address";
  else if (e.length > LIMITS.emailMax || !EMAIL_RE.test(e)) errors.email = "Enter a valid email address, like name@example.com";

  if (!m) errors.message = "Write your message";
  else if (m.length < LIMITS.messageMin) errors.message = `Please write a little more (${m.length} of ${LIMITS.messageMin} characters minimum)`;
  else if (m.length > LIMITS.messageMax) errors.message = `Message is too long (${LIMITS.messageMax.toLocaleString("en-NG")} characters maximum)`;

  return errors;
}
