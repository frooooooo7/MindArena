import { Navbar } from "@/components/navbar";
import {
  ArenaPromo,
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
          <PlayerProgress />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <ArenaPromo />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}
