import { CursorGlow, ScrollProgress } from "@/components/fx";
import { Hero, Nav } from "@/components/landing/Hero";
import { Faq, FinalCta, Footer, Journey, Marquee, Orbit, Plans, Stats, Story, Trust, Voices } from "@/components/landing/Sections";

export default function LandingPage() {
  return (
    <main className="relative bg-[#05060f]">
      <ScrollProgress />
      <CursorGlow />
      <Nav />
      <Hero />
      <Marquee />
      <Stats />
      <Orbit />
      <Story />
      <Journey />
      <Voices />
      <Trust />
      <Plans />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
