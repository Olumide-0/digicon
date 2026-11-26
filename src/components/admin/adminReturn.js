"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

// Remembers which admin page an admin left from when opening a shop page (View in shop,
// Preview, View More), so the admin bar on the shop can take them straight back to it.
const KEY = "digicon-admin-return";

export function rememberAdminReturn() {
  try {
    sessionStorage.setItem(KEY, location.pathname + location.search);
  } catch {}
}

const read = () => {
  try {
    const v = sessionStorage.getItem(KEY);
    return v && v.startsWith("/admin") ? v : "/admin";
  } catch {
    return "/admin";
  }
};
const subscribe = () => () => {};

const LABELS = [
  ["/admin/products", "Product Management"],
  ["/admin/orders", "Orders"],
  ["/admin/inventory", "Inventory Management"],
  ["/admin/team", "Team Management"],
  ["/admin", "Admin Dashboard"],
];

export function useAdminReturn() {
  const href = useSyncExternalStore(subscribe, read, () => "/admin");
  const label = LABELS.find(([p]) => href.startsWith(p))?.[1] ?? "Admin Dashboard";
  return { href, label };
}

// A link from the admin to a shop page that remembers where the admin came from.
export function ShopLink({ onClick, ...props }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        rememberAdminReturn();
        onClick?.(e);
      }}
    />
  );
}

// Slim bar shown above the shop navbar while an admin is signed in.
export function AdminReturnBar() {
  const { href, label } = useAdminReturn();
  return (
    <div className="flex h-9 items-center justify-between gap-3 bg-black px-4 text-xs text-white sm:px-8 lg:px-12 xl:px-16">
      <span className="hidden truncate text-white/70 sm:block">You&apos;re viewing the shop as an admin</span>
      <Link href={href} className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Back to {label}
      </Link>
    </div>
  );
}
