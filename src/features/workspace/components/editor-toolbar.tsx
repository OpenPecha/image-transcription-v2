import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Type, ALargeSmall, RotateCcw, GitCompare, PenLine, Keyboard, ChevronDown, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  onRestoreOriginal: () => void
  hasOriginalContent: boolean
  isDisabled?: boolean
  showDiffShortcuts?: boolean
  canEditSelection?: boolean
  onEditSelection?: () => void
  showDiff?: boolean
  onToggleDiff?: () => void
  canShowDiff?: boolean
}

function ShortcutHint({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
        {keys}
      </kbd>
    </div>
  )
}

export function EditorToolbar({
  onRestoreOriginal,
  hasOriginalContent,
  isDisabled = false,
  showDiffShortcuts = false,
  canEditSelection = false,
  onEditSelection,
  showDiff = false,
  onToggleDiff,
  canShowDiff = false,
}: EditorToolbarProps) {
  const { t } = useTranslation('workspace')
  const { editorFontFamily, editorFontSize, setEditorFontFamily, setEditorFontSize } = useUIStore()

  const handleFontFamilyChange = useCallback(
    (value: string) => {
      setEditorFontFamily(value as EditorFontFamily)
    },
    [setEditorFontFamily]
  )

  const handleFontSizeChange = useCallback(
    (value: string) => {
      setEditorFontSize(Number(value) as EditorFontSize)
    },
    [setEditorFontSize]
  )

  const currentFontLabel = FONT_FAMILIES.find((f) => f.value === editorFontFamily)?.label ?? 'Monlam'

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border-b border-border">
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
              <span className={cn('text-xs', FONT_FAMILIES.find((f) => f.value === editorFontFamily)?.fontClass)}>
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

      <div className="flex-1" />

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

      {showDiffShortcuts && onEditSelection && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditSelection}
            disabled={!canEditSelection}
            className="h-8 gap-1.5 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label={t('diffResolver.editSelection')}
          >
            <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t('diffResolver.editSelection')}
          </Button>
          <Separator orientation="vertical" className="h-5" />
        </>
      )}

      {showDiffShortcuts && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground data-[state=open]:text-foreground"
              aria-label={t('shortcuts.toggleOpen')}
            >
              <Keyboard className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t('shortcuts.title')}
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[280px] p-3">
            <p className="mb-1 px-0.5 text-xs font-semibold text-foreground">
              {t('shortcuts.title')}
            </p>
            <div className="divide-y divide-border">
              <ShortcutHint keys="E" label={t('shortcuts.editSelection')} />
              <ShortcutHint keys="1–9" label={t('shortcuts.selectOptions')} />
              <ShortcutHint keys="← → / Tab" label={t('shortcuts.navigateDiffs')} />
              <ShortcutHint keys="Enter" label={t('shortcuts.confirmCustom')} />
              <ShortcutHint keys="Shift + Enter" label={t('shortcuts.customLineBreak')} />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
