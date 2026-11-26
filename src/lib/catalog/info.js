// Photos, specs and description for a product, wherever they live: products added/edited in the
// admin carry their own; the original sample catalogue keeps them in src/data/productDetails.js.
import { productDetails } from "@/data/productDetails";

export function productInfo(product) {
  if (product.source === "admin") {
    return { variants: product.variants ?? [], specs: product.specs ?? {}, description: product.description ?? "" };
  }
  const d = productDetails[product.detailsId] ?? {};
  return {
    variants: d.variants ?? [{ color: product.color, images: [product.image] }],
    specs: d.specs ?? {},
    description: d.description ?? "",
  };
}
