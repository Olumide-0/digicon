import { customerReviews } from "@/data/reviews";
import SectionHeader from "./ui/SectionHeader";
import ScrollCarousel from "./ui/ScrollCarousel";

function Stars({ rating }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`size-4 ${i < rating ? "text-brand" : "text-white/20"}`}
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ name, location, product, rating, text }) {
  return (
    <figure className="flex h-72 w-[82vw] max-w-sm flex-col rounded-xl bg-ink p-6 text-white sm:h-60 sm:w-md sm:max-w-none sm:p-8 lg:h-72 lg:w-152">
      <Stars rating={rating} />

      <blockquote className="mt-5 line-clamp-6 text-sm sm:line-clamp-4 leading-relaxed text-white/85 sm:text-base">
        &ldquo;{text}&rdquo;
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3 pt-6">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-ink"
        >
          {name[0]}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {name}
            {location && <span className="font-normal text-white/50"> · {location}</span>}
          </span>
          <span className="block truncate text-xs text-white/50">Bought {product}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function CustomerReviews() {
  return (
    <section aria-labelledby="customer-reviews" className="bg-white py-14 sm:py-16">
      <SectionHeader
        id="customer-reviews"
        title="Customer Reviews."
        subtitle="A reason for you to start making that quick order"
      >
        We&apos;re showcasing African digital innovation across multiple industries, providing
        resources to help teams build products that truly resonate with their users. By curating
        these real-world solutions, we aim to help designers, developers, and product teams create
        impactful and relevant user experiences that drive growth and innovation across the
        continent.
      </SectionHeader>

      <ScrollCarousel label="Customer reviews" gap="gap-4" className="mt-12 sm:mt-14">
        {customerReviews.map((r, i) => (
          <ReviewCard key={i} {...r} />
        ))}
      </ScrollCarousel>
    </section>
  );
}
