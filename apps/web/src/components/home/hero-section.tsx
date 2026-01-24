import { Button } from "@/components/ui/button";
import { Brain, Sparkles, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center text-center gap-6">
      {/* Badge */}
      <div className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 animate-in fade-in slide-in-from-top-4 duration-700">
        <Sparkles className="mr-2 h-4 w-4" />
        Train your mind every day
      </div>
      
      {/* Main heading */}
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        Enter the{" "}
        <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
          MindArena
        </span>
        <br />
        and become a memory master
      </h1>
      
      {/* Description */}
      <p className="max-w-[42rem] leading-relaxed text-muted-foreground sm:text-xl sm:leading-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        Compete with other players in exciting memory games. 
        Develop your cognitive abilities and climb the rankings!
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
        <Button size="lg" className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
          <Brain className="mr-2 h-5 w-5" />
          Start Playing
        </Button>
        <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold group">
          How it works
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
}
