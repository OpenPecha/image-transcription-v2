import { normalizeUnicode } from './unicode-tib'

/** Botok-compatible normalization applied before Tibetan stack diffing. */
export function normalizeTibetanForDiff(input: string, form = 'nfd'): string {
  return normalizeUnicode(input, form)
}
