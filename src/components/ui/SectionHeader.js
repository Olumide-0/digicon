// Two-tone section heading on the left, intro paragraph on the right.
export default function SectionHeader({ id, title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-4 px-4 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:px-12 xl:px-16">
      <h2
        id={id}
        className="max-w-md text-2xl leading-tight font-semibold tracking-tight text-ink sm:text-[1.75rem]"
      >
        {title} <span className="text-neutral-400">{subtitle}</span>
      </h2>
      <p className="max-w-xl text-sm leading-relaxed text-neutral-500 lg:mr-auto lg:ml-16">
        {children}
      </p>
    </div>
  );
}
