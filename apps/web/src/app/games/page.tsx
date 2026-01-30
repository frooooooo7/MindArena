"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { GAME_TYPES } from "@/lib/games/game-types";

export default function GamesPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundGradients />
      <Navbar />

      <main className="container relative w-full mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-4xl mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
            {GAME_TYPES.map((game) => {
              const Icon = game.icon;
              return (
                <Card
                  key={game.id}
                  className="group relative overflow-hidden border-violet-500/10 bg-gradient-to-b from-background to-violet-500/5 transition-all hover:shadow-2xl hover:shadow-violet-500/10 hover:border-violet-500/30"
                >
                  <CardHeader className="pb-4">
                    <div
                      className={`mb-3 h-14 w-14 rounded-xl bg-gradient-to-br ${game.color} p-3 text-white shadow-lg ${game.shadow ?? ''} transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-full w-full" />
                    </div>
                    <CardTitle className="text-xl">{game.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <div className="px-6 pb-6">
                    <Button asChild className="w-full group/btn">
                      <Link href={game.href ?? `/games/${game.id}`}>
                        Play Now
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
