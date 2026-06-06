import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, ExternalLink, GripVertical, PanelRightClose } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/use-ui-store'

const DICTIONARY_URL = import.meta.env.VITE_LOOKUP_DICTIONARY_URL?.trim() ?? ''

export const DICTIONARY_PANEL_MIN_WIDTH = 280
export const DICTIONARY_PANEL_MAX_WIDTH = 520

type LookupDictionaryPanelProps = {
  enabled: boolean
}

export function LookupDictionaryPanel({ enabled }: LookupDictionaryPanelProps) {
  const { t } = useTranslation('workspace')
  const {
    dictionaryPanelOpen,
    dictionaryPanelWidth,
    toggleDictionaryPanel,
    setDictionaryPanelWidth,
  } = useUIStore()

  const [isIframeLoaded, setIsIframeLoaded] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleResizeStart = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (event: MouseEvent) => {
      if (!panelRef.current) return
      const panelRect = panelRef.current.getBoundingClientRect()
      const nextWidth = panelRect.right - event.clientX
      setDictionaryPanelWidth(
        Math.max(DICTIONARY_PANEL_MIN_WIDTH, Math.min(DICTIONARY_PANEL_MAX_WIDTH, nextWidth))
      )
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, setDictionaryPanelWidth])

  if (!enabled || !DICTIONARY_URL) {
    return null
  }

  const iframeBody = (
    <div
      className={cn(
        'relative min-h-0 flex-1',
        !dictionaryPanelOpen &&
          'pointer-events-none fixed top-0 left-[-9999px] h-[800px] w-[380px] opacity-0'
      )}
    >
      {dictionaryPanelOpen && !isIframeLoaded && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}
      <iframe
        src={DICTIONARY_URL}
        title={t('dictionary.title')}
        className="h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setIsIframeLoaded(true)}
      />
    </div>
  )

  if (!dictionaryPanelOpen) {
    return (
      <div className="relative flex h-full shrink-0">
        {iframeBody}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleDictionaryPanel}
          aria-label={t('dictionary.toggleOpen')}
          className="h-auto flex-col gap-2 rounded-none rounded-l-lg border-r-0 px-2 py-4"
        >
          <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-xs font-medium [writing-mode:vertical-rl]">{t('dictionary.title')}</span>
        </Button>
      </div>
    )
  }

  return (
    <div
      ref={panelRef}
      className="relative flex h-full shrink-0 flex-col border-l border-border bg-card"
      style={{ width: dictionaryPanelWidth }}
    >
      <div
        className={cn(
          'absolute left-0 top-0 z-10 flex h-full w-3 -translate-x-1/2 cursor-col-resize items-center justify-center',
          'bg-transparent hover:bg-primary/20',
          isResizing && 'bg-primary/40'
        )}
        onMouseDown={handleResizeStart}
        role="separator"
        aria-orientation="vertical"
        aria-label={t('dictionary.resize')}
      >
        <GripVertical className="h-5 w-3 text-muted-foreground/70" aria-hidden="true" />
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <h2 className="truncate text-sm font-medium">{t('dictionary.title')}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a
              href={DICTIONARY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('dictionary.openExternal')}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleDictionaryPanel}
            aria-label={t('dictionary.toggleClose')}
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {iframeBody}

      {!isIframeLoaded && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <span className="rounded-md bg-muted/90 px-2 py-1 text-xs text-muted-foreground">
            {t('dictionary.loading')}
          </span>
        </div>
      )}
    </div>
  )
}
