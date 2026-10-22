import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { sectionIds } from "@/components/v4/navigation";
import { siteConfig } from "@/lib/site-config";
import { BrochureForm } from "./BrochureForm";
import { ContactDirect } from "./ContactDirect";

export async function ContactSection() {
  const t = await getTranslations("contact");

  return (
    <section
      id={sectionIds.contact}
      aria-labelledby="contact-heading"
      data-nav-theme="light"
      className="border-t border-line bg-ivory py-section"
    >
      <div className="container-editorial">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <SectionLabel index="09">{t("label")}</SectionLabel>
            <SectionHeading id="contact-heading" className="mt-8 text-ink">
              {t("heading")}
            </SectionHeading>
          </div>
          <Reveal className="self-end md:col-span-4 md:col-start-9" delay={0.5}>
            <p className="text-[0.9375rem] leading-[1.8] text-ink-muted">{t("intro")}</p>
          </Reveal>
        </div>

        <Reveal className="mt-16 md:mt-24" y={16}>
          <BrochureForm
            brochurePath={siteConfig.brochure.path}
            brochureFilename={siteConfig.brochure.downloadFilename}
            contactEmail={siteConfig.contact.email}
            contactPhone={siteConfig.contact.phone}
          />
        </Reveal>

        <ContactDirect email={siteConfig.contact.email} phone={siteConfig.contact.phone} website={siteConfig.contact.website} />
      </div>
    </section>
  );
}
