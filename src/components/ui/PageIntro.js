import Link from "next/link";

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 text-ink" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

// Breadcrumb + page title + intro paragraph, as used on the cart and auth pages.
// crumbs: [{ label, href }]; the last crumb is the current page (no link).
export default function PageIntro({ crumbs, title, children }) {
  const current = crumbs.at(-1);
  return (
    <div>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs">
          {crumbs.slice(0, -1).map((c) => (
            <li key={c.href} className="flex items-center gap-2">
              <Link href={c.href} className="text-brand hover:underline">
                {c.label}
              </Link>
              <Chevron />
            </li>
          ))}
          <li aria-current="page" className="text-neutral-700">
            {current.label}
          </li>
        </ol>
      </nav>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
      {children && <p className="mt-3 max-w-lg text-sm leading-relaxed text-neutral-600">{children}</p>}
    </div>
  );
}
