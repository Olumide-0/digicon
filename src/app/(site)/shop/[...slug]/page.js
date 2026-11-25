import { notFound } from "next/navigation";
import { collections } from "@/data/collections";
import CollectionPage from "@/components/shop/CollectionPage";

// /shop/iphone, /shop/iphone/accessories, /shop/pixel, /shop/pixel/accessories
const shopKeys = Object.keys(collections).filter((k) => k !== "deals" && !k.startsWith("series/"));

export const dynamicParams = false;

export function generateStaticParams() {
  return shopKeys.map((k) => ({ slug: k.split("/") }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const config = collections[slug.join("/")];
  return config ? { title: config.title } : {};
}

export default async function ShopPage({ params }) {
  const { slug } = await params;
  const key = slug.join("/");
  if (!shopKeys.includes(key)) notFound();
  return <CollectionPage collectionKey={key} />;
}
