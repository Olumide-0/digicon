"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { adminSignOut } from "@/lib/admin/actions";
import { permissionFor } from "@/lib/team/permissions";
import { rememberAdminReturn } from "./adminReturn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/products", label: "Products Mgt", icon: "bag" },
  { href: "/admin/orders", label: "Orders", icon: "clipboard" },
  { href: "/admin/inventory", label: "Inventory Mgt", icon: "invoice" },
  { href: "/admin/team", label: "Team Mgt", icon: "team" },
];
// Top-bar title for each admin page (longest match wins).
const TITLES = [
  ["/admin/products/new", "Product Management"],
  ["/admin/categories/new", "Add New Categories"],
  ["/admin/products", "Product Management"],
  ["/admin/orders", "Orders"],
  ["/admin/inventory", "Inventory Management"],
  ["/admin/team", "Team Management"],
  ["/admin", "Dashboard"],
];

function Icon({ name, className = "size-4.5" }) {
  const p = { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  switch (name) {
    case "grid":
      return (
        <svg {...p}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
        </svg>
      );
    case "bag":
      return (
        <svg {...p}>
          <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8Z" />
          <path d="M9 10V7a3 3 0 0 1 6 0v3" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...p}>
          <rect x="4.5" y="4.5" width="15" height="16" rx="3" />
          <path d="M9 3v3M15 3v3M8.5 11h7M8.5 15h4" />
        </svg>
      );
    case "invoice":
      return (
        <svg {...p}>
          <path d="M7 3.5h7l4.5 4.5v11A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
          <path d="M14 3.5V8h4.5M13.5 11.5h-2.2a1.3 1.3 0 0 0 0 2.6h1.4a1.3 1.3 0 0 1 0 2.6h-2.4M12 10.5v1M12 16.7v1" />
        </svg>
      );
    case "team":
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="3" />
          <path d="M6.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
          <circle cx="5" cy="10" r="2" />
          <circle cx="19" cy="10" r="2" />
          <path d="M2.5 17c0-1.8 1-3 2.5-3.3M21.5 17c0-1.8-1-3-2.5-3.3" />
        </svg>
      );
    case "store":
      return (
        <svg {...p}>
          <path d="M4 9.5 5.5 4.5h13L20 9.5" />
          <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
          <path d="M5.5 12.5v7h13v-7M10 19.5v-4h4v4" />
        </svg>
      );
    case "logout":
      return (
        <svg {...p}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
          <path d="M9 12h7M13 9l3 3-3 3M8 8v8" />
        </svg>
      );
    default:
      return null;
  }
}

export function AdminAvatar({ name, src, className = "size-8" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- private, admin-only image route
    <img src={src} alt="" className={`${className} shrink-0 rounded-full object-cover`} />
  ) : (
    <span className={`${className} grid shrink-0 place-items-center rounded-full bg-brand text-xs font-semibold text-white`} aria-hidden>
      {initials}
    </span>
  );
}

function Sidebar({ pathname, onNavigate, permissions = [] }) {
  const isActive = (href) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <div className="flex h-full flex-col bg-black text-white">
      <Link href="/admin" onClick={onNavigate} className="block px-3 pt-5 pb-8 text-2xl font-bold text-brand">
        Digicon
      </Link>
      <nav aria-label="Admin" className="flex-1 px-3">
        <ul className="space-y-3">
          {NAV.filter((item) => !permissionFor(item.href) || permissions.includes(permissionFor(item.href))).map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center gap-3 rounded-md px-3.5 text-sm transition ${
                    active ? "bg-brand text-white" : "bg-[#1c1c1e] text-white/90 hover:bg-[#2a2a2d]"
                  }`}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-3 pb-3">
        <Link
          href="/"
          onClick={() => {
            rememberAdminReturn();
            onNavigate?.();
          }}
          className="flex w-full items-center gap-3 rounded-md px-3.5 py-2 text-sm text-white/90 transition hover:bg-[#1c1c1e]"
        >
          <Icon name="store" />
          Back to store
        </Link>
      </div>
      <form action={adminSignOut} className="border-t border-white/25 px-3 py-5">
        <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3.5 py-2 text-sm text-white/90 transition hover:bg-[#1c1c1e]">
          <Icon name="logout" />
          Logout
        </button>
      </form>
    </div>
  );
}

// Admin frame: black sidebar (a drawer on phones), grey top bar with the page title and the
// signed-in admin, then the page.
export default function AdminShell({ admin, children }) {
  const pathname = usePathname();
  // The drawer remembers which page it was opened on, so it closes by itself after navigating.
  const [openOn, setOpenOn] = useState(null);
  const open = openOn === pathname;
  const setOpen = (v) => setOpenOn(v ? pathname : null);
  const title = TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Dashboard";

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex min-h-screen flex-1 bg-white text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 lg:block">
        <Sidebar pathname={pathname} permissions={admin.permissions} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50" />
          <aside className="absolute inset-y-0 left-0 w-64 max-w-[80%] shadow-2xl">
            <Sidebar pathname={pathname} onNavigate={() => setOpen(false)} permissions={admin.permissions} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-56">
        <header
          className={`flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-9 ${
            pathname === "/admin" ? "bg-[#f4f4f6]" : "border-b border-neutral-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="-ml-1 p-1 lg:hidden">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-sm text-neutral-700 sm:block">{admin.name}</span>
            <AdminAvatar name={admin.name} src={admin.avatarUrl} />
          </div>
        </header>
        <div className="flex flex-1 flex-col *:min-w-0">{children}</div>
      </div>
    </div>
  );
}
