'use client'

import { FormEvent, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useToast } from '@/components/ui/Toaster'
import { createClient } from '@/lib/supabase'
import type { Livreur } from '@/types/commande'

interface LivreurFormDialogProps {
  open: boolean
  onClose: () => void
  livreur?: Livreur | null
  onSaved: (livreur: Livreur) => void
}

export function LivreurFormDialog({ open, onClose, livreur, onSaved }: LivreurFormDialogProps) {
  const supabase = createClient()
  const { toast } = useToast()

  const [nom, setNom] = useState(livreur?.nom ?? '')
  const [telephone, setTelephone] = useState(livreur?.telephone ?? '')
  const [tarifBase, setTarifBase] = useState(livreur?.tarif_base != null ? String(livreur.tarif_base) : '')
  const [zones, setZones] = useState(
    Array.isArray(livreur?.zones_couverture) ? (livreur.zones_couverture as string[]).join(', ') : ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!nom.trim() || !telephone.trim()) {
      setError('Le nom et le téléphone sont requis.')
      return
    }

    const payload = {
      nom: nom.trim(),
      telephone: telephone.trim(),
      tarif_base: tarifBase.trim() === '' ? null : Number(tarifBase),
      zones_couverture: zones
        .split(',')
        .map((z) => z.trim())
        .filter(Boolean),
    }

    setSaving(true)
    const query = livreur
      ? supabase.from('livreurs').update(payload).eq('id', livreur.id).select().single()
      : supabase.from('livreurs').insert({ ...payload, disponible: true }).select().single()

    const { data, error: dbError } = await query
    setSaving(false)

    if (dbError) {
      setError(dbError.message)
      return
    }
    toast(livreur ? 'Livreur mis à jour.' : 'Livreur ajouté.')
    onSaved(data as Livreur)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={livreur ? 'Modifier le livreur' : 'Nouveau livreur'}
      description="Le répertoire de livreurs est partagé entre tous les vendeurs de la plateforme."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nom">Nom</Label>
          <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+212 6..."
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tarif_base">Tarif de base</Label>
            <Input
              id="tarif_base"
              type="number"
              min="0"
              step="0.01"
              value={tarifBase}
              onChange={(e) => setTarifBase(e.target.value)}
              placeholder="Optionnel"
            />
          </div>
          <div>
            <Label htmlFor="zones">Zones couvertes</Label>
            <Input
              id="zones"
              value={zones}
              onChange={(e) => setZones(e.target.value)}
              placeholder="Maarif, Gauthier..."
            />
          </div>
        </div>
        <p className="text-xs text-muted">
          Zones séparées par des virgules (ex : quartiers ou villes desservis).
        </p>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" size="sm" loading={saving}>
            {livreur ? 'Enregistrer' : 'Ajouter le livreur'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}