import { notFound } from "next/navigation";
import { collections } from "@/data/collections";
import CollectionPage from "@/components/shop/CollectionPage";

// /series/iphone-16, /series/pixel-9, … — linked from "View Series" on the home page.
// The list of series comes from the "series/<slug>" entries in data/collections.js.
const slugs = () =>
  Object.keys(collections)
    .filter((k) => k.startsWith("series/"))
    .map((k) => k.slice("series/".length));

export const dynamicParams = false;

export function generateStaticParams() {
  return slugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: collections[`series/${slug}`]?.title };
}

export default async function SeriesPage({ params }) {
  const { slug } = await params;
  if (!slugs().includes(slug)) notFound();
  return <CollectionPage collectionKey={`series/${slug}`} />;
}
