import Link from "next/link";
import { Brain } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

interface AuthCardProps {
    children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
    return (
        <div className="w-full max-w-md">
            {/* Header with Logo */}
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2.5 group">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 transition-all group-hover:shadow-violet-500/40 group-hover:scale-105">
                        <Brain className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        MindArena
                    </span>
                </Link>
                <p className="mt-4 text-muted-foreground">
                    Train your mind, challenge your limits
                </p>
            </div>

            {/* Card */}
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/10 bg-background/80 backdrop-blur-xl shadow-2xl shadow-violet-500/5">
                {/* Gradient border effect */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

                <div className="p-8">
                    {children}
                </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex justify-center mt-6">
                <ModeToggle />
            </div>
        </div>
    );
}
