import Link from "next/link";
import { featuredCategories, slugify } from "@/data/categories";
import SectionHeader from "./ui/SectionHeader";
import ScrollCarousel from "./ui/ScrollCarousel";
import ProductImage from "./ui/ProductImage";

function CategoryTile({ name, image, href }) {
  return (
    <Link
      href={href ?? `/categories/${slugify(name)}`}
      className="group flex w-28 flex-col items-center sm:w-36"
    >
      <div className="relative size-24 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105 sm:size-28">
        <ProductImage src={`/images/categories/${image}.png`} name={name} sizes="112px" />
      </div>
      <span className="mt-6 text-center text-sm font-medium whitespace-nowrap text-ink transition-colors group-hover:text-brand">
        {name}
      </span>
    </Link>
  );
}

export default function ShopByCategory() {
  return (
    <section aria-labelledby="shop-by-category" className="bg-white py-14 sm:py-16">
      <SectionHeader
        id="shop-by-category"
        title="Shop by Categories."
        subtitle="The best way to buy the products you love."
      >
        At Digicon, we make it easy for you to find the perfect gadget. Whether you&apos;re after
        the latest iPhone, smartwatches, or high-tech accessories, explore our wide selection
        tailored to your lifestyle
      </SectionHeader>

      <ScrollCarousel label="Product categories" className="mt-12 sm:mt-16">
        {featuredCategories.map((c) => (
          <CategoryTile key={c.name} {...c} />
        ))}
      </ScrollCarousel>
    </section>
  );
}
