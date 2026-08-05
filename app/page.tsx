import { ClientAccessCta } from "@/components/home/client-access-cta";
import { HeroSection } from "@/components/home/hero-section";
import { LeadSection } from "@/components/home/lead-section";
import { ModulesSection } from "@/components/home/modules-section";
import { ProcessSection } from "@/components/home/process-section";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-20 py-6 sm:py-10">
      <HeroSection />
      <ModulesSection />
      <ProcessSection />
      <LeadSection />
      <ClientAccessCta />
    </div>
  );
}
