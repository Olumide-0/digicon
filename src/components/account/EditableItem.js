"use client";

import { useActionState, useState } from "react";
import AuthField from "../auth/AuthField";
import SelectField from "../ui/SelectField";
import LoadingOverlay from "../ui/LoadingOverlay";

// One editable value on the account page: shows `children` with an "Edit" link; Edit swaps in a
// small form (fields) that saves through `action` (a server action) and closes when it succeeds.
//
// fields: [{ name, label, type?, defaultValue?, autoComplete?, inputMode?, maxLength?,
//            options? (for type "select"), matches? (name of a field this one must equal) }]
// savingMessage:  text on the full-screen "please wait" overlay while saving
// successMessage: if set, a full-screen success overlay is shown briefly after saving
//                 (instead of the small inline "Saved")
// roomy:          extra space above the Cancel / Save buttons (password design)
export default function EditableItem({
  id,
  title,
  children,
  action,
  fields,
  editLabel = "Edit",
  ariaLabel,
  saveLabel = "Save",
  savingMessage = "Saving changes... Please wait.",
  successMessage,
  roomy = false,
}) {
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [live, setLive] = useState({}); // what's typed, for live checks like "Passwords don't match"
  const [selects, setSelects] = useState(() =>
    Object.fromEntries(fields.filter((f) => f.type === "select").map((f) => [f.name, f.defaultValue ?? ""]))
  );
  const [state, formAction, pending] = useActionState(async (prev, fd) => {
    const result = await action(prev, fd);
    setLive({}); // the form resets after each submit
    if (result?.ok) {
      setEditing(false);
      if (successMessage) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2200);
      }
    }
    return result;
  }, undefined);
  const errors = state?.errors ?? {};
  const values = state?.values ?? {};

  const open = () => {
    setSelects(Object.fromEntries(fields.filter((f) => f.type === "select").map((f) => [f.name, f.defaultValue ?? ""])));
    setLive({});
    setEditing(true);
  };

  const liveError = (f) =>
    f.matches && live[f.name] && live[f.name] !== (live[f.matches] ?? "") ? "Passwords don't match" : undefined;

  return (
    <div className="flex items-start gap-6">
      {pending && <LoadingOverlay message={savingMessage} />}
      {success && <LoadingOverlay variant="success" message={successMessage} onDismiss={() => setSuccess(false)} />}

      <div className="min-w-0 flex-1">
        {title && <p className="mb-3 text-sm font-medium text-ink">{title}</p>}

        {!editing ? (
          <div className="text-sm leading-relaxed text-neutral-700">{children}</div>
        ) : (
          <form action={formAction} noValidate className="max-w-lg">
            <div className="grid gap-3">
              {fields.map((f) =>
                f.type === "select" ? (
                  <SelectField
                    key={f.name}
                    name={f.name}
                    label={f.label}
                    placeholder={f.label}
                    value={selects[f.name]}
                    onChange={(e) => setSelects((s) => ({ ...s, [f.name]: e.target.value }))}
                    options={f.options}
                    error={errors[f.name]}
                  />
                ) : (
                  <AuthField
                    key={f.name}
                    id={`${id}-${f.name}`}
                    name={f.name}
                    label={f.label}
                    type={f.type ?? "text"}
                    autoComplete={f.autoComplete}
                    inputMode={f.inputMode}
                    maxLength={f.maxLength}
                    defaultValue={values[f.name] ?? f.defaultValue}
                    onChange={(e) => setLive((l) => ({ ...l, [f.name]: e.target.value }))}
                    error={liveError(f) ?? errors[f.name]}
                  />
                )
              )}
            </div>
            <div className={`${roomy ? "mt-16 sm:mt-24" : "mt-7"} flex gap-1.5`}>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={pending}
                className="h-8 rounded-md border border-neutral-300 bg-white px-4 text-[11px] text-neutral-600 transition hover:border-ink hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="h-8 rounded-md bg-brand px-3 text-[11px] font-semibold text-white transition hover:bg-brand-hover disabled:opacity-70"
              >
                {pending ? "Saving…" : saveLabel}
              </button>
            </div>
          </form>
        )}
        {state?.ok && !editing && !successMessage && (
          <p key={state.at} role="status" className="mt-2 animate-[fade-out-late_3.5s_ease-in_forwards] text-[11px] text-emerald-700">
            Saved
          </p>
        )}
      </div>

      {!editing && (
        <button
          type="button"
          onClick={open}
          className="shrink-0 pt-0.5 text-sm text-brand hover:underline"
          aria-label={ariaLabel ?? `${editLabel} ${title ?? id}`}
        >
          {editLabel}
        </button>
      )}
    </div>
  );
}
