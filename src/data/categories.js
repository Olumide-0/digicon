// Mega-menu data for "Shop by Categories".
// Each category has 3 columns; each column holds one or more groups.

export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const categories = [
  {
    name: "Phones and Tablets",
    columns: [
      [
        {
          title: "Mobile phone",
          items: ["Phone", "Tablets", "Basic phones", "Refurbished phones"],
        },
        {
          title: "Tablets",
          items: ["iPad", "Android Tablets", "Educational Tablets", "Tablets Accessories"],
        },
      ],
      [
        {
          title: "Accessories",
          items: [
            "Accessory Kits",
            "Adapters",
            "Batteries",
            "Phone Chargers",
            "Apple Watch",
            "Apple Vision Pro",
            "Apple Pencil",
            "AirPods",
            "Galaxy Buds",
            "Battery Charger",
            "Power banks",
            "Screen protector",
            "Case & covers",
          ],
        },
      ],
      [
        {
          title: "Top Smartphones",
          items: ["Smartphones", "Android phones", "Basic phones", "Refurbished phones"],
        },
        {
          title: "Top Brands",
          items: ["Apple", "Samsung", "Google Pixel", "Xiaomi", "Tecno", "itel"],
        },
      ],
    ],
  },
  {
    name: "Computing",
    columns: [
      [
        {
          title: "Laptops",
          items: [
            "MacBooks",
            "Gaming Laptops",
            "HP EliteBook",
            "Dell Latitude",
            "Lenovo ThinkPad",
            "Asus Zenbook",
          ],
        },
      ],
      [
        {
          title: "Monitors",
          items: ["Samsung Monitor", "Hisense Monitor", "LG Monitor", "iMac"],
        },
      ],
      [
        {
          title: "Accessories",
          items: [
            "Apple",
            "HP",
            "Lenovo",
            "Asus",
            "Huawei",
            "Microsoft",
            "Kingston",
            "Samsung",
            "SanDisk",
            "Toshiba",
          ],
        },
      ],
    ],
  },
  {
    name: "Gaming",
    columns: [
      [
        {
          title: "Playstation",
          items: ["Playstation 5", "Playstation 4", "Playstation 3", "Playstation Vita"],
        },
        {
          title: "Xbox",
          items: ["Xbox One", "Xbox 360", "Xbox"],
        },
      ],
      [
        {
          title: "Nintendo",
          items: ["Nintendo 3DS", "Nintendo DS", "Nintendo Switch", "Nintendo Wii"],
        },
      ],
      [
        {
          title: "Top Games",
          items: [
            "FIFA '23 PS5",
            "FIFA '23 PS4",
            "God of War",
            "Spider-Man",
            "Call of Duty",
            "Assassin's Creed Valhalla",
            "The Last of Us",
            "The Witcher 3",
            "Metal Gear Solid",
            "Fallout",
            "Madden NFL",
            "Far Cry",
          ],
        },
      ],
    ],
  },
];

// "Shop by Categories" carousel on the home page.
// Images live in /public/images/categories/<image>.png (export from Figma, transparent bg).
export const featuredCategories = [
  { name: "iPhone", image: "iphone", href: "/shop/iphone" },
  { name: "Samsung", image: "samsung" },
  { name: "Google Pixel", image: "google-pixel", href: "/shop/pixel" },
  { name: "iPad", image: "ipad" },
  { name: "Apple Watch", image: "apple-watch", href: "/shop/iphone/accessories" },
  { name: "MacBook", image: "macbook" },
  { name: "HP Laptops", image: "hp-laptops" },
  { name: "Galaxy Buds", image: "galaxy-buds" },
  { name: "AirPods", image: "airpods", href: "/shop/iphone/accessories" },
  { name: "Apple Vision Pro", image: "apple-vision-pro" },
  { name: "PlayStation", image: "playstation" },
  { name: "Accessories", image: "accessories" },
];

// Turns URL segments back into readable labels using the menu data,
// e.g. ["phones-and-tablets","top-smartphones","smartphones"]
//   -> ["Phones and Tablets","Top Smartphones","Smartphones"]
export function resolveCategoryLabels(segments) {
  const humanize = (s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const [catSlug, groupSlug, itemSlug] = segments;
  const cat = categories.find((c) => slugify(c.name) === catSlug);
  const group = cat?.columns.flat().find((g) => slugify(g.title) === groupSlug);
  const item = group?.items.find((i) => slugify(i) === itemSlug);
  const featured = featuredCategories.find((f) => slugify(f.name) === catSlug);
  return [
    cat?.name ?? featured?.name ?? humanize(catSlug ?? ""),
    group?.title ?? (groupSlug && humanize(groupSlug)),
    item ?? (itemSlug && humanize(itemSlug)),
  ].filter(Boolean);
}

// Brand links go to the brand shop pages; everything else to the category listing.
const brandShops = { Apple: "/shop/iphone", "Google Pixel": "/shop/pixel" };

export const itemHref = (category, group, item) =>
  brandShops[item] ?? `/categories/${slugify(category)}/${slugify(group)}/${slugify(item)}`;
