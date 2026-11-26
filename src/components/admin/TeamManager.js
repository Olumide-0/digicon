"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import SelectField from "@/components/ui/SelectField";
import { PERMISSIONS } from "@/lib/team/permissions";
import {
  cancelInviteAction,
  changeInviteRoleAction,
  changeMemberRoleAction,
  inviteMembersAction,
  removeMembersAction,
  resendInviteAction,
  setMemberStatusAction,
} from "@/lib/team/actions";

const button =
  "inline-flex h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3.5 text-[13px] text-neutral-600 transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50";
const primary = "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-[13px] font-medium text-white transition hover:bg-brand-hover disabled:opacity-60";
const field = (err) =>
  `h-12 w-full rounded-md border bg-white px-4 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:ring-2 ${
    err ? "border-red-500 focus:ring-red-200" : "border-neutral-200 focus:border-brand focus:ring-brand/20"
  }`;

const Plus = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

function useOutside(open, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && close();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

// White pop-up in the style of the other admin modals.
function Modal({ title, subtitle, onClose, children, footer, size = "max-w-[34rem]" }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/55 backdrop-blur-[2px] sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="team-modal-title" className={`flex h-full w-full flex-col overflow-y-auto bg-white px-5 pt-8 pb-6 text-left text-ink sm:h-auto sm:max-h-full sm:rounded-sm sm:px-8 sm:pt-9 sm:pb-8 ${size}`}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 id="team-modal-title" className="text-lg font-semibold text-black">
              {title}
            </h2>
            {subtitle && <p className="mt-3 text-sm text-neutral-600">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mt-1 p-1 text-black transition hover:text-brand">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          </button>
        </div>
        <div className="mt-8 flex-1">{children}</div>
        {footer && <div className="mt-10 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

function Label({ htmlFor, children, hint }) {
  return (
    <label htmlFor={htmlFor} className="mb-3 block text-sm font-medium text-black">
      {children}
      {hint && <span className="ml-1 font-normal text-neutral-500">{hint}</span>}
    </label>
  );
}
const Err = ({ children }) => (children ? <p className="mt-2 text-xs text-red-600">{children}</p> : null);

// ── Invite ───────────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      }}
      className="h-9 shrink-0 rounded-md bg-brand px-3 text-xs font-medium text-white transition hover:bg-brand-hover"
    >
      {copied ? "Copied ✓" : "Copy link"}
    </button>
  );
}

// One copyable link per invited email (emails aren't connected yet).
function InviteLinks({ invites }) {
  return (
    <div className="rounded-md border border-dashed border-brand bg-brand/5 p-4">
      <p className="text-xs text-neutral-600">
        Emails aren&apos;t connected yet, so copy each link and send it to the person (WhatsApp, email…). Each link works once and expires in 7 days.
      </p>
      <ul className="mt-4 space-y-3">
        {invites.map((i) => (
          <li key={i.email}>
            <p className="mb-1.5 text-sm font-medium text-ink">{i.email}</p>
            <div className="flex gap-2">
              <input readOnly value={i.link} onFocus={(e) => e.target.select()} aria-label={`Invitation link for ${i.email}`} className="h-9 min-w-0 flex-1 rounded-md border border-neutral-200 bg-white px-3 text-xs text-neutral-600" />
              <CopyButton text={i.link} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// "Invite New User" (design): emails added to a list as chips, one role, Send Invite.
function InviteModal({ roles, onClose, onDone }) {
  const [typed, setTyped] = useState("");
  const [emails, setEmails] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [pending, start] = useTransition();

  // "a@x.com, b@x.com" or one per line also works.
  const add = () => {
    const parts = typed.split(/[\s,;]+/).map((p) => p.trim().toLowerCase()).filter(Boolean);
    if (!parts.length) return;
    const bad = parts.filter((p) => !EMAIL_RE.test(p));
    if (bad.length) return setErrors((e) => ({ ...e, email: `Not a valid email: ${bad.join(", ")}` }));
    const fresh = parts.filter((p) => !emails.includes(p));
    if (!fresh.length) return setErrors((e) => ({ ...e, email: `${parts.join(", ")} ${parts.length === 1 ? "is" : "are"} already in the list` }));
    setEmails([...emails, ...fresh]);
    setTyped("");
    setErrors((e) => ({ ...e, email: undefined }));
  };

  const send = () => {
    // Something typed but not added yet counts too.
    const typedParts = typed.split(/[\s,;]+/).map((p) => p.trim().toLowerCase()).filter(Boolean);
    const list = [...new Set([...emails, ...typedParts])];
    start(async () => {
      const res = await inviteMembersAction({ emails: list, roleId });
      if (res.errors || res.error) return setErrors(res.errors ?? { form: res.error });
      setResult(res);
      onDone();
    });
  };

  if (result)
    return (
      <Modal
        title={`${result.invites.length === 1 ? "Invite" : `${result.invites.length} invites`} sent`}
        subtitle={`Invited as ${result.role}.`}
        onClose={onClose}
        footer={
          <button type="button" onClick={onClose} className={primary}>
            Done
          </button>
        }
      >
        <InviteLinks invites={result.invites} />
      </Modal>
    );

  return (
    <Modal
      title="Invite New User"
      onClose={onClose}
      size="max-w-[46rem] sm:min-h-[40rem]"
      footer={
        <button type="button" onClick={send} disabled={pending} className={primary}>
          {pending ? "Sending…" : "Send Invite"}
        </button>
      }
    >
      <div className="space-y-8">
        <div>
          <Label htmlFor="inv-email">Email Address</Label>
          <div
            className={`flex h-12 items-center gap-2 rounded-md border bg-white pr-2 pl-4 transition focus-within:ring-2 ${
              errors.email ? "border-red-500 focus-within:ring-red-200" : "border-neutral-200 focus-within:border-brand focus-within:ring-brand/20"
            }`}
          >
            <input
              id="inv-email"
              type="email"
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value);
                setErrors((x) => ({ ...x, email: undefined }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  add();
                }
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (/[\s,;]/.test(text.trim())) {
                  e.preventDefault();
                  setTyped(text);
                  setTimeout(add, 0);
                }
              }}
              placeholder="Input invitee's email address"
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-xs placeholder:text-neutral-400 outline-none"
              autoFocus
            />
            <button type="button" onClick={add} className="h-8 shrink-0 rounded-md bg-green-600 px-3 text-xs font-medium text-white transition hover:bg-green-700">
              Add to list
            </button>
          </div>
          <Err>{errors.email}</Err>
          {emails.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Emails to invite">
              {emails.map((e) => (
                <li key={e} className="flex max-w-full items-center gap-2 rounded bg-neutral-400 py-1.5 pr-2 pl-3 text-xs text-white">
                  <span className="truncate">{e}</span>
                  <button type="button" onClick={() => setEmails(emails.filter((x) => x !== e))} aria-label={`Remove ${e}`} className="grid size-4 shrink-0 place-items-center rounded-sm hover:bg-white/20">
                    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-3 text-sm font-medium text-black">Role *</p>
          <SelectField
            name="inv-role"
            label="Role"
            value={roleId}
            onChange={(e) => {
              setRoleId(e.target.value);
              setErrors((x) => ({ ...x, roleId: undefined }));
            }}
            options={roles.map((r) => ({ value: r.id, label: r.name, description: r.description }))}
            placeholder="Select Role"
            error={errors.roleId}
          />
        </div>
        {errors.form && (
          <p role="alert" className="text-sm text-red-600">
            {errors.form}
          </p>
        )}
      </div>
    </Modal>
  );
}

function ChangeRoleModal({ row, roles, onClose, onSave, pending }) {
  const [roleId, setRoleId] = useState(row.roleId);
  return (
    <Modal
      title="Change Role"
      subtitle={`${row.name !== "—" ? row.name : row.email} is currently ${row.role}.`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={button}>
            Cancel
          </button>
          <button type="button" onClick={() => onSave(roleId)} disabled={pending || roleId === row.roleId} className={primary}>
            {pending ? "Saving…" : "Save Role"}
          </button>
        </>
      }
    >
      <p className="mb-3 text-sm font-medium text-black">New Role</p>
      <SelectField name="change-role" label="New role" value={roleId} onChange={(e) => setRoleId(e.target.value)} options={roles.map((r) => ({ value: r.id, label: r.name }))} />
    </Modal>
  );
}

function Confirm({ title, text, action, danger = true, onCancel, onConfirm, pending }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/55 p-4 backdrop-blur-[2px]">
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-3 text-sm text-neutral-600">{text}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={onCancel} className="h-10 rounded-md border border-neutral-300 px-5 text-sm hover:border-ink">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={pending} className={`h-10 rounded-md px-5 text-sm font-medium text-white disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-brand hover:bg-brand-hover"}`}>
            {pending ? "Working…" : action}
          </button>
        </div>
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange, label, indeterminate = false, disabled }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      aria-label={label}
      className="size-4 cursor-pointer appearance-none rounded-[3px] border border-current bg-transparent align-middle transition checked:border-brand checked:bg-brand checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path d=%22M4 8.5l2.5 2.5L12 5.5%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22/></svg>')] indeterminate:border-brand indeterminate:bg-brand disabled:cursor-not-allowed disabled:opacity-30"
    />
  );
}

const STATUS = {
  active: ["Active", "text-green-600"],
  inactive: ["Inactive", "text-red-600"],
  invited: ["Invited", "text-amber-600"],
  expired: ["Invite expired", "text-neutral-500"],
};

function RowMenu({ row, onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, () => setOpen(false));
  const item = "block w-full px-4 py-2 text-left text-xs transition hover:bg-neutral-100";
  const items =
    row.kind === "invite"
      ? [
          ["link", "Get a new invite link"],
          ["role", "Change role"],
          ["cancel", "Cancel invitation", true],
        ]
      : row.isMe
        ? [["role", "Change my role"]]
        : [
            ["role", "Change role"],
            row.status === "active" ? ["deactivate", "Deactivate (turn off access)"] : ["activate", "Activate"],
            ["remove", "Remove from team", true],
          ];
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={`Actions for ${row.name !== "—" ? row.name : row.email}`} aria-expanded={open} aria-haspopup="menu" className="grid size-7 place-items-center rounded hover:bg-neutral-100">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-20 mt-1 w-52 rounded-md border border-neutral-200 bg-white py-1.5 shadow-xl">
          {items.map(([key, label, danger]) => (
            <button
              key={key}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                onPick(key, row);
              }}
              className={`${item} ${danger ? "text-red-600" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterMenu({ filters, roles, buildHref }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, () => setOpen(false));
  const groups = [
    ["status", "Status", [["active", "Active"], ["inactive", "Inactive"], ["invited", "Invited"]]],
    ["role", "Role", roles.map((r) => [r.id, r.name])],
  ];
  const active = groups.filter(([k]) => filters[k]).length;
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog" className="inline-flex h-10 items-center gap-3 rounded-md bg-black px-4 text-xs font-medium text-white transition hover:bg-ink">
        Filter by{active > 0 && <span className="grid size-4.5 place-items-center rounded-full bg-brand text-[10px]">{active}</span>}
        <svg viewBox="0 0 24 24" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div role="dialog" aria-label="Filter team" className="absolute top-full left-0 z-20 mt-2 w-64 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl">
          {groups.map(([key, label, options]) => (
            <fieldset key={key} className="mb-4 last:mb-0">
              <legend className="mb-2 text-xs font-semibold text-ink">{label}</legend>
              <div className="flex flex-wrap gap-1.5">
                {[["", "All"], ...options].map(([value, text]) => {
                  const on = (filters[key] ?? "") === value;
                  return (
                    <Link
                      key={value || "all"}
                      href={buildHref({ [key]: value, page: "" })}
                      onClick={() => setOpen(false)}
                      aria-current={on ? "true" : undefined}
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${on ? "border-brand bg-brand text-white" : "border-neutral-300 text-neutral-700 hover:border-ink"}`}
                    >
                      {text}
                    </Link>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
}

function Pages({ page, pages, total, from, to, buildHref }) {
  const btn = "grid h-7 min-w-7 place-items-center rounded-sm px-2 text-xs transition";
  return (
    <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 text-xs text-neutral-600 sm:flex-row">
      <p>{total ? `Showing ${from}–${to} of ${total}` : "Nothing to show"}</p>
      {pages > 1 && (
        <nav aria-label="Team pages" className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={buildHref({ page: p > 1 ? String(p) : "" })} aria-current={p === page ? "page" : undefined} className={`${btn} ${p === page ? "bg-brand font-semibold text-white" : "border border-neutral-300 hover:border-ink"}`}>
              {p}
            </Link>
          ))}
          {page < pages ? (
            <Link href={buildHref({ page: String(page + 1) })} className={`${btn} bg-brand font-semibold text-white`}>
              Next
            </Link>
          ) : (
            <span aria-disabled="true" className={`${btn} bg-brand font-semibold text-white opacity-40`}>
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-10 text-white" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 19.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6c0 .8-.5 1.3-1.3 1.3H5.8c-.8 0-1.3-.5-1.3-1.3Z" />
    </svg>
  );
}

// Team Management: members + invitations table, roles list, and all their pop-ups.
export default function TeamManager({ empty, view, rows, roles, stats, filters, page, pages, total, from, meId }) {
  const router = useRouter();
  const [modal, setModal] = useState(null); // { type: "invite"|"changeRole"|"link"|"confirm", ... }
  const [selected, setSelected] = useState([]);
  const [toast, setToast] = useState(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const buildHref = (change) => {
    const next = { view: view === "roles" ? "roles" : "", ...filters, page: page > 1 ? String(page) : "", ...change };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v));
    return `/admin/team${qs.size ? `?${qs}` : ""}`;
  };
  const close = () => setModal(null);
  const done = (res) => {
    if (res?.error) setToast({ error: true, text: res.error });
    else if (res?.message) setToast({ text: res.message });
    router.refresh();
  };
  const run = (fn) =>
    start(async () => {
      const res = await fn();
      done(res);
      if (!res?.error) {
        setModal(null);
        setSelected([]);
      }
    });

  // Only members (not invitations, not yourself) can be ticked for bulk actions.
  const selectable = rows.filter((r) => r.kind === "member" && r.id !== meId).map((r) => r.id);
  const picked = selected.filter((id) => selectable.includes(id));
  const allOn = selectable.length > 0 && picked.length === selectable.length;

  const onPick = (key, row) => {
    const who = row.name !== "—" ? row.name : row.email;
    if (key === "role") return setModal({ type: "changeRole", row });
    if (key === "link")
      return start(async () => {
        const res = await resendInviteAction(row.id);
        if (res.error) return done(res);
        setModal({ type: "link", ...res });
        router.refresh();
      });
    if (key === "cancel") return setModal({ type: "confirm", title: `Cancel invitation for ${row.email}?`, text: "Their invite link will stop working.", action: "Cancel invitation", run: () => cancelInviteAction(row.id) });
    if (key === "deactivate")
      return setModal({ type: "confirm", title: `Deactivate ${who}?`, text: "They won't be able to sign in to the admin until you activate them again.", action: "Deactivate", run: () => setMemberStatusAction([row.id], "inactive") });
    if (key === "activate") return run(() => setMemberStatusAction([row.id], "active"));
    if (key === "remove")
      return setModal({ type: "confirm", title: `Remove ${who} from the team?`, text: "They lose admin access straight away. Their account stays, so they can still shop.", action: "Remove", run: () => removeMembersAction([row.id]) });
  };

  const modals = (
    <>
      {modal?.type === "invite" && <InviteModal roles={roles} onClose={close} onDone={() => router.refresh()} />}
      {modal?.type === "changeRole" && (
        <ChangeRoleModal
          row={modal.row}
          roles={roles}
          pending={pending}
          onClose={close}
          onSave={(roleId) => run(() => (modal.row.kind === "invite" ? changeInviteRoleAction(modal.row.id, roleId) : changeMemberRoleAction(modal.row.id, roleId)))}
        />
      )}
      {modal?.type === "link" && (
        <Modal title="New invitation link" onClose={close} footer={<button type="button" onClick={close} className={primary}>Done</button>}>
          <InviteLinks invites={[{ email: modal.email, link: modal.link }]} />
        </Modal>
      )}
      {modal?.type === "confirm" && <Confirm {...modal} pending={pending} onCancel={close} onConfirm={() => run(modal.run)} />}
      {toast && (
        <p role="status" className={`fixed right-4 bottom-4 z-50 max-w-xs rounded-lg px-4 py-3 text-sm text-white shadow-xl ${toast.error ? "bg-red-600" : "bg-ink"}`}>
          {toast.text}
        </p>
      )}
    </>
  );

  // ── Empty state (design 1)
  if (empty) {
    return (
      <>
        <div className="min-h-16 border-b border-neutral-200" />
        <div className="flex flex-1 flex-col items-center px-4 pt-20 pb-24 text-center sm:pt-28">
          <span className="grid size-20 place-items-center rounded-full bg-brand">
            <PersonIcon />
          </span>
          <h2 className="mt-7 text-2xl font-bold text-black sm:text-[1.75rem]">No Team Members Added Yet</h2>
          <p className="mt-5 max-w-[19rem] text-sm leading-relaxed text-neutral-600">Invite people to help run the store. Make them an Admin (products, orders and inventory) or a Super Admin (everything, including the team).</p>
          <button type="button" onClick={() => setModal({ type: "invite" })} className={`${primary} mt-7`}>
            <Plus />
            Invite New Team Member
          </button>
        </div>
        {modals}
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-16 flex-wrap items-center justify-end gap-2 border-b border-neutral-200 px-4 py-3 sm:px-6 lg:px-9">
        <button type="button" onClick={() => setModal({ type: "invite" })} className={button}>
          <Plus />
          Invite New Team Member
        </button>
      </div>

      <div className="px-4 pt-7 pb-12 sm:px-6 lg:px-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Quick Stats</h2>
          <div className="flex gap-2" role="tablist" aria-label="Show">
            {[
              ["teams", "All Teams"],
              ["roles", "All Roles"],
            ].map(([key, label]) => (
              <Link
                key={key}
                href={key === "roles" ? "/admin/team?view=roles" : "/admin/team"}
                role="tab"
                aria-selected={view === key}
                className={`grid h-10 w-24 place-items-center rounded-md text-xs transition sm:w-[5.75rem] ${view === key ? "bg-black font-medium text-white" : "border border-neutral-300 text-neutral-500 hover:border-ink hover:text-ink"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-5">{stats}</div>

        {view === "teams" ? (
          <>
            <div className="mt-10 flex flex-col gap-3 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <FilterMenu filters={filters} roles={roles} buildHref={buildHref} />
                {picked.length > 0 && (
                  <>
                    <span className="ml-1 text-xs text-neutral-600">{picked.length} selected:</span>
                    <button type="button" disabled={pending} onClick={() => run(() => setMemberStatusAction(picked, "active"))} className={`${button} h-9 text-xs`}>
                      Activate
                    </button>
                    <button type="button" disabled={pending} onClick={() => run(() => setMemberStatusAction(picked, "inactive"))} className={`${button} h-9 text-xs`}>
                      Deactivate
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setModal({ type: "confirm", title: `Remove ${picked.length} ${picked.length === 1 ? "member" : "members"}?`, text: "They lose admin access straight away. Their accounts stay.", action: "Remove", run: () => removeMembersAction(picked) })}
                      className={`${button} h-9 text-xs text-red-600`}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
              <form action="/admin/team" role="search" className="flex w-full items-center gap-2 sm:w-auto">
                {["status", "role"].map((k) => filters[k] && <input key={k} type="hidden" name={k} value={filters[k]} />)}
                <label htmlFor="team-search" className="sr-only">
                  Search team
                </label>
                <input
                  id="team-search"
                  name="q"
                  type="search"
                  defaultValue={filters.q}
                  placeholder="Search by name, email or role"
                  className="h-10 min-w-0 flex-1 rounded-md bg-neutral-200/80 px-4 text-xs text-ink placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-brand/30 sm:w-80 sm:flex-none lg:w-[19.5rem]"
                />
                <button type="submit" aria-label="Search" className="grid h-10 w-14 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-hover">
                  <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m16 16 4 4" />
                  </svg>
                </button>
              </form>
            </div>
            {(filters.q || filters.status || filters.role) && (
              <p className="mt-4 text-xs text-neutral-600">
                {total} {total === 1 ? "result" : "results"} ·{" "}
                <Link href="/admin/team" className="font-medium text-brand hover:underline">
                  Clear search &amp; filters
                </Link>
              </p>
            )}

            <div className="mt-8 overflow-hidden border border-neutral-200 bg-white sm:mt-10">
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[56rem] table-fixed text-left text-xs">
                  <colgroup>
                    <col className="w-16" />
                    <col className="w-[18%]" />
                    <col className="w-[13%]" />
                    <col className="w-[22%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[15%]" />
                    <col className="w-12" />
                  </colgroup>
                  <thead className="bg-[#606169] text-white">
                    <tr>
                      <th scope="col" className="py-5 pl-5">
                        <Checkbox checked={allOn} indeterminate={picked.length > 0 && !allOn} disabled={!selectable.length} onChange={() => setSelected(allOn ? [] : selectable)} label="Select all team members on this page" />
                      </th>
                      {["Employee Name", "Role", "Email Address", "Status", "Date Added", "Last Login"].map((h) => (
                        <th key={h} scope="col" className="py-5 pr-3 font-normal">
                          {h}
                        </th>
                      ))}
                      <th scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-14 text-center text-sm text-neutral-500">
                          Nobody matches. Try another search or clear the filters.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => {
                        const on = picked.includes(r.id);
                        const [label, tone] = STATUS[r.status];
                        return (
                          <tr key={`${r.kind}-${r.id}`} className={`border-b border-neutral-200 text-neutral-800 ${on ? "bg-brand/5" : ""}`}>
                            <td className="py-6 pl-5 text-neutral-700">
                              {r.kind === "member" && r.id !== meId ? <Checkbox checked={on} onChange={() => setSelected(on ? picked.filter((x) => x !== r.id) : [...picked, r.id])} label={`Select ${r.name}`} /> : null}
                            </td>
                            <td className="truncate py-6 pr-3" title={r.name}>
                              {r.name}
                              {r.isMe && <span className="ml-1.5 rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-700">You</span>}
                            </td>
                            <td className="truncate py-6 pr-3" title={r.role}>
                              {r.role}
                            </td>
                            <td className="truncate py-6 pr-3" title={r.email}>
                              {r.email}
                            </td>
                            <td className={`py-6 pr-3 font-medium ${tone}`}>{label}</td>
                            <td className="py-6 pr-3">{r.added}</td>
                            <td className="py-6 pr-3">
                              <span className="font-semibold text-ink">{r.lastLogin.day}</span> {r.lastLogin.time}
                            </td>
                            <td className="py-6 pr-3">
                              <RowMenu row={r} onPick={onPick} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pages page={page} pages={pages} total={total} from={from} to={from + rows.length - 1} buildHref={buildHref} />
            </div>
          </>
        ) : (
          <section aria-labelledby="roles-title" className="mt-10 sm:mt-14">
            <h2 id="roles-title" className="sr-only">
              All roles
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {roles.map((r) => (
                <article key={r.id} className="flex flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-ink">{r.name}</h3>
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-500">{r.description || "No description"}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Can manage">
                    {PERMISSIONS.map((p) => (
                      <li key={p.key} className={`rounded-full px-2.5 py-1 text-[11px] ${r.permissions.includes(p.key) ? "bg-black text-white" : "bg-neutral-100 text-neutral-400 line-through"}`}>
                        {p.short}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-neutral-600">
                    {r.members} {r.members === 1 ? "member" : "members"}
                    {r.invites > 0 && ` · ${r.invites} invited`}
                  </p>
                  <Link href={`/admin/team?role=${r.id}`} className="mt-4 w-fit text-xs font-medium text-brand hover:underline">
                    See who has this role →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
      {modals}
    </>
  );
}
