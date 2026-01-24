import { Brain } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-10 text-center text-sm text-muted-foreground">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <Brain className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-semibold text-foreground">MindArena</span>
      </div>
      <p>© 2026 MindArena. All rights reserved.</p>
    </footer>
  );
}
