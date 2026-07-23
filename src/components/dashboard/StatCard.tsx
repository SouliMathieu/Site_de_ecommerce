interface StatCardProps {
  label: string
  value: string
  hint?: string
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="relative rounded-lg border border-border bg-surface p-5 pb-6">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}

      {/* Bord perforé façon ticket détachable */}
      <div
        className="absolute inset-x-4 bottom-0 h-px"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, var(--color-border) 0, var(--color-border) 4px, transparent 4px, transparent 9px)',
        }}
      />
      {/* Petites encoches de perforation sur les côtés */}
      <div className="absolute -left-1.5 bottom-0 h-3 w-3 rounded-full bg-paper" />
      <div className="absolute -right-1.5 bottom-0 h-3 w-3 rounded-full bg-paper" />
    </div>
  )
}