import Link from "next/link";
import { ShopLink } from "./adminReturn";

// Shared admin bits: naira prices, stat cards, the dark-header table card, View More links and button icons.

export const naira = (n) => `₦${Math.round(n).toLocaleString("en-NG")}`;

export function ViewMore({ href, label }) {
  return (
    <ShopLink href={href} className="inline-flex items-center gap-2 whitespace-nowrap text-green-600 hover:underline" aria-label={label}>
      View More
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </ShopLink>
  );
}

// Card with a title bar, an optional black "View all" button and a table (scrolls sideways on phones).
export function TableCard({ id, title, viewAll, columns, widths, rows, empty, footer }) {
  return (
    <section aria-labelledby={id} className="rounded-lg border border-neutral-200 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-2.5 py-2.5 sm:px-3">
        <h2 id={id} className="flex items-center gap-2 text-xs font-medium text-neutral-700">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 20V4M9 20v-8M14 20v-5M19 20V9" />
          </svg>
          {title}
        </h2>
        {viewAll && (
          <Link href={viewAll.href} className="rounded-md bg-black px-3 py-2 text-[11px] font-medium text-white transition hover:bg-ink">
            {viewAll.label}
          </Link>
        )}
      </div>
      <div className="overflow-x-auto px-2 pt-4 pb-2 sm:px-2.5">
        <table className="w-full min-w-[40rem] table-fixed border-separate border-spacing-0 text-left text-xs">
          <colgroup>
            {widths.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead>
            <tr className="text-white">
              {columns.map((c, i) => (
                <th
                  key={c}
                  scope="col"
                  className={`bg-[#606169] py-3.5 font-normal ${i === 0 ? "rounded-l-lg pl-6" : ""} ${i === columns.length - 1 ? "rounded-r-lg" : ""}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((cells, r) => (
                <tr key={r} className="text-neutral-800">
                  {cells.map((cell, i) => (
                    <td key={i} className={`py-4 pr-3 ${i === 0 ? "truncate pl-6" : ""} ${r < rows.length - 1 ? "border-b border-neutral-200" : ""}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-neutral-500">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </section>
  );
}

export const PencilIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 13.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V6a1.5 1.5 0 0 1 1.5-1.5H11" />
    <path d="m17.5 3.5 3 3L12 15l-4 1 1-4Z" />
  </svg>
);
export const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ICONS = {
  folder: <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18Z" />,
  check: <path d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM8 12.5l2.7 2.7L16 9.8" />,
  bag: <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8ZM9 10V7a3 3 0 0 1 6 0v3" />,
  file: <path d="M7 3.5h7l4.5 4.5v12.5H7a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 7 3.5ZM14 3.5V8h4.5" />,
  people: <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M5 11.5a2 2 0 1 0 0-4M19 11.5a2 2 0 1 0 0-4M2.5 17.5c0-1.8 1-3 2.5-3.3M21.5 17.5c0-1.8-1-3-2.5-3.3" />,
  alarm: <path d="M12 20.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM12 10v3.5l2 1.5M5 4.5 3 6.5M19 4.5l2 2" />,
};

export function StatCard({ title, value, note, icon }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="pt-2 text-[11px] font-semibold sm:text-xs">{title}</h2>
        <span className="grid size-8 shrink-0 sm:size-9 place-items-center rounded-md bg-brand text-white">
          <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {ICONS[icon]}
          </svg>
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold">{value.toLocaleString("en-NG")}</p>
      <p className="mt-1.5 text-[10px] text-neutral-600 sm:text-[11px]">{note}</p>
    </div>
  );
}
