'use client';

import * as React from 'react';
import { Bell, PackageCheck, ShoppingBag, Info } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationDto } from '@vente/shared';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiFetch, getAccessToken } from '@/lib/api-client';
import { createNotificationsSocket } from '@/lib/socket';
import { formatDate, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const ICONS: Record<NotificationDto['type'], typeof Bell> = {
  NOUVELLE_COMMANDE: ShoppingBag,
  LIVRAISON_MISE_A_JOUR: PackageCheck,
  SYSTEME: Info,
};

export function NotificationsMenu() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<NotificationDto[]>('/notifications'),
  });

  React.useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const socket = createNotificationsSocket(token);
    socket.on('notification', (notification: NotificationDto) => {
      queryClient.setQueryData<NotificationDto[]>(['notifications'], (prev = []) => [
        notification,
        ...prev,
      ]);
      toast({ title: 'Nouvelle notification', description: notification.message });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, toast]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    queryClient.setQueryData<NotificationDto[]>(['notifications'], (prev = []) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            Aucune notification pour le moment.
          </p>
        )}
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {notifications.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors hover:bg-secondary',
                  !n.read && 'bg-primary/5',
                )}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1">
                  <span className="block text-foreground">{n.message}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
                </span>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
