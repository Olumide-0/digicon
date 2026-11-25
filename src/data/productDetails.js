// Extra detail for the product page, keyed by product id (see products.js).
//
// COLOURS: add a `variants` list to give a product colour swatches. Each colour needs
// its own photo(s) — picking the swatch swaps the gallery to those photos:
//   variants: [
//     { color: "Midnight", hex: "#232a31", images: ["/images/products/iphone-13/midnight.png"] },
//     { color: "Pink",     hex: "#f9dcd6", images: ["/images/products/iphone-13/pink.png", "...back.png"] },
//   ],
// `hex` is the swatch colour (optional if the name exists in `colorHex` below).
// Without `variants`, the product shows one swatch using its main photo/colour from products.js.
// Specs are taken from manufacturers' published figures; double-check against your
// exact stock (region/model variants differ) before going live.
// In a value array, "" adds a paragraph gap.

// Swatch colours used by the colour picker.
export const colorHex = {
  Black: "#1f1f1f",
  White: "#f2f0eb",
  Gold: "#e3c9a8",
  Silver: "#d4d4d4",
  Gray: "#8a8a8f",
  Blue: "#7b93d6",
  Green: "#3f5b47",
  Pink: "#f4a3b5",
  Purple: "#7c6ca8",
  Red: "#c8102e",
  Yellow: "#f3d36b",
  Brown: "#8b6b4e",
  Teal: "#7fb8b0",
};

const appleExtras = ["Apple Pay (Visa, MasterCard, AMEX certified)"];
const noJack = { Loudspeaker: "Yes, with stereo speakers", "3.5mm jack": "No" };

// Builds the 8 spec groups used on the product page for phones and tablets.
function deviceSpecs(d) {
  return {
    Network: {
      Technology: d.network ?? "GSM / CDMA / HSPA / EVDO / LTE / 5G",
      ...(d.wifi && { "Wi-Fi": d.wifi }),
    },
    Body: {
      Dimensions: d.dims,
      Weight: d.weight,
      Build: d.build,
      Display: d.display,
      SIM: [d.sim ?? "Nano-SIM and eSIM", "", d.protection, ...(d.extras ?? [])].filter(
        (v, i, a) => v !== undefined && !(v === "" && i === a.length - 1)
      ),
    },
    Platform: { OS: d.os, Chipset: d.chipset, CPU: d.cpu },
    Memory: { "Card slot": "No", Internal: d.storage },
    "Main Camera": { [d.mainLabel]: d.main, Video: d.mainVideo },
    "Selfie Camera": { [d.selfieLabel ?? "Single"]: d.selfie, Video: d.selfieVideo },
    Battery: { Type: d.battery, Charging: d.charging },
    Sound: d.sound ?? noJack,
  };
}

const iphone16Pro = (dims, weight, display, battery, storage) =>
  deviceSpecs({
    dims,
    weight,
    display,
    build: "Glass front (Ceramic Shield), glass back, titanium frame (grade 5)",
    protection: "IP68 dust/water resistant (up to 6m for 30 min)",
    extras: appleExtras,
    os: "iOS 18",
    chipset: "Apple A18 Pro (3 nm)",
    cpu: "Hexa-core",
    storage,
    mainLabel: "Triple",
    main: [
      "48 MP, f/1.8, (wide), sensor-shift OIS",
      "12 MP, f/2.8, 5x optical zoom (periscope telephoto)",
      "48 MP, f/2.2, (ultrawide)",
    ],
    mainVideo: "4K@24/25/30/60/100/120fps, Dolby Vision HDR, ProRes",
    selfie: "12 MP, f/1.9, (wide)",
    selfieVideo: "4K@24/25/30/60fps",
    battery,
    charging: "Wired (USB-C), MagSafe and Qi2 wireless",
  });

const iphone15Pro = (dims, weight, display, battery, storage, tele) =>
  deviceSpecs({
    dims,
    weight,
    display,
    build: "Glass front (Ceramic Shield), glass back, titanium frame (grade 5)",
    protection: "IP68 dust/water resistant (up to 6m for 30 min)",
    extras: appleExtras,
    os: "iOS 17, upgradable to the latest iOS",
    chipset: "Apple A17 Pro (3 nm)",
    cpu: "Hexa-core",
    storage,
    mainLabel: "Triple",
    main: ["48 MP, f/1.8, (wide), sensor-shift OIS", tele, "12 MP, f/2.2, (ultrawide)"],
    mainVideo: "4K@24/25/30/60fps, Dolby Vision HDR, ProRes",
    selfie: "12 MP, f/1.9, (wide)",
    selfieVideo: "4K@24/25/30/60fps",
    battery,
    charging: "Wired (USB-C), MagSafe and Qi2 wireless",
  });

export const productDetails = {
  // ───────────── iPhone ─────────────
  "iphone-16-pro-max": {
    variants: [
      { color: "Desert Titanium", hex: "#bfa48f", images: ["/images/products/iphone-16-pro-max/desert-titanium.png", "/images/products/iphone-16-pro.png"] },
      { color: "Natural Titanium", hex: "#c2bcb2", images: ["/images/products/iphone-16-pro-max/natural-titanium.png"] },
      { color: "White Titanium", hex: "#f2f1ed", images: ["/images/products/iphone-16-pro-max/white-titanium.png"] },
      { color: "Black Titanium", hex: "#3c3c3d", images: ["/images/products/iphone-16-pro-max/black-titanium.png"] },
    ],
    description:
      "The largest iPhone display yet, with the A18 Pro chip, a 5x telephoto camera and Camera Control for fast, precise shots.",
    specs: iphone16Pro("163 x 77.6 x 8.3 mm", "227 g", "6.9″ Super Retina XDR OLED, 120Hz ProMotion", "Li-Ion 4685 mAh", "256GB / 512GB / 1TB, 8GB RAM"),
  },
  "iphone-16-pro": {
    variants: [
      { color: "Desert Titanium", hex: "#bfa48f", images: ["/images/products/iphone-16-pro/desert-titanium.png", "/images/products/iphone-16-pro.png"] },
      { color: "Natural Titanium", hex: "#c2bcb2", images: ["/images/products/iphone-16-pro/natural-titanium.png"] },
      { color: "White Titanium", hex: "#f2f1ed", images: ["/images/products/iphone-16-pro/white-titanium.png"] },
      { color: "Black Titanium", hex: "#3c3c3d", images: ["/images/products/iphone-16-pro/black-titanium.png"] },
    ],
    description:
      "Pro performance in a compact titanium design, with the A18 Pro chip, a 5x telephoto camera and Camera Control.",
    specs: iphone16Pro("149.6 x 71.5 x 8.3 mm", "199 g", "6.3″ Super Retina XDR OLED, 120Hz ProMotion", "Li-Ion 3582 mAh", "128GB / 256GB / 512GB / 1TB, 8GB RAM"),
  },
  "iphone-16": {
    variants: [
      { color: "Ultramarine", hex: "#9aadf6", images: ["/images/products/iphone-16/ultramarine.png", "/images/products/iphone-16.png"] },
      { color: "Teal", hex: "#b0d4d2", images: ["/images/products/iphone-16/teal.png"] },
      { color: "Pink", hex: "#f2adda", images: ["/images/products/iphone-16/pink.png"] },
      { color: "White", hex: "#fafafa", images: ["/images/products/iphone-16/white.png"] },
      { color: "Black", hex: "#3c4042", images: ["/images/products/iphone-16/black.png"] },
    ],
    description:
      "Built for Apple Intelligence, with the A18 chip, Camera Control and a 48 MP Fusion camera.",
    specs: deviceSpecs({
      dims: "147.6 x 71.6 x 7.8 mm",
      weight: "170 g",
      build: "Glass front (Ceramic Shield), glass back, aluminum frame",
      display: "6.1″ Super Retina XDR OLED, 60Hz",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 18",
      chipset: "Apple A18 (3 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB, 8GB RAM",
      mainLabel: "Dual",
      main: ["48 MP, f/1.6, (wide), sensor-shift OIS", "12 MP, f/2.2, (ultrawide)"],
      mainVideo: "4K@24/25/30/60fps, Dolby Vision HDR",
      selfie: "12 MP, f/1.9, (wide)",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 3561 mAh",
      charging: "Wired (USB-C), MagSafe and Qi2 wireless",
    }),
  },
  "iphone-15-pro-max": {
    variants: [
      { color: "Natural Titanium", hex: "#bab4a9", images: ["/images/products/iphone-15-pro-max/natural-titanium.png"] },
      { color: "Blue Titanium", hex: "#2f4452", images: ["/images/products/iphone-15-pro-max/blue-titanium.png"] },
      { color: "White Titanium", hex: "#f2f1eb", images: ["/images/products/iphone-15-pro-max/white-titanium.png"] },
      { color: "Black Titanium", hex: "#3b3b3c", images: ["/images/products/iphone-15-pro-max/black-titanium.png", "/images/series/iphone-15.png"] },
    ],
    description:
      "Titanium design, the A17 Pro chip and a 5x tetraprism telephoto camera on a big 6.7-inch display, with the Action button and USB-C.",
    specs: iphone15Pro(
      "159.9 x 76.7 x 8.3 mm",
      "221 g",
      "6.7″ Super Retina XDR OLED, 120Hz ProMotion",
      "Li-Ion 4441 mAh",
      "256GB / 512GB / 1TB, 8GB RAM",
      "12 MP, f/2.8, 5x optical zoom (periscope telephoto)"
    ),
  },
  "iphone-15-pro": {
    variants: [
      { color: "Natural Titanium", hex: "#bab4a9", images: ["/images/products/iphone-15-pro/natural-titanium.png"] },
      { color: "Blue Titanium", hex: "#2f4452", images: ["/images/products/iphone-15-pro/blue-titanium.png"] },
      { color: "White Titanium", hex: "#f2f1eb", images: ["/images/products/iphone-15-pro/white-titanium.png"] },
      { color: "Black Titanium", hex: "#3b3b3c", images: ["/images/products/iphone-15-pro/black-titanium.png", "/images/series/iphone-15.png"] },
    ],
    description:
      "A lighter titanium iPhone with the A17 Pro chip, a 3x telephoto camera, the customisable Action button and USB-C.",
    specs: iphone15Pro(
      "146.6 x 70.6 x 8.3 mm",
      "187 g",
      "6.1″ Super Retina XDR OLED, 120Hz ProMotion",
      "Li-Ion 3274 mAh",
      "128GB / 256GB / 512GB / 1TB, 8GB RAM",
      "12 MP, f/2.8, 3x optical zoom (telephoto)"
    ),
  },
  "iphone-14": {
    variants: [
      { color: "Blue", hex: "#a0b4c7", images: ["/images/products/iphone-14/blue.png", "/images/products/iphone-14.png"] },
      { color: "Purple", hex: "#e5ddea", images: ["/images/products/iphone-14/purple.png"] },
      { color: "Midnight", hex: "#222930", images: ["/images/products/iphone-14/midnight.png"] },
      { color: "Starlight", hex: "#faf6f2", images: ["/images/products/iphone-14/starlight.png"] },
      { color: "(PRODUCT)RED", hex: "#bf0013", images: ["/images/products/iphone-14/product-red.png"] },
      { color: "Yellow", hex: "#f9e479", images: ["/images/products/iphone-14/yellow.png"] },
    ],
    description:
      "A dependable everyday iPhone with the A15 Bionic chip, an improved main camera for low light and Crash Detection.",
    specs: deviceSpecs({
      dims: "146.7 x 71.5 x 7.8 mm",
      weight: "172 g",
      build: "Glass front (Ceramic Shield), glass back, aluminum frame",
      display: "6.1″ Super Retina XDR OLED, 60Hz",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 16, upgradable to the latest iOS",
      chipset: "Apple A15 Bionic (5 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB, 6GB RAM",
      mainLabel: "Dual",
      main: ["12 MP, f/1.5, (wide), sensor-shift OIS", "12 MP, f/2.4, (ultrawide)"],
      mainVideo: "4K@24/25/30/60fps, Dolby Vision HDR, Cinematic mode",
      selfie: "12 MP, f/1.9, (wide)",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 3279 mAh",
      charging: "Wired (Lightning), MagSafe and Qi wireless",
    }),
  },
  "iphone-13": {
    // Official Apple colours & product photos (store.storeimages.cdn-apple.com).
    variants: [
      { color: "Midnight", hex: "#232a31", images: ["/images/products/iphone-13/midnight.png"] },
      { color: "Starlight", hex: "#f7f1ea", images: ["/images/products/iphone-13/starlight.png"] },
      { color: "Blue", hex: "#276787", images: ["/images/products/iphone-13/blue.png"] },
      { color: "Pink", hex: "#f9dcd6", images: ["/images/products/iphone-13/pink.png"] },
      { color: "(PRODUCT)RED", hex: "#bf0013", images: ["/images/products/iphone-13/product-red.png"] },
      { color: "Green", hex: "#394c38", images: ["/images/products/iphone-13/green.png", "/images/series/iphone-13.png"] },
    ],
    description:
      "Great value with the A15 Bionic chip, a bright Super Retina XDR display and a dual-camera system with Cinematic mode.",
    specs: deviceSpecs({
      dims: "146.7 x 71.5 x 7.7 mm",
      weight: "173 g",
      build: "Glass front (Ceramic Shield), glass back, aluminum frame",
      display: "6.1″ Super Retina XDR OLED, 60Hz",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 15, upgradable to the latest iOS",
      chipset: "Apple A15 Bionic (5 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB, 4GB RAM",
      mainLabel: "Dual",
      main: ["12 MP, f/1.6, (wide), sensor-shift OIS", "12 MP, f/2.4, (ultrawide)"],
      mainVideo: "4K@24/30/60fps, Dolby Vision HDR, Cinematic mode",
      selfie: "12 MP, f/2.2, (wide)",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 3240 mAh",
      charging: "Wired (Lightning), MagSafe and Qi wireless",
    }),
  },

  // ───────────── Google Pixel ─────────────
  "pixel-9-pro-fold": {
    variants: [
      { color: "Obsidian", hex: "#2b2b2d", images: ["/images/products/pixel-9-pro-fold/obsidian.png","/images/products/pixel-9-pro-fold.png"] },
      { color: "Porcelain", hex: "#ece6dc", images: ["/images/products/pixel-9-pro-fold/porcelain.png"] },
    ],
    description:
      "Google's thinnest foldable opens into an 8-inch screen for multitasking, powered by Tensor G4 and Gemini AI.",
    specs: deviceSpecs({
      network: "GSM / HSPA / LTE / 5G",
      dims: ["Unfolded: 155.2 x 150.2 x 5.1 mm", "Folded: 155.2 x 77.1 x 10.5 mm"],
      weight: "257 g",
      build: "Glass front (Gorilla Glass Victus 2), plastic inner screen, glass back, aluminum frame",
      display: ["8.0″ LTPO OLED inner, 120Hz", "6.3″ OLED cover, 120Hz"],
      protection: "IPX8 water resistant (up to 1.5m for 30 min)",
      os: "Android 14, 7 major Android upgrades",
      chipset: "Google Tensor G4 (4 nm)",
      cpu: "Octa-core",
      storage: "256GB / 512GB, 16GB RAM",
      mainLabel: "Triple",
      main: [
        "48 MP, f/1.7, (wide), OIS",
        "10.8 MP, f/3.1, 5x optical zoom (telephoto)",
        "10.5 MP, f/2.2, (ultrawide)",
      ],
      mainVideo: "4K@24/30/60fps, 10-bit HDR",
      selfieLabel: "Dual",
      selfie: ["10 MP, f/2.2 (cover screen)", "10 MP, f/2.2 (inner screen)"],
      selfieVideo: "4K@24/30/60fps",
      battery: "Li-Po 4650 mAh",
      charging: "21W wired, 7.5W wireless",
    }),
  },
  "pixel-9-pro": {
    variants: [
      { color: "Porcelain", hex: "#ece6dc", images: ["/images/products/pixel-9-pro/porcelain.png","/images/products/pixel-9-pro.png"] },
      { color: "Rose Quartz", hex: "#f3c9d6", images: ["/images/products/pixel-9-pro/rose-quartz.png"] },
      { color: "Hazel", hex: "#8e968e", images: ["/images/products/pixel-9-pro/hazel.png"] },
      { color: "Obsidian", hex: "#2b2b2d", images: ["/images/products/pixel-9-pro/obsidian.png"] },
    ],
    description:
      "A pro-level camera system with 5x zoom, a 42 MP selfie camera and Tensor G4 with built-in Gemini, in a compact 6.3-inch size.",
    specs: deviceSpecs({
      network: "GSM / HSPA / LTE / 5G",
      dims: "152.8 x 72 x 8.5 mm",
      weight: "199 g",
      build: "Glass front & back (Gorilla Glass Victus 2), aluminum frame",
      display: "6.3″ LTPO OLED, 120Hz, up to 3000 nits",
      protection: "IP68 dust/water resistant (up to 1.5m for 30 min)",
      os: "Android 14, 7 major Android upgrades",
      chipset: "Google Tensor G4 (4 nm)",
      cpu: "Octa-core",
      storage: "128GB / 256GB / 512GB / 1TB, 16GB RAM",
      mainLabel: "Triple",
      main: [
        "50 MP, f/1.7, (wide), OIS",
        "48 MP, f/2.8, 5x optical zoom (periscope telephoto)",
        "48 MP, f/1.7, (ultrawide)",
      ],
      mainVideo: "4K@24/30/60fps, 8K via Video Boost",
      selfie: "42 MP, f/2.2, (ultrawide)",
      selfieVideo: "4K@24/30/60fps",
      battery: "Li-Ion 4700 mAh",
      charging: "27W wired, 21W wireless",
    }),
  },
  "pixel-9": {
    variants: [
      { color: "Peony", hex: "#f29bb0", images: ["/images/products/pixel-9/peony.png","/images/products/pixel-9.png"] },
      { color: "Obsidian", hex: "#2b2b2d", images: ["/images/products/pixel-9/obsidian.png","/images/series/pixel-9.png"] },
      { color: "Porcelain", hex: "#ece6dc", images: ["/images/products/pixel-9/porcelain.png"] },
      { color: "Wintergreen", hex: "#bfe3c8", images: ["/images/products/pixel-9/wintergreen.png"] },
    ],
    description:
      "Everyday Pixel with Tensor G4, a 50 MP main camera, Add Me and Magic Editor, and 7 years of updates.",
    specs: deviceSpecs({
      network: "GSM / HSPA / LTE / 5G",
      dims: "152.8 x 72 x 8.5 mm",
      weight: "198 g",
      build: "Glass front & back (Gorilla Glass Victus 2), aluminum frame",
      display: "6.3″ OLED, 120Hz, up to 2700 nits",
      protection: "IP68 dust/water resistant (up to 1.5m for 30 min)",
      os: "Android 14, 7 major Android upgrades",
      chipset: "Google Tensor G4 (4 nm)",
      cpu: "Octa-core",
      storage: "128GB / 256GB, 12GB RAM",
      mainLabel: "Dual",
      main: ["50 MP, f/1.7, (wide), OIS", "48 MP, f/1.7, (ultrawide)"],
      mainVideo: "4K@24/30/60fps, 10-bit HDR",
      selfie: "10.5 MP, f/2.2, (ultrawide)",
      selfieVideo: "4K@24/30/60fps",
      battery: "Li-Ion 4700 mAh",
      charging: "27W wired, 15W wireless",
    }),
  },
  "pixel-8-pro": {
    variants: [
      { color: "Bay", hex: "#9fc6ee", images: ["/images/products/pixel-8-pro/bay.png","/images/series/pixel-8.png"] },
      { color: "Porcelain", hex: "#ece6dc", images: ["/images/products/pixel-8-pro/porcelain.png"] },
      { color: "Obsidian", hex: "#2b2b2d", images: ["/images/products/pixel-8-pro/obsidian.png"] },
    ],
    description:
      "A big 6.7-inch Super Actua display, Tensor G3, a triple camera with 5x zoom and a built-in temperature sensor.",
    specs: deviceSpecs({
      network: "GSM / HSPA / LTE / 5G",
      dims: "162.6 x 76.5 x 8.8 mm",
      weight: "213 g",
      build: "Glass front & back (Gorilla Glass Victus 2), aluminum frame",
      display: "6.7″ LTPO OLED, 120Hz, up to 2400 nits",
      protection: "IP68 dust/water resistant (up to 1.5m for 30 min)",
      os: "Android 14, 7 major Android upgrades",
      chipset: "Google Tensor G3 (4 nm)",
      cpu: "Nona-core",
      storage: "128GB / 256GB / 512GB / 1TB, 12GB RAM",
      mainLabel: "Triple",
      main: [
        "50 MP, f/1.7, (wide), OIS",
        "48 MP, f/2.8, 5x optical zoom (periscope telephoto)",
        "48 MP, f/2.0, (ultrawide)",
      ],
      mainVideo: "4K@24/30/60fps, 10-bit HDR",
      selfie: "10.5 MP, f/2.2, (ultrawide)",
      selfieVideo: "4K@24/30/60fps",
      battery: "Li-Ion 5050 mAh",
      charging: "30W wired, 23W wireless, reverse wireless",
    }),
  },

  // ───────────── Samsung ─────────────
  "galaxy-s24": {
    variants: [
      { color: "Cobalt Violet", hex: "#5b5a8a", images: ["/images/series/galaxy-s24.png"] },
      { color: "Onyx Black", hex: "#2e2f33", images: ["/images/products/galaxy-s24/onyx-black.png"] },
      { color: "Marble Grey", hex: "#c9c9cc", images: ["/images/products/galaxy-s24/marble-grey.png"] },
    ],
    description:
      "A compact flagship with Galaxy AI, a 120Hz Dynamic AMOLED 2X display and a 50 MP triple camera with 3x zoom.",
    specs: deviceSpecs({
      network: "GSM / HSPA / LTE / 5G",
      dims: "147 x 70.6 x 7.6 mm",
      weight: "167 g",
      build: "Glass front & back (Gorilla Glass Victus 2), aluminum frame",
      display: "6.2″ Dynamic AMOLED 2X, 120Hz, up to 2600 nits",
      sim: "Nano-SIM and eSIM",
      protection: "IP68 dust/water resistant (up to 1.5m for 30 min)",
      os: "Android 14, One UI 6.1, 7 major Android upgrades",
      chipset: "Exynos 2400 (4 nm) or Snapdragon 8 Gen 3 (4 nm), by region",
      cpu: "Deca-core (Exynos) / Octa-core (Snapdragon)",
      storage: "128GB / 256GB / 512GB, 8GB RAM",
      mainLabel: "Triple",
      main: [
        "50 MP, f/1.8, (wide), OIS",
        "10 MP, f/2.4, 3x optical zoom (telephoto)",
        "12 MP, f/2.2, (ultrawide)",
      ],
      mainVideo: "8K@24/30fps, 4K@30/60fps, HDR10+",
      selfie: "12 MP, f/2.2, (wide)",
      selfieVideo: "4K@30/60fps",
      battery: "Li-Ion 4000 mAh",
      charging: "25W wired, 15W wireless, 4.5W reverse wireless",
    }),
  },
  "galaxy-z-fold6": {
    variants: [
      { color: "Crafted Black", hex: "#2e2f33", images: ["/images/categories/samsung.png"] },
      { color: "Silver Shadow", hex: "#b8babd", images: ["/images/products/galaxy-z-fold6/silver-shadow.png"] },
    ],
    description:
      "Samsung's lightest Fold yet: a 7.6-inch inner screen for multitasking, Snapdragon 8 Gen 3 for Galaxy and Galaxy AI.",
    specs: deviceSpecs({
      network: "GSM / HSPA / LTE / 5G",
      dims: ["Unfolded: 153.5 x 132.6 x 5.6 mm", "Folded: 153.5 x 68.1 x 12.1 mm"],
      weight: "239 g",
      build: "Glass front (Gorilla Glass Victus 2), plastic inner screen, glass back, aluminum frame",
      display: ["7.6″ Foldable Dynamic AMOLED 2X inner, 120Hz", "6.3″ Dynamic AMOLED 2X cover, 120Hz"],
      sim: "Nano-SIM and eSIM",
      protection: "IP48 dust/water resistant (up to 1.5m for 30 min)",
      os: "Android 14, One UI 6.1.1, 7 major Android upgrades",
      chipset: "Qualcomm Snapdragon 8 Gen 3 for Galaxy (4 nm)",
      cpu: "Octa-core",
      storage: "256GB / 512GB / 1TB, 12GB RAM",
      mainLabel: "Triple",
      main: [
        "50 MP, f/1.8, (wide), OIS",
        "10 MP, f/2.4, 3x optical zoom (telephoto)",
        "12 MP, f/2.2, (ultrawide)",
      ],
      mainVideo: "8K@30fps, 4K@30/60fps, HDR10+",
      selfieLabel: "Dual",
      selfie: ["10 MP, f/2.2 (cover screen)", "4 MP, f/1.8 (under-display, inner screen)"],
      selfieVideo: "4K@30/60fps",
      battery: "Li-Po 4400 mAh",
      charging: "25W wired, 15W wireless, 4.5W reverse wireless",
    }),
  },

  // ───────────── iPad ─────────────
  "ipad-pro-13-m4": {
    variants: [
      { color: "Space Black", hex: "#3b3b3d", images: ["/images/products/ipad-pro-13-m4/space-black.png", "/images/series/ipad-pro.png"] },
      { color: "Silver", hex: "#e3e4e5", images: ["/images/products/ipad-pro-13-m4/silver.png"] },
    ],
    description:
      "The thinnest Apple product ever, with the M4 chip and an Ultra Retina XDR tandem OLED display. Works with Apple Pencil Pro.",
    specs: deviceSpecs({
      network: "Wi-Fi; optional 5G cellular",
      wifi: "Wi-Fi 6E, Bluetooth 5.3",
      dims: "281.6 x 215.5 x 5.1 mm",
      weight: "579 g (Wi-Fi), 582 g (cellular)",
      build: "Glass front, aluminum back, aluminum frame",
      display: "13″ Ultra Retina XDR tandem OLED, 120Hz ProMotion",
      sim: "eSIM (cellular models)",
      extras: ["Face ID, works with Apple Pencil Pro and Magic Keyboard"],
      os: "iPadOS 17, upgradable to the latest iPadOS",
      chipset: "Apple M4 (3 nm)",
      cpu: "9-core (256GB/512GB) or 10-core (1TB/2TB)",
      storage: "256GB / 512GB with 8GB RAM; 1TB / 2TB with 16GB RAM",
      mainLabel: "Single",
      main: ["12 MP, f/1.8, (wide)", "LiDAR Scanner, adaptive True Tone flash"],
      mainVideo: "4K@24/25/30/60fps, ProRes",
      selfie: "12 MP, f/2.4, (ultrawide, landscape), Center Stage",
      selfieVideo: "1080p@25/30/60fps",
      battery: "Li-Po 38.99 Wh, up to 10 hours web/video",
      charging: "USB-C with Thunderbolt / USB 4",
      sound: { Loudspeaker: "Yes, with four speakers", "3.5mm jack": "No" },
    }),
  },
  "ipad-air-11-m2": {
    variants: [
      { color: "Blue", hex: "#b7c9d9", images: ["/images/products/ipad-air-11-m2/blue.png", "/images/categories/ipad.png"] },
      { color: "Purple", hex: "#d8cfe3", images: ["/images/products/ipad-air-11-m2/purple.png"] },
      { color: "Starlight", hex: "#f0e9df", images: ["/images/products/ipad-air-11-m2/starlight.png"] },
      { color: "Space Gray", hex: "#7d7e80", images: ["/images/products/ipad-air-11-m2/space-gray.png"] },
    ],
    description:
      "Serious performance in a thin, light design with the M2 chip, a landscape front camera and Apple Pencil Pro support.",
    specs: deviceSpecs({
      network: "Wi-Fi; optional 5G cellular",
      wifi: "Wi-Fi 6E, Bluetooth 5.3",
      dims: "247.6 x 178.5 x 6.1 mm",
      weight: "462 g (Wi-Fi), 462 g (cellular)",
      build: "Glass front, aluminum back, aluminum frame",
      display: "11″ Liquid Retina IPS LCD, 60Hz",
      sim: "eSIM (cellular models)",
      extras: ["Touch ID in top button, works with Apple Pencil Pro"],
      os: "iPadOS 17, upgradable to the latest iPadOS",
      chipset: "Apple M2 (5 nm)",
      cpu: "8-core",
      storage: "128GB / 256GB / 512GB / 1TB, 8GB RAM",
      mainLabel: "Single",
      main: "12 MP, f/1.8, (wide)",
      mainVideo: "4K@24/25/30/60fps",
      selfie: "12 MP, f/2.4, (ultrawide, landscape), Center Stage",
      selfieVideo: "1080p@25/30/60fps",
      battery: "Li-Po 28.93 Wh, up to 10 hours web/video",
      charging: "USB-C",
      sound: { Loudspeaker: "Yes, with stereo speakers (landscape)", "3.5mm jack": "No" },
    }),
  },

  // ───────────── Accessories ─────────────
  "airpods-pro-2": {
    description:
      "Up to 2x more Active Noise Cancellation, Adaptive Audio and Personalised Spatial Audio, now with a USB-C MagSafe case.",
    specs: {
      General: {
        Chip: "Apple H2",
        Weight: ["Earbud: 5.3 g each", "Case: 50.8 g"],
        Durability: "IP54 dust, sweat and water resistant (earbuds and case)",
      },
      Audio: {
        Modes: ["Active Noise Cancellation", "Adaptive Audio", "Transparency mode"],
        Spatial: "Personalised Spatial Audio with dynamic head tracking",
        Controls: "Touch control (press and swipe for volume)",
      },
      Connectivity: { Bluetooth: "Bluetooth 5.3", Compatibility: "iPhone, iPad, Mac, Apple Watch, Apple TV" },
      Battery: {
        Listening: "Up to 6 hours (ANC on)",
        "With case": "Up to 30 hours",
        Charging: "USB-C, MagSafe, Qi wireless, Apple Watch charger",
      },
    },
  },
  "apple-pencil": {
    description:
      "Pixel-perfect precision with pressure and tilt sensitivity for note-taking, drawing and marking up documents.",
    specs: {
      General: {
        Dimensions: "175.7 mm long, 8.9 mm diameter",
        Weight: "20.7 g",
        Features: ["Pressure sensitivity", "Tilt sensitivity", "Low latency"],
      },
      Connectivity: { Pairing: "Bluetooth", Charging: "Lightning (USB-C to Apple Pencil adapter for newer iPads)" },
      Compatibility: {
        iPad: ["iPad (6th–10th generation)", "iPad Air (3rd generation)", "iPad mini (5th generation)"],
        "iPad Pro": ["12.9-inch (1st & 2nd generation)", "10.5-inch, 9.7-inch"],
      },
    },
  },
  "iphone-finewoven-case": {
    variants: [
      { color: "Taupe", hex: "#8b7765", images: ["/images/products/iphone-finewoven-case/taupe.png", "/images/accessories/phone-case.png"] },
      { color: "Black", hex: "#2f3033", images: ["/images/products/iphone-finewoven-case/black.png"] },
      { color: "Mulberry", hex: "#6b2d3e", images: ["/images/products/iphone-finewoven-case/mulberry.png"] },
      { color: "Pacific Blue", hex: "#2c5468", images: ["/images/products/iphone-finewoven-case/pacific-blue.png"] },
      { color: "Evergreen", hex: "#3e5547", images: ["/images/products/iphone-finewoven-case/evergreen.png"] },
    ],
    description:
      "A soft, durable microtwill case with built-in MagSafe magnets that snap on perfectly and charge wirelessly.",
    specs: {
      General: {
        Material: ["FineWoven microtwill exterior", "Soft microfiber lining"],
        Fit: "Precisely fitted to iPhone 15 Pro",
      },
      Features: {
        MagSafe: "Built-in magnets for MagSafe chargers and accessories",
        Buttons: "Aluminum side buttons",
        Charging: "Leave it on while charging wirelessly",
      },
      Compatibility: { iPhone: "iPhone 15 Pro" },
    },
  },
  "ipad-smart-folio": {
    variants: [
      { color: "Sage", hex: "#c4caa6", images: ["/images/products/ipad-smart-folio/sage.png", "/images/accessories/ipad-cover.png"] },
      { color: "Light Violet", hex: "#d6d3ef", images: ["/images/products/ipad-smart-folio/light-violet.png"] },
      { color: "Denim", hex: "#7f9fb4", images: ["/images/products/ipad-smart-folio/denim.png"] },
      { color: "Black", hex: "#2a2829", images: ["/images/products/ipad-smart-folio/black.png"] },
      { color: "White", hex: "#f4f4f4", images: ["/images/products/ipad-smart-folio/white.png"] },
    ],
    description:
      "A thin, light folio that protects the front and back of your iPad and folds into a stand for reading or typing.",
    specs: {
      General: {
        Material: "Polyurethane exterior",
        Protection: "Front and back cover",
      },
      Features: {
        Attachment: "Magnetic, no clasps",
        "Wake/Sleep": "Automatically wakes iPad when opened",
        Stand: "Folds into viewing and typing positions",
      },
      Compatibility: { iPad: "iPad mini (6th generation and A17 Pro)" },
    },
  },
  "apple-watch-ultra-2": {
    description:
      "The most capable Apple Watch: a 49mm titanium case, a 3000-nit display, precision dual-frequency GPS and up to 36 hours of battery.",
    specs: {
      Body: {
        Case: "49 mm titanium",
        Weight: "61.6 g (case only)",
        Durability: ["Water resistant 100 m, dive to 40 m (EN13319)", "IP6X dust resistant"],
      },
      Display: { Type: "Always-On Retina LTPO2 OLED, up to 3000 nits" },
      Platform: { OS: "watchOS 11", Chip: "Apple S9 SiP" },
      Connectivity: {
        Network: "LTE and UMTS (cellular)",
        GPS: "Precision dual-frequency GPS (L1 and L5)",
        Other: "Wi-Fi, Bluetooth 5.3, Ultra Wideband",
      },
      Battery: { Life: ["Up to 36 hours normal use", "Up to 72 hours in Low Power Mode"], Charging: "Fast charging (USB-C magnetic)" },
      Band: { Included: "Titanium Milanese Loop" },
    },
  },
  "galaxy-buds3-pro": {
    description:
      "Adaptive ANC, a 2-way speaker for rich, clear sound and Galaxy AI interpreter features, in a sleek blade design.",
    specs: {
      General: {
        Weight: ["Earbud: 5.4 g each", "Case: 46.5 g"],
        Durability: "IP57 dust and water resistant (earbuds)",
      },
      Audio: {
        Drivers: "2-way: 10.5 mm dynamic woofer + planar tweeter",
        Modes: ["Adaptive Active Noise Cancellation", "Ambient sound"],
        Features: "360 Audio, 24-bit Hi-Fi (Samsung Galaxy devices)",
      },
      Connectivity: { Bluetooth: "Bluetooth 5.4" },
      Battery: {
        Listening: "Up to 6 hours (ANC on)",
        "With case": "Up to 26 hours (ANC on)",
        Charging: "USB-C and Qi wireless",
      },
    },
  },
  // ───────────── iPhone (added for the Shop iPhone page) ─────────────
  "iphone-16-plus": {
    variants: [
      { color: "Ultramarine", hex: "#9aadf6", images: ["/images/products/iphone-16-plus/ultramarine.png"] },
      { color: "Teal", hex: "#b0d4d2", images: ["/images/products/iphone-16-plus/teal.png"] },
      { color: "Pink", hex: "#f2adda", images: ["/images/products/iphone-16-plus/pink.png"] },
      { color: "White", hex: "#fafafa", images: ["/images/products/iphone-16-plus/white.png"] },
      { color: "Black", hex: "#3c4042", images: ["/images/products/iphone-16-plus/black.png"] },
    ],
    description:
      "The big-screen iPhone 16, with a 6.7-inch display, the A18 chip, Camera Control and the longest battery life of any 16 model without Pro.",
    specs: deviceSpecs({
      dims: "160.9 x 77.8 x 7.8 mm",
      weight: "199 g",
      build: "Glass front (Ceramic Shield), glass back, aluminum frame",
      display: "6.7″ Super Retina XDR OLED, 60Hz",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 18",
      chipset: "Apple A18 (3 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB, 8GB RAM",
      mainLabel: "Dual",
      main: ["48 MP, f/1.6, (wide), sensor-shift OIS", "12 MP, f/2.2, (ultrawide)"],
      mainVideo: "4K@24/25/30/60fps, Dolby Vision HDR",
      selfie: "12 MP, f/1.9, (wide)",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 4674 mAh",
      charging: "Wired (USB-C), MagSafe and Qi2 wireless",
    }),
  },
  "iphone-15-plus": {
    variants: [
      { color: "Blue", hex: "#d5e0e7", images: ["/images/products/iphone-15-plus/blue.png"] },
      { color: "Pink", hex: "#f3d9de", images: ["/images/products/iphone-15-plus/pink.png"] },
      { color: "Yellow", hex: "#f4ecc5", images: ["/images/products/iphone-15-plus/yellow.png"] },
      { color: "Green", hex: "#dbe5d4", images: ["/images/products/iphone-15-plus/green.png"] },
      { color: "Black", hex: "#35393b", images: ["/images/products/iphone-15-plus/black.png"] },
    ],
    description:
      "A 6.7-inch iPhone with Dynamic Island, a 48 MP main camera, USB-C and all-day battery life, in a colour-infused glass back.",
    specs: deviceSpecs({
      dims: "160.9 x 77.8 x 7.8 mm",
      weight: "201 g",
      build: "Glass front (Ceramic Shield), colour-infused glass back, aluminum frame",
      display: "6.7″ Super Retina XDR OLED, 60Hz, Dynamic Island",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 17, upgradable to the latest iOS",
      chipset: "Apple A16 Bionic (4 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB, 6GB RAM",
      mainLabel: "Dual",
      main: ["48 MP, f/1.6, (wide), sensor-shift OIS", "12 MP, f/2.4, (ultrawide)"],
      mainVideo: "4K@24/25/30/60fps, Dolby Vision HDR",
      selfie: "12 MP, f/1.9, (wide)",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 4383 mAh",
      charging: "Wired (USB-C), MagSafe and Qi2 wireless",
    }),
  },
  "iphone-15": {
    variants: [
      { color: "Pink", hex: "#f3d9de", images: ["/images/products/iphone-15/pink.png"] },
      { color: "Blue", hex: "#d5e0e7", images: ["/images/products/iphone-15/blue.png"] },
      { color: "Yellow", hex: "#f4ecc5", images: ["/images/products/iphone-15/yellow.png"] },
      { color: "Green", hex: "#dbe5d4", images: ["/images/products/iphone-15/green.png"] },
      { color: "Black", hex: "#35393b", images: ["/images/products/iphone-15/black.png"] },
    ],
    description:
      "Dynamic Island, a 48 MP main camera with 2x telephoto option, USB-C and a durable colour-infused glass design.",
    specs: deviceSpecs({
      dims: "147.6 x 71.6 x 7.8 mm",
      weight: "171 g",
      build: "Glass front (Ceramic Shield), colour-infused glass back, aluminum frame",
      display: "6.1″ Super Retina XDR OLED, 60Hz, Dynamic Island",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 17, upgradable to the latest iOS",
      chipset: "Apple A16 Bionic (4 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB, 6GB RAM",
      mainLabel: "Dual",
      main: ["48 MP, f/1.6, (wide), sensor-shift OIS", "12 MP, f/2.4, (ultrawide)"],
      mainVideo: "4K@24/25/30/60fps, Dolby Vision HDR",
      selfie: "12 MP, f/1.9, (wide)",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 3349 mAh",
      charging: "Wired (USB-C), MagSafe and Qi2 wireless",
    }),
  },
  "iphone-14-plus": {
    variants: [
      { color: "Purple", hex: "#e5ddea", images: ["/images/products/iphone-14-plus/purple.png"] },
      { color: "Blue", hex: "#a0b4c7", images: ["/images/products/iphone-14-plus/blue.png"] },
      { color: "Midnight", hex: "#222930", images: ["/images/products/iphone-14-plus/midnight.png"] },
      { color: "Starlight", hex: "#faf6f2", images: ["/images/products/iphone-14-plus/starlight.png"] },
      { color: "(PRODUCT)RED", hex: "#bf0013", images: ["/images/products/iphone-14-plus/product-red.png"] },
      { color: "Yellow", hex: "#f9e479", images: ["/images/products/iphone-14-plus/yellow.png"] },
    ],
    description:
      "A big 6.7-inch display and exceptional battery life with the A15 Bionic chip, Crash Detection and an improved camera for low light.",
    specs: deviceSpecs({
      dims: "160.8 x 78.1 x 7.8 mm",
      weight: "203 g",
      build: "Glass front (Ceramic Shield), glass back, aluminum frame",
      display: "6.7″ Super Retina XDR OLED, 60Hz",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 16, upgradable to the latest iOS",
      chipset: "Apple A15 Bionic (5 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB, 6GB RAM",
      mainLabel: "Dual",
      main: ["12 MP, f/1.5, (wide), sensor-shift OIS", "12 MP, f/2.4, (ultrawide)"],
      mainVideo: "4K@24/25/30/60fps, Dolby Vision HDR, Cinematic mode",
      selfie: "12 MP, f/1.9, (wide)",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 4325 mAh",
      charging: "Wired (Lightning), MagSafe and Qi wireless",
    }),
  },
  // ───────────── iPhone accessories (Shop iPhone Accessories page) ─────────────
  "iphone-16-plus-silicone-case-with-magsafe-fuchsia": {
    variants: [{ color: "Fuchsia", hex: "#b0306a", images: ["/images/products/apple-accessories/silicone-case-iphone-16-plus-fuchsia.png"] }],
    description:
      "Designed by Apple for iPhone 16 Plus. A silky, soft-touch silicone exterior with a soft microfiber lining and built-in magnets for MagSafe.",
    specs: {
      General: {
        Material: ["Silicone exterior", "Soft microfiber lining"],
        Fit: "Precisely fitted to iPhone 16 Plus",
      },
      Features: {
        MagSafe: "Built-in magnets for MagSafe chargers and accessories",
        "Camera Control": "Sapphire crystal cover, works through the case",
        Charging: "Leave it on while charging wirelessly",
      },
      Compatibility: { iPhone: "iPhone 16 Plus" },
    },
  },
  "beats-iphone-16-pro-case-with-magsafe-summit-stone": {
    variants: [{ color: "Summit Stone", hex: "#e6ddd0", images: ["/images/products/apple-accessories/beats-case-iphone-16-pro-summit-stone.png"] }],
    description:
      "A slim, protective Beats case with a grippy finish, raised edges for the screen and camera, and a MagSafe ring with a built-in lanyard attachment point.",
    specs: {
      General: {
        Material: ["Polycarbonate shell", "Soft-touch finish"],
        Protection: "Drop-tested; raised edges around screen and camera",
        Fit: "Precisely fitted to iPhone 16 Pro",
      },
      Features: {
        MagSafe: "Built-in magnets for MagSafe chargers and accessories",
        "Camera Control": "Cut-out for Camera Control",
        Charging: "Leave it on while charging wirelessly",
      },
      Compatibility: { iPhone: "iPhone 16 Pro" },
    },
  },
  "iphone-finewoven-wallet-with-magsafe-blackberry": {
    variants: [{ color: "Blackberry", hex: "#4a2a40", images: ["/images/products/apple-accessories/finewoven-wallet-blackberry.png"] }],
    description:
      "Snaps magnetically to the back of your iPhone to keep up to three cards close at hand, and works with Find My so you'll know where it was last detached.",
    specs: {
      General: {
        Material: "FineWoven microtwill (68% recycled content)",
        Capacity: "Up to 3 cards",
      },
      Features: {
        MagSafe: "Attaches magnetically to iPhone or a MagSafe case",
        "Find My": "Shows where the wallet was detached from your iPhone",
        Shielding: "Protects cards from demagnetisation",
      },
      Compatibility: { iPhone: "iPhone 12 and later with MagSafe" },
    },
  },
  "20w-usb-c-power-adapter": {
    variants: [{ color: "White", hex: "#f4f4f4", images: ["/images/products/apple-accessories/20w-usb-c-power-adapter.png"] }],
    description:
      "Fast, efficient charging at home, in the office or on the go. Charge iPhone to about 50% in around 30 minutes.",
    specs: {
      General: { Output: "20W", Connector: "USB-C", Cable: "Sold separately" },
      Features: { "Fast charging": "Up to 50% in around 30 minutes on supported iPhone models" },
      Compatibility: {
        Devices: ["iPhone 8 and later", "iPad models with USB-C or Lightning", "AirPods and Apple Watch (with cable)"],
      },
    },
  },
  "magsafe-charger-1-m": {
    variants: [{ color: "White", hex: "#f4f4f4", images: ["/images/products/apple-accessories/magsafe-charger.png"] }],
    description:
      "Perfectly aligned magnets attach to iPhone and deliver faster wireless charging, up to 25W with a 30W adapter on iPhone 16 models.",
    specs: {
      General: { "Cable length": "1 m", Connector: "USB-C", "Power adapter": "Sold separately (30W recommended)" },
      Features: {
        Output: ["Up to 25W on iPhone 16 models", "Up to 15W on earlier MagSafe iPhones"],
        Qi2: "Also charges Qi2 and Qi-compatible devices and AirPods",
      },
      Compatibility: { iPhone: "iPhone 12 and later" },
    },
  },
  "airpods-max-orange": {
    variants: [{ color: "Orange", hex: "#f2a77d", images: ["/images/products/apple-accessories/airpods-max-orange.png"] }],
    description:
      "High-fidelity over-ear headphones with Active Noise Cancellation, Transparency mode and Personalised Spatial Audio, now with USB-C.",
    specs: {
      General: {
        Weight: "384.8 g",
        Design: ["Knit-mesh canopy", "Memory foam ear cushions", "Stainless steel headband"],
      },
      Audio: {
        Driver: "Apple-designed 40 mm dynamic driver",
        Modes: ["Active Noise Cancellation", "Transparency mode"],
        Spatial: "Personalised Spatial Audio with dynamic head tracking",
      },
      Connectivity: { Bluetooth: "Bluetooth 5.0", Chip: "Apple H1 (each ear cup)" },
      Battery: { Listening: "Up to 20 hours (ANC on)", Charging: "USB-C, Smart Case for low-power mode" },
    },
  },
  // ───────────── Pixel accessories (Shop Pixel Accessories page) ─────────────
  "pixel-9-9-pro-and-9-pro-xl-case": {
    variants: [{ color: "Obsidian", hex: "#2b2b2d", images: ["/images/products/pixel-accessories/pixel-9-case-obsidian.png"] }],
    description:
      "A slim, soft-touch case designed by Google to fit Pixel 9, Pixel 9 Pro and Pixel 9 Pro XL. It keeps the camera bar visible and protects the edges and corners.",
    specs: {
      General: { Finish: "Soft-touch", Fit: "Precisely fitted around buttons, ports and the camera bar" },
      Protection: { Edges: "Raised edges around the screen and camera", Wear: "Resists scratches from daily use" },
      Compatibility: { Pixel: ["Pixel 9", "Pixel 9 Pro", "Pixel 9 Pro XL"] },
    },
  },
  "pixel-9-pro-fold-case": {
    variants: [{ color: "Obsidian", hex: "#2b2b2d", images: ["/images/products/pixel-accessories/pixel-9-pro-fold-case-obsidian.png"] }],
    description:
      "Made to fit Pixel 9 Pro Fold when it is closed. A slim, grippy case that protects the back, hinge side and camera without getting in the way of the hinge.",
    specs: {
      General: { Finish: "Soft-touch", Fit: "Precisely fitted to Pixel 9 Pro Fold" },
      Protection: { Coverage: "Back and outer edges (leaves the hinge and screen free)" },
      Compatibility: { Pixel: "Pixel 9 Pro Fold" },
    },
  },
  "pixel-9a-case": {
    variants: [{ color: "Mint Green", hex: "#a9f0c0", images: ["/images/products/pixel-accessories/pixel-9a-case-mint.png"] }],
    description:
      "A colourful, soft-touch case made for Pixel 9a. It frames the camera bar and adds grip and protection for everyday use.",
    specs: {
      General: { Finish: "Soft-touch", Fit: "Precisely fitted to Pixel 9a" },
      Protection: { Edges: "Raised edges around the screen and camera" },
      Compatibility: { Pixel: "Pixel 9a" },
    },
  },
  "pixel-8-pro-case": {
    variants: [{ color: "Bay", hex: "#9fc6ee", images: ["/images/products/pixel-accessories/pixel-8-pro-case-bay.png"] }],
    description:
      "The official case for Pixel 8 Pro in a soft Bay blue. A snug fit around the camera bar with raised edges to protect the screen.",
    specs: {
      General: { Finish: "Soft-touch", Fit: "Precisely fitted to Pixel 8 Pro" },
      Protection: { Edges: "Raised edges around the screen and camera" },
      Compatibility: { Pixel: "Pixel 8 Pro" },
    },
  },
  "pixel-buds-pro-2": {
    variants: [{ color: "Porcelain", hex: "#ece6dc", images: ["/images/products/pixel-accessories/pixel-buds-pro-2-porcelain.png"] }],
    description:
      "Google's smallest, most comfortable earbuds, with Active Noise Cancellation powered by the Tensor A1 chip, Gemini voice help and a wireless-charging case.",
    specs: {
      General: {
        Weight: ["Earbud: about 5.1 g each", "Case: about 43 g"],
        Durability: ["Earbuds: IP54 dust and water resistant", "Case: IPX4 water resistant"],
      },
      Audio: {
        Chip: "Google Tensor A1",
        Modes: ["Active Noise Cancellation", "Transparency mode"],
        Fit: "Silent Seal technology with ear-hugging fit fins",
      },
      Connectivity: { Bluetooth: "Bluetooth 5.4", Multipoint: "Connects to two devices at once" },
      Battery: {
        Earbuds: "Up to 8 hours (ANC on), up to 12 hours (ANC off)",
        "With case": "Up to 30 hours (ANC on), up to 48 hours (ANC off)",
        Charging: "USB-C and Qi wireless",
      },
    },
  },
  "pixel-watch-performance-loop-band": {
    variants: [{ color: "Dark Green", hex: "#3c4a45", images: ["/images/products/pixel-accessories/pixel-watch-performance-loop-band.png"] }],
    description:
      "A breathable woven band with an adjustable hook-and-loop closure. Light, sweat-friendly and secure for workouts and everyday wear.",
    specs: {
      General: { Material: "Woven recycled nylon", Closure: "Hook-and-loop, infinitely adjustable" },
      Features: { Comfort: "Lightweight and breathable", "Quick change": "Swaps in seconds with the watch's band release" },
      Compatibility: { Watch: ["Google Pixel Watch", "Google Pixel Watch 2", "Google Pixel Watch 3 (41 mm)"] },
    },
  },
  "pixel-watch-metal-links-band": {
    variants: [{ color: "Obsidian", hex: "#2b2b2d", images: ["/images/products/pixel-accessories/pixel-watch-metal-links-band.png"] }],
    description:
      "A polished stainless steel link band with a folding clasp for a dressed-up look. Links can be removed for the right fit.",
    specs: {
      General: { Material: "Stainless steel", Closure: "Folding clasp" },
      Features: { Fit: "Removable links for a custom fit", "Quick change": "Swaps in seconds with the watch's band release" },
      Compatibility: { Watch: ["Google Pixel Watch", "Google Pixel Watch 2", "Google Pixel Watch 3 (41 mm)"] },
    },
  },
  "pixel-watch-crafted-leather-band": {
    variants: [{ color: "Slate Blue", hex: "#4c6a82", images: ["/images/products/pixel-accessories/pixel-watch-crafted-leather-band.png"] }],
    description:
      "A soft leather band with stainless steel hardware and a classic buckle, for a refined everyday look.",
    specs: {
      General: { Material: "Leather with stainless steel hardware", Closure: "Buckle with adjustment holes" },
      Features: { "Quick change": "Swaps in seconds with the watch's band release" },
      Compatibility: { Watch: ["Google Pixel Watch", "Google Pixel Watch 2", "Google Pixel Watch 3 (41 mm)"] },
    },
  },
  "spigen-rugged-armor-case-pixel-buds-pro-2": {
    variants: [{ color: "Black", hex: "#1f1f1f", images: ["/images/products/pixel-accessories/spigen-rugged-armor-buds-case.png"] }],
    description:
      "A rugged Spigen case with a carbon-fibre pattern, shock-absorbing corners and a carabiner so your earbuds case clips to a bag or belt loop.",
    specs: {
      General: { Brand: "Spigen", Material: "Flexible TPU with carbon-fibre pattern", Includes: "Carabiner" },
      Protection: { Corners: "Shock-absorbing corners", Access: "Cut-outs for charging and the pairing button" },
      Compatibility: { Earbuds: "Pixel Buds Pro 2 charging case" },
    },
  },
  "spigen-clear-case-with-carabiner-pixel-buds-pro-2": {
    variants: [{ color: "Clear", hex: "#e8eef2", images: ["/images/products/pixel-accessories/spigen-clear-buds-case.png"] }],
    description:
      "A crystal-clear Spigen case that shows off your earbuds case while protecting it from scratches and drops. Comes with a carabiner.",
    specs: {
      General: { Brand: "Spigen", Material: "Clear flexible TPU", Includes: "Carabiner" },
      Protection: { Coverage: "Full case coverage with a secure snap-on fit", Access: "Cut-outs for charging and the pairing button" },
      Compatibility: { Earbuds: "Pixel Buds Pro 2 charging case" },
    },
  },
  "bellroy-leather-case-pixel-buds-pro-2": {
    variants: [{ color: "Terracotta", hex: "#c8692f", images: ["/images/products/pixel-accessories/bellroy-buds-case-terracotta.png"] }],
    description:
      "A premium Bellroy leather case that wraps your earbuds case in soft, durable, environmentally certified leather.",
    specs: {
      General: { Brand: "Bellroy", Material: "Leather", Fit: "Snug, moulded fit" },
      Features: { Access: "Open design for wireless and USB-C charging" },
      Compatibility: { Earbuds: "Pixel Buds Pro 2 charging case" },
    },
  },
  "fitbit-charge-6-charge-5-and-5-luxe-charging-cable": {
    variants: [{ color: "Black", hex: "#1f1f1f", images: ["/images/products/pixel-accessories/fitbit-charge-charging-cable.png"] }],
    description:
      "A replacement charging cable that clips magnetically to the back of your Fitbit tracker. USB connector for any USB power source.",
    specs: {
      General: { Connector: "USB-A", Attachment: "Magnetic clip" },
      Compatibility: { Trackers: ["Fitbit Charge 6", "Fitbit Charge 5", "Fitbit Charge 5 Luxe Special Edition"] },
    },
  },
  // ───────────── iPhone 13 & 14 series (completed lineups) ─────────────
  "iphone-13-mini": {
    variants: [
      { color: "Midnight", hex: "#232a31", images: ["/images/products/iphone-13-mini/midnight.png"] },
      { color: "Starlight", hex: "#f7f1ea", images: ["/images/products/iphone-13-mini/starlight.png"] },
      { color: "Blue", hex: "#276787", images: ["/images/products/iphone-13-mini/blue.png"] },
      { color: "Pink", hex: "#f9dcd6", images: ["/images/products/iphone-13-mini/pink.png"] },
      { color: "(PRODUCT)RED", hex: "#bf0013", images: ["/images/products/iphone-13-mini/product-red.png"] },
      { color: "Green", hex: "#394c38", images: ["/images/products/iphone-13-mini/green.png"] },
    ],
    description:
      "All the power of iPhone 13 in the smallest size: a compact 5.4-inch display, the A15 Bionic chip and a dual-camera system with Cinematic mode.",
    specs: deviceSpecs({
      dims: "131.5 x 64.2 x 7.65 mm",
      weight: "141 g",
      build: "Glass front (Ceramic Shield), glass back, aluminum frame",
      display: "5.4″ Super Retina XDR OLED, 60Hz",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 15, upgradable to the latest iOS",
      chipset: "Apple A15 Bionic (5 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB, 4GB RAM",
      mainLabel: "Dual",
      main: ["12 MP, f/1.6, (wide), sensor-shift OIS", "12 MP, f/2.4, (ultrawide)"],
      mainVideo: "4K@24/30/60fps, Dolby Vision HDR, Cinematic mode",
      selfie: "12 MP, f/2.2, (wide)",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 2438 mAh",
      charging: "Wired (Lightning), MagSafe and Qi wireless",
    }),
  },
  "iphone-13-pro": {
    variants: [
      { color: "Graphite", hex: "#54524f", images: ["/images/products/iphone-13-pro/graphite.png"] },
      { color: "Gold", hex: "#fae7cf", images: ["/images/products/iphone-13-pro/gold.png"] },
      { color: "Silver", hex: "#e4e6e8", images: ["/images/products/iphone-13-pro/silver.png"] },
      { color: "Sierra Blue", hex: "#a7c1d9", images: ["/images/products/iphone-13-pro/sierra-blue.png"] },
      { color: "Alpine Green", hex: "#576856", images: ["/images/products/iphone-13-pro/alpine-green.png"] },
    ],
    description:
      "A pro camera system with a 3x telephoto lens and macro photography, a 120Hz ProMotion display and the A15 Bionic chip, in a stainless steel frame.",
    specs: deviceSpecs({
      dims: "146.7 x 71.5 x 7.65 mm",
      weight: "204 g",
      build: "Glass front (Ceramic Shield), glass back, stainless steel frame",
      display: "6.1″ Super Retina XDR OLED, 120Hz ProMotion",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 15, upgradable to the latest iOS",
      chipset: "Apple A15 Bionic (5 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB / 1TB, 6GB RAM",
      mainLabel: "Triple",
      main: [
        "12 MP, f/1.5, (wide), sensor-shift OIS",
        "12 MP, f/2.8, 3x optical zoom (telephoto), OIS",
        "12 MP, f/1.8, (ultrawide), macro photography",
      ],
      mainVideo: "4K@24/30/60fps, Dolby Vision HDR, ProRes, Cinematic mode",
      selfie: "12 MP, f/2.2, (wide)",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 3095 mAh",
      charging: "Wired (Lightning), MagSafe and Qi wireless",
    }),
  },
  "iphone-13-pro-max": {
    variants: [
      { color: "Graphite", hex: "#54524f", images: ["/images/products/iphone-13-pro-max/graphite.png"] },
      { color: "Gold", hex: "#fae7cf", images: ["/images/products/iphone-13-pro-max/gold.png"] },
      { color: "Silver", hex: "#e4e6e8", images: ["/images/products/iphone-13-pro-max/silver.png"] },
      { color: "Sierra Blue", hex: "#a7c1d9", images: ["/images/products/iphone-13-pro-max/sierra-blue.png"] },
      { color: "Alpine Green", hex: "#576856", images: ["/images/products/iphone-13-pro-max/alpine-green.png"] },
    ],
    description:
      "The biggest iPhone 13 with the longest battery life: a 6.7-inch ProMotion display, the pro camera system and the A15 Bionic chip.",
    specs: deviceSpecs({
      dims: "160.8 x 78.1 x 7.65 mm",
      weight: "240 g",
      build: "Glass front (Ceramic Shield), glass back, stainless steel frame",
      display: "6.7″ Super Retina XDR OLED, 120Hz ProMotion",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 15, upgradable to the latest iOS",
      chipset: "Apple A15 Bionic (5 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB / 1TB, 6GB RAM",
      mainLabel: "Triple",
      main: [
        "12 MP, f/1.5, (wide), sensor-shift OIS",
        "12 MP, f/2.8, 3x optical zoom (telephoto), OIS",
        "12 MP, f/1.8, (ultrawide), macro photography",
      ],
      mainVideo: "4K@24/30/60fps, Dolby Vision HDR, ProRes, Cinematic mode",
      selfie: "12 MP, f/2.2, (wide)",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 4352 mAh",
      charging: "Wired (Lightning), MagSafe and Qi wireless",
    }),
  },
  "iphone-14-pro": {
    variants: [
      { color: "Space Black", hex: "#403e3d", images: ["/images/products/iphone-14-pro/space-black.png"] },
      { color: "Silver", hex: "#f0f2f2", images: ["/images/products/iphone-14-pro/silver.png"] },
      { color: "Gold", hex: "#f4e8ce", images: ["/images/products/iphone-14-pro/gold.png"] },
      { color: "Deep Purple", hex: "#594f63", images: ["/images/products/iphone-14-pro/deep-purple.png"] },
    ],
    description:
      "Dynamic Island, an Always-On display, a 48 MP main camera and the A16 Bionic chip, in a stainless steel design.",
    specs: deviceSpecs({
      dims: "147.5 x 71.5 x 7.85 mm",
      weight: "206 g",
      build: "Glass front (Ceramic Shield), glass back, stainless steel frame",
      display: "6.1″ Super Retina XDR OLED, 120Hz ProMotion, Always-On, Dynamic Island",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 16, upgradable to the latest iOS",
      chipset: "Apple A16 Bionic (4 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB / 1TB, 6GB RAM",
      mainLabel: "Triple",
      main: [
        "48 MP, f/1.8, (wide), sensor-shift OIS",
        "12 MP, f/2.8, 3x optical zoom (telephoto), OIS",
        "12 MP, f/2.2, (ultrawide)",
      ],
      mainVideo: "4K@24/25/30/60fps, Dolby Vision HDR, ProRes, Action mode",
      selfie: "12 MP, f/1.9, (wide), autofocus",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 3200 mAh",
      charging: "Wired (Lightning), MagSafe and Qi wireless",
    }),
  },
  "iphone-14-pro-max": {
    variants: [
      { color: "Space Black", hex: "#403e3d", images: ["/images/products/iphone-14-pro-max/space-black.png"] },
      { color: "Silver", hex: "#f0f2f2", images: ["/images/products/iphone-14-pro-max/silver.png"] },
      { color: "Gold", hex: "#f4e8ce", images: ["/images/products/iphone-14-pro-max/gold.png"] },
      { color: "Deep Purple", hex: "#594f63", images: ["/images/products/iphone-14-pro-max/deep-purple.png"] },
    ],
    description:
      "The largest 14-series display with Dynamic Island and Always-On, the 48 MP camera system, A16 Bionic and the longest battery life.",
    specs: deviceSpecs({
      dims: "160.7 x 77.6 x 7.85 mm",
      weight: "240 g",
      build: "Glass front (Ceramic Shield), glass back, stainless steel frame",
      display: "6.7″ Super Retina XDR OLED, 120Hz ProMotion, Always-On, Dynamic Island",
      protection: "IP68 dust/water resistant (up to 6m for 30 min)",
      extras: appleExtras,
      os: "iOS 16, upgradable to the latest iOS",
      chipset: "Apple A16 Bionic (4 nm)",
      cpu: "Hexa-core",
      storage: "128GB / 256GB / 512GB / 1TB, 6GB RAM",
      mainLabel: "Triple",
      main: [
        "48 MP, f/1.8, (wide), sensor-shift OIS",
        "12 MP, f/2.8, 3x optical zoom (telephoto), OIS",
        "12 MP, f/2.2, (ultrawide)",
      ],
      mainVideo: "4K@24/25/30/60fps, Dolby Vision HDR, ProRes, Action mode",
      selfie: "12 MP, f/1.9, (wide), autofocus",
      selfieVideo: "4K@24/25/30/60fps",
      battery: "Li-Ion 4323 mAh",
      charging: "Wired (Lightning), MagSafe and Qi wireless",
    }),
  },
};
