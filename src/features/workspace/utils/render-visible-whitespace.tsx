import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const WHITESPACE_GLYPH_CLASS =
  'inline-block select-none font-sans text-[0.85em] opacity-80'

interface RenderVisibleWhitespaceOptions {
  /** When true, spaces render as ␣ and tabs as ⇥. Newlines always render as ↵. */
  revealWhitespace?: boolean
}

export function renderVisibleWhitespace(
  text: string,
  options: RenderVisibleWhitespaceOptions = {}
): ReactNode[] {
  const { revealWhitespace = false } = options
  const nodes: ReactNode[] = []

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '\n') {
      nodes.push(
        <span
          key={i}
          className={cn(WHITESPACE_GLYPH_CLASS, 'mx-1')}
          aria-hidden="true"
        >
          ↵
        </span>
      )
      nodes.push('\n')
      continue
    }

    if (revealWhitespace && char === ' ') {
      nodes.push(
        <span key={i} className={WHITESPACE_GLYPH_CLASS} aria-hidden="true" title="Space">
          ␣
        </span>
      )
      continue
    }

    if (revealWhitespace && char === '\t') {
      nodes.push(
        <span key={i} className={WHITESPACE_GLYPH_CLASS} aria-hidden="true" title="Tab">
          ⇥
        </span>
      )
      continue
    }

    nodes.push(char)
  }

  return nodes
}
