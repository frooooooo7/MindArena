"use client";

import Link from "next/link";
import { useState } from "react";
import { Brain, Swords, Gamepad2, Trophy, BarChart3, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

const navItems = [
  { name: "Arena", href: "/arena", icon: Swords },
  { name: "Games", href: "/games", icon: Gamepad2 },
  { name: "Challenges", href: "/challenges", icon: Trophy },
  { name: "Stats", href: "/stats", icon: BarChart3 },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 transition-all group-hover:shadow-violet-500/40 group-hover:scale-105">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              MindArena
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <item.icon className="h-4 w-4 transition-colors group-hover:text-violet-500" />
                <span>{item.name}</span>
                <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-violet-500/0 via-violet-500/70 to-violet-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                href="/account"
                className="group relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <User className="h-4 w-4 transition-colors group-hover:text-violet-500" />
                <span>Account</span>
                <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-violet-500/0 via-violet-500/70 to-violet-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-3 bg-secondary/30 pl-1 pr-4 py-1 rounded-full border border-border/40 hover:bg-secondary/50 transition-colors cursor-pointer group/user">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-md group-hover/user:scale-105 transition-transform">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    {user?.name}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="hidden sm:flex h-9 px-4 gap-2 font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button
                  size="sm"
                  className="hidden sm:flex h-9 px-4 font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                >
                  Sign In
                </Button>
              </Link>
            )}
            <ModeToggle />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 py-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <item.icon className="h-5 w-5 text-violet-500" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
