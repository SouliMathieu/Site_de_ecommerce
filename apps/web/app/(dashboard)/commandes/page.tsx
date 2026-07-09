'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import type { OrderDto, OrderStatus } from '@vente/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { EmptyState } from '@/components/dashboard/empty-state';
import { OrderStatusMenu } from '@/components/dashboard/order-status-menu';
import { DeliveryStatusBadge } from '@/components/dashboard/status-badge';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatMoney, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function CommandesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const currency = user?.currency ?? 'XOF';

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiFetch<OrderDto[]>('/orders'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      apiFetch<OrderDto>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['stats-overview'] });
    },
    onError: (error) =>
      toast({ variant: 'destructive', title: 'Erreur', description: error instanceof ApiError ? error.message : 'Réessayez.' }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Commandes</h1>
        <p className="text-sm text-muted-foreground">Suivez et mettez à jour le statut de vos commandes.</p>
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}

      {!isLoading && orders.length === 0 && (
        <EmptyState
          icon={ShoppingCart}
          title="Aucune commande pour le moment"
          description="Les commandes passées par vos clients apparaîtront ici."
        />
      )}

      {!isLoading && orders.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Livraison</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{order.address}</TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell className="font-medium">{formatMoney(order.total, currency)}</TableCell>
                <TableCell>
                  <OrderStatusMenu
                    status={order.status}
                    disabled={statusMutation.isPending}
                    onChange={(status) => statusMutation.mutate({ id: order.id, status })}
                  />
                </TableCell>
                <TableCell>
                  {order.delivery ? <DeliveryStatusBadge status={order.delivery.status} /> : '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
