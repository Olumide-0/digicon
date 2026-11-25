import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Shop pages: site navbar + footer. (The admin area under /admin has its own layout.)
export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">{children}</main>
      <Footer />
    </>
  );
}
