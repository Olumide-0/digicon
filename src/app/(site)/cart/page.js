import CartView from "@/components/cart/CartView";
import { getProducts } from "@/lib/catalog/store";

export const metadata = { title: "My Cart" };

export default async function CartPage() {
  return <CartView products={await getProducts()} />;
}
