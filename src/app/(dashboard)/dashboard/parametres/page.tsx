import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { redirect } from 'next/navigation'
import { CurrencyForm } from '@/components/dashboard/CurrencyForm'

export default async function ParametresPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profil } = await supabase
    .from('profils_vendeurs')
    .select('nom_boutique, telephone, role, devise')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <PageHeader title="Paramètres" description="Informations de votre compte vendeur." />
      <div className="max-w-md space-y-6 rounded-lg border border-[--color-border] bg-[--color-surface] p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</p>
          <p className="text-sm text-[--color-ink]">{user.email}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Nom de la boutique</p>
          <p className="text-sm text-[--color-ink]">{profil?.nom_boutique ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Rôle</p>
          <p className="text-sm text-[--color-ink]">{profil?.role ?? '—'}</p>
        </div>

        <CurrencyForm currentDevise={profil?.devise ?? 'USD'} />
      </div>
    </div>
  )
}