import type { LocalDiffTarget } from './parse-tdiff'

function getOffsetInElement(element: HTMLElement, container: Node, offset: number): number {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  let charCount = 0
  let node: Node | null = walker.nextNode()

  while (node) {
    if (node === container) {
      return charCount + offset
    }
    charCount += node.textContent?.length ?? 0
    node = walker.nextNode()
  }

  return -1
}

export function parseTextSegmentSelection(root: HTMLElement): LocalDiffTarget | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null
  }

  const range = selection.getRangeAt(0)
  const selectedText = range.toString()
  if (!selectedText) return null

  const startSpan = range.startContainer.parentElement?.closest('[data-segment-index]')
  const endSpan = range.endContainer.parentElement?.closest('[data-segment-index]')

  if (!startSpan || !endSpan || startSpan !== endSpan || !root.contains(startSpan)) {
    return null
  }

  const segmentIndex = Number(startSpan.getAttribute('data-segment-index'))
  if (Number.isNaN(segmentIndex)) return null

  const start = getOffsetInElement(startSpan as HTMLElement, range.startContainer, range.startOffset)
  const end = getOffsetInElement(endSpan as HTMLElement, range.endContainer, range.endOffset)

  if (start < 0 || end <= start) return null

  return { segmentIndex, start, end, text: selectedText }
}
