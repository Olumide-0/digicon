// Brand shop pages and the deals page. Each entry decides which products appear and
// which filters the sidebar shows (in the order listed).
//
// Filter types:
//   { type: "price" }                       Min/Max + Apply
//   { type: "colors" } / "storage" / "brands"   options built from the products shown
//   { type: "models", title, options }      fixed list from the design (e.g. AirPods models);
//                                           ticking options across all "models" groups shows
//                                           products matching ANY of them
//   { type: "category" }                    Phones / Tablets / Accessories radio

const INTRO =
  "We're showcasing African digital innovation across multiple industries, providing resources to help teams build products that truly resonate with their users.";

const iphoneSwitch = [
  { label: "All Models", href: "/shop/iphone" },
  { label: "Accessories", href: "/shop/iphone/accessories" },
];
const pixelSwitch = [
  { label: "All Phones", href: "/shop/pixel" },
  { label: "Accessories", href: "/shop/pixel/accessories" },
];

export const collections = {
  iphone: {
    path: "/shop/iphone",
    title: "Shop iPhone",
    crumb: "iPhones",
    intro: INTRO,
    switcher: iphoneSwitch,
    match: (p) => p.line === "iPhone",
    filters: [{ type: "price" }, { type: "colors" }, { type: "storage" }],
  },
  "iphone/accessories": {
    path: "/shop/iphone/accessories",
    title: "Shop iPhone Accessories",
    crumb: "iPhone Accessories",
    intro: INTRO,
    switcher: iphoneSwitch,
    match: (p) => p.category === "Accessories" && p.for === "iPhone",
    filters: [
      { type: "price" },
      {
        type: "models",
        title: "Phone Case",
        options: ["iPhone 16 series", "iPhone 15 series", "iPhone 14 series", "iPhone 13 series", "iPhone 12 series", "iPhone 11 series"],
      },
      { type: "models", title: "AirPods", options: ["AirPods 4", "AirPods Pro 2", "AirPods Max"] },
      {
        type: "models",
        title: "iWatch",
        options: ["Series 4", "Series 5", "Series 6", "Series 7", "Series 8", "Series 9", "Series 10", "Ultra 2"],
      },
      { type: "colors" },
    ],
  },
  pixel: {
    path: "/shop/pixel",
    title: "Shop Pixel",
    crumb: "Pixel",
    intro: INTRO,
    switcher: pixelSwitch,
    match: (p) => p.line === "Pixel",
    filters: [{ type: "price" }, { type: "colors" }, { type: "storage" }],
  },
  "pixel/accessories": {
    path: "/shop/pixel/accessories",
    title: "Shop Pixel Accessories",
    crumb: "Pixel Accessories",
    intro: INTRO,
    switcher: pixelSwitch,
    match: (p) => p.category === "Accessories" && p.for === "Pixel",
    filters: [
      { type: "price" },
      {
        type: "models",
        title: "Phone Case",
        options: ["Pixel 9 Pro Fold", "Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 9a", "Pixel 8a", "Pixel 8 Pro", "Pixel 8", "Pixel 7a", "Pixel 7 Pro", "Pixel 7"],
      },
      { type: "models", title: "Earphones & Headphones", options: ["Pixel Buds Pro 2", "Pixel Buds A-Series"] },
      {
        type: "models",
        title: "Watches and Trackers",
        options: ["Google Pixel Watch 3", "Google Pixel Watch 2", "Google Pixel Watch", "Fitbit Ace LTE", "Fitbit Sense 2", "Fitbit Versa 4", "Fitbit Charge 6"],
      },
      { type: "colors" },
    ],
  },
  deals: {
    path: "/deals",
    title: "All 20% Fresh Deals Gadgets",
    crumb: "Fresh deals gadget",
    intro: INTRO,
    match: (p) => Boolean(p.deal),
    filters: [{ type: "category" }, { type: "brands" }, { type: "colors" }],
  },
};

// ── Series pages (/series/<slug>) — opened by "View Series" on the home page ──
// Each lists the devices (not accessories) whose name starts with the series name.
const SERIES = [
  { slug: "iphone-16", title: "iPhone 16 Series", starts: "iPhone 16" },
  { slug: "iphone-15", title: "iPhone 15 Series", starts: "iPhone 15" },
  { slug: "iphone-14", title: "iPhone 14 Series", starts: "iPhone 14" },
  { slug: "iphone-13", title: "iPhone 13 Series", starts: "iPhone 13" },
  { slug: "pixel-9", title: "Pixel 9 Series", starts: "Pixel 9" },
  { slug: "pixel-8", title: "Pixel 8 Series", starts: "Pixel 8" },
  { slug: "galaxy-s24", title: "Galaxy S24 Series", starts: "Galaxy S24" },
  { slug: "ipad-pro", title: "iPad Pro Series", starts: "iPad Pro" },
];

const startsWithModel = (name, prefix) => name === prefix || name.startsWith(prefix + " ");

for (const s of SERIES) {
  collections[`series/${s.slug}`] = {
    path: `/series/${s.slug}`,
    title: s.title,
    crumb: s.title,
    intro: INTRO,
    match: (p) => p.category !== "Accessories" && startsWithModel(p.name, s.starts),
    filters: [{ type: "price" }, { type: "colors" }, { type: "storage" }],
  };
}

export const seriesSlugs = SERIES.map((s) => s.slug);
