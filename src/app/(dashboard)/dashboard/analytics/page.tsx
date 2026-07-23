import { PageHeader } from '@/components/dashboard/PageHeader'

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Statistiques détaillées de performance de votre boutique."
      />
      <div className="rounded-lg border border-dashed border-border bg-surface p-12 text-center">
        <p className="text-sm text-muted">
          Les graphiques détaillés (trafic, conversion par source, historique des ventes)
          arrivent avec le tracking UTM en Phase 3.
        </p>
      </div>
    </div>
  )
}