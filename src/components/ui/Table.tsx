import { TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react'

export function Table({ className = '', ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className={`w-full text-left text-sm ${className}`} {...props} />
    </div>
  )
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-paper">
      <tr>{children}</tr>
    </thead>
  )
}

export function Th({ className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted ${className}`}
      {...props}
    />
  )
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>
}

export function Tr({ className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`hover:bg-paper/60 ${className}`} {...props} />
}

export function Td({ className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3 text-ink ${className}`} {...props} />
}
