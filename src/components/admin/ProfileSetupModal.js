"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { completeAdminProfile } from "@/lib/admin/actions";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import AdminModal, { ModalField, modalButton } from "./AdminModal";

const MAX = 5 * 1024 * 1024;

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.8 19.5c0-3 3.2-5 7.2-5s7.2 2 7.2 5c0 .6-.4 1-1 1H5.8c-.6 0-1-.4-1-1Z" />
    </svg>
  );
}

// "Tell us your name": shown after an admin signs in until they complete it.
// The X hides it for now; it comes back on the next visit until setup is done.
export default function ProfileSetupModal({ firstName = "", lastName = "" }) {
  const [state, action, pending] = useActionState(completeAdminProfile, undefined);
  const router = useRouter();
  const [closed, setClosed] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState();
  const fileRef = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  // Once saved: short "You're all set" tick, then the modal goes away and the page reloads its data.
  useEffect(() => {
    if (!state?.done) return;
    const t = setTimeout(() => {
      setClosed(true);
      router.refresh();
    }, 1400);
    return () => clearTimeout(t);
  }, [state, router]);

  if (closed) return null;
  if (state?.done) return <LoadingOverlay variant="success" message="You're all set" onDismiss={() => {
    setClosed(true);
    router.refresh();
  }} />;

  const pick = (e) => {
    const file = e.target.files?.[0];
    setFileError(undefined);
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setFileError("Upload a JPG or PNG image");
      e.target.value = "";
      return;
    }
    if (file.size > MAX) {
      setFileError("Image must be 5MB or smaller");
      e.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  const submit = (e) => {
    e.preventDefault(); // keeps the chosen photo if the server sends back an error
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };

  const errors = state?.errors ?? {};
  const avatarError = fileError ?? errors.avatar;

  return (
    <form onSubmit={submit} noValidate>
      {pending && <LoadingOverlay message="Setting up your account..." />}
      <AdminModal
        title="Tell us your name"
        subtitle="Help us personalize your experience"
        onClose={() => setClosed(true)}
        footer={
          <button type="submit" disabled={pending} className={modalButton}>
            Complete Setup
          </button>
        }
      >
        <div className="-mt-2 sm:-mt-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label={preview ? "Change profile image" : "Upload profile image"}
              className="relative grid size-15 shrink-0 place-items-center overflow-hidden rounded-md bg-brand transition hover:bg-brand-hover"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
                <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <PersonIcon />
              )}
            </button>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-brand hover:underline">
                {preview ? "Change profile image" : "Upload profile image"}
              </button>
              <p className="mt-1.5 text-[11px] text-neutral-500">JPG or PNG. Max size of 5MB.</p>
            </div>
            <input ref={fileRef} type="file" name="avatar" accept="image/jpeg,image/png" onChange={pick} className="sr-only" tabIndex={-1} aria-hidden />
          </div>
          {avatarError && <p className="mt-3 text-sm text-red-600">{avatarError}</p>}

          <div className="mt-8 space-y-8">
            <ModalField name="firstName" label="First Name" autoComplete="given-name" defaultValue={state?.values?.firstName ?? firstName} error={errors.firstName} />
            <ModalField name="lastName" label="Last Name" autoComplete="family-name" defaultValue={state?.values?.lastName ?? lastName} error={errors.lastName} />
          </div>
        </div>
      </AdminModal>
    </form>
  );
}
