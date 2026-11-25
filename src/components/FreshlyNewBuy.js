import { newSeries } from "@/data/series";
import SectionHeader from "./ui/SectionHeader";
import ScrollCarousel from "./ui/ScrollCarousel";
import SeriesCard from "./ui/SeriesCard";

export default function FreshlyNewBuy() {
  return (
    <section aria-labelledby="freshly-new-buy" className="bg-[#f4f4f6] py-14 sm:py-16">
      <SectionHeader
        id="freshly-new-buy"
        title="Freshly New Buy."
        subtitle="Get Your Hands on the Latest Tech."
      >
        We&apos;re showcasing African digital innovation across multiple industries, providing
        resources to help teams build products that truly resonate with their users. By curating
        these real-world solutions, we aim to help designers, developers, and product teams create
        impactful and relevant user experiences that drive growth and innovation across the
        continent.
      </SectionHeader>

      <ScrollCarousel label="New product series" gap="gap-4" fill className="mt-12 sm:mt-14">
        {newSeries.map((s) => (
          <SeriesCard key={s.name} {...s} />
        ))}
      </ScrollCarousel>
    </section>
  );
}
