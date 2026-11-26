// What a team role can open in the admin. The Dashboard is open to every team member.
// Shared by server and browser code.
export const PERMISSIONS = [
  { key: "products", label: "Products & categories", short: "Products" },
  { key: "orders", label: "Orders", short: "Orders" },
  { key: "inventory", label: "Inventory", short: "Inventory" },
  { key: "team", label: "Team & roles", short: "Team" },
];
export const ALL_PERMISSIONS = PERMISSIONS.map((p) => p.key);

// The two admin levels. Super Admin: everything, including managing the team.
// Admin: everything except Team Mgt.
export const SUPER_ADMIN = { id: "super-admin", name: "Super Admin", description: "Full access, including inviting and managing the team", permissions: ALL_PERMISSIONS };
export const ADMIN = { id: "admin", name: "Admin", description: "Products, categories, orders and inventory — everything except Team Mgt", permissions: ALL_PERMISSIONS.filter((p) => p !== "team") };
export const ROLES = [SUPER_ADMIN, ADMIN];
// No role recorded (accounts made admin with the setup script) = Super Admin; anything unknown = Admin.
export const roleOf = (id) => (id == null ? SUPER_ADMIN : (ROLES.find((r) => r.id === id) ?? ADMIN));

// Which permission each admin section needs (longest match wins).
export const SECTION_PERMISSION = [
  ["/admin/products", "products"],
  ["/admin/categories", "products"],
  ["/admin/orders", "orders"],
  ["/admin/inventory", "inventory"],
  ["/admin/team", "team"],
];
export const permissionFor = (pathname) => SECTION_PERMISSION.find(([p]) => pathname.startsWith(p))?.[1] ?? null;
