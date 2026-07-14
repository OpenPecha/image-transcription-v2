import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ContributionHintLabelProps {
  hint: string
  children: ReactNode
  className?: string
}

/** Shows the metric description on hover (native title; safe inside overflow scroll). */
export function ContributionHintLabel({
  hint,
  children,
  className,
}: ContributionHintLabelProps) {
  return (
    <span
      title={hint}
      className={cn(
        'cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-2',
        className
      )}
    >
      {children}
    </span>
  )
}
