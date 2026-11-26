// "Filter by" options on Admin → Products Mgt (shared by the server page and the client menu).
export const PRODUCT_FILTERS = {
  category: { label: "Category", options: [["Phones", "Phones"], ["Tablets", "Tablets"], ["Accessories", "Accessories"]] },
  stock: { label: "Stock status", options: [["in", "In Stock"], ["low", "Low Stock"], ["out", "Out of Stock"]] },
  status: { label: "Visibility", options: [["active", "Active"], ["draft", "Draft"]] },
};
export const filterValues = (key) => PRODUCT_FILTERS[key].options.map(([v]) => v);
