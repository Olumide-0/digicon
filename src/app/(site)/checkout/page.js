import { redirect } from "next/navigation";
import PageIntro from "@/components/ui/PageIntro";
import CheckoutView from "@/components/checkout/CheckoutView";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { getProducts } from "@/lib/catalog/store";

export const metadata = { title: "Checkout" };

// Customers must be signed in to check out.
export default async function CheckoutPage() {
  const session = await getSession();
  const user = session && (await findUserById(session.userId));
  if (!user) redirect("/signin?next=/checkout");

  return (
    <div className="min-h-[60vh] bg-white px-4 pt-6 text-ink sm:px-8 sm:pt-10 lg:px-12 xl:px-16">
      <PageIntro
        crumbs={[
          { label: "Home", href: "/" },
          { label: "My Cart", href: "/cart" },
          { label: "Checkout", href: "/checkout" },
        ]}
        title="Checkout"
      >
        Enter your delivery details, choose how you&apos;d like to receive your order, and review everything before you pay.
      </PageIntro>
      <CheckoutView account={{ firstName: user.firstName, lastName: user.lastName, phone: user.phone, address: user.address ?? null }} products={await getProducts()} />
    </div>
  );
}
