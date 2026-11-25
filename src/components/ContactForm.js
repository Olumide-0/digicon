"use client";

import { useActionState, useState } from "react";
import { sendContactMessage } from "@/lib/contact/actions";
import { LIMITS, validateContact } from "@/lib/contact/validate";
import AuthField from "./auth/AuthField";

const ORDER = ["name", "email", "message"];

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, undefined);
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({});

  // Checked live. A field's error appears once the person has left it (or tried to submit),
  // then updates as they type, so it disappears the moment it's fixed.
  const clientErrors = validateContact(values);
  const serverErrors = state?.errors ?? {};
  const shown = (f) => (touched[f] ? clientErrors[f] : serverErrors[f]);

  const onChange = (f) => (e) => setValues((v) => ({ ...v, [f]: e.target.value }));
  const onBlur = (f) => () => setTouched((t) => ({ ...t, [f]: true }));

  const onSubmit = (e) => {
    const bad = ORDER.filter((f) => clientErrors[f]);
    if (bad.length === 0) return; // valid: let the form submit
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    document.getElementById(`field-${bad[0]}`)?.focus();
  };

  if (state?.sent) {
    return (
      <div role="status" className="flex h-full flex-col items-center justify-center rounded-md bg-white px-6 py-16 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-brand text-xl text-white" aria-hidden>
          ✓
        </div>
        <p className="mt-4 text-base font-semibold text-ink">Thank you, we&apos;ve got your message</p>
        <p className="mt-2 max-w-xs text-sm text-neutral-600">Our team will reply to your email as soon as possible.</p>
      </div>
    );
  }

  const messageError = shown("message");
  const length = values.message.length;

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-3">
      <AuthField
        name="name"
        label="Name"
        autoComplete="name"
        maxLength={LIMITS.nameMax}
        defaultValue={state?.values?.name}
        onChange={onChange("name")}
        onBlur={onBlur("name")}
        error={shown("name")}
      />
      <AuthField
        name="email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        maxLength={LIMITS.emailMax}
        defaultValue={state?.values?.email}
        onChange={onChange("email")}
        onBlur={onBlur("email")}
        error={shown("email")}
      />

      <div>
        <label htmlFor="field-message" className="sr-only">
          Message
        </label>
        <textarea
          id="field-message"
          name="message"
          placeholder="Message"
          rows={5}
          maxLength={LIMITS.messageMax}
          defaultValue={state?.values?.message}
          onChange={onChange("message")}
          onBlur={onBlur("message")}
          aria-invalid={Boolean(messageError)}
          aria-describedby={messageError ? "field-message-error" : undefined}
          className={`h-40 w-full resize-y rounded-md border bg-white px-4 py-3 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:ring-2 ${
            messageError ? "border-red-600 focus:ring-red-200" : "border-neutral-300 focus:border-brand focus:ring-brand/20"
          }`}
        />
        <div className="mt-2 flex items-start justify-between gap-4 text-[11px]">
          <p id="field-message-error" className="flex items-center gap-1.5 text-red-600" role={messageError ? "alert" : undefined}>
            {messageError && (
              <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
            )}
            {messageError}
          </p>
          <p className={`ml-auto shrink-0 ${length >= LIMITS.messageMax ? "text-red-600" : "text-neutral-400"}`} aria-live="off">
            {length.toLocaleString("en-NG")} / {LIMITS.messageMax.toLocaleString("en-NG")}
          </p>
        </div>
      </div>

      {/* Spam trap: hidden from people, filled in by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={pending}
          className="h-10 w-full max-w-64 rounded-md bg-brand text-xs font-medium text-white transition hover:bg-brand-hover disabled:opacity-70"
        >
          {pending ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
