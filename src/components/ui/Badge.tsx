type Tone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning'

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-border/60 text-ink',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-accent/15 text-accent',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}

/** Mappe les statuts métier (FR) vers un ton visuel cohérent dans toute l'app. */
export const STATUT_TONE: Record<string, Tone> = {
  // Commandes
  nouvelle: 'neutral',
  confirmee: 'primary',
  dispatchee: 'warning',
  recuperee: 'warning',
  livree: 'success',
  echouee: 'danger',
  annulee: 'danger',
  // Produits
  brouillon: 'neutral',
  publie: 'success',
  archive: 'neutral',
  // Livreurs
  disponible: 'success',
  occupe: 'warning',
  hors_ligne: 'neutral',
}

export function StatutBadge({ statut, label }: { statut: string; label?: string }) {
  return <Badge tone={STATUT_TONE[statut] ?? 'neutral'}>{label ?? statut}</Badge>
}
