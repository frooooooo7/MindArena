import { Navbar } from "@/components/navbar";
import {
  FriendsDuelPromo,
  CognitiveDomains,
  FeaturesGrid,
  Footer,
  HeroSection,
  PlayerProgress,
  ScrollReveal,
} from "@/components/home";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <ScrollReveal>
          <CognitiveDomains />
        </ScrollReveal>
        <ScrollReveal delay={0.02}>
          <PlayerProgress />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <FriendsDuelPromo />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}

