import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Sparkles, KeyRound } from "lucide-react";

const games = [
  {
    id: "sequence-memory",
    title: "Sequence Memory",
    description: "Remember and repeat the sequence of highlighted cells. Grid grows as you level up!",
    icon: Brain,
    href: "/games/sequence-memory",
    gradient: "from-violet-500 to-indigo-600",
    shadow: "shadow-violet-500/30",
  },
  {
    id: "chimp-memory",
    title: "Chimp Memory",
    description: "Numbers flash briefly on the grid. Memorize and click them in ascending order!",
    icon: Sparkles,
    href: "/games/chimp-memory",
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/30",
  },
  {
    id: "code-memory",
    title: "Code Memory",
    description: "See a random code for a few seconds, then type it from memory!",
    icon: KeyRound,
    href: "/games/code-memory",
    gradient: "from-cyan-500 to-blue-600",
    shadow: "shadow-cyan-500/30",
  },
];

export default function GamesPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundGradients />
      <Navbar />

      <main className="container relative w-full mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col items-center gap-8">
          {/* Title */}
          <div className="text-center max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Memory Games
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Challenge your mind with our collection of memory games. 
              Track your progress and compete for the highest scores!
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-4xl mt-8">
            {games.map((game) => (
              <Card
                key={game.id}
                className="group relative overflow-hidden border-violet-500/10 bg-gradient-to-b from-background to-violet-500/5 transition-all hover:shadow-2xl hover:shadow-violet-500/10 hover:border-violet-500/30"
              >
                <CardHeader className="pb-4">
                  <div
                    className={`mb-3 h-14 w-14 rounded-xl bg-gradient-to-br ${game.gradient} p-3 text-white shadow-lg ${game.shadow} transition-transform group-hover:scale-110`}
                  >
                    <game.icon className="h-full w-full" />
                  </div>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-6">
                  <Button asChild className="w-full group/btn">
                    <Link href={game.href}>
                      Play Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
