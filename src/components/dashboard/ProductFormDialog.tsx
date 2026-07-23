'use client'

import { FormEvent, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { ImageUploader } from '@/components/dashboard/ImageUploader'
import { useToast } from '@/components/ui/Toaster'
import { createClient } from '@/lib/supabase'
import type { Media, ProduitAvecMedias, StatutProduit } from '@/types/produit'
import { STATUT_PRODUIT_LABELS } from '@/types/produit'

interface ProductFormDialogProps {
  open: boolean
  onClose: () => void
  vendeurId: string
  /** Si fourni, le dialogue s'ouvre en mode édition. */
  produit?: ProduitAvecMedias | null
  onSaved: (produit: ProduitAvecMedias) => void
}

interface FormState {
  nom: string
  description: string
  prix: string
  prix_plancher: string
  categorie: string
  stock: string
  statut: StatutProduit
}

function toFormState(produit?: ProduitAvecMedias | null): FormState {
  return {
    nom: produit?.nom ?? '',
    description: produit?.description ?? '',
    prix: produit ? String(produit.prix) : '',
    prix_plancher: produit?.prix_plancher != null ? String(produit.prix_plancher) : '',
    categorie: produit?.categorie ?? '',
    stock: produit ? String(produit.stock) : '0',
    statut: produit?.statut ?? 'brouillon',
  }
}

export function ProductFormDialog({ open, onClose, vendeurId, produit, onSaved }: ProductFormDialogProps) {
  const supabase = createClient()
  const { toast } = useToast()

  const [form, setForm] = useState<FormState>(() => toFormState(produit))
  const [currentId, setCurrentId] = useState<string | null>(produit?.id ?? null)
  const [medias, setMedias] = useState<Media[]>(produit?.medias ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Réinitialise le formulaire à chaque nouvelle ouverture (création ou édition d'un autre produit).
  const [lastOpenedFor, setLastOpenedFor] = useState(produit?.id ?? 'new')
  const openKey = produit?.id ?? 'new'
  if (open && openKey !== lastOpenedFor) {
    setForm(toFormState(produit))
    setCurrentId(produit?.id ?? null)
    setMedias(produit?.medias ?? [])
    setError(null)
    setLastOpenedFor(openKey)
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.nom.trim()) {
      setError('Le nom du produit est requis.')
      return
    }
    const prix = Number(form.prix)
    if (!form.prix || Number.isNaN(prix) || prix < 0) {
      setError('Le prix doit être un nombre positif.')
      return
    }
    const prixPlancher = form.prix_plancher.trim() === '' ? null : Number(form.prix_plancher)
    if (prixPlancher !== null && (Number.isNaN(prixPlancher) || prixPlancher < 0)) {
      setError('Le prix plancher doit être un nombre positif.')
      return
    }

    const payload = {
      nom: form.nom.trim(),
      description: form.description.trim() || null,
      prix,
      prix_plancher: prixPlancher,
      categorie: form.categorie.trim() || null,
      stock: Number(form.stock) || 0,
      statut: form.statut,
    }

    setSaving(true)

    if (currentId) {
      const { data, error: updateError } = await supabase
        .from('produits')
        .update(payload)
        .eq('id', currentId)
        .select()
        .single()

      setSaving(false)
      if (updateError) {
        setError(updateError.message)
        return
      }
      toast('Produit mis à jour.')
      onSaved({ ...(data as ProduitAvecMedias), medias })
    } else {
      const { data, error: insertError } = await supabase
        .from('produits')
        .insert({ ...payload, vendeur_id: vendeurId })
        .select()
        .single()

      setSaving(false)
      if (insertError) {
        setError(insertError.message)
        return
      }
      setCurrentId(data.id)
      toast('Produit créé — ajoutez des photos ci-dessous.')
      onSaved({ ...(data as ProduitAvecMedias), medias })
    }
  }

  function handleMediasChange(next: Media[]) {
    setMedias(next)
    if (currentId) {
      onSaved({
        ...(produit ?? ({} as ProduitAvecMedias)),
        id: currentId,
        nom: form.nom,
        description: form.description || null,
        prix: Number(form.prix) || 0,
        prix_plancher: form.prix_plancher.trim() === '' ? null : Number(form.prix_plancher),
        categorie: form.categorie || null,
        stock: Number(form.stock) || 0,
        statut: form.statut,
        vendeur_id: vendeurId,
        created_at: produit?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
        medias: next,
      })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={produit ? 'Modifier le produit' : 'Nouveau produit'}
      description="Les champs marqués sont visibles par vos clients sur la boutique."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nom">Nom du produit</Label>
          <Input
            id="nom"
            value={form.nom}
            onChange={(e) => update('nom', e.target.value)}
            placeholder="Ex : Sac à main en cuir"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Détails, matières, avantages..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="prix">Prix</Label>
            <Input
              id="prix"
              type="number"
              min="0"
              step="0.01"
              value={form.prix}
              onChange={(e) => update('prix', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="prix_plancher">Prix plancher</Label>
            <Input
              id="prix_plancher"
              type="number"
              min="0"
              step="0.01"
              value={form.prix_plancher}
              onChange={(e) => update('prix_plancher', e.target.value)}
              placeholder="Optionnel"
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="statut">Statut</Label>
            <Select
              id="statut"
              value={form.statut}
              onChange={(e) => update('statut', e.target.value as StatutProduit)}
            >
              {Object.entries(STATUT_PRODUIT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="categorie">Catégorie</Label>
          <Input
            id="categorie"
            value={form.categorie}
            onChange={(e) => update('categorie', e.target.value)}
            placeholder="Ex : Mode, Tech, Maison..."
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {currentId ? 'Fermer' : 'Annuler'}
          </Button>
          <Button type="submit" size="sm" loading={saving}>
            {currentId ? 'Enregistrer les modifications' : 'Créer le produit'}
          </Button>
        </div>
      </form>

      {currentId && (
        <div className="mt-6 border-t border-border pt-4">
          <Label>Photos du produit</Label>
          <ImageUploader
            vendeurId={vendeurId}
            produitId={currentId}
            medias={medias}
            onChange={handleMediasChange}
          />
        </div>
      )}
    </Dialog>
  )
}