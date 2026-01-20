import { Navbar } from "@/components/navbar";
import { 
  HeroSection, 
  FeaturesGrid, 
  Footer, 
  BackgroundGradients 
} from "@/components/home";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Gradients */}
      <BackgroundGradients />

      {/* Navbar */}
      <Navbar />

      {/* Main Content - fits in viewport */}
      <main className="container relative w-full mx-auto px-4 md:px-8 h-[calc(100vh-4rem)] flex flex-col">
        <HeroSection />
        <FeaturesGrid />
      </main>
      
      {/* Footer - below fold */}
      <footer className="container relative w-full mx-auto px-4 md:px-8">
        <Footer />
      </footer>
    </div>
  );
}
