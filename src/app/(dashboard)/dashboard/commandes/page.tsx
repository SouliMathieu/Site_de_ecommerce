import { PageHeader } from '@/components/dashboard/PageHeader'

export default function CommandesPage() {
  return (
    <div>
      <PageHeader
        title="Commandes"
        description="Suivez les commandes reçues via le chatbot WhatsApp."
      />
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">
          Aucune commande pour l&apos;instant. Le tunnel de commande WhatsApp arrive en Phase 4.
        </p>
      </div>
    </div>
  )
}