'use client';

import type { OrderStatus } from '@vente/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrderStatusBadge } from './status-badge';

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'CONFIRMEE', label: 'Confirmée' },
  { value: 'ANNULEE', label: 'Annulée' },
];

export function OrderStatusMenu({
  status,
  onChange,
  disabled,
}: {
  status: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled} className="disabled:opacity-50">
        <OrderStatusBadge status={status} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {STATUSES.map((s) => (
          <DropdownMenuItem key={s.value} onClick={() => onChange(s.value)}>
            {s.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
