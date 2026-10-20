import { CinematicIntro } from "@/components/cinematic/CinematicIntro";
import { numeral } from "@/components/v2/nav";
import { V2Plans } from "@/components/v2/V2Plans";
import {
  V2Amenities,
  V2Architecture,
  V2Contact,
  V2Facts,
  V2Financing,
  V2Location,
  V2Manifesto,
  V2Nature,
  V2Residences,
} from "@/components/v2/V2Sections";
import { sectionIds } from "@/lib/navigation";

/** v2 order: film → manifesto → figures → residences → plans → architecture → amenities → nature → location → financing → contact. */
export default function V2Page() {
  return (
    <main id="top">
      <CinematicIntro nextSectionId={sectionIds.introduction} look="v2" />
      <V2Manifesto />
      <V2Facts />
      <V2Residences />
      <V2Plans index={numeral("plans")} />
      <V2Architecture />
      <V2Amenities />
      <V2Nature />
      <V2Location />
      <V2Financing />
      <V2Contact />
    </main>
  );
}
