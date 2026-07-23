"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Gamepad2,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Swords,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Games", href: "/games", icon: Gamepad2 },
  { name: "Play with Friends", href: "/play-with-friends", icon: Users },
  { name: "Stats", href: "/stats", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const { resolvedTheme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/8 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
      <div className="portal-section">
        <div className="flex h-[4.5rem] items-center justify-between">
          <Link
            href="/"
            className="font-display inline-flex min-h-11 items-center text-xl font-bold tracking-[-0.06em]"
            aria-label="MindArena home"
          >
            MIND<span className="text-portal-mint">ARENA</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors ${
                    active
                      ? "bg-white/8 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`size-4 ${active ? "text-portal-mint" : ""}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-1.5 pr-3 text-sm font-bold transition-colors hover:bg-white/10"
                    aria-label={`Open account menu for ${user?.name ?? "user"}`}
                  >
                    <UserAvatar
                      name={user?.name || "User"}
                      avatarUrl={user?.avatarUrl}
                      size="sm"
                    />
                    <span className="hidden max-w-28 truncate sm:inline">
                      {user?.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <Link href="/account?tab=overview">
                    <DropdownMenuItem className="cursor-pointer gap-2 font-semibold">
                      <User className="size-4 text-portal-mint" />
                      My Account
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/account?tab=social">
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <Users className="size-4 text-portal-mint" />
                      Friends
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/account">
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <Settings className="size-4" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() =>
                      setTheme(resolvedTheme === "dark" ? "light" : "dark")
                    }
                  >
                    {resolvedTheme === "dark" ? (
                      <Sun className="size-4" />
                    ) : (
                      <Moon className="size-4" />
                    )}
                    {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-1 sm:flex">
                <Link
                  href="/auth"
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/games"
                  className="inline-flex min-h-11 items-center rounded-full bg-portal-mint px-4 text-sm font-extrabold text-[#07150f] transition-transform hover:-translate-y-0.5"
                >
                  Quick play
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="size-11 rounded-full md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-white/8 py-3 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold ${
                      active
                        ? "bg-white/8 text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="size-5 text-portal-mint" />
                    {item.name}
                  </Link>
                );
              })}
              {!isAuthenticated && (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/8 pt-3">
                  <Link
                    href="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 text-sm font-bold"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/games"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-portal-mint text-sm font-extrabold text-[#07150f]"
                  >
                    Quick play
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
