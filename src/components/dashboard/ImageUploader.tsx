'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toaster'
import type { Media } from '@/types/produit'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ImageUploaderProps {
  vendeurId: string
  produitId: string
  medias: Media[]
  onChange: (medias: Media[]) => void
}

export function ImageUploader({ vendeurId, produitId, medias, onChange }: ImageUploaderProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast(`Format non supporté : ${file.name}`, 'error')
        continue
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast(`${file.name} dépasse ${MAX_SIZE_MB} Mo`, 'error')
        continue
      }

      setUploading(true)
      const path = `${vendeurId}/${produitId}/${crypto.randomUUID()}-${file.name}`

      const { error: uploadError } = await supabase.storage.from('produits').upload(path, file)
      if (uploadError) {
        toast(`Échec upload : ${uploadError.message}`, 'error')
        setUploading(false)
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('produits').getPublicUrl(path)

      const { data: media, error: insertError } = await supabase
        .from('medias')
        .insert({ produit_id: produitId, url: publicUrl, type: 'image', format: 'original' })
        .select()
        .single()
      if (insertError) {
        toast(`Échec enregistrement média : ${insertError.message}`, 'error')
      } else if (media) {
        onChange([...medias, media as Media])
      }
      setUploading(false)
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDelete(media: Media) {
    // Le chemin storage est déductible de l'URL publique (dernier segment après le bucket).
    const marker = '/produits/'
    const idx = media.url.indexOf(marker)
    const path = idx !== -1 ? media.url.slice(idx + marker.length) : null

    if (path) {
      await supabase.storage.from('produits').remove([path])
    }
    const { error } = await supabase.from('medias').delete().eq('id', media.id)
    if (error) {
      toast(`Échec suppression : ${error.message}`, 'error')
      return
    }
    onChange(medias.filter((m) => m.id !== media.id))
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {medias.map((media) => (
          <div key={media.id} className="group relative aspect-square overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL Supabase Storage dynamique */}
            <img src={media.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleDelete(media)}
              className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-danger text-xs text-white group-hover:flex"
              aria-label="Supprimer l'image"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <span className="text-xl">{uploading ? '…' : '+'}</span>
          <span className="text-xs">{uploading ? 'Envoi...' : 'Ajouter'}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-muted">JPEG, PNG ou WebP — {MAX_SIZE_MB} Mo max par image.</p>
    </div>
  )
}