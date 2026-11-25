import { recommendedAccessories } from "@/data/accessories";
import SectionHeader from "./ui/SectionHeader";
import ScrollCarousel from "./ui/ScrollCarousel";
import SeriesCard from "./ui/SeriesCard";

export default function RecommendedAccessories() {
  return (
    <section aria-labelledby="recommended-accessories" className="bg-white py-14 sm:py-16">
      <SectionHeader
        id="recommended-accessories"
        title="Recommended Accessories."
        subtitle="Perfect Pairings for Your Gadgets"
      >
        We&apos;re showcasing African digital innovation across multiple industries, providing
        resources to help teams build products that truly resonate with their users. By curating
        these real-world solutions, we aim to help designers, developers, and product teams create
        impactful and relevant user experiences that drive growth and innovation across the
        continent.
      </SectionHeader>

      <ScrollCarousel label="Recommended accessories" gap="gap-4" fill className="mt-12 sm:mt-14">
        {recommendedAccessories.map((a) => (
          <SeriesCard key={a.name} {...a} imageDir="accessories" ctaLabel="Shop Now" />
        ))}
      </ScrollCarousel>
    </section>
  );
}
