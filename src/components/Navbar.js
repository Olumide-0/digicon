"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import MegaMenu from "./MegaMenu";
import { useCart } from "./cart/CartProvider";
import { categories, itemHref } from "@/data/categories";
import {
  BagIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  InfoIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./icons";

function SearchBar({ id, className = "" }) {
  return (
    <form action="/search" role="search" className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search products, brands and categories
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="search products, brands and categories"
        className="h-10 w-full min-w-0 rounded-md border border-white/80 bg-transparent px-5 text-sm text-white placeholder:text-white/50 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
      <button
        type="submit"
        aria-label="Search"
        className="grid h-10 w-14 shrink-0 place-items-center rounded-full bg-brand text-ink transition hover:bg-brand-hover"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

function CartBadge() {
  const { count } = useCart();
  if (!count) return null;
  return (
    <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] leading-none font-bold text-ink">
      {count > 99 ? "99+" : count}
    </span>
  );
}

const helpLinks = [
  { label: "Contact us", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
  { label: "Delivery & Returns", href: "/delivery-returns" },
];

// Full-screen menu for phones/tablets.
function MobileMenu({ onClose, account }) {
  const { count } = useCart();

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
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Dimmed backdrop: click/tap outside the panel to close */}
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="relative max-h-[85dvh] overflow-y-auto rounded-b-2xl bg-ink shadow-2xl"
      >
      <div className="sticky top-0 z-10 flex h-19 items-center justify-between border-b border-white/20 bg-ink px-4 sm:px-8">
        <Link href="/" onClick={onClose} className="text-xl font-bold tracking-tight">
          DIGICON
        </Link>
        <button type="button" onClick={onClose} aria-label="Close menu" className="text-brand">
          <CloseIcon />
        </button>
      </div>

      <div className="px-4 pt-6 pb-6 sm:px-8">
        <SearchBar id="mobile-search" />

        <div className="mt-6">
          {categories.map((c) => (
            <details key={c.name} className="group/cat">
              <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-base font-semibold text-white transition-colors group-open/cat:text-brand [&::-webkit-details-marker]:hidden">
                {c.name}
                <ChevronDownIcon className="size-5 transition-transform group-open/cat:rotate-180" />
              </summary>

              <div>
                {c.columns.flat().map((group) => (
                  <details key={group.title} className="group/grp">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm text-white [&::-webkit-details-marker]:hidden">
                      {group.title}
                      <ChevronDownIcon className="size-4 text-white/70 transition-transform group-open/grp:rotate-180" />
                    </summary>
                    <ul className="mb-2 border-l border-white/10 pl-4">
                      {group.items.map((item) => (
                        <li key={item}>
                          <Link
                            href={itemHref(c.name, group.title, item)}
                            onClick={onClose}
                            className="block py-2 text-sm text-white/60 transition hover:text-brand"
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </details>
          ))}

          <details className="group/cat">
            <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-base font-semibold text-white transition-colors group-open/cat:text-brand [&::-webkit-details-marker]:hidden">
              Help
              <ChevronDownIcon className="size-5 transition-transform group-open/cat:rotate-180" />
            </summary>
            <ul className="mb-2">
              {helpLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={onClose}
                    className="block py-3 text-sm text-white transition hover:text-brand"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div className="space-y-1">
          {[
            { label: count ? `Cart (${count})` : "Cart", href: "/cart" },
            account,
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="flex items-center justify-between py-3 text-base font-semibold transition hover:text-brand"
            >
              {l.label}
              <ChevronRightIcon className="size-5" />
            </Link>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

// Signed-in user ({ firstName } or null). Re-checked on every page change, so the
// navbar updates right after signing in or out.
function useCurrentUser() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => alive && setUser(d.user))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);
  return user;
}

export default function Navbar() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);
  const user = useCurrentUser();
  const account = user ? { label: user.firstName, href: "/account" } : { label: "Account", href: "/signin" };

  // Close the mega menu on outside click or Escape.
  useEffect(() => {
    if (!megaOpen) return;
    const onClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setMegaOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMegaOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [megaOpen]);

  const closeMega = () => setMegaOpen(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-ink/95 backdrop-blur">
      <nav className="flex h-19 w-full items-center gap-6 px-4 sm:px-8 lg:px-12 xl:px-16">
        <Link href="/" className="text-xl font-bold tracking-tight">
          DIGICON
        </Link>

        <SearchBar id="site-search" className="hidden w-full max-w-xl flex-1 md:flex lg:ml-16 xl:ml-24" />

        <ul className="ml-auto hidden items-center gap-6 lg:flex">
          <li>
            <button
              type="button"
              onClick={() => setMegaOpen((o) => !o)}
              aria-expanded={megaOpen}
              aria-controls="mega-menu"
              className={`flex items-center gap-2 text-sm transition hover:text-brand ${
                megaOpen ? "text-brand" : ""
              }`}
            >
              Shop by Categories
              <ChevronDownIcon
                className={`size-4 transition-transform ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>
          </li>
          <li>
            <Link href="/contact" className="flex items-center gap-2 text-sm transition hover:text-brand">
              <InfoIcon />
              Contact us
            </Link>
          </li>
          <li>
            <Link href="/cart" className="flex items-center gap-2 text-sm transition hover:text-brand">
              <span className="relative">
                <BagIcon />
                <CartBadge />
              </span>
              cart
            </Link>
          </li>
          <li>
            <Link href={account.href} className="flex items-center gap-2 text-sm transition hover:text-brand">
              <UserIcon />
              {account.label}
            </Link>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="ml-auto text-brand lg:hidden"
        >
          <MenuIcon />
        </button>
      </nav>

      {/* Desktop mega menu, aligned with the navbar's edges */}
      {megaOpen && (
        <div
          id="mega-menu"
          className="absolute inset-x-0 top-full hidden px-4 pt-2 sm:px-8 lg:block lg:px-12 xl:px-16"
        >
          <MegaMenu onNavigate={closeMega} />
        </div>
      )}

      {/* Portalled to <body>: the header's backdrop-blur would otherwise trap position:fixed */}
      {mobileOpen && createPortal(<MobileMenu onClose={closeMobile} account={account} />, document.body)}
    </header>
  );
}
