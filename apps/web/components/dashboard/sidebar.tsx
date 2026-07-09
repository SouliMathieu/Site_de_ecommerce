import { Sparkles } from 'lucide-react';
import { NavLinks } from './nav-links';

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/50 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="font-semibold tracking-tight">Vente Intelligente</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <NavLinks />
      </div>
      <div className="px-6 py-4 text-xs text-muted-foreground">Phase 1 — Fondations</div>
    </aside>
  );
}
