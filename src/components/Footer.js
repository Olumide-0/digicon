import Link from "next/link";
import { contact, footerLinks, socials } from "@/data/footer";
import NewsletterForm from "./NewsletterForm";
import {
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  SnapchatIcon,
  XLogoIcon,
} from "./icons";

const socialIcons = { X: XLogoIcon, Snapchat: SnapchatIcon, Instagram: InstagramIcon };

function ColumnTitle({ children }) {
  return <h2 className="text-sm font-semibold text-white sm:text-base">{children}</h2>;
}

export default function Footer() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    contact.address.join(", ")
  )}`;

  return (
    <footer className="bg-ink text-white">
      <div className="px-4 pt-14 pb-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-12 xl:flex-row xl:justify-between">
          {/* Link columns */}
          <div className="flex flex-col gap-10 sm:flex-row sm:flex-wrap sm:gap-x-12 lg:gap-x-14">
            {footerLinks.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <ColumnTitle>{col.title}</ColumnTitle>
                <ul className="mt-6 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-white/60 transition hover:text-brand">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div>
              <ColumnTitle>For inquiries</ColumnTitle>
              <ul className="mt-6 space-y-3 text-sm text-white/60">
                <li>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 transition hover:text-brand"
                  >
                    <PhoneIcon className="size-5 shrink-0 text-brand" />
                    {contact.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 transition hover:text-brand"
                  >
                    <MailIcon className="size-5 shrink-0 text-brand" />
                    {contact.email}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <ColumnTitle>Address</ColumnTitle>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex gap-3 text-sm leading-relaxed text-white/60 transition hover:text-brand"
              >
                <PinIcon className="mt-0.5 size-5 shrink-0 text-brand" />
                <address className="not-italic">
                  {contact.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="w-full max-w-md xl:max-w-sm 2xl:max-w-md">
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex flex-col items-start gap-6 sm:mt-20 sm:flex-row sm:items-end sm:justify-between">
          <ul className="flex items-center gap-5">
            {socials.map(({ name, href }) => {
              const Icon = socialIcons[name];
              return (
                <li key={name}>
                  <a
                    href={href}
                    aria-label={`Digicon on ${name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white transition hover:text-brand"
                  >
                    <Icon className="size-6 sm:size-7" />
                  </a>
                </li>
              );
            })}
          </ul>

          <Link
            href="/"
            aria-label="Digicon home"
            className="text-4xl leading-none font-semibold tracking-tight text-brand sm:text-5xl lg:text-6xl"
          >
            Digicon
          </Link>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Digicon. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
