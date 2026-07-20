import { LabelHTMLAttributes } from 'react'

export function Label({ className = '', children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-1 block text-xs font-medium uppercase tracking-wide text-muted ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}
