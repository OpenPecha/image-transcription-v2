/**
 * Tibetan stack tokenizer (Botok stacktokenizer.py).
 * Each token is a base character plus any following combining marks — safe for HTML markup boundaries.
 * @see https://github.com/OpenPecha/Botok/blob/master/botok/tokenizers/stacktokenizer.py
 */

const TIBETAN_COMBINING =
  '\u0f18\u0f19\u0f35\u0f37\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f8d-\u0fbc'

/** Base + combining marks, or a leading combining-only run at segment start. */
const STACK_PARTS = new RegExp(
  `(?:[^${TIBETAN_COMBINING}][${TIBETAN_COMBINING}]*|^[${TIBETAN_COMBINING}]+)`,
  'g'
)

/**
 * Split text into Tibetan stacks and literal gaps (spaces, punctuation, newlines, etc.).
 * Gaps are preserved as their own tokens so diffs never split inside a stack.
 */
export function tokenizeInStacks(text: string): string[] {
  if (!text) return []

  const tokens: string[] = []
  let lastIndex = 0

  for (const match of text.matchAll(STACK_PARTS)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      tokens.push(text.slice(lastIndex, index))
    }
    tokens.push(match[0])
    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex))
  }

  return tokens
}
