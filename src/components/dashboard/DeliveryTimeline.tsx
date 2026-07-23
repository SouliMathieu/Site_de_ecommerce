import type { StatutCommande } from '@/types/commande'

const ETAPES: { statut: StatutCommande; label: string }[] = [
  { statut: 'dispatchee', label: 'Dispatchée' },
  { statut: 'recuperee', label: 'Récupérée' },
  { statut: 'livree', label: 'Livrée' },
]

export function DeliveryTimeline({ statut }: { statut: StatutCommande }) {
  if (statut === 'echouee' || statut === 'annulee') {
    return (
      <div className="flex items-center gap-2 text-sm text-danger">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/10">✕</span>
        {statut === 'echouee' ? 'Livraison échouée' : 'Commande annulée'}
      </div>
    )
  }

  const currentIndex = ETAPES.findIndex((e) => e.statut === statut)

  return (
    <div className="flex items-center">
      {ETAPES.map((etape, i) => {
        const done = currentIndex >= i
        const isLast = i === ETAPES.length - 1
        return (
          <div key={etape.statut} className="flex items-center">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  done ? 'bg-primary text-white' : 'bg-border/60 text-muted'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={`mt-1 text-[11px] ${done ? 'text-ink' : 'text-muted'}`}>{etape.label}</span>
            </div>
            {!isLast && (
              <div className={`mb-4 h-px w-8 ${currentIndex > i ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}