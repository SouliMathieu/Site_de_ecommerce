import { PageHeader } from '@/components/dashboard/PageHeader'

export default function CataloguePage() {
  return (
    <div>
      <PageHeader
        title="Catalogue"
        description="Gérez vos produits, visuels et fiches produits générés par l'IA."
      />
      <div className="rounded-lg border border-dashed border-border bg-surface p-12 text-center">
        <p className="text-sm text-gray-500">
          Aucun produit pour l&apos;instant. La création de produits (upload photo, Studio IA,
          copywriting automatique) arrive en Phase 2.
        </p>
      </div>
    </div>
  )
}