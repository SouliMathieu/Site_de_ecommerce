'use client'

import { useRef, useState } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { StatutBadge } from '@/components/ui/Badge'
import { STATUT_COMMANDE_LABELS } from '@/types/commande'
import type { StatutCommande } from '@/types/commande'

const TOUS_LES_STATUTS: StatutCommande[] = [
  'nouvelle',
  'confirmee',
  'dispatchee',
  'recuperee',
  'livree',
  'echouee',
  'annulee',
]

interface CommandeStatusMenuProps {
  statut: StatutCommande
  onChange: (next: StatutCommande) => void
  disabled?: boolean
}

export function CommandeStatusMenu({ statut, onChange, disabled }: CommandeStatusMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  useClickOutside(ref, () => setIsOpen(false))

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        <StatutBadge statut={statut} label={STATUT_COMMANDE_LABELS[statut]} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-1 w-44 rounded-md border border-border bg-surface py-1 shadow-lg">
          {TOUS_LES_STATUTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setIsOpen(false)
                if (s !== statut) onChange(s)
              }}
              className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-paper ${
                s === statut ? 'font-semibold text-primary' : 'text-ink'
              }`}
            >
              {STATUT_COMMANDE_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}