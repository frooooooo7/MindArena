import { Navbar } from "@/components/navbar";
import {
  ArenaPromo,
  FeaturesGrid,
  Footer,
  HeroSection,
  PlayerProgress,
} from "@/components/home";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <PlayerProgress />
        <ArenaPromo />
      </main>
      <Footer />
    </div>
  );
}
