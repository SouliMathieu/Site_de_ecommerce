'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone, Truck } from 'lucide-react';
import type { DeliveryDto, DeliveryStatus } from '@vente/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { EmptyState } from '@/components/dashboard/empty-state';
import { DeliveryTimeline } from '@/components/dashboard/delivery-timeline';
import { DeliveryStatusMenu } from '@/components/dashboard/delivery-status-menu';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatMoney, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

function DeliveryCard({
  delivery,
  onStatusChange,
  isUpdating,
}: {
  delivery: DeliveryDto;
  onStatusChange: (status: DeliveryStatus) => void;
  isUpdating: boolean;
}) {
  const { user } = useAuth();
  const currency = user?.currency ?? 'XOF';

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="font-medium">{delivery.order?.customerName ?? 'Client'}</p>
            <span className="text-xs text-muted-foreground">· {formatDate(delivery.updatedAt)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {delivery.order?.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {delivery.order.address}
              </span>
            )}
            {delivery.order?.customerPhone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {delivery.order.customerPhone}
              </span>
            )}
            {delivery.order?.total !== undefined && (
              <span className="font-medium text-foreground">{formatMoney(delivery.order.total, currency)}</span>
            )}
          </div>
          <DeliveryTimeline status={delivery.status} />
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
          <DeliveryStatusMenu status={delivery.status} disabled={isUpdating} onChange={onStatusChange} />
          {delivery.zone && <span className="text-xs text-muted-foreground">Zone : {delivery.zone}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LivraisonsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = React.useState('toutes');

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => apiFetch<DeliveryDto[]>('/deliveries'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DeliveryStatus }) =>
      apiFetch<DeliveryDto>(`/deliveries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
    onError: (error) =>
      toast({ variant: 'destructive', title: 'Erreur', description: error instanceof ApiError ? error.message : 'Réessayez.' }),
  });

  const filtered = deliveries.filter((d) => {
    if (tab === 'en-cours') return d.status === 'EN_ATTENTE' || d.status === 'EN_COURS';
    if (tab === 'livrees') return d.status === 'LIVRE';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Livraisons</h1>
        <p className="text-sm text-muted-foreground">Suivez vos livraisons en cours et livrées.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="toutes">Toutes</TabsTrigger>
          <TabsTrigger value="en-cours">En cours</TabsTrigger>
          <TabsTrigger value="livrees">Livrées</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}

          {!isLoading && filtered.length === 0 && (
            <EmptyState icon={Truck} title="Aucune livraison" description="Aucune livraison ne correspond à ce filtre." />
          )}

          {filtered.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              isUpdating={statusMutation.isPending}
              onStatusChange={(status) => statusMutation.mutate({ id: delivery.id, status })}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
