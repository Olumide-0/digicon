import Hero from "@/components/Hero";
import ShopByCategory from "@/components/ShopByCategory";
import FreshlyNewBuy from "@/components/FreshlyNewBuy";
import UsedGadgets from "@/components/UsedGadgets";
import RecommendedAccessories from "@/components/RecommendedAccessories";
import CustomerUnboxing from "@/components/CustomerUnboxing";
import CustomerReviews from "@/components/CustomerReviews";

export default function Home() {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <FreshlyNewBuy />
      <UsedGadgets />
      <RecommendedAccessories />
      <CustomerUnboxing />
      <CustomerReviews />
    </>
  );
}
