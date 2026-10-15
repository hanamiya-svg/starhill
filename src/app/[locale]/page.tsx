import { CinematicIntro } from "@/components/cinematic/CinematicIntro";
import { ArchitectureShowcase } from "@/components/sections/ArchitectureShowcase";
import { ContactSection } from "@/components/sections/ContactSection";
import { EditorialIntro } from "@/components/sections/EditorialIntro";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { LocationSection } from "@/components/sections/LocationSection";
import { NatureSection } from "@/components/sections/NatureSection";
import { ProjectGallery } from "@/components/sections/ProjectGallery";
import { ProjectOverview } from "@/components/sections/ProjectOverview";
import { ResidencesSection } from "@/components/sections/ResidencesSection";
import { sectionIds } from "@/lib/navigation";

export default function HomePage() {
  return (
    <main id="top">
      <CinematicIntro nextSectionId={sectionIds.introduction} />
      <EditorialIntro />
      <ArchitectureShowcase />
      <NatureSection />
      <ExperienceSection />
      <ResidencesSection />
      <ProjectOverview />
      <ProjectGallery />
      <LocationSection />
      <ContactSection />
    </main>
  );
}
