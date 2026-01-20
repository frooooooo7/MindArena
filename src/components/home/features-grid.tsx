import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Trophy, Users } from "lucide-react";

const features = [
  {
    title: "Memory Games",
    description: "Various challenges testing your memory and concentration.",
    icon: Brain,
    gradient: "from-violet-500 to-violet-600",
    shadow: "shadow-violet-500/30",
    border: "border-violet-500/10 hover:border-violet-500/30",
    bg: "to-violet-500/5",
    hoverShadow: "hover:shadow-violet-500/10",
  },
  {
    title: "Arena Mode",
    description: "Compete in real-time with players from around the world.",
    icon: Zap,
    gradient: "from-indigo-500 to-indigo-600",
    shadow: "shadow-indigo-500/30",
    border: "border-indigo-500/10 hover:border-indigo-500/30",
    bg: "to-indigo-500/5",
    hoverShadow: "hover:shadow-indigo-500/10",
  },
  {
    title: "Challenges",
    description: "Daily and weekly challenges with exclusive rewards.",
    icon: Trophy,
    gradient: "from-fuchsia-500 to-fuchsia-600",
    shadow: "shadow-fuchsia-500/30",
    border: "border-fuchsia-500/10 hover:border-fuchsia-500/30",
    bg: "to-fuchsia-500/5",
    hoverShadow: "hover:shadow-fuchsia-500/10",
  },
  {
    title: "Community",
    description: "Join thousands of players developing their minds.",
    icon: Users,
    gradient: "from-cyan-500 to-cyan-600",
    shadow: "shadow-cyan-500/30",
    border: "border-cyan-500/10 hover:border-cyan-500/30",
    bg: "to-cyan-500/5",
    hoverShadow: "hover:shadow-cyan-500/10",
  },
];

export function FeaturesGrid() {
  return (
    <section className="shrink-0 pb-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className={`group relative overflow-hidden ${feature.border} bg-gradient-to-b from-background ${feature.bg} transition-all hover:shadow-2xl ${feature.hoverShadow}`}
          >
            <CardHeader>
              <div
                className={`mb-3 h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 text-white shadow-lg ${feature.shadow} transition-transform group-hover:scale-110`}
              >
                <feature.icon className="h-full w-full" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
