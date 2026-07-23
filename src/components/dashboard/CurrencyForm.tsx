'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const DEVISES = [
  { code: 'USD', label: 'USD — Dollar américain' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'MAD', label: 'MAD — Dirham marocain' },
  { code: 'XOF', label: 'XOF — Franc CFA (UEMOA)' },
  { code: 'NGN', label: 'NGN — Naira nigérian' },
  { code: 'KES', label: 'KES — Shilling kényan' },
  { code: 'GBP', label: 'GBP — Livre sterling' },
]

export function CurrencyForm({ currentDevise }: { currentDevise: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [devise, setDevise] = useState(currentDevise)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('profils_vendeurs').update({ devise }).eq('id', user.id)
      setSaved(true)
      router.refresh()
    }

    setSaving(false)
  }

  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
        Devise affichée
      </label>
      <div className="mt-1 flex gap-2">
        <select
          value={devise}
          onChange={(e) => setDevise(e.target.value)}
          className="w-full rounded-md border border-[--color-border] bg-white px-3 py-2 text-sm text-[--color-ink]"
        >
          {DEVISES.map((d) => (
            <option key={d.code} value={d.code}>
              {d.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 rounded-md bg-[--color-primary] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? '...' : 'Enregistrer'}
        </button>
      </div>
      {saved && <p className="mt-1 text-xs text-[--color-success]">Devise mise à jour.</p>}
    </div>
  )
}