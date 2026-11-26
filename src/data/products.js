import { slugify } from "./categories";
import { productDetails } from "./productDetails";

// SAMPLE CATALOGUE. These 48 products are copied into the admin product store
// (.data/catalog.json, see src/lib/catalog/store.js) the first time the site runs. After that the
// store is what the shop shows, and products are managed from Admin → Products Mgt.
// Editing this list later does NOT change an existing store.
//
// category: "Phones" | "Tablets" | "Accessories"
// stock (optional): units available. ≤10 shows "N units left" in red; 0 = out of stock.
// deal (optional): % off. The listed `price` is the normal price; the sale price and
//                  crossed-out old price are worked out below and used everywhere.
// for / model (accessories): which device family it's for, and the model it's filtered
//                  under on the Shop … Accessories pages (e.g. "AirPods Pro 2", "iPhone 15 series").
export const sampleProducts = [
  // iPhone
  { name: "iPhone 16 Pro Max", brand: "Apple", color: "Desert Titanium", category: "Phones", spec: "6.9″ Super Retina XDR • 256GB", price: 2150000, stock: 5, deal: 20, image: "/images/products/iphone-16-pro.png" },
  { name: "iPhone 16 Pro", brand: "Apple", color: "Desert Titanium", category: "Phones", spec: "6.3″ Super Retina XDR • 128GB", price: 1850000, deal: 20, image: "/images/products/iphone-16-pro.png" },
  { name: "iPhone 16 Plus", brand: "Apple", color: "Ultramarine", category: "Phones", spec: "6.7″ Super Retina XDR • 128GB", price: 1650000, image: "/images/products/iphone-16-plus/ultramarine.png" },
  { name: "iPhone 16", brand: "Apple", color: "Ultramarine", category: "Phones", spec: "6.1″ Super Retina XDR • 128GB", price: 1450000, image: "/images/products/iphone-16.png" },
  { name: "iPhone 15 Pro Max", brand: "Apple", color: "Black Titanium", category: "Phones", spec: "6.7″ Super Retina XDR • 256GB", price: 1650000, deal: 20, image: "/images/series/iphone-15.png" },
  { name: "iPhone 15 Pro", brand: "Apple", color: "Black Titanium", category: "Phones", spec: "6.1″ Super Retina XDR • 128GB", price: 1420000, image: "/images/series/iphone-15.png" },
  { name: "iPhone 15 Plus", brand: "Apple", color: "Blue", category: "Phones", spec: "6.7″ Super Retina XDR • 128GB", price: 1250000, image: "/images/products/iphone-15-plus/blue.png" },
  { name: "iPhone 15", brand: "Apple", color: "Pink", category: "Phones", spec: "6.1″ Super Retina XDR • 128GB", price: 1100000, deal: 20, image: "/images/products/iphone-15/pink.png" },
  { name: "iPhone 14 Pro Max", brand: "Apple", color: "Space Black", category: "Phones", spec: "6.7″ Super Retina XDR • 128GB", price: 1290000, image: "/images/products/iphone-14-pro-max/space-black.png" },
  { name: "iPhone 14 Pro", brand: "Apple", color: "Deep Purple", category: "Phones", spec: "6.1″ Super Retina XDR • 128GB", price: 1150000, image: "/images/products/iphone-14-pro/deep-purple.png" },
  { name: "iPhone 14 Plus", brand: "Apple", color: "Purple", category: "Phones", spec: "6.7″ Super Retina XDR • 128GB", price: 990000, image: "/images/products/iphone-14-plus/purple.png" },
  { name: "iPhone 14", brand: "Apple", color: "Blue", category: "Phones", spec: "6.1″ Super Retina XDR • 128GB", price: 890000, image: "/images/products/iphone-14/blue.png" },
  { name: "iPhone 13 Pro Max", brand: "Apple", color: "Sierra Blue", category: "Phones", spec: "6.7″ Super Retina XDR • 128GB", price: 990000, image: "/images/products/iphone-13-pro-max/sierra-blue.png" },
  { name: "iPhone 13 Pro", brand: "Apple", color: "Alpine Green", category: "Phones", spec: "6.1″ Super Retina XDR • 128GB", price: 890000, image: "/images/products/iphone-13-pro/alpine-green.png" },
  { name: "iPhone 13", brand: "Apple", color: "Green", category: "Phones", spec: "6.1″ Super Retina XDR • 128GB", price: 690000, image: "/images/products/iphone-13/green.png" },
  { name: "iPhone 13 mini", brand: "Apple", color: "Pink", category: "Phones", spec: "5.4″ Super Retina XDR • 128GB", price: 590000, image: "/images/products/iphone-13-mini/pink.png" },
  // Google Pixel
  { name: "Pixel 9 Pro Fold", brand: "Google Pixel", color: "Obsidian", category: "Phones", spec: "8″ Super Actua Flex display • 256GB", price: 2400000, image: "/images/products/pixel-9-pro-fold.png" },
  { name: "Pixel 9 Pro", brand: "Google Pixel", color: "Porcelain", category: "Phones", spec: "6.3″ Super Actua display • 128GB", price: 1250000, deal: 20, image: "/images/products/pixel-9-pro.png" },
  { name: "Pixel 9", brand: "Google Pixel", color: "Peony", category: "Phones", spec: "6.3″ Actua display • 128GB", price: 980000, image: "/images/products/pixel-9.png" },
  { name: "Pixel 8 Pro", brand: "Google Pixel", color: "Bay", category: "Phones", spec: "6.7″ Super Actua display • 128GB", price: 850000, deal: 20, image: "/images/series/pixel-8.png" },
  // Samsung
  { name: "Galaxy S24", brand: "Samsung", color: "Cobalt Violet", category: "Phones", spec: "6.2″ Dynamic AMOLED 2X • 256GB", price: 1150000, deal: 20, image: "/images/series/galaxy-s24.png" },
  { name: "Galaxy Z Fold6", brand: "Samsung", color: "Crafted Black", category: "Phones", spec: "7.6″ Foldable AMOLED • 256GB", price: 2300000, image: "/images/categories/samsung.png" },
  // Tablets
  { name: "iPad Pro 13″ (M4)", brand: "Apple", color: "Space Black", category: "Tablets", spec: "Ultra Retina XDR • 256GB", price: 2100000, image: "/images/series/ipad-pro.png" },
  { name: "iPad Air 11″ (M2)", brand: "Apple", color: "Blue", category: "Tablets", spec: "Liquid Retina • 128GB", price: 1050000, deal: 20, image: "/images/categories/ipad.png" },
  // Accessories
  { name: "AirPods Pro 2", brand: "Apple", color: "White", category: "Accessories", for: "iPhone", model: "AirPods Pro 2", spec: "Active Noise Cancellation • USB-C", price: 380000, deal: 20, image: "/images/categories/airpods.png" },
  { name: "Apple Pencil", brand: "Apple", color: "White", category: "Accessories", for: "iPad", model: "Apple Pencil", spec: "For iPad • Lightning", price: 150000, image: "/images/accessories/apple-pencil.png" },
  { name: "iPhone FineWoven Case", brand: "Apple", color: "Taupe", category: "Accessories", for: "iPhone", model: "iPhone 15 series", spec: "MagSafe • iPhone 15 Pro", price: 85000, image: "/images/accessories/phone-case.png" },
  { name: "iPad Smart Folio", brand: "Apple", color: "Sage", category: "Accessories", for: "iPad", model: "Smart Folio", spec: "Magnetic cover • iPad mini", price: 95000, image: "/images/accessories/ipad-cover.png" },
  { name: "Apple Watch Ultra 2", brand: "Apple", color: "Black", category: "Accessories", for: "iPhone", model: "Ultra 2", spec: "49mm Titanium • Milanese Loop", price: 1200000, image: "/images/categories/apple-watch.png" },
  { name: "iPhone 16 Plus Silicone Case with MagSafe – Fuchsia", brand: "Apple", color: "Fuchsia", category: "Accessories", for: "iPhone", model: "iPhone 16 series", spec: "Silicone • MagSafe • iPhone 16 Plus", price: 75000, image: "/images/products/apple-accessories/silicone-case-iphone-16-plus-fuchsia.png" },
  { name: "Beats iPhone 16 Pro Case with MagSafe – Summit Stone", brand: "Apple", color: "Summit Stone", category: "Accessories", for: "iPhone", model: "iPhone 16 series", spec: "Rugged • MagSafe • iPhone 16 Pro", price: 70000, image: "/images/products/apple-accessories/beats-case-iphone-16-pro-summit-stone.png" },
  { name: "iPhone FineWoven Wallet with MagSafe – Blackberry", brand: "Apple", color: "Blackberry", category: "Accessories", for: "iPhone", model: "Wallet", spec: "FineWoven • MagSafe • Holds 3 cards", price: 85000, image: "/images/products/apple-accessories/finewoven-wallet-blackberry.png" },
  { name: "20W USB-C Power Adapter", brand: "Apple", color: "White", category: "Accessories", for: "iPhone", model: "Power Adapter", spec: "20W • USB-C • Fast charging", price: 35000, image: "/images/products/apple-accessories/20w-usb-c-power-adapter.png" },
  { name: "MagSafe Charger (1 m)", brand: "Apple", color: "White", category: "Accessories", for: "iPhone", model: "MagSafe Charger", spec: "Up to 25W • USB-C • 1 m cable", price: 65000, image: "/images/products/apple-accessories/magsafe-charger.png" },
  { name: "AirPods Max – Orange", brand: "Apple", color: "Orange", category: "Accessories", for: "iPhone", model: "AirPods Max", spec: "Over-ear • ANC • USB-C", price: 950000, image: "/images/products/apple-accessories/airpods-max-orange.png" },
  // Pixel accessories
  { name: "Pixel 9, 9 Pro & 9 Pro XL Case", brand: "Google Pixel", color: "Obsidian", category: "Accessories", for: "Pixel", model: ["Pixel 9", "Pixel 9 Pro", "Pixel 9 Pro XL"], spec: "Soft-touch • Pixel 9 / 9 Pro / 9 Pro XL", price: 35000, image: "/images/products/pixel-accessories/pixel-9-case-obsidian.png" },
  { name: "Pixel 9 Pro Fold Case", brand: "Google Pixel", color: "Obsidian", category: "Accessories", for: "Pixel", model: "Pixel 9 Pro Fold", spec: "Slim • Soft-touch • Pixel 9 Pro Fold", price: 42000, image: "/images/products/pixel-accessories/pixel-9-pro-fold-case-obsidian.png" },
  { name: "Pixel 9a Case", brand: "Google Pixel", color: "Mint Green", category: "Accessories", for: "Pixel", model: "Pixel 9a", spec: "Soft-touch • Pixel 9a", price: 30000, image: "/images/products/pixel-accessories/pixel-9a-case-mint.png" },
  { name: "Pixel 8 Pro Case", brand: "Google Pixel", color: "Bay", category: "Accessories", for: "Pixel", model: "Pixel 8 Pro", spec: "Soft-touch • Pixel 8 Pro", price: 30000, image: "/images/products/pixel-accessories/pixel-8-pro-case-bay.png" },
  { name: "Pixel Buds Pro 2", brand: "Google Pixel", color: "Porcelain", category: "Accessories", for: "Pixel", model: "Pixel Buds Pro 2", spec: "Active Noise Cancellation • Wireless charging", price: 190000, image: "/images/products/pixel-accessories/pixel-buds-pro-2-porcelain.png" },
  { name: "Pixel Watch Performance Loop Band", brand: "Google Pixel", color: "Dark Green", category: "Accessories", for: "Pixel", model: ["Google Pixel Watch 3", "Google Pixel Watch 2", "Google Pixel Watch"], spec: "Woven nylon • Adjustable", price: 45000, image: "/images/products/pixel-accessories/pixel-watch-performance-loop-band.png" },
  { name: "Pixel Watch Metal Links Band", brand: "Google Pixel", color: "Obsidian", category: "Accessories", for: "Pixel", model: ["Google Pixel Watch 3", "Google Pixel Watch 2", "Google Pixel Watch"], spec: "Stainless steel • Folding clasp", price: 85000, image: "/images/products/pixel-accessories/pixel-watch-metal-links-band.png" },
  { name: "Pixel Watch Crafted Leather Band", brand: "Google Pixel", color: "Slate Blue", category: "Accessories", for: "Pixel", model: ["Google Pixel Watch 3", "Google Pixel Watch 2", "Google Pixel Watch"], spec: "Leather • Stainless steel buckle", price: 55000, image: "/images/products/pixel-accessories/pixel-watch-crafted-leather-band.png" },
  { name: "Spigen Rugged Armor Case – Pixel Buds Pro 2", brand: "Spigen", color: "Black", category: "Accessories", for: "Pixel", model: "Pixel Buds Pro 2", spec: "Shock-absorbing • Carabiner included", price: 22000, image: "/images/products/pixel-accessories/spigen-rugged-armor-buds-case.png" },
  { name: "Spigen Clear Case with Carabiner – Pixel Buds Pro 2", brand: "Spigen", color: "Clear", category: "Accessories", for: "Pixel", model: "Pixel Buds Pro 2", spec: "Crystal clear • Carabiner included", price: 18000, image: "/images/products/pixel-accessories/spigen-clear-buds-case.png" },
  { name: "Bellroy Leather Case – Pixel Buds Pro 2", brand: "Bellroy", color: "Terracotta", category: "Accessories", for: "Pixel", model: "Pixel Buds Pro 2", spec: "Premium leather • Snug fit", price: 48000, image: "/images/products/pixel-accessories/bellroy-buds-case-terracotta.png" },
  { name: "Fitbit Charge 6, Charge 5 & 5 Luxe Charging Cable", brand: "Fitbit", color: "Black", category: "Accessories", for: "Pixel", model: ["Fitbit Charge 6"], spec: "Magnetic clip • USB-A", price: 25000, image: "/images/products/pixel-accessories/fitbit-charge-charging-cable.png" },
  { name: "Galaxy Buds3 Pro", brand: "Samsung", color: "Silver", category: "Accessories", for: "Samsung", model: "Galaxy Buds3 Pro", spec: "ANC • 360 Audio", price: 260000, image: "/images/categories/galaxy-buds.png" },
];

// Card photos: the product's own photo first, then one photo per other colour
// (shown as dots under the image on product cards, max 4).
function cardImages(variants = [], mainImage, mainColor) {
  const others = variants.filter((v) => v.color !== mainColor).map((v) => ({ color: v.color, src: v.images[0] }));
  return [{ color: mainColor, src: mainImage }, ...others].slice(0, 4);
}

// Groups marketing colour names into simple families for the "Colors" filter.
const FAMILIES = [
  [/blackberry|purple|violet|mulberry/i, "Purple"],
  [/black|midnight|obsidian|onyx/i, "Black"],
  [/starlight/i, "Starlight"],
  [/white|porcelain|summit stone/i, "White"],
  [/space gr[ae]y|graphite|marble|hazel|gr[ae]y/i, "Space Gray"],
  [/silver|natural/i, "Silver"],
  [/rose gold|desert|gold/i, "Gold"],
  [/ultramarine|blue|bay|denim/i, "Blue"],
  [/teal|green|sage/i, "Green"],
  [/pink|peony|rose quartz|fuchsia/i, "Pink"],
  [/red/i, "Red"],
  [/orange|terracotta/i, "Orange"],
  [/yellow/i, "Yellow"],
  [/taupe|brown/i, "Brown"],
];
export const colorFamily = (name) => FAMILIES.find(([re]) => re.test(name))?.[1] ?? name;

// "256GB / 512GB / 1TB, 8GB RAM" -> ["256GB", "512GB", "1TB"]
function storageOptions(specs) {
  const internal = specs?.Memory?.Internal;
  if (typeof internal !== "string") return [];
  return internal
    .split(",")[0]
    .split(/[\/;]| with /)
    .map((s) => s.trim())
    .filter((s) => /^\d+(GB|TB)$/.test(s));
}

const roundTo = (n, step) => Math.round(n / step) * step;

// Store record -> the product object the shop uses. detailsId points at the photos/specs in
// productDetails (a duplicated product shares its original's until it gets its own).
export function deriveProduct(p) {
  const id = p.id ?? slugify(p.name);
  const detailsId = p.detailsId ?? id;
  // Products added in the admin carry their own photos/specs; the samples use productDetails.
  const variants = p.variants ?? productDetails[detailsId]?.variants;
  const colors = variants?.map((v) => v.color) ?? [p.color];
  // Product line for the brand shop pages (devices only — accessories use `for`).
  const line =
    p.category === "Accessories" ? null : /^iPhone/.test(p.name) ? "iPhone" : /^Pixel/.test(p.name) ? "Pixel" : /^iPad/.test(p.name) ? "iPad" : null;
  const sale = p.deal ? { price: roundTo(p.price * (1 - p.deal / 100), 1000), oldPrice: p.price } : {};
  return {
    ...p,
    ...sale,
    id,
    detailsId,
    line,
    colors,
    colorFamilies: [...new Set(colors.map(colorFamily))],
    storage: storageOptions(p.specs ?? productDetails[detailsId]?.specs),
    cardImages: cardImages(variants, p.image, p.color),
  };
}

export const productCategories = ["Phones", "Tablets", "Accessories"];

export const formatNaira = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
