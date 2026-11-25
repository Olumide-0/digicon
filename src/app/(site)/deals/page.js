import CollectionPage from "@/components/shop/CollectionPage";

export const metadata = { title: "20% Fresh Deals" };

// Linked from the hero's "Get 20% Off" button.
export default function DealsPage() {
  return <CollectionPage collectionKey="deals" />;
}
