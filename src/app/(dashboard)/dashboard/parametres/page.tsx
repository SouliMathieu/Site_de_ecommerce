import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { redirect } from 'next/navigation'

export default async function ParametresPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profil } = await supabase
    .from('profils_vendeurs')
    .select('nom_boutique, telephone, role')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <PageHeader title="Paramètres" description="Informations de votre compte vendeur." />
      <div className="max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <p className="text-xs font-medium uppercase text-gray-400">Email</p>
          <p className="text-sm text-gray-900">{user.email}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-400">Nom de la boutique</p>
          <p className="text-sm text-gray-900">{profil?.nom_boutique ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-400">Rôle</p>
          <p className="text-sm text-gray-900">{profil?.role ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}