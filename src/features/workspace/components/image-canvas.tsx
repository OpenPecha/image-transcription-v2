import { useEffect, useRef } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { tiffImageLog } from '@/features/workspace/utils/tiff-image-debug-log'
import { useTiffImage } from '../hooks'
import { useTranslation } from 'react-i18next'

interface ImageCanvasProps {
  imageUrl: string
  isLoading?: boolean
  username?: string
}

export function ImageCanvas({ imageUrl, isLoading, username }: ImageCanvasProps) {
  const { t } = useTranslation('workspace')
  const containerRef = useRef<HTMLDivElement>(null)
  const { displayUrl, isConverting, error } = useTiffImage(imageUrl)

  useEffect(() => {
    if (isLoading) {
      tiffImageLog.imageCanvas({ branch: 'loading' })
    } else if (isConverting) {
      tiffImageLog.imageCanvas({ branch: 'converting' })
    } else if (error) {
      tiffImageLog.imageCanvas({ branch: 'error' })
    } else if (!displayUrl) {
      tiffImageLog.imageCanvas({ branch: 'null' })
    } else {
      tiffImageLog.imageCanvas({ branch: 'img' })
    }
  }, [isLoading, isConverting, error, displayUrl])

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
          <span className="text-sm font-medium">{t('imageCanvas.sourceImage')}</span>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <Skeleton className="h-3/4 w-3/4" />
        </div>
      </div>
    )
  }

  if (isConverting) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-64 w-64" />
          <span className="text-sm text-muted-foreground">{t('imageCanvas.converting')}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <span className="text-sm text-muted-foreground">{error}</span>
        </div>
      </div>
    )
  }

  if (!displayUrl) {
    return null
  }

  return (
    <div ref={containerRef} className="flex h-full flex-col">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
              <span className="text-sm font-medium text-foreground">{username ? `${username}` : t('imageCanvas.sourceImage')}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => zoomIn()}
                  title="Zoom In (Ctrl++)"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => zoomOut()}
                  title="Zoom Out (Ctrl+-)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => resetTransform()}
                  title="Reset Zoom (Ctrl+0)"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => centerView()}
                  title="Center Image"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 overflow-hidden bg-muted">
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                }}
                contentStyle={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={displayUrl}
                  alt="Source document"
                  className="max-h-full max-w-full object-contain"
                  draggable={false}
                  onLoad={() => tiffImageLog.imgLoad({ src: displayUrl })}
                  onError={() => tiffImageLog.imgError({ src: displayUrl })}
                />
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}

