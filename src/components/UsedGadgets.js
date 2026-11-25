import { usedSeries } from "@/data/series";
import SectionHeader from "./ui/SectionHeader";
import ScrollCarousel from "./ui/ScrollCarousel";
import SeriesCard from "./ui/SeriesCard";

export default function UsedGadgets() {
  return (
    <section aria-labelledby="used-gadgets" className="bg-white py-14 sm:py-16">
      <SectionHeader
        id="used-gadgets"
        title="Grade A UK Used Gadgets."
        subtitle="The best gadget that fits in your budget anytime."
      >
        We&apos;re showcasing African digital innovation across multiple industries, providing
        resources to help teams build products that truly resonate with their users. By curating
        these real-world solutions, we aim to help designers, developers, and product teams create
        impactful and relevant user experiences that drive growth and innovation across the
        continent.
      </SectionHeader>

      <ScrollCarousel label="UK used gadgets" gap="gap-4" fill className="mt-12 sm:mt-14">
        {usedSeries.map((s) => (
          <SeriesCard key={s.name} {...s} />
        ))}
      </ScrollCarousel>
    </section>
  );
}
