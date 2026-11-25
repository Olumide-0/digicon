import Link from "next/link";
import { redirect } from "next/navigation";
import PageIntro from "@/components/ui/PageIntro";
import EditableItem from "@/components/account/EditableItem";
import PasswordMask from "@/components/account/PasswordMask";
import SignOutButton from "@/components/account/SignOutButton";
import OrderHistory from "@/components/account/OrderHistory";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { changePassword, updateAddress, updateEmail, updateName, updatePhone } from "@/lib/account/actions";
import { findOrdersByUser } from "@/lib/checkout/orders";
import { countries } from "@/data/shipping";

export const metadata = { title: "My Account" };

const COUNTRY_CODES = { Nigeria: "NG", Ghana: "GH", Kenya: "KE", "South Africa": "ZA", "United Kingdom": "GB", "United States": "US" };
const INTRO = "Manage your details, orders, and preferences all in one place. It's your hub for staying in control.";

function Row({ label, children }) {
  return (
    <div className="grid gap-3 border-b border-neutral-200 py-7 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-6">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Tabs({ tab }) {
  const item = (key, label, href) => (
    <Link
      href={href}
      aria-current={tab === key ? "page" : undefined}
      className={`pb-4 text-base ${tab === key ? "font-semibold text-ink" : "font-medium text-neutral-500 hover:text-ink"}`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mt-12 sm:mt-16">
      <nav aria-label="Account sections" className="flex gap-16 px-0.5">
        {item("account", "Account", "/account")}
        {item("orders", "Order", "/account?tab=orders")}
      </nav>
      <div aria-hidden className="h-1.5 rounded-full bg-brand" />
    </div>
  );
}

function SideNav({ section }) {
  const item = (key, label) => (
    <li>
      <Link
        href={key === "personal" ? "/account" : `/account?section=${key}`}
        aria-current={section === key ? "page" : undefined}
        className={`block py-1 text-xs font-semibold ${section === key ? "text-ink" : "text-neutral-500 hover:text-ink"}`}
      >
        {label}
      </Link>
      {section === key && <span aria-hidden className="mt-2.5 block h-1.5 rounded-full bg-brand" />}
    </li>
  );
  return (
    <nav aria-label="Account settings" className="flex h-fit flex-col rounded-xl bg-[#f4f4f6] px-4 py-6 lg:min-h-62">
      <ul className="space-y-5">
        {item("personal", "Personal Information")}
        {item("security", "Sign-in and security")}
      </ul>
      <div className="mt-10 border-t border-neutral-300 pt-4 lg:mt-auto">
        <SignOutButton className="text-xs font-semibold text-neutral-500 transition hover:text-red-600" />
      </div>
    </nav>
  );
}

function PersonalInformation({ user }) {
  const a = user.address;
  return (
    <section aria-labelledby="personal-title">
      <h2 id="personal-title" className="text-base font-semibold">
        Personal Information
      </h2>
      <p className="mt-3 text-sm text-neutral-600">{INTRO}</p>
      <div className="mt-8 border-t border-neutral-200">
        <Row label="Account Name">
          <EditableItem
            id="name"
            title={null}
            action={updateName}
            saveLabel="Save new name"
            fields={[
              { name: "firstName", label: "First Name", defaultValue: user.firstName, autoComplete: "given-name", maxLength: 60 },
              { name: "lastName", label: "Last Name", defaultValue: user.lastName, autoComplete: "family-name", maxLength: 60 },
            ]}
          >
            {user.firstName} {user.lastName}
          </EditableItem>
        </Row>

        <Row label="Contact info">
          <EditableItem
            id="email"
            title="Email address"
            action={updateEmail}
            saveLabel="Save email"
            fields={[
              { name: "email", label: "Input new email address", type: "email", inputMode: "email", defaultValue: user.email, autoComplete: "email", maxLength: 254 },
              { name: "currentPassword", label: "Current password (to confirm)", type: "password", autoComplete: "current-password" },
            ]}
          >
            {user.email}
          </EditableItem>
          <div className="my-7 border-t border-neutral-200" />
          <EditableItem
            id="phone"
            title="Phone number"
            action={updatePhone}
            saveLabel="Save new phone number"
            fields={[{ name: "phone", label: "Phone number", type: "tel", inputMode: "tel", defaultValue: user.phone, autoComplete: "tel", maxLength: 20 }]}
          >
            {user.phone}
          </EditableItem>
        </Row>

        <Row label="Address">
          <EditableItem
            id="address"
            title={null}
            action={updateAddress}
            saveLabel="Save new address"
            editLabel={a ? "Edit" : "Add"}
            fields={[
              { name: "line1", label: "Street name", defaultValue: a?.line1, autoComplete: "street-address", maxLength: 200 },
              { name: "state", label: "State", defaultValue: a?.state, autoComplete: "address-level1", maxLength: 80 },
              { name: "country", label: "Country", type: "select", defaultValue: a?.country ?? "", options: countries.map((c) => ({ value: c, label: c })) },
            ]}
          >
            {a ? (
              <>
                {a.line1}
                <br />
                {a.state}
                <br />
                {COUNTRY_CODES[a.country] ?? a.country}
              </>
            ) : (
              <span className="text-neutral-500">No address saved yet. Add one to fill in checkout faster.</span>
            )}
          </EditableItem>
        </Row>
      </div>
    </section>
  );
}

function SignInSecurity() {
  return (
    <section aria-labelledby="security-title">
      <h2 id="security-title" className="text-base font-semibold">
        Sign-in and Security
      </h2>
      <p className="mt-3 text-sm text-neutral-600">{INTRO}</p>
      <div className="mt-8 border-t border-neutral-200">
        <Row label="Password">
          <EditableItem
            id="password"
            title={null}
            action={changePassword}
            editLabel="Change Password"
            ariaLabel="Change password"
            saveLabel="Save new password"
            savingMessage="Updating your password... Please wait."
            successMessage="Password updated successfully"
            roomy
            fields={[
              { name: "currentPassword", label: "Current password", type: "password", autoComplete: "current-password" },
              { name: "newPassword", label: "New password", type: "password", autoComplete: "new-password" },
              { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password", matches: "newPassword" },
            ]}
          >
            <PasswordMask />
          </EditableItem>
        </Row>
      </div>
    </section>
  );
}

export default async function AccountPage({ searchParams }) {
  const session = await getSession();
  const user = session && (await findUserById(session.userId));
  if (!user) redirect("/signin?next=/account");

  const params = await searchParams;
  const tab = params.tab === "orders" ? "orders" : "account";
  const section = params.section === "security" ? "security" : "personal";

  return (
    <div className="min-h-[70vh] bg-white px-4 pt-6 pb-20 text-ink sm:px-8 sm:pt-10 lg:px-12 xl:px-16">
      <PageIntro crumbs={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }]} title="Your Account Information">
        {INTRO}
      </PageIntro>

      <Tabs tab={tab} />

      <div className="mt-7">
        {tab === "orders" ? (
          <OrderHistory orders={await findOrdersByUser(user.id)} view={params.orders} page={params.page} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[11.5rem_minmax(0,1fr)] lg:gap-5">
            <SideNav section={section} />
            <div className="min-w-0 lg:px-1">
              {section === "security" ? <SignInSecurity /> : <PersonalInformation user={user} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
