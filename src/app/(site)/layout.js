import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCategoryTree, toMenu } from "@/lib/catalog/categories";

// Shop pages: site navbar + footer. (The admin area under /admin has its own layout.)
export default async function SiteLayout({ children }) {
  const menu = toMenu(await getCategoryTree());
  return (
    <>
      <Navbar categories={menu} />
      <main className="flex-1 bg-white">{children}</main>
      <Footer />
    </>
  );
}
