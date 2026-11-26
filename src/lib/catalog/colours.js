import { colorHex, productDetails } from "@/data/productDetails";

// Preset colours for the colour picker: the basic swatches plus every named colour
// already used by products (e.g. "Desert Titanium").
export function colourPresets() {
  const map = new Map(Object.entries(colorHex).map(([name, hex]) => [name, hex]));
  for (const d of Object.values(productDetails)) for (const v of d.variants ?? []) if (v.hex && !map.has(v.color)) map.set(v.color, v.hex);
  return [...map].filter(([, hex]) => /^#[0-9a-f]{6}$/i.test(hex)).map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name));
}
