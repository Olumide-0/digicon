import Link from "next/link";
import { collections } from "@/data/collections";
import { getProducts } from "@/lib/catalog/store";
import CollectionListing from "./CollectionListing";

// Page shell (breadcrumb + listing) shared by /shop/* and /deals.
export default async function CollectionPage({ collectionKey }) {
  const config = collections[collectionKey];
  const products = await getProducts();
  return (
    <div className="min-h-[85vh] bg-[#f4f4f6] px-4 pt-6 pb-16 text-ink sm:px-8 lg:px-12 xl:px-16">
      <nav aria-label="Breadcrumb" className="mb-6 lg:mb-4 lg:ml-70 xl:ml-72">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs">
          <li className="flex items-center gap-1.5">
            <Link href="/" className="text-brand hover:underline">
              Home
            </Link>
            <span aria-hidden className="text-neutral-400">
              ›
            </span>
          </li>
          <li aria-current="page" className="text-neutral-500">
            {config.crumb}
          </li>
        </ol>
      </nav>
      <CollectionListing collectionKey={collectionKey} products={products} />
    </div>
  );
}
