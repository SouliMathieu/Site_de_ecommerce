'use client'

import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { StatutBadge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import { STATUT_COMMANDE_LABELS } from '@/types/commande'
import type { ClientAvecStats, CommandeAvecRelations } from '@/types/commande'

interface ClientDetailDialogProps {
  open: boolean
  onClose: () => void
  client: ClientAvecStats | null
  vendeurId: string
  devise: string
}

export function ClientDetailDialog({ open, onClose, client, vendeurId, devise }: ClientDetailDialogProps) {
  const supabase = createClient()
  const [commandes, setCommandes] = useState<CommandeAvecRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open || !client) return
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('commandes')
        .select('*, produits!inner(id, nom, vendeur_id), clients(*), livreurs(*)')
        .eq('produits.vendeur_id', vendeurId)
        .eq('client_id', client!.id)
        .order('created_at', { ascending: false })
      setCommandes((data as unknown as CommandeAvecRelations[]) ?? [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client?.id])

  if (!client) return null

  return (
    <Dialog open={open} onClose={onClose} title={client.nom} description={client.telephone} maxWidth="max-w-lg">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4 rounded-md border border-border bg-paper p-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Commandes</p>
            <p className="mt-0.5 font-medium">{client.nombreCommandes}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Total dépensé</p>
            <p className="mt-0.5 font-medium">{formatCurrency(client.totalDepense, devise)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Localisation</p>
            <p className="mt-0.5 font-medium">
              {[client.quartier, client.ville].filter(Boolean).join(', ') || '—'}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Historique des commandes
          </p>
          {loading ? (
            <p className="text-sm text-muted">Chargement...</p>
          ) : commandes.length === 0 ? (
            <p className="text-sm text-muted">Aucune commande avec ce client pour l&apos;instant.</p>
          ) : (
            <div className="space-y-2">
              {commandes.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">{c.produits?.nom}</p>
                    <p className="text-xs text-muted">
                      {new Date(c.created_at).toLocaleDateString('fr-FR')} · {formatCurrency(c.prix_final, devise)}
                    </p>
                  </div>
                  <StatutBadge statut={c.statut} label={STATUT_COMMANDE_LABELS[c.statut]} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}