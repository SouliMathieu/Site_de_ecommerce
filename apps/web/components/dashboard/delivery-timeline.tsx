import { Check, X } from 'lucide-react';
import type { DeliveryStatus } from '@vente/shared';
import { cn } from '@/lib/utils';

const STEPS: { status: DeliveryStatus; label: string }[] = [
  { status: 'EN_ATTENTE', label: 'En attente' },
  { status: 'EN_COURS', label: 'En cours' },
  { status: 'LIVRE', label: 'Livrée' },
];

export function DeliveryTimeline({ status }: { status: DeliveryStatus }) {
  if (status === 'ECHEC') {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/15">
          <X className="h-3.5 w-3.5" />
        </span>
        Échec de livraison
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        const isLast = index === STEPS.length - 1;
        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium',
                  done ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className={cn('text-[11px]', done ? 'text-foreground' : 'text-muted-foreground')}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={cn('mx-1.5 h-0.5 w-8 rounded-full', index < currentIndex ? 'bg-primary' : 'bg-secondary')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
