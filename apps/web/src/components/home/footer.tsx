import Link from "next/link";

const footerLinks = [
  { label: "Games", href: "/games" },
  { label: "Arena", href: "/arena" },
  { label: "Ranking", href: "/stats" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#070a12]">
      <div className="portal-section flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-[-0.055em]"
          aria-label="MindArena home"
        >
          MIND<span className="text-portal-mint">ARENA</span>
        </Link>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-5">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">
          © 2026 MindArena. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
