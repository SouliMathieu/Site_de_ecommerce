'use client'

import { FormEvent, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useToast } from '@/components/ui/Toaster'
import { createClient } from '@/lib/supabase'
import type { Client } from '@/types/commande'

interface ClientFormDialogProps {
  open: boolean
  onClose: () => void
  client?: Client | null
  onSaved: (client: Client) => void
}

export function ClientFormDialog({ open, onClose, client, onSaved }: ClientFormDialogProps) {
  const supabase = createClient()
  const { toast } = useToast()

  const [nom, setNom] = useState(client?.nom ?? '')
  const [telephone, setTelephone] = useState(client?.telephone ?? '')
  const [ville, setVille] = useState(client?.ville ?? '')
  const [quartier, setQuartier] = useState(client?.quartier ?? '')
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
      ville: ville.trim() || null,
      quartier: quartier.trim() || null,
    }

    setSaving(true)
    const query = client
      ? supabase.from('clients').update(payload).eq('id', client.id).select().single()
      : supabase.from('clients').insert(payload).select().single()

    const { data, error: dbError } = await query
    setSaving(false)

    if (dbError) {
      setError(dbError.message)
      return
    }
    toast(client ? 'Client mis à jour.' : 'Client ajouté.')
    onSaved(data as Client)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={client ? 'Modifier le client' : 'Nouveau client'}
      description="Le répertoire de clients est partagé entre tous les vendeurs de la plateforme."
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
            <Label htmlFor="ville">Ville</Label>
            <Input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="quartier">Quartier</Label>
            <Input id="quartier" value={quartier} onChange={(e) => setQuartier(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" size="sm" loading={saving}>
            {client ? 'Enregistrer' : 'Ajouter le client'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}