// Give an existing account admin access (or take it away).
//   node scripts/make-admin.mjs you@example.com          -> make admin
//   node scripts/make-admin.mjs you@example.com --remove -> remove admin
// The account must already exist (sign up on the site first).
// Only the one account is changed; everything else in .data/users.json is kept.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node scripts/make-admin.mjs <email> [--remove]");
  process.exit(1);
}
const file = path.join(process.cwd(), ".data", "users.json");
const users = JSON.parse(await readFile(file, "utf8"));
const user = users.find((u) => u.email === email.trim().toLowerCase());
if (!user) {
  console.error(`No account uses ${email}. Sign up on the site first, then run this again.`);
  process.exit(1);
}
if (flag === "--remove") {
  for (const k of ["role", "teamRoleId", "teamStatus", "addedToTeamAt"]) delete user[k];
} else {
  // Full access (Super Admin). Other roles are given from Admin → Team Mgt.
  Object.assign(user, { role: "admin", teamRoleId: "super-admin", teamStatus: "active" });
  user.addedToTeamAt ??= new Date().toISOString();
}
await writeFile(file, JSON.stringify(users, null, 2));
console.log(`${user.email} is ${flag === "--remove" ? "no longer an admin" : "now a Super Admin"}.`);
