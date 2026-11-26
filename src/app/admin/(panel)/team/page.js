import { requireAdmin, isTeamMember } from "@/lib/admin/auth";
import { listUsers } from "@/lib/auth/users";
import { listInvites, listRoles } from "@/lib/team/store";
import { SUPER_ADMIN, roleOf } from "@/lib/team/permissions";
import { StatCard } from "@/components/admin/AdminTable";
import TeamManager from "@/components/admin/TeamManager";

export const metadata = { title: "Team Management" };

const PAGE_SIZE = 10;
const TZ = "Africa/Lagos";
const day = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
const dateLabel = (iso) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ }).format(new Date(iso));
const timeLabel = (d) => new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ }).format(d).toLowerCase();

// "Today 7:54 am" / "Yesterday 7:54 am" / "23/04/2024" (Lagos time).
function lastLoginLabel(iso) {
  if (!iso) return { day: "Never", time: "" };
  const d = new Date(iso);
  const today = day(new Date());
  const yesterday = day(new Date(Date.now() - 864e5));
  if (day(d) === today) return { day: "Today", time: timeLabel(d) };
  if (day(d) === yesterday) return { day: "Yesterday", time: timeLabel(d) };
  return { day: dateLabel(iso), time: timeLabel(d) };
}

function monthNote(items, dateOf) {
  const ym = (d) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: TZ }).format(d);
  const now = new Date();
  const a = items.filter((x) => ym(new Date(dateOf(x))) === ym(now)).length;
  const b = items.filter((x) => ym(new Date(dateOf(x))) === ym(new Date(now.getFullYear(), now.getMonth() - 1, 15))).length;
  if (b === 0) return a ? `+${a} this month` : "None added this month";
  const pct = Math.round(((a - b) / b) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% from last month`;
}

// Invitation links last 7 days.
const isLive = (invite) => invite.expiresAt > Date.now();

const pick = (v, allowed) => (typeof v === "string" && allowed.includes(v) ? v : "");

export default async function TeamPage({ searchParams }) {
  const me = await requireAdmin("team");
  const params = await searchParams;
  const [users, roles, invites] = await Promise.all([listUsers(), listRoles(), listInvites()]);

  // Team members + pending invitations, newest first.
  const members = users
    .filter(isTeamMember)
    .map((u) => ({
      kind: "member",
      id: u.id,
      name: `${u.firstName} ${u.lastName}`.trim() || "(name not set yet)",
      email: u.email,
      roleId: roleOf(u.teamRoleId).id,
      role: roleOf(u.teamRoleId).name,
      status: u.teamStatus === "inactive" ? "inactive" : "active",
      addedAt: u.addedToTeamAt ?? u.createdAt,
      added: dateLabel(u.addedToTeamAt ?? u.createdAt),
      lastLogin: lastLoginLabel(u.lastLoginAt),
      isMe: u.id === me.id,
    }));
  const pending = invites.map((i) => ({
    kind: "invite",
    id: i.id,
    name: `${i.firstName} ${i.lastName}`.trim() || "—",
    email: i.email,
    roleId: roleOf(i.roleId).id,
    role: roleOf(i.roleId).name,
    status: isLive(i) ? "invited" : "expired",
    addedAt: i.createdAt,
    added: dateLabel(i.createdAt),
    lastLogin: { day: isLive(i) ? "Not joined yet" : "Link expired", time: "" },
  }));
  const everyone = [...members, ...pending].sort((a, b) => b.addedAt.localeCompare(a.addedAt));

  const view = params.view === "roles" ? "roles" : "teams";
  const filters = {
    q: typeof params.q === "string" ? params.q.trim().slice(0, 80) : "",
    status: pick(params.status, ["active", "inactive", "invited"]),
    role: pick(params.role, roles.map((r) => r.id)),
  };
  const words = filters.q.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = everyone.filter((m) => {
    const text = `${m.name} ${m.email} ${m.role}`.toLowerCase();
    return (
      words.every((w) => text.includes(w)) &&
      (!filters.status || (filters.status === "invited" ? m.kind === "invite" : m.status === filters.status)) &&
      (!filters.role || m.roleId === filters.role)
    );
  });
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pages);
  const rows = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const active = members.filter((m) => m.status === "active").length;
  const superCount = members.filter((m) => m.roleId === SUPER_ADMIN.id).length;
  const inactive = members.length - active;
  const stats = (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard title="Total Employees" value={members.length} note={monthNote(members, (m) => m.addedAt)} icon="people" />
      <StatCard title="Active Employees" value={active} note={active === members.length ? "Everyone has access" : `${inactive} turned off`} icon="check" />
      <StatCard title="Inactive Employees" value={inactive} note={pending.length ? `${pending.length} invitation${pending.length === 1 ? "" : "s"} pending` : "No pending invitations"} icon="alarm" />
      <StatCard title="Total Roles" value={roles.length} note={`${superCount} Super Admin · ${members.length - superCount} Admin`} icon="folder" />
    </div>
  );

  const roleRows = roles.map((r) => ({
    ...r,
    members: members.filter((m) => m.roleId === r.id).length,
    invites: pending.filter((p) => p.roleId === r.id).length,
  }));

  // "No Team Members Added Yet": only you on the team and nobody invited.
  const empty = members.length <= 1 && pending.length === 0;

  return (
    <TeamManager
      key={`${view}-${page}-${filters.q}-${filters.status}-${filters.role}`}
      empty={empty}
      view={view}
      rows={rows}
      roles={roleRows}
      stats={stats}
      filters={filters}
      page={page}
      pages={pages}
      total={matches.length}
      from={(page - 1) * PAGE_SIZE + 1}
      meId={me.id}
    />
  );
}
