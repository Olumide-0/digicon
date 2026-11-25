import PageIntro from "@/components/ui/PageIntro";
import ContactForm from "@/components/ContactForm";
import { contactEmails, phoneLines, tradingHours } from "@/data/contact";

export const metadata = { title: "Contact Us" };

const mail = "text-neutral-700 underline-offset-2 hover:text-brand hover:underline";

export default function ContactPage() {
  return (
    <div className="bg-white px-4 pt-6 pb-20 text-ink sm:px-8 sm:pt-10 lg:px-12 xl:px-16">
      <PageIntro crumbs={[{ label: "Home", href: "/" }, { label: "Contact Us", href: "/contact" }]} title="Contact Us">
        We&apos;d love to hear from you! Share your feedback by contacting{" "}
        <a href={`mailto:${contactEmails.manager}`} className={mail}>
          {contactEmails.manager}
        </a>
        . For any sales-related inquiries, email us at{" "}
        <a href={`mailto:${contactEmails.sales}`} className={mail}>
          {contactEmails.sales}
        </a>
        . If you have a technical query and can articulate it better in writing, please reach out to{" "}
        <a href={`mailto:${contactEmails.support}`} className={mail}>
          {contactEmails.support}
        </a>
        .
      </PageIntro>

      <div className="mt-10 grid gap-12 rounded-xl bg-[#f4f4f6] px-5 py-10 sm:px-10 sm:py-12 md:grid-cols-2 md:gap-16 lg:px-14">
        <section aria-labelledby="call-title">
          <h2 id="call-title" className="text-sm font-semibold text-neutral-600">
            Prefer to hear the person you&apos;re speaking to?
          </h2>
          <ul className="mt-6 grid gap-x-6 gap-y-5 text-xs text-neutral-600 sm:grid-cols-2">
            {phoneLines.map((p, i) => (
              <li key={i}>
                <a href={`tel:${p.number}`} className="text-sm text-brand hover:underline">
                  {p.number}
                </a>{" "}
                - ({p.label})
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-sm font-semibold text-neutral-600">Trading Hours:</h2>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs text-neutral-600">
            {tradingHours.map((t) => (
              <li key={t.days}>
                {t.hours} [{t.days}]
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="touch-title">
          <h2 id="touch-title" className="mb-4 text-sm font-semibold text-neutral-600">
            Get in Touch
          </h2>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
