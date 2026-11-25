import { Inter } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Digicon | Latest Gadgets, Computers & Tech Accessories",
    template: "%s | Digicon",
  },
  description:
    "Your premier destination for the latest gadgets, computers and tech accessories.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
