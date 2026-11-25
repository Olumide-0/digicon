import Link from "next/link";

// Stand-in for admin sections whose designs haven't arrived yet.
export default function ComingSoon({ title, text }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-brand/15 text-brand" aria-hidden>
        <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3Z" />
          <path d="M5 5l3 3M3.5 9.5 5 8M9.5 3.5 8 5" />
        </svg>
      </span>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-sm text-sm text-neutral-600">{text}</p>
      <Link href="/admin" className="mt-6 rounded-md bg-brand px-4 py-2.5 text-xs font-medium text-white transition hover:bg-brand-hover">
        Back to Dashboard
      </Link>
    </div>
  );
}
