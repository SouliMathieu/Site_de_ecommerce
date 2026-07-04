import { PageHeader } from '@/components/dashboard/PageHeader'

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Statistiques détaillées de performance de votre boutique."
      />
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">
          Les graphiques détaillés (trafic, conversion par source, historique des ventes)
          arrivent avec le tracking UTM en Phase 3.
        </p>
      </div>
    </div>
  )
}