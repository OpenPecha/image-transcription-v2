import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Eraser, Type, ALargeSmall, RotateCcw, GitCompare, PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useUIStore, type EditorFontFamily, type EditorFontSize } from '@/store/use-ui-store'
import { FONT_FAMILIES, FONT_SIZES } from './constant'

type EditorToolbarProps = {
  onClear: () => void
  onRestoreOriginal: () => void
  hasContent: boolean
  hasOriginalContent: boolean
  isDisabled?: boolean
  // Diff view props — only used for reviewer role
  showDiff?: boolean
  onToggleDiff?: () => void
  canShowDiff?: boolean
}

export function EditorToolbar({
  onClear,
  onRestoreOriginal,
  hasContent,
  hasOriginalContent,
  isDisabled = false,
  showDiff = false,
  onToggleDiff,
  canShowDiff = false,
}: EditorToolbarProps) {
  const { t } = useTranslation('workspace')
  const {
    editorFontFamily,
    editorFontSize,
    setEditorFontFamily,
    setEditorFontSize,
    addToast,
  } = useUIStore()

  const handleFontFamilyChange = useCallback(
    (value: string) => {
      setEditorFontFamily(value as EditorFontFamily)
    },
    [setEditorFontFamily]
  )

  const handleFontSizeChange = useCallback(
    (value: string) => {
      console.log('value', value)
      setEditorFontSize(Number(value) as EditorFontSize)
    },
    [setEditorFontSize]
  )

  const handleClear = useCallback(() => {
    // Trigger the clear action
    onClear()

    // Show toast with undo option
    addToast({
      title: t('editor.cleared'),
      description: t('editor.clearedDescription'),
      variant: 'default',
      action: {
        label: t('editor.undo'),
        onClick: () => {
          onRestoreOriginal()
        },
      },
    })
  }, [onClear, onRestoreOriginal, addToast, t])

  const currentFontLabel = FONT_FAMILIES.find((f) => f.value === editorFontFamily)?.label ?? 'Monlam'

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border-b border-border">
      {/* Font Family Selector */}
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Select
          value={editorFontFamily}
          onValueChange={handleFontFamilyChange}
          disabled={isDisabled}
        >
          <SelectTrigger
            className="h-8 w-[140px] text-xs border-input/50 bg-background/50 hover:bg-background focus:ring-1"
            aria-label="Select font family"
          >
            <SelectValue placeholder="Font">
              <span className={cn("text-xs", FONT_FAMILIES.find(f => f.value === editorFontFamily)?.fontClass)}>
                {currentFontLabel}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem
                key={font.value}
                value={font.value}
                className={cn('text-sm', font.fontClass)}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size Selector */}
      <div className="flex items-center gap-2">
        <ALargeSmall className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Select
          value={editorFontSize.toString()}
          onValueChange={handleFontSizeChange}
          disabled={isDisabled}
        >
          <SelectTrigger
            className="h-8 w-[80px] text-xs border-input/50 bg-background/50 hover:bg-background focus:ring-1"
            aria-label="Select font size"
          >
            <SelectValue placeholder="Size">{editorFontSize}px</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={size.toString()} className="text-sm">
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Compare / Edit toggle — reviewer only */}
      {canShowDiff && onToggleDiff && (
        <>
          <Button
            id="diff-toggle-btn"
            variant={showDiff ? 'secondary' : 'ghost'}
            size="sm"
            onClick={onToggleDiff}
            className={cn(
              'h-8 px-3 text-xs transition-colors gap-1.5',
              showDiff
                ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={showDiff ? t('editor.editMode') : t('editor.compareMode')}
          >
            {showDiff ? (
              <>
                <PenLine className="h-3.5 w-3.5" />
                {t('editor.editMode')}
              </>
            ) : (
              <>
                <GitCompare className="h-3.5 w-3.5" />
                {t('editor.compareMode')}
              </>
            )}
          </Button>
          <Separator orientation="vertical" className="h-5" />
        </>
      )}

      {/* Restore Original Button — hidden when in diff mode */}
      {hasOriginalContent && !showDiff && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestoreOriginal}
            disabled={isDisabled}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
            aria-label={t('editor.restoreOriginal')}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            {t('editor.restoreOriginal')}
          </Button>
          <Separator orientation="vertical" className="h-5" />
        </>
      )}

      {/* Clear Button — hidden when in diff mode */}
      {!showDiff && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={isDisabled || !hasContent}
          className={cn(
            'h-8 px-3 text-xs transition-colors',
            hasContent
              ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
              : 'text-muted-foreground/50'
          )}
          aria-label={t('editor.clear')}
        >
          <Eraser className="h-3.5 w-3.5 mr-1.5" />
          {t('editor.clear')}
        </Button>
      )}
    </div>
  )
}
