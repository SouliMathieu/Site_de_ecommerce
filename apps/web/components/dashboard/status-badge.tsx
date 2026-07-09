import type { BadgeProps } from '@/components/ui/badge';
import { Badge } from '@/components/ui/badge';
import type { DeliveryStatus, OrderStatus } from '@vente/shared';

const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; variant: BadgeProps['variant'] }> = {
  EN_ATTENTE: { label: 'En attente', variant: 'warning' },
  CONFIRMEE: { label: 'Confirmée', variant: 'success' },
  ANNULEE: { label: 'Annulée', variant: 'destructive' },
};

const DELIVERY_STATUS_MAP: Record<DeliveryStatus, { label: string; variant: BadgeProps['variant'] }> = {
  EN_ATTENTE: { label: 'En attente', variant: 'secondary' },
  EN_COURS: { label: 'En cours', variant: 'warning' },
  LIVRE: { label: 'Livrée', variant: 'success' },
  ECHEC: { label: 'Échec', variant: 'destructive' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, variant } = ORDER_STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const { label, variant } = DELIVERY_STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
