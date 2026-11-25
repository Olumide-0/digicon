"use client";

import { useState } from "react";

// Newsletter sign-up. Not connected to an email service yet:
// wire `subscribe` up to your provider (Mailchimp, Brevo, a Server Action, etc.).
async function subscribe(email) {
  // TODO: send `email` to your mailing-list provider.
  console.info("Newsletter sign-up (not connected yet):", email);
}

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await subscribe(email);
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <label htmlFor="newsletter-email" className="text-sm font-semibold sm:text-base">
        Subscribe to get the latest on sales, new releases and more …
      </label>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          autoComplete="email"
          className="h-11 min-w-0 rounded-xl sm:flex-1 bg-white/20 px-4 text-sm text-white placeholder:text-white/50 outline-none transition focus:bg-white/25 focus:ring-2 focus:ring-brand/50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-11 shrink-0 rounded-xl bg-white px-5 text-sm font-medium text-ink transition hover:bg-brand disabled:opacity-60"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm">
        {status === "done" && <span className="text-brand">Thanks for subscribing!</span>}
        {status === "error" && (
          <span className="text-red-400">Something went wrong. Please try again.</span>
        )}
      </p>
    </form>
  );
}
