import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronsDown, ChevronsUp, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/lib/copy-to-clipboard'
import { Button } from '@/components/ui/button'

interface TaskFileNameProps {
  fileName: string
  className?: string
  textClassName?: string
  /** When set, controls expanded state instead of internal toggle */
  expanded?: boolean
  showCopyButton?: boolean
  showExpandToggle?: boolean
  enableContextMenu?: boolean
}

export function TaskFileName({
  fileName,
  className,
  textClassName,
  expanded,
  showCopyButton = true,
  showExpandToggle = true,
  enableContextMenu = false,
}: TaskFileNameProps) {
  const { t } = useTranslation('common')
  const nameRef = useRef<HTMLParagraphElement>(null)
  const [isExpandedInternal, setIsExpandedInternal] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const isControlled = expanded !== undefined
  const isExpanded = isControlled ? expanded : isExpandedInternal

  const updateTruncation = useCallback(() => {
    const element = nameRef.current
    if (!element || isExpanded) {
      setIsTruncated(false)
      return
    }

    setIsTruncated(element.scrollWidth > element.clientWidth)
  }, [isExpanded])

  useEffect(() => {
    updateTruncation()
  }, [fileName, updateTruncation])

  useEffect(() => {
    const element = nameRef.current
    if (!element) return

    const observer = new ResizeObserver(updateTruncation)
    observer.observe(element)

    return () => observer.disconnect()
  }, [updateTruncation])

  useEffect(() => {
    if (!contextMenu) return

    const closeMenu = () => setContextMenu(null)
    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('scroll', closeMenu, true)

    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('scroll', closeMenu, true)
    }
  }, [contextMenu])

  const copyFileName = useCallback(async () => {
    const copied = await copyToClipboard(fileName)
    if (!copied) return

    setHasCopied(true)
    window.setTimeout(() => setHasCopied(false), 2000)
  }, [fileName])

  const handleCopy = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      setContextMenu(null)
      await copyFileName()
    },
    [copyFileName]
  )

  const handleToggleExpand = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setIsExpandedInternal((prev) => !prev)
  }

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    if (!enableContextMenu) return

    event.preventDefault()
    event.stopPropagation()
    setContextMenu({ x: event.clientX, y: event.clientY })
  }

  const handleContextMenuCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setContextMenu(null)
    await copyFileName()
  }

  const canShowExpandToggle =
    showExpandToggle && !isControlled && (isExpanded || isTruncated)

  return (
    <>
      <div
        className={cn('flex items-start gap-1', className)}
        onContextMenu={handleContextMenu}
      >
        <p
          ref={nameRef}
          className={cn(
            'flex-1 min-w-0 text-sm font-medium',
            isExpanded ? 'break-all' : 'truncate',
            textClassName
          )}
          title={!isExpanded && isTruncated ? fileName : undefined}
        >
          {fileName}
        </p>

        {(canShowExpandToggle || showCopyButton) && (
          <div className="flex shrink-0 items-center gap-0.5">
            {canShowExpandToggle && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleToggleExpand}
                aria-label={isExpanded ? t('fileName.collapse') : t('fileName.expand')}
                title={isExpanded ? t('fileName.collapse') : t('fileName.expand')}
              >
                {isExpanded ? (
                  <ChevronsUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronsDown className="h-3.5 w-3.5" />
                )}
              </Button>
            )}

            {showCopyButton && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
                aria-label={t('fileName.copy')}
                title={t('fileName.copy')}
              >
                {hasCopied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 min-w-[160px] rounded-md border border-border bg-popover p-1 shadow-md"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={handleContextMenuCopy}
          >
            <Copy className="h-3.5 w-3.5" />
            {t('fileName.copy')}
          </button>
        </div>
      )}
    </>
  )
}
