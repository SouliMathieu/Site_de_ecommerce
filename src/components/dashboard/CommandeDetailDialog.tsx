'use client'

import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { StatutBadge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toaster'
import { createClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import {
  CANAL_ORIGINE_LABELS,
  STATUT_COMMANDE_LABELS,
} from '@/types/commande'
import type { CommandeAvecRelations, Livreur, StatutCommande } from '@/types/commande'

interface CommandeDetailDialogProps {
  open: boolean
  onClose: () => void
  commande: CommandeAvecRelations | null
  devise: string
  onUpdated: (commande: CommandeAvecRelations) => void
}

export function CommandeDetailDialog({ open, onClose, commande, devise, onUpdated }: CommandeDetailDialogProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [livreurs, setLivreurs] = useState<Livreur[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    async function loadLivreurs() {
      const { data } = await supabase
        .from('livreurs')
        .select('*')
        .eq('disponible', true)
        .order('score_performance', { ascending: false })
      setLivreurs((data as Livreur[]) ?? [])
    }
    loadLivreurs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!commande) return null

  async function handleStatutChange(statut: StatutCommande) {
    if (!commande) return
    setSaving(true)
    const { data, error } = await supabase
      .from('commandes')
      .update({ statut })
      .eq('id', commande.id)
      .select('*, produits(id, nom, vendeur_id), clients(*), livreurs(*)')
      .single()
    setSaving(false)
    if (error) {
      toast(`Échec mise à jour du statut : ${error.message}`, 'error')
      return
    }
    toast('Statut mis à jour.')
    onUpdated(data as CommandeAvecRelations)
  }

  async function handleLivreurChange(livreurId: string) {
    if (!commande) return
    setSaving(true)
    const { data, error } = await supabase
      .from('commandes')
      .update({ livreur_id: livreurId || null })
      .eq('id', commande.id)
      .select('*, produits(id, nom, vendeur_id), clients(*), livreurs(*)')
      .single()
    setSaving(false)
    if (error) {
      toast(`Échec assignation livreur : ${error.message}`, 'error')
      return
    }
    toast('Livreur assigné.')
    onUpdated(data as CommandeAvecRelations)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={commande.produits?.nom ?? 'Commande'}
      description={`Commande passée le ${new Date(commande.created_at).toLocaleDateString('fr-FR')} via ${
        CANAL_ORIGINE_LABELS[commande.canal_origine ?? 'autre'] ?? commande.canal_origine
      }`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 rounded-md border border-border bg-paper p-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Quantité</p>
            <p className="mt-0.5 font-medium">{commande.quantite}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Prix final</p>
            <p className="mt-0.5 font-medium">{formatCurrency(commande.prix_final, devise)}</p>
          </div>
        </div>

        <div>
          <Label>Statut de la commande</Label>
          <Select
            value={commande.statut}
            disabled={saving}
            onChange={(e) => handleStatutChange(e.target.value as StatutCommande)}
          >
            {Object.entries(STATUT_COMMANDE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Client</Label>
          {commande.clients ? (
            <div className="rounded-md border border-border p-3 text-sm">
              <p className="font-medium text-ink">{commande.clients.nom}</p>
              <p className="text-muted">{commande.clients.telephone}</p>
              {(commande.clients.ville || commande.clients.quartier) && (
                <p className="text-muted">
                  {[commande.clients.quartier, commande.clients.ville].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">Client introuvable.</p>
          )}
        </div>

        <div>
          <Label>Livreur assigné</Label>
          <Select
            value={commande.livreur_id ?? ''}
            disabled={saving}
            onChange={(e) => handleLivreurChange(e.target.value)}
          >
            <option value="">Aucun livreur assigné</option>
            {commande.livreurs && !livreurs.some((l) => l.id === commande.livreurs?.id) && (
              <option value={commande.livreurs.id}>{commande.livreurs.nom} (indisponible)</option>
            )}
            {livreurs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nom}
              </option>
            ))}
          </Select>
          {commande.livreurs && (
            <div className="mt-2">
              <StatutBadge
                statut={commande.livreurs.disponible ? 'disponible' : 'occupe'}
                label={commande.livreurs.disponible ? 'Disponible' : 'Occupé'}
              />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}