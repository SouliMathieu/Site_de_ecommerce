'use client';

import type { DeliveryStatus } from '@vente/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeliveryStatusBadge } from './status-badge';

const STATUSES: { value: DeliveryStatus; label: string }[] = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'LIVRE', label: 'Livrée' },
  { value: 'ECHEC', label: 'Échec' },
];

export function DeliveryStatusMenu({
  status,
  onChange,
  disabled,
}: {
  status: DeliveryStatus;
  onChange: (status: DeliveryStatus) => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled} className="disabled:opacity-50">
        <DeliveryStatusBadge status={status} />
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
