import { Search } from 'lucide-react';
import { MobileSidebar } from './mobile-sidebar';
import { ThemeToggle } from './theme-toggle';
import { NotificationsMenu } from './notifications-menu';
import { UserMenu } from './user-menu';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <MobileSidebar />
      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher un produit, une commande…" className="pl-9" />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationsMenu />
        <div className="mx-1 h-6 w-px bg-border" />
        <UserMenu />
      </div>
    </header>
  );
}
