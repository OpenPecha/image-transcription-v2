/**
 * Tibetan Unicode normalization (Botok unicode_normalization.py).
 * normalizeUnicode ported from https://github.com/buda-base/jsewts/blob/master/src/unicode_tib.js
 * normalizeGraphical ported from https://github.com/OpenPecha/Botok/blob/master/botok/utils/unicode_normalization.py
 */

const Cats = {
  Other: 0,
  Base: 1,
  Subscript: 2,
  BottomVowel: 3,
  BottomMark: 4,
  TopVowel: 5,
  TopMark: 6,
  RightMark: 7,
} as const

const CATEGORIES = ([] as number[]).concat(
  [Cats.Other],
  [Cats.Base],
  Array(22).fill(Cats.Other),
  Array(2).fill(Cats.BottomVowel),
  Array(6).fill(Cats.Other),
  Array(20).fill(Cats.Base),
  [Cats.Other],
  [Cats.BottomMark],
  [Cats.Other],
  [Cats.BottomMark],
  [Cats.Other],
  [Cats.Subscript],
  Array(4).fill(Cats.Other),
  [Cats.RightMark],
  [Cats.Other],
  Array(45).fill(Cats.Base),
  Array(4).fill(Cats.Other),
  [Cats.BottomVowel],
  [Cats.TopVowel],
  [Cats.TopVowel],
  Array(2).fill(Cats.BottomVowel),
  Array(8).fill(Cats.TopVowel),
  [Cats.TopMark],
  [Cats.RightMark],
  Array(2).fill(Cats.TopVowel),
  Array(2).fill(Cats.TopMark),
  [Cats.BottomMark],
  [Cats.Other],
  Array(2).fill(Cats.TopMark),
  Array(2).fill(Cats.Base),
  [Cats.Base],
  [Cats.Other],
  [Cats.Base],
  Array(48).fill(Cats.Subscript)
)

function charcat(ch: string): number {
  const codePoint = ch.codePointAt(0)
  if (codePoint === undefined) return Cats.Other
  if (codePoint >= 0x0f00 && codePoint <= 0x0fbc) {
    return CATEGORIES[codePoint - 0x0f00] ?? Cats.Other
  }
  return Cats.Other
}

export function unicodeReorder(txt: string): { str: string; valid: boolean } {
  const charcats = Array.from(txt, charcat)
  let i = 0
  const out: string[] = []
  let valid = true

  while (i < charcats.length) {
    const category = charcats[i]
    if (category !== Cats.Base) {
      if (category > Cats.Base) valid = false
      out.push(txt[i] ?? '')
      i += 1
      continue
    }

    let j = i + 1
    while (j < charcats.length && (charcats[j] ?? Cats.Other) > Cats.Base) {
      j += 1
    }

    const newIndices: number[] = []
    for (let k = i; k < j; k += 1) newIndices.push(k)
    newIndices.sort((a, b) => {
      const delta = (charcats[a] ?? 0) - (charcats[b] ?? 0)
      return delta !== 0 ? delta : a - b
    })

    out.push(newIndices.map((idx) => txt[idx] ?? '').join(''))
    i = j
  }

  return { str: out.join(''), valid }
}

function isVowel(ch: string): boolean {
  return /[\u0F71-\u0F84]/.test(ch)
}

function isSuffix(ch: string): boolean {
  return /[\u0F90-\u0FBC]/.test(ch)
}

export function normalizeInvalidStartString(s: string): string {
  if (s.length < 2) return s

  if (isVowel(s[0] ?? '') && !isVowel(s[1] ?? '') && !isSuffix(s[1] ?? '')) {
    return s[1] + s[0] + (s.length > 2 ? s.slice(2) : '')
  }
  if (isSuffix(s[0] ?? '')) {
    return s.slice(1)
  }
  return s
}

/**
 * Normalize characters that share the same graphical representation.
 */
export function normalizeGraphical(input: string): string {
  let s = String(input)

  s = s.replaceAll('\u0F0C', '\u0F0B')
  s = s.replaceAll('\u0F0E', '\u0F0D\u0F0D')
  s = s.replaceAll('\u0F38', '\u0F27')
  s = s.replaceAll('\u0F7A\u0F7A', '\u0F7B')
  s = s.replaceAll('\u0F7C\u0F7C', '\u0F7D')
  s = s.replace(
    /[\u0F71]([\u0F8D-\u0FAC\u0FAE\u0FB0\u0FB3-\u0FBC])/g,
    '\u0FB0$1'
  )
  s = s.replace(
    /[\u0FB0]([^\u0F8D-\u0FAC\u0FAE\u0FB0\u0FB3-\u0FBC]|$)/g,
    '\u0F71$1'
  )

  return s
}

export function normalizeUnicode(input: string, form = 'nfd'): string {
  let s = String(input)

  s = s.replaceAll('\u0F73', '\u0F71\u0F72')
  s = s.replaceAll('\u0F75', '\u0F71\u0F74')
  s = s.replaceAll('\u0F77', '\u0FB2\u0F71\u0F80')
  s = s.replaceAll('\u0F79', '\u0FB3\u0F71\u0F80')
  s = s.replaceAll('\u0F81', '\u0F71\u0F80')

  if (form.toLowerCase() === 'nfd') {
    s = s.replaceAll('\u0F43', '\u0F42\u0FB7')
    s = s.replaceAll('\u0F4D', '\u0F4C\u0FB7')
    s = s.replaceAll('\u0F52', '\u0F51\u0FB7')
    s = s.replaceAll('\u0F57', '\u0F56\u0FB7')
    s = s.replaceAll('\u0F5C', '\u0F5B\u0FB7')
    s = s.replaceAll('\u0F69', '\u0F40\u0FB5')
    s = s.replaceAll('\u0F76', '\u0FB2\u0F80')
    s = s.replaceAll('\u0F78', '\u0FB3\u0F80')
    s = s.replaceAll('\u0F93', '\u0F92\u0FB7')
    s = s.replaceAll('\u0F9D', '\u0F9C\u0FB7')
    s = s.replaceAll('\u0FA2', '\u0FA1\u0FB7')
    s = s.replaceAll('\u0FA7', '\u0FA6\u0FB7')
    s = s.replaceAll('\u0FAC', '\u0FAB\u0FB7')
    s = s.replaceAll('\u0FB9', '\u0F90\u0FB5')
  } else {
    s = s.replaceAll('\u0F42\u0FB7', '\u0F43')
    s = s.replaceAll('\u0F4C\u0FB7', '\u0F4D')
    s = s.replaceAll('\u0F51\u0FB7', '\u0F52')
    s = s.replaceAll('\u0F56\u0FB7', '\u0F57')
    s = s.replaceAll('\u0F5B\u0FB7', '\u0F5C')
    s = s.replaceAll('\u0F40\u0FB5', '\u0F69')
    s = s.replaceAll('\u0FB2\u0F80', '\u0F76')
    s = s.replaceAll('\u0FB3\u0F80', '\u0F78')
    s = s.replaceAll('\u0F92\u0FB7', '\u0F93')
    s = s.replaceAll('\u0F9C\u0FB7', '\u0F9D')
    s = s.replaceAll('\u0FA1\u0FB7', '\u0FA2')
    s = s.replaceAll('\u0FA6\u0FB7', '\u0FA7')
    s = s.replaceAll('\u0FAB\u0FB7', '\u0FAC')
    s = s.replaceAll('\u0F90\u0FB5', '\u0FB9')
  }

  s = s.replaceAll('\u0F00', '\u0F68\u0F7C\u0F7E')
  s = normalizeGraphical(s)

  const { str: reordered } = unicodeReorder(s)
  s = reordered

  s = s.replace(
    /\u0F65([^\u0F90-\u0F97\u0F9A-\u0FAC\u0FAE\u0FAF\u0FB4-\u0FBC])/g,
    '\u0F62$1'
  )
  s = normalizeInvalidStartString(s)

  return s
}
