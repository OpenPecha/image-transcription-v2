import { useState, useEffect, useCallback, useRef } from 'react'
import * as UTIF from 'utif2'

export function useTiffImage(
  imageUrl: string,
  onRefreshUrl?: () => void | Promise<unknown>
) {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refreshAttemptedForUrlRef = useRef<string | null>(null)
  const onRefreshUrlRef = useRef(onRefreshUrl)
  onRefreshUrlRef.current = onRefreshUrl

  const loadTiffImage = useCallback(async (url: string, originalUrl: string) => {
    setIsConverting(true)
    setError(null)

    try {
      const response = await fetch(url)
      if (response.status === 403 && onRefreshUrlRef.current) {
        if (refreshAttemptedForUrlRef.current !== imageUrl) {
          refreshAttemptedForUrlRef.current = imageUrl
          await onRefreshUrlRef.current()
          return
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()

      if (isTiffBuffer(buffer)) {
        setDisplayUrl(decodeTiffToDataUrl(buffer))
      } else {
        setDisplayUrl(originalUrl)
      }
    } catch (err) {
      setError('Failed to load image')
      console.error('Image loading error:', err)
    } finally {
      setIsConverting(false)
    }
  }, [imageUrl])

  useEffect(() => {
    if (!imageUrl) {
      setDisplayUrl(null)
      return
    }

    if (refreshAttemptedForUrlRef.current !== imageUrl) {
      refreshAttemptedForUrlRef.current = null
    }

    const proxiedUrl = getProxiedUrl(imageUrl)
    if (isTiffUrl(imageUrl)) {
      loadTiffImage(proxiedUrl, proxiedUrl)
    } else {
      setDisplayUrl(proxiedUrl)
      setIsConverting(false)
      setError(null)
    }
  }, [imageUrl, loadTiffImage])

  return { displayUrl, isConverting, error }
}

function decodeTiffToDataUrl(buffer: ArrayBuffer): string {
  const ifds = UTIF.decode(buffer)
  if (ifds.length === 0) {
    throw new Error('No pages found in TIFF file')
  }

  UTIF.decodeImage(buffer, ifds[0])
  const firstPage = ifds[0]
  const rgba = UTIF.toRGBA8(firstPage)

  const canvas = document.createElement('canvas')
  canvas.width = firstPage.width
  canvas.height = firstPage.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const imageData = ctx.createImageData(firstPage.width, firstPage.height)
  imageData.data.set(rgba)
  ctx.putImageData(imageData, 0, 0)

  return canvas.toDataURL('image/png')
}

function isTiffUrl(url: string): boolean {
  const pathname = url.split('?')[0]?.toLowerCase() ?? url.toLowerCase()
  return pathname.endsWith('.tiff') || pathname.endsWith('.tif')
}

function isTiffBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false

  const bytes = new Uint8Array(buffer, 0, 4)

  const isLittleEndian =
    bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00

  const isBigEndian =
    bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a

  return isLittleEndian || isBigEndian
}

function getProxiedUrl(url: string): string {
  if (import.meta.env.DEV && url.includes('s3.us-east-1.amazonaws.com')) {
    return url.replace('https://s3.us-east-1.amazonaws.com', '/s3-proxy')
  }
  return url
}
