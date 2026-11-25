// Spec sheet: black heading bar per group, orange labels, grey values.
// Phones: a "Specification" heading and collapsible groups (first one open).
// md and up: every group open in two columns, as in the desktop design.
// A value can be a string or an array of lines; an empty string "" in an
// array inserts a paragraph gap (e.g. before "IP68 dust/water resistant…").
function Value({ value }) {
  if (!Array.isArray(value)) return value;
  return value.map((line, i) =>
    line === "" ? (
      <span key={i} className="block h-3" aria-hidden />
    ) : (
      <span key={i} className="block">
        {line}
      </span>
    )
  );
}

function Rows({ rows }) {
  return (
    <dl className="mt-6 space-y-6 md:mt-7">
      {Object.entries(rows).map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 text-xs leading-relaxed sm:grid-cols-[5.5rem_minmax(0,1fr)]"
        >
          <dt className="text-brand">{label}</dt>
          <dd className="break-words text-neutral-500">
            <Value value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function ProductSpecs({ specs }) {
  const groups = specs ? Object.entries(specs) : [];

  return (
    <section aria-labelledby="specs-title">
      <h2 id="specs-title" className="mb-6 text-lg font-semibold md:sr-only">
        Specification
      </h2>

      <div className="rounded-xl bg-white px-4 py-5 shadow-[0_0_14px_rgba(0,0,0,0.08)] sm:px-10 sm:py-10 lg:px-14">
        {/* Phones: accordion */}
        <div className="space-y-4 md:hidden">
          {groups.map(([group, rows], i) => (
            <details key={group} open={i === 0} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between bg-black px-3 py-3 text-xs font-semibold text-white [&::-webkit-details-marker]:hidden">
                {group}
                <Chevron />
              </summary>
              <div className="pb-2">
                <Rows rows={rows} />
              </div>
            </details>
          ))}
        </div>

        {/* md and up: all groups open, two columns */}
        <div className="hidden gap-x-20 gap-y-12 md:grid md:grid-cols-2">
          {groups.map(([group, rows]) => (
            <div key={group} className="min-w-0">
              <h3 className="w-4/5 max-w-sm bg-black px-3 py-2.5 text-xs font-semibold text-white">{group}</h3>
              <Rows rows={rows} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
