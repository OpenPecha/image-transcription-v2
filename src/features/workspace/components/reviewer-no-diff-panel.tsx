import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FONT_FAMILY_MAP } from './constant'
import type { EditorFontFamily } from '@/store/use-ui-store'

interface ReviewerNoDiffPanelProps {
  transcript: string
  fontFamily: EditorFontFamily
  fontSize: number
}

export function ReviewerNoDiffPanel({
  transcript,
  fontFamily,
  fontSize,
}: ReviewerNoDiffPanelProps) {
  const { t } = useTranslation('workspace')
  const isEmpty = !transcript.trim()

  const textStyle = {
    fontFamily: FONT_FAMILY_MAP[fontFamily],
    fontSize: `${fontSize}px`,
    lineHeight: 1.6,
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-card">
      <div
        className={cn(
          'flex shrink-0 flex-col gap-1 border-b border-border px-5 py-4',
          'bg-muted/40'
        )}
        role="status"
      >
        <div className="flex items-start gap-2.5">
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-success"
            aria-hidden
          />
          <p className="text-sm font-medium text-foreground">
            {t('reviewer.noDiffsToResolve')}
          </p>
        </div>
        {isEmpty && (
          <p className="pl-6 text-xs text-muted-foreground">
            {t('reviewer.pendingAlignment')}
          </p>
        )}
      </div>

      <div
        className={cn(
          'flex-1 overflow-auto p-5 text-foreground',
          'cursor-default select-text whitespace-pre-wrap break-words',
          isEmpty && 'text-muted-foreground italic'
        )}
        style={textStyle}
        aria-readonly
      >
        {isEmpty ? t('reviewer.emptyTranscript') : transcript}
      </div>
    </div>
  )
}
