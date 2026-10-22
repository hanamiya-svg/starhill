import { CinematicIntro } from "@/components/cinematic/CinematicIntro";
import { V4Advantages } from "@/components/v4/V4Advantages";
import { V4Intro } from "@/components/v4/V4Intro";
import { V4Planning } from "@/components/v4/V4Planning";
import { V4Residences } from "@/components/v4/V4Residences";
import { V4Sports } from "@/components/v4/V4Sports";
import { sectionIds } from "@/components/v4/navigation";
import { ContactSection } from "@/components/v4/sections/ContactSection";

/** v4 (from v1): film → Танилцуулга → Төлөвлөлт → Спорт цогцолбор → Орон сууц → Давуу тал → contact. */
export default function V4Page() {
  return (
    <main id="top">
      <CinematicIntro nextSectionId={sectionIds.introduction} look="v4" />
      <V4Intro />
      <V4Planning />
      <V4Sports />
      <V4Residences />
      <V4Advantages />
      <ContactSection />
    </main>
  );
}
