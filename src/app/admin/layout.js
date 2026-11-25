// Admin area: no shop navbar/footer, and kept out of search engines.
export const metadata = {
  title: { default: "Admin", template: "%s | Digicon Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <main className="flex flex-1 flex-col bg-white text-ink">{children}</main>;
}
